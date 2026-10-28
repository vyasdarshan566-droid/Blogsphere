import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { createUniquePostSlug } from '../services/slugService.js';
import { AppError, asyncHandler } from '../utils/errors.js';

const sortOptions = { newest: { publishedAt: -1, createdAt: -1 }, oldest: { publishedAt: 1 }, popular: { views: -1, publishedAt: -1 }, title: { title: 1 } };
function pageInfo(page, limit, total) { return { page, limit, total, pages: Math.ceil(total / limit) }; }

export const getPosts = asyncHandler(async (req, res) => {
    const { page, limit, q, search, category, tag, tags, author, sort } = req.query;
    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (author) filter.author = author;
    const tagList = [...(tag ? [tag] : []), ...(tags ? tags.split(',').map((item) => item.trim()).filter(Boolean) : [])];
    if (tagList.length) filter.tags = { $in: [...new Set(tagList)] };
    const phrase = q || search;
    if (phrase) filter.$text = { $search: phrase };
    const [data, total] = await Promise.all([
        Post.find(filter).populate('author', 'name avatar bio').sort(sortOptions[sort]).skip((page - 1) * limit).limit(limit).lean(),
        Post.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: pageInfo(page, limit, total) });
});

export const getPostBySlug = asyncHandler(async (req, res) => {
    let post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name avatar bio');
    if (!post || (post.status !== 'published' && (!req.user || post.author._id.toString() !== req.user._id.toString() && req.user.role !== 'admin'))) throw new AppError('Post not found.', 404);
    if (post.status === 'published') post = await Post.findByIdAndUpdate(post._id, { $inc: { views: 1 } }, { new: true }).populate('author', 'name avatar bio');
    res.json({ success: true, data: post });
});

export const createPost = asyncHandler(async (req, res) => {
    const post = new Post({ ...req.body, author: req.user._id, slug: await createUniquePostSlug(req.body.title) });
    await post.save();
    res.status(201).json({ success: true, data: post });
});

export const updatePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new AppError('Post not found.', 404);
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new AppError('You do not have permission to edit this post.', 403);
    if (req.body.title && req.body.title !== post.title) post.slug = await createUniquePostSlug(req.body.title, post._id);
    Object.assign(post, req.body);
    if (post.status === 'published' && !post.publishedAt) post.publishedAt = new Date();
    await post.save();
    res.json({ success: true, data: post });
});

export const deletePost = asyncHandler(async (req, res) => {
    const session = await Post.startSession();
    try {
        await session.withTransaction(async () => {
            const post = await Post.findById(req.params.id).session(session);
            if (!post) throw new AppError('Post not found.', 404);
            if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') throw new AppError('You do not have permission to delete this post.', 403);
            await Comment.deleteMany({ post: post._id }, { session });
            await post.deleteOne({ session });
        });
    } finally {
        await session.endSession();
    }
    res.json({ success: true, message: 'Post deleted successfully.' });
});

export const getMyPosts = asyncHandler(async (req, res) => {
    const { page, limit, status, sort } = req.query;
    const filter = { author: req.user._id, ...(status ? { status } : {}) };
    const [data, total] = await Promise.all([
        Post.find(filter).sort(sortOptions[sort] || { createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
        Post.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: pageInfo(page, limit, total) });
});

export const getFeaturedPosts = asyncHandler(async (_req, res) => {
    const data = await Post.find({ status: 'published' }).populate('author', 'name avatar').sort({ views: -1, publishedAt: -1 }).limit(6).lean();
    res.json({ success: true, data });
});