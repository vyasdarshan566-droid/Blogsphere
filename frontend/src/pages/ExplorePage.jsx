import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { postsApi } from '../api';
import PostCard from '../components/blog/PostCard';
import Pagination from '../components/blog/Pagination';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { BookOpen } from 'lucide-react';
import PostSkeleton from '../components/common/PostSkeleton';

const CATEGORIES = ['Technology', 'Programming', 'Design', 'Business', 'Science', 'Health', 'Travel', 'Food', 'Lifestyle', 'Other'];

export default function ExplorePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const [tagDraft, setTagDraft] = useState({ tag, value: tag });
    const tagInputValue = tagDraft.tag === tag ? tagDraft.value : tag;
    const sort = searchParams.get('sort') || 'newest';
    const parsedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['posts', 'explore', category, tag, sort, page],
        queryFn: () =>
            postsApi.getAll({ category: category || undefined, tag: tag || undefined, sort, page, limit: 12 }).then((r) => r.data),
    });

    const setCategory = (cat) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('page');
            if (cat) next.set('category', cat);
            else next.delete('category');
            return next;
        });
    };

    const setPage = (p) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('page', p);
            return next;
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const clearFilters = () => {
        setTagDraft({ tag: '', value: '' });
        setSearchParams({});
    };

    return (
        <div className="page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                    Explore Articles
                </h1>
                <p style={{ color: 'var(--color-cream-300)' }}>
                    Discover stories across every topic from our community of writers.
                </p>
            </div>

            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Thoughtful perspectives from across the community.</p>
                <label className="flex items-center gap-2 text-sm text-slate-600">Sort by
                        <select aria-label="Sort articles" value={sort} onChange={(event) => setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('sort', event.target.value); next.delete('page'); return next; })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-800">
                            <option value="newest">Latest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="popular">Most viewed</option>
                            <option value="title">Title</option>
                    </select>
                </label>
            </div>

            <form className="mb-7 flex flex-wrap items-end gap-3" onSubmit={(event) => {
                event.preventDefault();
                const next = new URLSearchParams(searchParams);
                const value = tagInputValue.trim();
                if (value) next.set('tag', value);
                else next.delete('tag');
                next.delete('page');
                setSearchParams(next);
            }}>
                <label htmlFor="explore-tag" className="text-sm text-slate-600">Filter by tag</label>
                <input id="explore-tag" value={tagInputValue} onChange={(event) => setTagDraft({ tag, value: event.target.value })} placeholder="e.g. design" className="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800" />
                <button type="submit" className="btn-secondary px-3 py-2 text-sm">Apply tag</button>
                {(category || tag || sort !== 'newest') && <button type="button" onClick={clearFilters} className="btn-secondary px-3 py-2 text-sm">Clear filters</button>}
            </form>

            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap mb-10">
                <span className="flex items-center gap-1 text-sm mr-1" style={{ color: 'var(--color-cream-300)' }}>
                    <Filter size={14} /> Filter:
                </span>
                <button
                    onClick={() => setCategory('')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!category ? 'bg-accent-500 text-white' : ''
                        }`}
                    style={!category ? { background: 'var(--color-accent-500)' } : {
                        background: 'color-mix(in srgb, white 7%, transparent)',
                        color: 'var(--color-cream-300)',
                        border: '1px solid color-mix(in srgb, white 10%, transparent)',
                    }}
                >
                    All
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={category === cat ? { background: 'var(--color-accent-500)', color: 'white' } : {
                            background: 'color-mix(in srgb, white 7%, transparent)',
                            color: 'var(--color-cream-300)',
                            border: '1px solid color-mix(in srgb, white 10%, transparent)',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Results */}
            {isLoading ? (
                <PostSkeleton count={6} />
            ) : error ? (
                <ErrorMessage message={error.message} onRetry={refetch} />
            ) : data?.data?.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="No posts found"
                    description={category || tag ? `No published posts match the selected ${category && tag ? 'category and tag' : category ? 'category' : 'tag'} filters.` : 'No posts published yet.'}
                />
            ) : (
                <>
                    <div className="mb-4 text-sm" style={{ color: 'var(--color-cream-300)' }}>
                        {data?.pagination?.total} article{data?.pagination?.total !== 1 ? 's' : ''} found
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data?.data?.map((post, i) => (
                            <PostCard key={post._id} post={post} index={i} />
                        ))}
                    </div>
                    <Pagination
                        page={page}
                        pages={data?.pagination?.pages || 1}
                        onPage={setPage}
                    />
                </>
            )}
        </div>
    );
}
