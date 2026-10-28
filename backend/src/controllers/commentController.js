import { Comment } from '../models/Comment.js';
import { Post } from '../models/Post.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const getComments = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id).select('status');
    if (!post || post.status !== 'published') throw new AppError('Post not found.', 404);
    const data = await Comment.find({ post: post._id })
        .select('_id post author content createdAt')
        .populate('author', 'name avatar')
        .sort({ createdAt: -1, _id: -1 })
        .lean();
    res.json({ success: true, data });
});

export const addComment = asyncHandler(async (req, res) => {
    const session = await Comment.startSession();
    let comment;
    try {
        await session.withTransaction(async () => {
            const post = await Post.findOne({ _id: req.params.id, status: 'published' }).session(session).select('_id');
            if (!post) throw new AppError('Post not found.', 404);
            [comment] = await Comment.create([{ post: post._id, author: req.user._id, content: req.body.content }], { session });
        });
    } finally {
        await session.endSession();
    }
    await comment.populate('author', 'name avatar');
    res.status(201).json({ success: true, data: comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new AppError('Comment not found.', 404);
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new AppError('You can only delete your own comments.', 403);
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted.' });
});