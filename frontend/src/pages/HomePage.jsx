import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, TrendingUp, PenSquare, Search } from 'lucide-react';
import { postsApi } from '../api';
import FeaturedPostCard from '../components/blog/FeaturedPostCard';
import PostCard from '../components/blog/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';
import PostSkeleton from '../components/common/PostSkeleton';
import EmptyState from '../components/common/EmptyState';

const CATEGORIES = ['Technology', 'Programming', 'Design', 'Business', 'Science', 'Health', 'Travel', 'Food'];

export default function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const { data: featuredData, isLoading: featuredLoading, error: featuredError } = useQuery({
        queryKey: ['posts', 'featured'],
        queryFn: () => postsApi.getFeatured().then((r) => r.data.data),
    });

    const { data: recentData, isLoading: recentLoading, error: recentError, refetch: refetchRecent } = useQuery({
        queryKey: ['posts', 'recent'],
        queryFn: () => postsApi.getAll({ limit: 9 }).then((r) => r.data),
    });

    const featured = featuredData?.[0];
    const otherFeatured = featuredData?.slice(1, 4) || [];
    const recent = recentData?.data || [];

    return (
        <div className="page-enter">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 pb-16"
                style={{ background: 'linear-gradient(to bottom, var(--color-navy-900), var(--color-navy-950))' }}>
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 30% 50%, var(--color-accent-500), transparent 60%)',
                }} />
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-14"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
                            style={{ background: 'color-mix(in srgb, var(--color-accent-500) 15%, transparent)', color: 'var(--color-accent-400)', border: '1px solid color-mix(in srgb, var(--color-accent-500) 25%, transparent)' }}>
                            <TrendingUp size={14} />
                            Premium Editorial Platform
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
                            Stories Worth
                            <span className="gradient-text"> Reading</span>
                        </h1>
                        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: 'var(--color-cream-300)' }}>
                            Discover insightful articles from expert writers across technology, design, business, and culture. Join BlogSphere and share your perspective with the world.
                        </p>
                        <div className="flex items-center justify-center gap-3 flex-wrap">
                            <Link to="/explore" className="btn-primary">
                                <BookOpen size={16} /> Explore Posts
                            </Link>
                            {user ? (
                                <Link to="/write" className="btn-secondary">
                                    <PenSquare size={16} /> Write Article
                                </Link>
                            ) : (
                                <Link to="/register" className="btn-secondary">
                                    Start Writing Free
                                </Link>
                            )}
                        </div>
                        <form onSubmit={(event) => { event.preventDefault(); if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`); }} className="mx-auto mt-8 flex max-w-xl gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                            <label htmlFor="home-search" className="sr-only">Search articles</label>
                            <Search aria-hidden="true" className="ml-2 mt-2.5 shrink-0 text-slate-400" size={18} />
                            <input id="home-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stories, ideas, and people" className="min-w-0 flex-1 border-0 bg-transparent px-2 py-2 text-sm text-slate-800 outline-none" />
                            <button type="submit" className="btn-primary px-4 py-2">Search</button>
                        </form>
                    </motion.div>

                    {/* Featured Article */}
                    {featuredLoading ? (
                        <LoadingSpinner />
                    ) : featuredError ? (
                        <ErrorMessage message="Failed to load featured posts." />
                    ) : featured ? (
                        <div className="mb-6">
                            <FeaturedPostCard post={featured} />
                        </div>
                    ) : null}

                </div>
            </section>

            {/* Categories */}
            {otherFeatured.length > 0 && <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-end justify-between gap-4">
                    <div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-accent-500">Reader favorites</p><h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>Trending this week</h2></div>
                    <Link to="/explore?sort=popular" className="flex items-center gap-1 text-sm font-medium text-accent-500">Explore <ArrowRight size={14} /></Link>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{otherFeatured.map((post, index) => <PostCard key={post._id} post={post} index={index} />)}</div>
            </section>}

            <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>Browse by Category</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                to={`/explore?category=${cat}`}
                                className="px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5"
                                style={{
                                    background: 'color-mix(in srgb, var(--color-navy-700) 80%, transparent)',
                                    color: 'var(--color-cream-200)',
                                    border: '1px solid color-mix(in srgb, white 10%, transparent)',
                                }}
                            >
                                {cat}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Recent Posts */}
            <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>Recent Articles</h2>
                    <Link to="/explore" className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--color-accent-400)' }}>
                        View all <ArrowRight size={14} />
                    </Link>
                </div>
                {recentLoading ? <PostSkeleton count={6} /> : recentError ? <ErrorMessage message={recentError.message} onRetry={refetchRecent} /> : recent.length === 0 ? <EmptyState icon={BookOpen} title="No stories published yet" description="Be the first to share a story with the community." action={<Link to={user ? '/write' : '/register'} className="btn-primary">Start writing</Link>} /> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recent.map((post, i) => (
                            <PostCard key={post._id} post={post} index={i} />
                        ))}
                    </div>
                )}
            </section>

            {/* CTA Banner */}
            {!user && (
                <section className="py-20" style={{ background: 'var(--color-navy-900)' }}>
                    <div className="max-w-3xl mx-auto text-center px-4">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                                Ready to share your story?
                            </h2>
                            <p className="text-lg mb-8" style={{ color: 'var(--color-cream-300)' }}>
                                Join thousands of writers and readers on BlogSphere. It's free and always will be.
                            </p>
                            <Link to="/register" className="btn-primary text-base px-8 py-3">
                                <PenSquare size={18} /> Start Writing Today
                            </Link>
                        </motion.div>
                    </div>
                </section>
            )}
        </div>
    );
}
