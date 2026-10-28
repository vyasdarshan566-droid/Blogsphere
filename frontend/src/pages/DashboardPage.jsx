import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PenSquare, BookMarked, Eye, BarChart3, User, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { postsApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function DashboardPage() {
    const { user } = useAuth();

    const { data: myPostsData, isLoading, error, refetch } = useQuery({
        queryKey: ['my-posts', 'dashboard'],
        queryFn: async () => {
            const first = await postsApi.getMy({ page: 1, limit: 50 });
            const allPosts = [...first.data.data];
            for (let page = 2; page <= first.data.pagination.pages; page += 1) {
                const next = await postsApi.getMy({ page, limit: 50 });
                allPosts.push(...next.data.data);
            }
            return { ...first.data, data: allPosts };
        },
    });

    const posts = myPostsData?.data || [];
    const published = posts.filter((p) => p.status === 'published').length;
    const drafts = posts.filter((p) => p.status === 'draft').length;
    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);

    const stats = [
        { label: 'Total Posts', value: myPostsData?.pagination?.total || 0, icon: BookMarked, color: 'var(--color-accent-500)' },
        { label: 'Published', value: published, icon: Eye, color: '#22c55e' },
        { label: 'Drafts', value: drafts, icon: Clock, color: '#f59e0b' },
        { label: 'Total Views', value: totalViews.toLocaleString(), icon: BarChart3, color: '#a78bfa' },
    ];

    return (
        <div className="page-enter max-w-6xl mx-auto px-4 sm:px-6 py-12">
            {/* Welcome Header */}
            <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <img
                        src={user?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`}
                        alt={user?.name}
                        className="w-14 h-14 rounded-full object-cover border-2"
                        style={{ borderColor: 'var(--color-accent-500)' }}
                    />
                    <div>
                        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
                            Welcome back, {user?.name?.split(' ')[0]}!
                        </h1>
                        <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>
                            Here's an overview of your activity.
                        </p>
                    </div>
                </div>
                <Link to="/write" className="btn-primary">
                    <PenSquare size={16} /> New Article
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="glass-card p-5"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${stat.color} 15%, transparent)` }}>
                                <stat.icon size={20} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-xs" style={{ color: 'var(--color-cream-300)' }}>{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {[
                    { to: '/write', icon: PenSquare, label: 'Write New Article', desc: 'Start a new blog post', color: 'var(--color-accent-500)' },
                    { to: '/my-blogs', icon: BookMarked, label: 'My Articles', desc: 'Manage your posts', color: '#22c55e' },
                    { to: `/profile/${user?._id}`, icon: User, label: 'Edit Profile', desc: 'Update your information', color: '#a78bfa' },
                ].map(({ to, icon: Icon, label, desc, color }) => (
                    <Link key={to} to={to} className="glass-card p-5 flex items-center gap-4 hover:border-white/20 transition-colors group">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                            <Icon size={22} style={{ color }} />
                        </div>
                        <div>
                            <p className="font-semibold text-white group-hover:text-white">{label}</p>
                            <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>{desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Posts */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>Recent Posts</h2>
                    <Link to="/my-blogs" className="text-sm" style={{ color: 'var(--color-accent-400)' }}>View all →</Link>
                </div>
                {isLoading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <p role="alert" className="py-5 text-sm text-red-700">{error.message} <button className="underline" type="button" onClick={() => refetch()}>Retry</button></p>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8">
                        <p style={{ color: 'var(--color-cream-300)' }}>You haven't written anything yet.</p>
                        <Link to="/write" className="btn-primary text-sm mt-4 inline-flex">Start Writing</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.slice(0, 5).map((post) => (
                            <div key={post._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <Link to={`/blog/${post.slug}`} className="text-sm font-medium text-white hover:text-accent-400 transition-colors truncate block">
                                        {post.title}
                                    </Link>
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-cream-300)' }}>
                                        {format(new Date(post.createdAt), 'MMM d, yyyy')} · {post.views} views
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 ml-4 shrink-0">
                                    <span className={`badge ${post.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>
                                        {post.status}
                                    </span>
                                    <Link to={`/edit/${post._id}`} className="text-xs" style={{ color: 'var(--color-accent-400)' }}>Edit</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
