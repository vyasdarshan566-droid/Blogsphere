import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, BookOpen, MessageSquare, Trash2, Shield, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function AdminDashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const [usersPage, setUsersPage] = useState(1);
    const [postsPage, setPostsPage] = useState(1);
    const queryClient = useQueryClient();

    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: () => adminApi.getStats().then((r) => r.data.data),
    });

    const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['admin', 'users', usersPage],
        queryFn: () => adminApi.getUsers({ page: usersPage, limit: 20 }).then((r) => r.data),
        enabled: activeTab === 'users',
    });

    const { data: postsData, isLoading: postsLoading, error: postsError } = useQuery({
        queryKey: ['admin', 'posts', postsPage],
        queryFn: () => adminApi.getPosts({ page: postsPage, limit: 20 }).then((r) => r.data),
        enabled: activeTab === 'posts',
    });

    const deleteUserMutation = useMutation({
        mutationFn: (id) => adminApi.deleteUser(id),
        onSuccess: () => {
            toast.success('User deleted');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
        onError: (err) => toast.error(err.message),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ id, role }) => adminApi.updateRole(id, role),
        onSuccess: () => {
            toast.success('Role updated');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
        onError: (err) => toast.error(err.message),
    });

    const deletePostMutation = useMutation({
        mutationFn: (id) => adminApi.deletePost(id),
        onSuccess: () => {
            toast.success('Post deleted');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
        onError: (err) => toast.error(err.message),
    });

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'posts', label: 'Posts', icon: BookOpen },
    ];

    return (
        <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 py-12">
            {/* Header */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--color-accent-500) 15%, transparent)' }}>
                    <Shield size={22} style={{ color: 'var(--color-accent-400)' }} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>Admin Dashboard</h1>
                    <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>Manage users, posts, and platform settings</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit" style={{ background: 'var(--color-navy-800)' }}>
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={activeTab === id
                            ? { background: 'var(--color-accent-500)', color: 'white' }
                            : { color: 'var(--color-cream-300)' }}
                    >
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {statsLoading ? <LoadingSpinner /> : statsError ? <ErrorMessage message={statsError.message} /> : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                                {[
                                    { label: 'Total Users', value: stats?.userCount || 0, icon: Users, color: 'var(--color-accent-500)' },
                                    { label: 'Total Posts', value: stats?.postCount || 0, icon: BookOpen, color: '#22c55e' },
                                    { label: 'Total Comments', value: stats?.commentCount || 0, icon: MessageSquare, color: '#a78bfa' },
                                ].map((s, i) => (
                                    <motion.div key={s.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `color-mix(in srgb, ${s.color} 15%, transparent)` }}>
                                                <s.icon size={22} style={{ color: s.color }} />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
                                                <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>{s.label}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Recent Posts */}
                                <div className="glass-card p-6">
                                    <h3 className="font-bold text-white mb-4">Recent Posts</h3>
                                    <div className="space-y-3">
                                        {stats?.recentPosts?.map((p) => (
                                            <div key={p._id} className="flex justify-between items-center text-sm">
                                                <span className="text-white truncate flex-1">{p.title}</span>
                                                <span style={{ color: 'var(--color-cream-300)', fontSize: '0.75rem', marginLeft: 8, flexShrink: 0 }}>
                                                    {p.author?.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Recent Users */}
                                <div className="glass-card p-6">
                                    <h3 className="font-bold text-white mb-4">Recent Users</h3>
                                    <div className="space-y-3">
                                        {stats?.recentUsers?.map((u) => (
                                            <div key={u._id} className="flex items-center gap-3 text-sm">
                                                <img src={u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${u.name}`} className="w-7 h-7 rounded-full object-cover" alt={u.name} />
                                                <span className="text-white flex-1">{u.name}</span>
                                                <span className="badge badge-blue">{u.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="glass-card overflow-x-auto">
                    {usersLoading ? <LoadingSpinner /> : usersError ? <ErrorMessage message={usersError.message} /> : !usersData?.data?.length ? <p className="p-8 text-center text-slate-600">No users found.</p> : (
                        <table className="w-full text-sm">
                            <thead style={{ background: 'var(--color-navy-800)', borderBottom: '1px solid color-mix(in srgb, white 8%, transparent)' }}>
                                <tr>
                                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-cream-300)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'color-mix(in srgb, white 5%, transparent)' }}>
                                {usersData?.data?.map((u) => (
                                    <tr key={u._id} className="hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={u.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${u.name}`} className="w-8 h-8 rounded-full object-cover" alt={u.name} />
                                                <span className="font-medium text-white">{u.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--color-cream-300)' }}>{u.email}</td>
                                        <td className="px-5 py-4">
                                            <select
                                                value={u.role}
                                                onChange={(e) => updateRoleMutation.mutate({ id: u._id, role: e.target.value })}
                                                className="text-xs px-2 py-1 rounded-lg border"
                                                style={{ background: 'var(--color-navy-700)', color: 'var(--color-cream-200)', borderColor: 'color-mix(in srgb, white 10%, transparent)' }}
                                            >
                                                <option value="user">user</option>
                                                <option value="admin">admin</option>
                                            </select>
                                        </td>
                                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-cream-300)' }}>
                                            {format(new Date(u.createdAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => { if (confirm('Delete user and all their posts?')) deleteUserMutation.mutate(u._id); }}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!usersLoading && usersData?.pagination?.pages > 1 && <div className="flex items-center justify-center gap-4 p-4"><button type="button" className="btn-secondary" disabled={usersPage <= 1} onClick={() => setUsersPage((page) => page - 1)}>Previous</button><span className="text-sm text-slate-600">Page {usersPage} of {usersData.pagination.pages}</span><button type="button" className="btn-secondary" disabled={usersPage >= usersData.pagination.pages} onClick={() => setUsersPage((page) => page + 1)}>Next</button></div>}
                </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
                <div className="glass-card overflow-x-auto">
                    {postsLoading ? <LoadingSpinner /> : postsError ? <ErrorMessage message={postsError.message} /> : !postsData?.data?.length ? <p className="p-8 text-center text-slate-600">No posts found.</p> : (
                        <table className="w-full text-sm">
                            <thead style={{ background: 'var(--color-navy-800)', borderBottom: '1px solid color-mix(in srgb, white 8%, transparent)' }}>
                                <tr>
                                    {['Title', 'Author', 'Category', 'Status', 'Created', 'Actions'].map((h) => (
                                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-cream-300)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'color-mix(in srgb, white 5%, transparent)' }}>
                                {postsData?.data?.map((p) => (
                                    <tr key={p._id} className="hover:bg-white/3 transition-colors">
                                        <td className="px-5 py-4 max-w-xs">
                                            <span className="font-medium text-white line-clamp-1">{p.title}</span>
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--color-cream-300)' }}>{p.author?.name}</td>
                                        <td className="px-5 py-4"><span className="badge badge-blue">{p.category}</span></td>
                                        <td className="px-5 py-4">
                                            <span className={`badge ${p.status === 'published' ? 'badge-green' : 'badge-yellow'}`}>{p.status}</span>
                                        </td>
                                        <td className="px-5 py-4 text-xs" style={{ color: 'var(--color-cream-300)' }}>
                                            {format(new Date(p.createdAt), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-5 py-4"><button type="button" aria-label={`Delete ${p.title}`} onClick={() => { if (confirm(`Delete “${p.title}”?`)) deletePostMutation.mutate(p._id); }} className="rounded-lg p-2 text-red-700 transition-colors hover:bg-red-50"><Trash2 size={15} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!postsLoading && postsData?.pagination?.pages > 1 && <div className="flex items-center justify-center gap-4 p-4"><button type="button" className="btn-secondary" disabled={postsPage <= 1} onClick={() => setPostsPage((page) => page - 1)}>Previous</button><span className="text-sm text-slate-600">Page {postsPage} of {postsData.pagination.pages}</span><button type="button" className="btn-secondary" disabled={postsPage >= postsData.pagination.pages} onClick={() => setPostsPage((page) => page + 1)}>Next</button></div>}
                </div>
            )}
        </div>
    );
}
