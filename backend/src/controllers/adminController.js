import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const getDashboard = asyncHandler(async (_req, res) => {
    const [userCount, postCount, commentCount, recentPosts, recentUsers] = await Promise.all([
        User.countDocuments(), Post.countDocuments(), Comment.countDocuments(),
        Post.find().populate('author', 'name').sort({ createdAt: -1 }).limit(5).lean(),
        User.find().sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({ success: true, data: { userCount, postCount, commentCount, recentPosts, recentUsers } });
});

export const getUsers = asyncHandler(async (req, res) => {
    const page = req.query.page || 1; const limit = req.query.limit || 20;
    const [data, total] = await Promise.all([User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit), User.countDocuments()]);
    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getPostsAdmin = asyncHandler(async (req, res) => {
    const page = req.query.page || 1; const limit = req.query.limit || 20;
    const [data, total] = await Promise.all([Post.find().populate('author', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Post.countDocuments()]);
    res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const deletePostAdmin = asyncHandler(async (req, res) => {
    const session = await Post.startSession();
    try {
        await session.withTransaction(async () => {
            const post = await Post.findById(req.params.id).session(session);
            if (!post) throw new AppError('Post not found.', 404);
            await Comment.deleteMany({ post: post._id }, { session });
            await post.deleteOne({ session });
        });
    } finally {
        await session.endSession();
    }
    res.json({ success: true, message: 'Post deleted successfully.' });
});

export const deleteUserAdmin = asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) throw new AppError('You cannot delete your own account from the admin panel.', 400);
    const session = await User.startSession();
    try {
        await session.withTransaction(async () => {
            const user = await User.findById(req.params.id).session(session);
            if (!user) throw new AppError('User not found.', 404);
            const posts = await Post.find({ author: user._id }).select('_id').session(session).lean();
            const postIds = posts.map((post) => post._id);
            await Comment.deleteMany({ $or: [{ author: user._id }, { post: { $in: postIds } }] }, { session });
            await Post.deleteMany({ author: user._id }, { session });
            await user.deleteOne({ session });
        });
    } finally {
        await session.endSession();
    }
    res.json({ success: true, message: 'User and related content deleted.' });
});

export const updateUserRole = asyncHandler(async (req, res) => {
    if (req.params.id === req.user._id.toString()) throw new AppError('You cannot change your own role.', 400);
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role: req.body.role }, $inc: { tokenVersion: 1 } }, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found.', 404);
    res.json({ success: true, data: user });
});