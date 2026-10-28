import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const schema = z.object({
    name: z.string().min(2).max(60),
    bio: z.string().max(300).optional(),
    avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export default function EditProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser, updateUser } = useAuth();

    const { data, isLoading, error } = useQuery({
        queryKey: ['profile', id],
        queryFn: () => usersApi.getProfile(id).then((r) => r.data),
    });

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        values: data?.data ? {
            name: data.data.name,
            bio: data.data.bio || '',
            avatar: data.data.avatar || '',
        } : undefined,
    });

    const avatarPreview = watch('avatar');

    const mutation = useMutation({
        mutationFn: (values) => usersApi.updateProfile(id, values),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['profile', id] });
            updateUser(res.data.data);
            toast.success('Profile updated!');
            navigate(`/profile/${id}`);
        },
        onError: (err) => toast.error(err.message),
    });

    if (currentUser?._id !== id) return <Navigate to={`/profile/${currentUser?._id}`} replace />;
    if (isLoading) return <LoadingSpinner fullScreen />;
    if (error) return <div className="max-w-xl mx-auto px-4 py-12"><p role="alert" className="text-red-700">{error.message}</p></div>;

    return (
        <div className="page-enter max-w-xl mx-auto px-4 sm:px-6 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
                <h1 className="text-2xl font-bold text-white mb-7" style={{ fontFamily: 'var(--font-serif)' }}>Edit Profile</h1>

                {/* Avatar Preview */}
                <div className="flex items-center gap-4 mb-7">
                    <img
                        src={avatarPreview || `https://api.dicebear.com/8.x/initials/svg?seed=${data?.data?.name}`}
                        alt="Avatar preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2"
                        style={{ borderColor: 'var(--color-accent-500)' }}
                        onError={(e) => { e.target.src = `https://api.dicebear.com/8.x/initials/svg?seed=${data?.data?.name}`; }}
                    />
                    <div>
                        <p className="text-sm font-medium text-white">Avatar Preview</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--color-cream-300)' }}>Paste a URL below to update your profile photo</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5" noValidate>
                    <div>
                        <label htmlFor="profile-name" className="block text-sm font-medium text-white mb-1.5">Full Name</label>
                        <input id="profile-name" {...register('name')} type="text" className="input-base" placeholder="Jane Doe" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="profile-avatar" className="block text-sm font-medium text-white mb-1.5">Avatar URL</label>
                        <input id="profile-avatar" {...register('avatar')} type="url" className="input-base" placeholder="https://example.com/avatar.jpg" />
                        {errors.avatar && <p className="text-red-400 text-xs mt-1">{errors.avatar.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="profile-bio" className="block text-sm font-medium text-white mb-1.5">Bio</label>
                        <textarea id="profile-bio" {...register('bio')} rows={4} className="input-base resize-none" placeholder="Tell people a little about yourself…" />
                        {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center py-2.5">
                            <X size={15} /> Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center py-2.5">
                            <Save size={15} /> {isSubmitting ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
