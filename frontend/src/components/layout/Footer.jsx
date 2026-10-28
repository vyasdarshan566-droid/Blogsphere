import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

const CATEGORIES = ['Technology', 'Programming', 'Design', 'Business', 'Science', 'Health'];
const currentYear = new Date().getFullYear();

export default function Footer() {
    return (
        <footer style={{ background: 'var(--color-navy-900)', borderTop: '1px solid color-mix(in srgb, white 8%, transparent)' }} className="mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-500)' }}>
                                <BookOpen size={16} color="white" />
                            </div>
                            <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-cream-50)' }}>
                                BlogSphere
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-cream-300)', maxWidth: 320 }}>
                            A premium editorial publishing platform for writers, thinkers, and storytellers. Share your ideas with the world.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Explore</h4>
                        <ul className="space-y-2.5">
                            {[
                                { to: '/', label: 'Home' },
                                { to: '/explore', label: 'All Posts' },
                                { to: '/search', label: 'Search' },
                                { to: '/write', label: 'Write' },
                            ].map(({ to, label }) => (
                                <li key={to}>
                                    <Link to={to} className="text-sm transition-colors" style={{ color: 'var(--color-cream-300)' }}
                                        onMouseEnter={(e) => (e.target.style.color = 'white')}
                                        onMouseLeave={(e) => (e.target.style.color = 'var(--color-cream-300)')}>
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-4">Categories</h4>
                        <ul className="space-y-2.5">
                            {CATEGORIES.map((cat) => (
                                <li key={cat}>
                                    <Link
                                        to={`/explore?category=${cat}`}
                                        className="text-sm transition-colors"
                                        style={{ color: 'var(--color-cream-300)' }}
                                        onMouseEnter={(e) => (e.target.style.color = 'white')}
                                        onMouseLeave={(e) => (e.target.style.color = 'var(--color-cream-300)')}
                                    >
                                        {cat}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <hr className="divider mt-10" />
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>
                        © {currentYear} BlogSphere. All rights reserved.
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-cream-300)' }}>
                        Built with ❤️ for writers everywhere.
                    </p>
                </div>
            </div>
        </footer>
    );
}
