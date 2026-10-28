import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { usersApi, postsApi } from '../api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import PostCard from '../components/blog/PostCard';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
    const { id } = useParams();
    const { user: currentUser } = useAuth();
    const isOwn = currentUser?._id === id;

    const { data: profileData, isLoading: profileLoading, error } = useQuery({
        queryKey: ['profile', id],
        queryFn: () => usersApi.getProfile(id).then((r) => r.data),
    });

    const { data: postsData, isLoading: postsLoading, error: postsError, refetch: refetchPosts } = useQuery({
        queryKey: ['posts', 'byAuthor', id],
        queryFn: () => postsApi.getAll({ author: id, limit: 6 }).then((r) => r.data),
    });

    if (profileLoading) return <LoadingSpinner fullScreen />;
    if (error) return <ErrorMessage message={error.message} />;

    const profile = profileData?.data;
    const posts = postsData?.data || [];

    return (
        <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-12">
            {/* Profile Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <img
                        src={profile?.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${profile?.name}`}
                        alt={profile?.name}
                        className="w-24 h-24 rounded-2xl object-cover border-2"
                        style={{ borderColor: 'var(--color-accent-500)' }}
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>{profile?.name}</h1>
                            {profile?.role === 'admin' && <span className="badge badge-blue">Admin</span>}
                        </div>
                        <p className="text-sm mt-2 mb-3" style={{ color: 'var(--color-cream-300)' }}>
                            {profile?.bio || 'No bio provided yet.'}
                        </p>
                        <div className="flex items-center gap-5 text-sm" style={{ color: 'var(--color-cream-300)' }}>
                            <span className="flex items-center gap-1">
                                <BookOpen size={14} /> {profileData?.postCount || 0} articles
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar size={14} /> Joined {profile?.createdAt && Number.isFinite(new Date(profile.createdAt).getTime()) ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'Recently'}
                            </span>
                        </div>
                    </div>
                    {isOwn && (
                        <Link to={`/profile/${id}/edit`} className="btn-secondary text-sm py-2 px-4 shrink-0">
                            <Edit size={14} /> Edit Profile
                        </Link>
                    )}
                </div>
            </motion.div>

            {/* Posts */}
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-serif)' }}>Articles by {profile?.name}</h2>
            {postsLoading ? (
                <LoadingSpinner />
            ) : postsError ? (
                <ErrorMessage message={postsError.message} onRetry={refetchPosts} />
            ) : posts.length === 0 ? (
                <div className="glass-card p-10 text-center">
                    <p style={{ color: 'var(--color-cream-300)' }}>No published articles yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map((post, i) => <PostCard key={post._id} post={post} index={i} />)}
                </div>
            )}
        </div>
    );
}
