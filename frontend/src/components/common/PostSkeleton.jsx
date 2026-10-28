export default function PostSkeleton({ count = 3 }) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading articles" role="status">
            <span className="sr-only">Loading articles…</span>
            {Array.from({ length: count }, (_, index) => (
                <div key={index} className="glass-card overflow-hidden">
                    <div className="aspect-video animate-pulse bg-slate-200" />
                    <div className="space-y-3 p-5">
                        <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                        <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}