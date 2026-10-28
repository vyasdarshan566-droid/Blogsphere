import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
            .min(12, 'Password must be at least 12 characters')
            .regex(/[a-z]/, 'Must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    bio: z.string().max(300).optional(),
}).refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export default function RegisterPage() {
    const { register: authRegister } = useAuth();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            const { confirmPassword: _confirmPassword, ...rest } = data;
            await authRegister(rest);
            toast.success('Account created! Welcome to BlogSphere 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-16"
            style={{ background: 'linear-gradient(135deg, var(--color-navy-950), var(--color-navy-900))' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-500)' }}>
                            <BookOpen size={18} color="white" />
                        </div>
                        <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-cream-50)' }}>BlogSphere</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
                    <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>Join thousands of writers and readers</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="register-name" className="block text-sm font-medium text-white mb-1.5">Full Name</label>
                        <input id="register-name" {...register('name')} type="text" className="input-base" placeholder="Jane Doe" autoComplete="name" />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="register-email" className="block text-sm font-medium text-white mb-1.5">Email</label>
                        <input id="register-email" {...register('email')} type="email" className="input-base" placeholder="you@example.com" autoComplete="email" />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="register-password" className="block text-sm font-medium text-white mb-1.5">Password</label>
                        <input id="register-password" {...register('password')} type="password" className="input-base" placeholder="12+ chars, upper/lowercase, and a number" autoComplete="new-password" />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-white mb-1.5">Confirm Password</label>
                        <input id="register-confirm-password" {...register('confirmPassword')} type="password" className="input-base" placeholder="Repeat password" autoComplete="new-password" />
                        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="register-bio" className="block text-sm font-medium text-white mb-1.5">Bio <span className="text-white/30">(optional)</span></label>
                        <textarea id="register-bio" {...register('bio')} rows={2} className="input-base resize-none" placeholder="Tell readers a little about yourself…" />
                        {errors.bio && <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3 mt-2">
                        <UserPlus size={16} />
                        {isSubmitting ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: 'var(--color-cream-300)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--color-accent-400)' }} className="font-medium">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}
