import mongoose from 'mongoose';
import slugify from 'slugify';

export const CATEGORIES = ['Technology', 'Programming', 'Design', 'Business', 'Science', 'Health', 'Travel', 'Food', 'Lifestyle', 'Other'];
const postSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    content: { type: String, required: true, minlength: 20, maxlength: 100000 },
    coverImage: { type: String, default: '', maxlength: 2048 },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    tags: { type: [String], default: [], index: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        validate: {
            validator: async (userId) => Boolean(await mongoose.model('User').exists({ _id: userId })),
            message: 'Post author must reference an existing user.',
        },
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: Date,
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.pre('validate', function generateSlug() {
    if (!this.slug) this.slug = slugify(this.title, { lower: true, strict: true }) || 'post';
    if (this.status === 'published' && !this.publishedAt) this.publishedAt = new Date();
});
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

export const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
export default Post;
