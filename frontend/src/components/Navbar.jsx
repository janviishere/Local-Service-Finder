import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wrench, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const navLinks = [
  { title: 'Home',     path: '/'        },
  { title: 'About',   path: '/about'   },
  { title: 'Services',path: '/services'},
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen]         = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* On home page the hero is dark — nav text should be white until scrolled */
  const isDark = isHome && !isScrolled;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-4"
    >
      <div className={cn(
        'max-w-7xl mx-auto flex items-center justify-between rounded-2xl px-6 py-3 transition-all duration-500',
        isScrolled ? 'glassmorphism shadow-lg' : 'bg-transparent'
      )}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="bg-royal-blue text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-md">
            <Wrench size={22} />
          </div>
          <span className={cn(
            'font-heading font-black text-xl tracking-tight transition-colors',
            isDark ? 'text-white' : 'text-deep-navy'
          )}>
            Local<span className="text-royal-blue">Finds</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.title}
              to={link.path}
              className={cn(
                'relative font-semibold text-sm transition-colors',
                location.pathname === link.path
                  ? 'text-royal-blue'
                  : isDark
                    ? 'text-white/80 hover:text-white'
                    : 'text-deep-navy/70 hover:text-deep-navy'
              )}
            >
              {link.title}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-royal-blue rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={cn(
                  'text-sm font-semibold transition-colors flex items-center gap-1',
                  isDark ? 'text-white/80 hover:text-white' : 'text-deep-navy/70 hover:text-deep-navy'
                )}
              >
                <User size={16} /> Dashboard
              </Link>
              <button
                onClick={logout}
                className="bg-royal-blue/10 text-royal-blue border border-royal-blue/20 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-royal-blue hover:text-white transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={cn(
                  'text-sm font-semibold transition-colors',
                  isDark ? 'text-white/80 hover:text-white' : 'text-deep-navy/70 hover:text-deep-navy'
                )}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-royal-blue text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-md hover:shadow-royal-blue/30"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn('md:hidden p-2 rounded-xl transition-colors', isDark ? 'text-white' : 'text-deep-navy')}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mt-2 mx-4 md:hidden"
          >
            <div className="glassmorphism rounded-2xl p-5 flex flex-col gap-2 shadow-xl">
              {navLinks.map(link => (
                <Link
                  key={link.title}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl font-semibold text-sm transition-colors',
                    location.pathname === link.path
                      ? 'bg-royal-blue/10 text-royal-blue'
                      : 'text-deep-navy hover:bg-slate-100'
                  )}
                >
                  {link.title}
                </Link>
              ))}
              <div className="border-t border-slate-200 my-1" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl font-semibold text-sm text-deep-navy hover:bg-slate-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="block w-full text-center bg-red-50 text-red-600 px-4 py-3 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl font-semibold text-sm text-deep-navy hover:bg-slate-100 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-royal-blue text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
