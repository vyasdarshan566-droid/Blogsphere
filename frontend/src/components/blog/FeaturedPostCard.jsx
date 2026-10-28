import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Eye } from 'lucide-react';
import { format } from 'date-fns';

export default function FeaturedPostCard({ post }) {
    if (!post) return null;
    const { title, slug, excerpt, coverImage, category, author, publishedAt, views } = post;

    return (
        <motion.article
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="featured-article relative rounded-2xl overflow-hidden group"
            style={{ minHeight: 420 }}
        >
            {/* Background image */}
            <div className="absolute inset-0">
                <img
                    src={coverImage || '/images/article-placeholder.svg'}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/article-placeholder.svg'; }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(9,14,30,0.97) 0%, rgba(9,14,30,0.5) 60%, transparent 100%)' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-end h-full p-8" style={{ minHeight: 420 }}>
                <span className="badge badge-blue mb-4 self-start">{category}</span>
                <Link to={`/blog/${slug}`}>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight line-clamp-3 group-hover:text-accent-400 transition-colors"
                        style={{ fontFamily: 'var(--font-serif)' }}>
                        {title}
                    </h2>
                </Link>
                <p className="text-sm leading-relaxed mb-5 line-clamp-2" style={{ color: 'var(--color-cream-300)' }}>
                    {excerpt}
                </p>
                <div className="flex items-center gap-4">
                    {author && (
                        <Link to={`/profile/${author._id}`} className="flex items-center gap-2">
                            <img
                                src={author.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${author.name}`}
                                alt={author.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
                            />
                            <span className="text-sm font-medium text-white">{author.name}</span>
                        </Link>
                    )}
                    <span className="text-white/40">·</span>
                    {publishedAt && (
                        <span className="text-sm flex items-center gap-1 text-white/60">
                            <Calendar size={13} />
                            {format(new Date(publishedAt), 'MMM d, yyyy')}
                        </span>
                    )}
                    {views > 0 && (
                        <span className="text-sm flex items-center gap-1 text-white/60">
                            <Eye size={13} />
                            {views.toLocaleString()} views
                        </span>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
