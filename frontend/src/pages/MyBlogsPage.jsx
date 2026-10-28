import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Trash2, PenSquare, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { postsApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/blog/Pagination';

export default function MyBlogsPage() {
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['my-posts', page, statusFilter],
        queryFn: () => postsApi.getMy({ page, limit: 10, status: statusFilter || undefined }).then((r) => r.data),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => postsApi.delete(id),
        onSuccess: () => {
            toast.success('Post deleted');
            queryClient.invalidateQueries({ queryKey: ['my-posts'] });
        },
        onError: (err) => toast.error(err.message),
    });

    const posts = data?.data || [];

    return (
        <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>My Articles</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-cream-300)' }}>
                        {data?.pagination?.total || 0} article{data?.pagination?.total !== 1 ? 's' : ''} total
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Status Filter */}
                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'color-mix(in srgb, white 10%, transparent)' }}>
                        {[{ label: 'All', value: '' }, { label: 'Published', value: 'published' }, { label: 'Drafts', value: 'draft' }].map(({ label, value }) => (
                            <button
                                key={value}
                                onClick={() => { setStatusFilter(value); setPage(1); }}
                                className="px-4 py-2 text-sm font-medium transition-colors"
                                style={statusFilter === value
                                    ? { background: 'var(--color-accent-500)', color: 'white' }
                                    : { background: 'color-mix(in srgb, white 5%, transparent)', color: 'var(--color-cream-300)' }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <Link to="/write" className="btn-primary text-sm py-2 px-4">
                        <PenSquare size={14} /> New Post
                    </Link>
                </div>
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : posts.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No articles yet"
                    description={statusFilter ? `No ${statusFilter} articles found.` : "You haven't written anything yet!"}
                    action={<Link to="/write" className="btn-primary text-sm">Write Your First Article</Link>}
                />
            ) : (
                <>
                    <div className="glass-card overflow-hidden">
                        <div className="divide-y" style={{ borderColor: 'color-mix(in srgb, white 7%, transparent)' }}>
                            {posts.map((post, i) => (
                                <motion.div
                                    key={post._id}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-5 flex items-center gap-4 hover:bg-white/3 transition-colors"
                                >
                                    {/* Cover thumbnail */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--color-navy-700)' }}>
                                        {post.coverImage ? (
                                            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/article-placeholder.svg'; }} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xl">📝</div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <Link to={`/blog/${post.slug}`} className="text-sm font-semibold text-white truncate block hover:text-accent-400 transition-colors">
                                            {post.title}
                                        </Link>
                                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                                            <span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                                                {post.status}
                                            </span>
                                            <span className="badge badge-blue">{post.category}</span>
                                            <span className="text-xs" style={{ color: 'var(--color-cream-300)' }}>
                                                {format(new Date(post.createdAt), 'MMM d, yyyy')} · {post.views || 0} views
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <Link to={`/edit/${post._id}`} className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--color-accent-400)' }}>
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(post._id); }}
                                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    <Pagination page={page} pages={data?.pagination?.pages || 1} onPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                </>
            )}
        </div>
    );
}
