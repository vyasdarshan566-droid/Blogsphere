import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
        index: true,
        validate: {
            validator: async (postId) => Boolean(await mongoose.model('Post').exists({ _id: postId, status: 'published' })),
            message: 'Comment must reference an existing published post.',
        },
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        validate: {
            validator: async (userId) => Boolean(await mongoose.model('User').exists({ _id: userId })),
            message: 'Comment author must reference an existing user.',
        },
    },
    content: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
}, { timestamps: true });
commentSchema.index({ post: 1, createdAt: -1 });

export const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export default Comment;
