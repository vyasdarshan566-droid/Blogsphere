import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
    return (
        <div role="alert" className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'color-mix(in srgb, #ef4444 12%, transparent)' }}>
                <AlertTriangle size={26} color="#f87171" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-cream-300)', maxWidth: 320 }}>{message || 'An unexpected error occurred.'}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn-secondary text-sm py-2 px-5">
                    Try again
                </button>
            )}
        </div>
    );
}
