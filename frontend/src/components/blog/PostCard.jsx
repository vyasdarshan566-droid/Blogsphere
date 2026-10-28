import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';

function readTime(content) {
    const words = content?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
}

export default function PostCard({ post, index = 0 }) {
    if (!post) return null;
    const { title, slug, excerpt, coverImage, category, author, publishedAt, views, content } = post;
    const publishedDate = publishedAt && Number.isFinite(new Date(publishedAt).getTime()) ? format(new Date(publishedAt), 'MMM d, yyyy') : null;

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
            className="group glass-card overflow-hidden hover:shadow-2xl transition-all duration-300"
            style={{ '--tw-shadow-color': 'color-mix(in srgb, var(--color-accent-500) 10%, transparent)' }}
        >
            {/* Cover Image */}
            <Link to={`/blog/${slug}`} className="block overflow-hidden aspect-video relative bg-navy-800">
                {coverImage ? (
                    <img
                        src={coverImage}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/article-placeholder.svg'; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg, var(--color-navy-700), var(--color-navy-600))' }}>
                        📝
                    </div>
                )}
                {/* Category badge overlay */}
                <span className="badge badge-blue absolute top-3 left-3 shadow-lg">
                    {category}
                </span>
            </Link>

            {/* Content */}
            <div className="p-5">
                {/* Author */}
                {author && (
                    <Link to={`/profile/${author._id}`} className="flex items-center gap-2 mb-3">
                        <img
                            src={author.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${author.name}`}
                            alt={author.name}
                            className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium" style={{ color: 'var(--color-cream-300)' }}>
                            {author.name}
                        </span>
                    </Link>
                )}

                {/* Title */}
                <Link to={`/blog/${slug}`}>
                    <h2 className="text-base font-semibold text-white mb-2 line-clamp-2 leading-snug group-hover:text-accent-400 transition-colors"
                        style={{ fontFamily: 'var(--font-serif)' }}>
                        {title}
                    </h2>
                </Link>

                {/* Excerpt */}
                <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--color-cream-300)', lineHeight: 1.6 }}>
                    {excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-cream-300)', opacity: 0.7 }}>
                    {publishedDate && (
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {publishedDate}
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {readTime(content)} min read
                    </span>
                    {views > 0 && (
                        <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {views.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
