import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-20 px-4"
        >
            {Icon && (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'color-mix(in srgb, var(--color-accent-500) 12%, transparent)' }}>
                    <Icon size={30} style={{ color: 'var(--color-accent-400)' }} />
                </div>
            )}
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            {description && <p className="text-sm max-w-sm" style={{ color: 'var(--color-cream-300)' }}>{description}</p>}
            {action && <div className="mt-6">{action}</div>}
        </motion.div>
    );
}
