import { useState } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { postsApi } from '../api';
import PostCard from '../components/blog/PostCard';
import Pagination from '../components/blog/Pagination';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import PostSkeleton from '../components/common/PostSkeleton';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const q = searchParams.get('q') || '';
    const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const [draftQuery, setDraftQuery] = useState(null);
    const inputVal = draftQuery?.locationKey === `${location.pathname}${location.search}` ? draftQuery.value : q;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['posts', 'search', q, page],
        queryFn: () => postsApi.getAll({ q, page, limit: 9 }).then((r) => r.data),
        enabled: q.length > 0,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        if (!inputVal.trim()) return;
        setSearchParams({ q: inputVal.trim() });
    };

    const setPage = (p) => {
        setSearchParams({ q, page: p });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-3xl font-bold text-white mb-8" style={{ fontFamily: 'var(--font-serif)' }}>Search Articles</h1>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-10 flex flex-wrap gap-3">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-cream-300)' }} />
                        <input
                        type="text"
                        id="article-search"
                        aria-label="Search articles"
                        value={inputVal}
                        onChange={(e) => setDraftQuery({ locationKey: `${location.pathname}${location.search}`, value: e.target.value })}
                        placeholder="Search titles, excerpts, and article text…"
                        className="input-base pl-10"
                    />
                </div>
                <button type="submit" className="btn-primary px-6" disabled={!inputVal.trim()}>Search</button>
                {(q || inputVal) && <button type="button" className="btn-secondary px-4" onClick={() => { setDraftQuery(null); setSearchParams({}); }}>Clear</button>}
            </form>

            {!q ? (
                <EmptyState
                    icon={Search}
                    title="Search for articles"
                    description="Search the title, excerpt, and full text of published articles."
                />
            ) : isLoading ? (
                <PostSkeleton count={6} />
            ) : error ? (
                <ErrorMessage message={error.message} onRetry={refetch} />
            ) : data?.data?.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title={`No results for "${q}"`}
                    description="Try different keywords or browse all articles."
                    action={<Link to="/explore" className="btn-primary text-sm">Browse All</Link>}
                />
            ) : (
                <>
                    <p className="text-sm mb-6" style={{ color: 'var(--color-cream-300)' }}>
                        Found {data?.pagination?.total} result{data?.pagination?.total !== 1 ? 's' : ''} for "<strong className="text-white">{q}</strong>"
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.data.map((post, i) => (
                            <PostCard key={post._id} post={post} index={i} />
                        ))}
                    </div>
                    <Pagination page={page} pages={data?.pagination?.pages || 1} onPage={setPage} />
                </>
            )}
        </div>
    );
}
