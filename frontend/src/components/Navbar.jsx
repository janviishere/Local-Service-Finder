import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wrench, User, Sun, Moon, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocationContext } from '../context/LocationContext';
import LocationSearch from './LocationSearch';

const navLinks = [
  { title: 'Home',     path: '/'        },
  { title: 'About',   path: '/about'   },
  { title: 'Services',path: '/services'},
];

// Helper to concatenate classes
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen]         = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  
  const routerLocation = useLocation();
  const isHome = routerLocation.pathname === '/';
  
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { location, setLocation } = useLocationContext();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* On home page the hero is dark — nav text should be white until scrolled */
  const isHeroDark = isHome && !isScrolled;

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setIsLocationOpen(false);
  };

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

        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="bg-royal-blue text-white p-2 rounded-xl group-hover:scale-110 transition-transform shadow-md">
              <Wrench size={22} />
            </div>
            <span className={cn(
              'font-heading font-black text-xl tracking-tight transition-colors',
              isHeroDark ? 'text-white' : isDark ? 'text-white' : 'text-deep-navy'
            )}>
              Local<span className="text-royal-blue">Finds</span>
            </span>
          </Link>

          {/* Location Selector (Desktop) */}
          <div className="hidden lg:flex relative items-center">
            <button 
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors",
                isHeroDark 
                  ? 'border-white/20 text-white hover:bg-white/10' 
                  : isDark 
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              <MapPin size={16} className={isHeroDark ? 'text-white' : 'text-royal-blue'} />
              <span className="max-w-[120px] truncate">{location?.name || 'Set Location'}</span>
            </button>

            {isLocationOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50">
                <LocationSearch 
                  placeholder="Enter your city..." 
                  onSelect={handleLocationSelect}
                  initialValue={location?.name || ''}
                />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link
              key={link.title}
              to={link.path}
              className={cn(
                'relative font-semibold text-sm transition-colors',
                routerLocation.pathname === link.path
                  ? 'text-royal-blue'
                  : isHeroDark
                    ? 'text-white/80 hover:text-white'
                    : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-deep-navy/70 hover:text-deep-navy'
              )}
            >
              {link.title}
              {routerLocation.pathname === link.path && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-royal-blue rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right side: Theme Toggle + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            id="theme-toggle-btn"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={cn(
              'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 hover:scale-110',
              isHeroDark
                ? 'text-white bg-white/10 hover:bg-white/20'
                : isDark
                  ? 'text-yellow-400 bg-white/10 hover:bg-white/20'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            )}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className={cn(
                  'flex items-center gap-2 p-1 pr-3 rounded-full border transition-colors',
                  isHeroDark
                    ? 'border-white/20 hover:bg-white/10'
                    : isDark ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-royal-blue text-white flex items-center justify-center font-bold text-sm">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full" alt="" /> : user.name.charAt(0)}
                </div>
                <span className={cn('text-sm font-semibold truncate max-w-[100px]', isHeroDark ? 'text-white' : isDark ? 'text-white' : 'text-deep-navy')}>
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={cn(
                  'text-sm font-semibold transition-colors',
                  isHeroDark ? 'text-white/80 hover:text-white' : isDark ? 'text-slate-300 hover:text-white' : 'text-deep-navy/70 hover:text-deep-navy'
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
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={cn(
              'p-2 rounded-xl transition-colors',
              isHeroDark ? 'text-white' : isDark ? 'text-yellow-400' : 'text-slate-600'
            )}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn('p-2 rounded-xl transition-colors', isHeroDark ? 'text-white' : isDark ? 'text-white' : 'text-deep-navy')}
            aria-label="Toggle navigation"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
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
              
              <div className="mb-4">
                <p className={cn("text-xs font-semibold mb-2 ml-2 uppercase", isDark ? 'text-slate-400' : 'text-slate-500')}>Location</p>
                <LocationSearch 
                  placeholder="Set location..." 
                  onSelect={handleLocationSelect}
                  initialValue={location?.name || ''}
                />
              </div>

              {navLinks.map(link => (
                <Link
                  key={link.title}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'block px-4 py-3 rounded-xl font-semibold text-sm transition-colors',
                    routerLocation.pathname === link.path
                      ? 'bg-royal-blue/10 text-royal-blue'
                      : isDark
                        ? 'text-slate-200 hover:bg-white/10'
                        : 'text-deep-navy hover:bg-slate-100'
                  )}
                >
                  {link.title}
                </Link>
              ))}
              <div className="border-t border-slate-200/20 my-1" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={cn('block px-4 py-3 rounded-xl font-semibold text-sm transition-colors', isDark ? 'text-slate-200 hover:bg-white/10' : 'text-deep-navy hover:bg-slate-100')}
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
                    className={cn('block px-4 py-3 rounded-xl font-semibold text-sm transition-colors', isDark ? 'text-slate-200 hover:bg-white/10' : 'text-deep-navy hover:bg-slate-100')}
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

