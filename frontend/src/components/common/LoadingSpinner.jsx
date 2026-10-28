import { motion } from 'framer-motion';

export default function LoadingSpinner({ fullScreen = false, size = 40 }) {
    const spinner = (
        <div role="status" aria-live="polite" className="flex flex-col items-center justify-center gap-3">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                style={{
                    width: size,
                    height: size,
                    border: `3px solid color-mix(in srgb, var(--color-accent-500) 20%, transparent)`,
                    borderTopColor: 'var(--color-accent-500)',
                    borderRadius: '50%',
                }}
            />
            <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>Loading…</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'var(--color-navy-950)' }}>
                {spinner}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center py-16">
            {spinner}
        </div>
    );
}
