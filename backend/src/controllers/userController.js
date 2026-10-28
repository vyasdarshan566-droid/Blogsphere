import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-email');
    if (!user) throw new AppError('User not found.', 404);
    const postCount = await Post.countDocuments({ author: user._id, status: 'published' });
    res.json({ success: true, data: user, postCount });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true, runValidators: true });
    if (!user) throw new AppError('User not found.', 404);
    res.json({ success: true, data: user });
});