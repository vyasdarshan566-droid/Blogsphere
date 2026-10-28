import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, BookOpen } from 'lucide-react';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-navy-950)' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md"
            >
                <div className="text-8xl font-black mb-4 gradient-text" style={{ fontFamily: 'var(--font-serif)' }}>404</div>
                <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                    Page Not Found
                </h1>
                <p className="mb-8 leading-relaxed" style={{ color: 'var(--color-cream-300)' }}>
                    The page you're looking for doesn't exist or has been moved to a different address.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link to="/" className="btn-primary">
                        <Home size={16} /> Go Home
                    </Link>
                    <Link to="/explore" className="btn-secondary">
                        <BookOpen size={16} /> Explore Posts
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
