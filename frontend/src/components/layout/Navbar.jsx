import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import {
    PenSquare,
    Search,
    LogOut,
    User,
    LayoutDashboard,
    BookOpen,
    Menu,
    X,
    Shield,
    BookMarked,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        toast.success('Logged out successfully');
        navigate('/');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/explore', label: 'Explore' },
    ];

    return (
        <header className="sticky top-0 z-50" style={{
            background: 'color-mix(in srgb, var(--color-navy-900) 90%, transparent)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid color-mix(in srgb, white 8%, transparent)',
        }}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-accent-500)' }}>
                        <BookOpen size={16} color="white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-cream-50)' }}>
                        BlogSphere
                    </span>
                </Link>

                {/* Desktop Nav links */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.to === '/'}
                            className={({ isActive }) =>
                                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'text-white bg-white/10'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            {l.label}
                        </NavLink>
                    ))}
                </div>

                {/* Search + Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    <button
                        onClick={() => navigate('/search')}
                        className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label="Search"
                    >
                        <Search size={18} />
                    </button>

                    {user ? (
                        <>
                            <Link to="/write" className="hidden sm:flex btn-primary text-sm py-2 px-4">
                                <PenSquare size={15} /> Write
                            </Link>

                            {/* User avatar dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors"
                                >
                                    <img
                                        src={user.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full object-cover border-2"
                                        style={{ borderColor: 'var(--color-accent-500)' }}
                                    />
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute right-0 mt-2 w-52 glass-card py-1 shadow-2xl"
                                            style={{ zIndex: 100 }}
                                        >
                                            <div className="px-4 py-2 border-b" style={{ borderColor: 'color-mix(in srgb, white 8%, transparent)' }}>
                                                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                                                <p className="text-xs text-white/50 truncate">{user.email}</p>
                                            </div>
                                            {[
                                                { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                                                { to: `/profile/${user._id}`, label: 'Profile', icon: User },
                                                { to: '/my-blogs', label: 'My Blogs', icon: BookMarked },
                                                ...(user.role === 'admin' ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
                                            ].map(({ to, label, icon: Icon }) => (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                                >
                                                    <Icon size={15} /> {label}
                                                </Link>
                                            ))}
                                            <hr className="my-1" style={{ borderColor: 'color-mix(in srgb, white 8%, transparent)' }} />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 px-4 py-2 text-sm w-full text-red-400 hover:bg-white/5 transition-colors"
                                            >
                                                <LogOut size={15} /> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link to="/login" className="btn-secondary text-sm py-2 px-4 hidden sm:flex">Login</Link>
                            <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                        </div>
                    )}

                    {/* Mobile menu toggle */}
                    <button
                        className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors ml-1"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={menuOpen}
                        aria-controls="mobile-navigation"
                    >
                        {menuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t overflow-hidden"
                        id="mobile-navigation"
                        style={{ borderColor: 'color-mix(in srgb, white 8%, transparent)', background: 'var(--color-navy-900)' }}
                    >
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((l) => (
                                <NavLink
                                    key={l.to}
                                    to={l.to}
                                    end={l.to === '/'}
                                    onClick={() => setMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {l.label}
                                </NavLink>
                            ))}
                            {user && (
                                <>
                                    <Link to="/write" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                        <PenSquare size={15} /> Write
                                    </Link>
                                    <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                        <LayoutDashboard size={15} /> Dashboard
                                    </Link>
                                </>
                            )}
                            {!user && (
                                <div className="flex gap-2 pt-2">
                                    <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary flex-1 justify-center text-sm py-2">Login</Link>
                                    <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 justify-center text-sm py-2">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
