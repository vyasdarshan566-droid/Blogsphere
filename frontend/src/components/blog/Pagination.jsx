export default function Pagination({ page, pages, onPage }) {
    if (pages <= 1) return null;

    const items = [];
    for (let i = 1; i <= pages; i++) {
        if (
            i === 1 ||
            i === pages ||
            (i >= page - 2 && i <= page + 2)
        ) {
            items.push(i);
        } else if (items[items.length - 1] !== '...') {
            items.push('...');
        }
    }

    return (
        <div className="flex items-center justify-center gap-1 mt-10">
            <button
                onClick={() => onPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-cream-300)', background: 'color-mix(in srgb, white 5%, transparent)' }}
            >
                ← Prev
            </button>
            {items.map((item, idx) =>
                item === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-sm" style={{ color: 'var(--color-cream-300)' }}>
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        onClick={() => onPage(item)}
                        className="w-9 h-9 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: item === page ? 'var(--color-accent-500)' : 'color-mix(in srgb, white 5%, transparent)',
                            color: item === page ? 'white' : 'var(--color-cream-300)',
                        }}
                    >
                        {item}
                    </button>
                )
            )}
            <button
                onClick={() => onPage(page + 1)}
                disabled={page === pages}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-cream-300)', background: 'color-mix(in srgb, white 5%, transparent)' }}
            >
                Next →
            </button>
        </div>
    );
}
