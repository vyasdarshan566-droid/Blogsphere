import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, Eye, X } from 'lucide-react';
import { postsApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = ['Technology', 'Programming', 'Design', 'Business', 'Science', 'Health', 'Travel', 'Food', 'Lifestyle', 'Other'];

const schema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(200),
    excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500),
    content: z.string().min(20, 'Content must be at least 20 characters'),
    coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    category: z.enum(CATEGORIES, { error: 'Please select a category' }),
    tags: z.string().optional(),
    status: z.enum(['draft', 'published']),
});

export default function PostEditorPage() {
    const { id } = useParams(); // if editing
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [previewMode, setPreviewMode] = useState(false);

    const { data: existing, isLoading: loadingExisting } = useQuery({
        queryKey: ['post-edit', id],
        queryFn: async () => {
            let currentPage = 1;
            let pages = 1;
            while (currentPage <= pages) {
                const response = await postsApi.getMy({ page: currentPage, limit: 50 });
                pages = response.data.pagination.pages;
                const post = response.data.data.find((item) => item._id === id);
                if (post) return post;
                currentPage += 1;
            }
            throw new Error('Article not found in your posts.');
        },
        enabled: isEditing,
    });

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        values: existing ? {
            title: existing.title,
            excerpt: existing.excerpt,
            content: existing.content,
            coverImage: existing.coverImage || '',
            category: existing.category,
            tags: existing.tags?.join(', ') || '',
            status: existing.status,
        } : {
            title: '',
            excerpt: '',
            content: '',
            coverImage: '',
            category: 'Technology',
            tags: '',
            status: 'draft',
        },
    });

    const watchedContent = watch('content');
    const watchedTitle = watch('title');

    const mutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                coverImage: data.coverImage || '',
            };
            return isEditing ? postsApi.update(id, payload) : postsApi.create(payload);
        },
        onSuccess: (res) => {
            toast.success(isEditing ? 'Post updated!' : 'Post created!');
            navigate(`/blog/${res.data.data.slug}`);
        },
        onError: (err) => toast.error(err.message),
    });

    if (isEditing && loadingExisting) return <LoadingSpinner fullScreen />;

    return (
        <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                        {isEditing ? 'Edit Article' : 'Write New Article'}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-cream-300)' }}>
                        {isEditing ? 'Update your post below' : 'Share your story with the world'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setPreviewMode(!previewMode)}
                        className="btn-secondary text-sm py-2 px-4"
                    >
                        <Eye size={14} /> {previewMode ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {previewMode ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8">
                    <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-serif)' }}>{watchedTitle || 'Untitled'}</h2>
                    <div
                        className="prose prose-invert max-w-none"
                        style={{ color: 'var(--color-cream-200)', fontSize: '1rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                    >
                        {watchedContent || 'No content yet'}
                    </div>
                </motion.div>
            ) : (
                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6">
                    {/* Title */}
                    <div className="glass-card p-6 space-y-5">
                        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Article Info</h3>
                        <div>
                            <label htmlFor="post-title" className="block text-sm font-medium text-white mb-1.5">Title *</label>
                            <input id="post-title" {...register('title')} type="text" className="input-base text-lg" placeholder="An engaging title that draws readers in…" />
                            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="post-excerpt" className="block text-sm font-medium text-white mb-1.5">Excerpt * <span className="text-white/30">(short summary)</span></label>
                            <textarea id="post-excerpt" {...register('excerpt')} rows={2} className="input-base resize-none" placeholder="A 1-2 sentence summary of your article…" />
                            {errors.excerpt && <p className="text-red-400 text-xs mt-1">{errors.excerpt.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label htmlFor="post-category" className="block text-sm font-medium text-white mb-1.5">Category *</label>
                                <select id="post-category" {...register('category')} className="input-base">
                                    {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="post-tags" className="block text-sm font-medium text-white mb-1.5">Tags <span className="text-white/30">(comma-separated)</span></label>
                                <input id="post-tags" {...register('tags')} type="text" className="input-base" placeholder="react, javascript, webdev" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="post-cover-image" className="block text-sm font-medium text-white mb-1.5">Cover Image URL</label>
                            <input id="post-cover-image" {...register('coverImage')} type="url" className="input-base" placeholder="https://example.com/image.jpg" />
                            {errors.coverImage && <p className="text-red-400 text-xs mt-1">{errors.coverImage.message}</p>}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Content *</h3>
                        <textarea
                            aria-label="Article content"
                            {...register('content')}
                            rows={20}
                            className="input-base resize-y font-mono text-sm"
                            placeholder="Write your article content here… (Markdown-like formatting supported via line breaks)"
                        />
                        {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content.message}</p>}
                    </div>

                    {/* Status + Submit */}
                    <div className="glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-1.5">Publish Status</label>
                            <div className="flex gap-3">
                                {(['draft', 'published']).map((s) => (
                                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                                        <input {...register('status')} type="radio" value={s} className="accent-blue-500" />
                                        <span className="text-sm capitalize" style={{ color: 'var(--color-cream-200)' }}>{s}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => navigate(-1)} className="btn-secondary text-sm py-2.5 px-5">
                                <X size={14} /> Cancel
                            </button>
                            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary text-sm py-2.5 px-6">
                                <Save size={14} />
                                {isSubmitting || mutation.isPending ? 'Saving…' : isEditing ? 'Update Post' : 'Publish Post'}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
