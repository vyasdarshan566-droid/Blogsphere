import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { LogIn, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            await login(data);
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20"
            style={{ background: 'linear-gradient(135deg, var(--color-navy-950), var(--color-navy-900))' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8"
            >
                {/* Brand */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-accent-500)' }}>
                            <BookOpen size={18} color="white" />
                        </div>
                        <span className="text-xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-cream-50)' }}>BlogSphere</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
                    <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-medium text-white mb-1.5">Email</label>
                        <input
                            id="login-email"
                            {...register('email')}
                            type="email"
                            className="input-base"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-white mb-1.5">Password</label>
                        <input
                            id="login-password"
                            {...register('password')}
                            type="password"
                            className="input-base"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
                        <LogIn size={16} />
                        {isSubmitting ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: 'var(--color-cream-300)' }}>
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--color-accent-400)' }} className="font-medium">
                        Create one free
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
