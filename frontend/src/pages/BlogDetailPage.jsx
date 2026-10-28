import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Eye, Clock, Trash2, Send, Edit, Share2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { postsApi, commentsApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';

const commentSchema = z.object({ content: z.string().trim().min(1, 'Comment cannot be empty').max(1000) });

function readTime(content) {
    return Math.max(1, Math.ceil((content?.split(/\s+/).length || 0) / 200));
}

export default function BlogDetailPage() {
    const { slug } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch: refetchPost } = useQuery({
        queryKey: ['post', slug],
        queryFn: () => postsApi.getBySlug(slug).then((r) => r.data),
    });

    const post = data?.data;
    const { data: commentData, isLoading: commentsLoading, error: commentsError, refetch: refetchComments } = useQuery({
        queryKey: ['comments', post?._id],
        queryFn: () => commentsApi.getForPost(post._id).then((response) => response.data.data),
        enabled: Boolean(post?._id),
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(commentSchema),
    });

    const addCommentMutation = useMutation({
        mutationFn: (values) => commentsApi.add(post?._id, values),
        onSuccess: () => {
            toast.success('Comment added!');
            reset();
            queryClient.invalidateQueries({ queryKey: ['comments', post?._id] });
        },
        onError: (err) => toast.error(err.message),
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (id) => commentsApi.delete(id),
        onSuccess: () => {
            toast.success('Comment deleted');
            queryClient.invalidateQueries({ queryKey: ['comments', post?._id] });
        },
        onError: (err) => toast.error(err.message),
    });

    const deletePostMutation = useMutation({
        mutationFn: () => postsApi.delete(data?.data?._id),
        onSuccess: () => {
            toast.success('Post deleted');
            navigate('/explore');
        },
        onError: (err) => toast.error(err.message),
    });

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (error) return <ErrorMessage message={error.message} onRetry={refetchPost} />;

    const comments = commentData || [];
    const isOwner = user && (user._id === post?.author?._id || user.role === 'admin');

    return (
        <div className="page-enter max-w-4xl mx-auto px-4 sm:px-6 py-12">
            {/* Category + meta */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <span className="badge badge-blue">{post?.category}</span>
                    {post?.tags?.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'color-mix(in srgb, white 8%, transparent)', color: 'var(--color-cream-300)' }}>
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                    {post?.title}
                </h1>

                {/* Author row */}
                <div className="flex items-center gap-4 mb-8 flex-wrap">
                    {post?.author && (
                        <Link to={`/profile/${post.author._id}`} className="flex items-center gap-3">
                            <img
                                src={post.author.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${post.author.name}`}
                                alt={post.author.name}
                                className="w-11 h-11 rounded-full object-cover border-2"
                                style={{ borderColor: 'var(--color-accent-500)' }}
                            />
                            <div>
                                <p className="text-sm font-semibold text-white">{post.author.name}</p>
                                <p className="text-xs" style={{ color: 'var(--color-cream-300)' }}>{post.author.bio?.slice(0, 60)}</p>
                            </div>
                        </Link>
                    )}
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-cream-300)' }}>
                        {post?.publishedAt && (
                            <span className="flex items-center gap-1">
                                <Calendar size={13} />
                                {format(new Date(post.publishedAt), 'MMMM d, yyyy')}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock size={13} />
                            {readTime(post?.content)} min read
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye size={13} />
                            {post?.views?.toLocaleString()} views
                        </span>
                    </div>
                    {isOwner && (
                        <div className="flex gap-2 ml-auto">
                            <Link to={`/edit/${post._id}`} className="btn-secondary text-xs py-1.5 px-3">
                                <Edit size={13} /> Edit
                            </Link>
                            <button
                                onClick={() => { if (confirm('Delete this post?')) deletePostMutation.mutate(); }}
                                disabled={deletePostMutation.isPending}
                                className="btn-danger text-xs py-1.5 px-3"
                            >
                                <Trash2 size={13} /> Delete
                            </button>
                        </div>
                    )}
                    <button type="button" onClick={async () => {
                        try {
                            await navigator.clipboard.writeText(window.location.href);
                            toast.success('Article link copied');
                        } catch {
                            toast.error('Could not copy the article link');
                        }
                    }} className="btn-secondary text-xs py-1.5 px-3" aria-label="Copy article link">
                        <Share2 size={13} /> Share
                    </button>
                </div>

                {/* Cover Image */}
                {post?.coverImage && (
                    <div className="rounded-2xl overflow-hidden mb-10 aspect-video">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/article-placeholder.svg'; }}
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-invert max-w-none mb-16"
                    style={{ color: 'var(--color-cream-200)', fontSize: '1.0625rem', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                >
                    {post?.content}
                </div>

                {/* Comments Section */}
                <section>
                    <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                        Comments {commentsLoading ? '' : `(${comments.length})`}
                    </h2>

                    {/* Add Comment */}
                    {user ? (
                        <form onSubmit={handleSubmit((v) => addCommentMutation.mutate(v))} className="glass-card p-5 mb-8">
                            <div className="flex items-start gap-3">
                                <img
                                    src={user.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
                                    alt={user.name}
                                    className="w-9 h-9 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1">
                                    <textarea
                                        {...register('content')}
                                        aria-label="Write a comment"
                                        aria-describedby="comment-help comment-error"
                                        rows={3}
                                        placeholder="Share your thoughts…"
                                        className="input-base resize-none"
                                    />
                                    <div id="comment-help" className="mt-1 text-xs text-slate-500">Comments must be 1–1,000 characters.</div>
                                    {errors.content && <p id="comment-error" role="alert" className="text-red-700 text-xs mt-1">{errors.content.message}</p>}
                                    <div className="flex justify-end mt-3">
                                        <button type="submit" disabled={addCommentMutation.isPending} className="btn-primary text-sm py-2 px-4">
                                            <Send size={14} /> {addCommentMutation.isPending ? 'Posting…' : 'Post Comment'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="glass-card p-5 mb-8 text-center">
                            <p style={{ color: 'var(--color-cream-300)' }}>
                                <Link to="/login" style={{ color: 'var(--color-accent-400)' }}>Log in</Link> to leave a comment.
                            </p>
                        </div>
                    )}

                    {/* Comment List */}
                    <div className="space-y-4" aria-live="polite">
                        {commentsLoading ? (
                            <div role="status" className="py-8 text-center text-slate-600">Loading comments…</div>
                        ) : commentsError ? (
                            <ErrorMessage message={commentsError.message} onRetry={refetchComments} />
                        ) : comments.length === 0 ? (
                            <p className="text-center py-8" style={{ color: 'var(--color-cream-300)' }}>No comments yet. Be the first!</p>
                        ) : (
                            comments.map((comment) => (
                                <motion.div
                                    key={comment._id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 mb-2">
                                            <img
                                                src={comment.author?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${comment.author?.name}`}
                                                alt={comment.author?.name || 'Former member'}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                            <div>
                                                {comment.author?._id ? <Link to={`/profile/${comment.author._id}`} className="text-sm font-semibold text-white">{comment.author.name}</Link> : <span className="text-sm font-semibold text-white">Former member</span>}
                                                <p className="text-xs" style={{ color: 'var(--color-cream-300)' }}>
                                                    {Number.isFinite(new Date(comment.createdAt).getTime()) ? format(new Date(comment.createdAt), 'MMM d, yyyy · h:mm a') : 'Date unavailable'}
                                                </p>
                                            </div>
                                        </div>
                                        {user && (user._id === comment.author?._id || user.role === 'admin') && (
                                            <button
                                                onClick={() => deleteCommentMutation.mutate(comment._id)}
                                                aria-label={`Delete comment by ${comment.author?.name || 'author'}`}
                                                disabled={deleteCommentMutation.isPending}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-cream-200)' }}>
                                        {comment.content}
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </section>
            </motion.div>
        </div>
    );
}
