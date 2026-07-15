import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLocationContext } from '../context/LocationContext';
import { api } from '../lib/api';
import ServiceCard from '../components/ServiceCard';
import LocationSearch from '../components/LocationSearch';
import {
  Filter, Search, X, SlidersHorizontal, MapPin,
  Zap, Droplets, Home as HomeIcon, Wind, Paintbrush,
  Hammer, Bug, Lock, ChevronDown, ChevronUp, Star, RotateCcw,
} from 'lucide-react';

const CATEGORY_ICONS = {
  electrician:      <Zap size={20} />,
  plumber:          <Droplets size={20} />,
  'house-cleaning': <HomeIcon size={20} />,
  'ac-repair':      <Wind size={20} />,
  painting:         <Paintbrush size={20} />,
  carpentry:        <Hammer size={20} />,
  'pest-control':   <Bug size={20} />,
  security:         <Lock size={20} />,
};

const CAT_COLORS = {
  electrician:      '#D97706',
  plumber:          '#2563EB',
  'house-cleaning': '#059669',
  'ac-repair':      '#0891B2',
  painting:         '#7C3AED',
  carpentry:        '#92400E',
  'pest-control':   '#DC2626',
  security:         '#16A34A',
};

const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'reviews', label: 'Most Reviewed' },
];

export default function Services() {
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef(null);

  const routerLocation = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(routerLocation.search);

  const [categoryFilter, setCategoryFilter] = useState(queryParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  const { isDark } = useTheme();
  const { location, setLocation } = useLocationContext();

  // Close sort menu on outside click
  useEffect(() => {
    const handler = (e) => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSortMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try { setCategories(await api.get('/categories')); } catch {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let url = '/services?';
        if (categoryFilter) url += `category=${categoryFilter}&`;
        if (location?.name) url += `city=${encodeURIComponent(location.name)}&`;
        if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}&`;
        if (minPrice) url += `minPrice=${minPrice}&`;
        if (maxPrice) url += `maxPrice=${maxPrice}&`;
        if (minRating) url += `minRating=${minRating}&`;
        const data = await api.get(url);
        setAllServices(data);
      } catch { setAllServices([]); }
      finally { setLoading(false); }
    };
    fetchServices();
  }, [categoryFilter, location, debouncedSearch, minPrice, maxPrice, minRating]);

  // Client-side sort
  useEffect(() => {
    const sorted = [...allServices].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
      const pa = parseInt(String(a.price).replace(/\D/g, ''));
      const pb = parseInt(String(b.price).replace(/\D/g, ''));
      if (sortBy === 'price_asc') return pa - pb;
      if (sortBy === 'price_desc') return pb - pa;
      return 0;
    });
    setServices(sorted);
  }, [allServices, sortBy]);

  const clearFilters = () => {
    setCategoryFilter('');
    setSearchQuery('');
    setDebouncedSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setLocation(null);
  };

  const activeFiltersCount = [categoryFilter, searchQuery, minPrice, maxPrice, minRating, location?.name].filter(Boolean).length;
  const activeCat = categories.find(c => c.slug === categoryFilter);
  const activeSortLabel = SORT_OPTIONS.find(s => s.value === sortBy)?.label;

  return (
    <div className="min-h-screen bg-primary text-primary" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* ── Sticky Top Bar ── */}
      <div className="sticky top-0 z-40 shadow-sm border-b border-border" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-3">

          {/* Row 1: Search + Location + Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-royal-blue transition-colors z-10" size={18} />
              <input
                type="text"
                placeholder="Search for a service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 rounded-2xl border bg-card border-border focus:outline-none focus:border-royal-blue focus:ring-2 focus:ring-royal-blue/10 transition-all text-sm font-medium"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Location */}
            <div className="sm:w-64 rounded-2xl border bg-card border-border px-1 py-1">
              <LocationSearch
                placeholder="Your city..."
                onSelect={setLocation}
                initialValue={location?.name || ''}
                className="w-full"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(p => !p)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-royal-blue text-white border-royal-blue shadow-lg shadow-royal-blue/20'
                  : 'bg-card border-border hover:border-royal-blue/50'
              }`}
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-royal-blue text-xs font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative" ref={sortRef}>
              <button
                onClick={() => setShowSortMenu(p => !p)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border bg-card border-border font-bold text-sm hover:border-royal-blue/50 transition-all whitespace-nowrap"
              >
                <Star size={15} className="text-amber-400" />
                {activeSortLabel}
                {showSortMenu ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl py-2 z-50"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-alt transition-colors flex items-center justify-between ${
                          sortBy === opt.value ? 'text-royal-blue font-bold' : ''
                        }`}
                      >
                        {opt.label}
                        {sortBy === opt.value && <div className="w-2 h-2 rounded-full bg-royal-blue" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Row 2: Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setCategoryFilter('')}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                categoryFilter === ''
                  ? 'bg-deep-navy text-white border-deep-navy shadow-md dark:bg-white dark:text-deep-navy'
                  : 'border-border bg-card hover:border-slate-400 text-secondary'
              }`}
            >
              All Services
            </button>
            {categories.map(cat => {
              const color = CAT_COLORS[cat.slug];
              const isActive = categoryFilter === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.slug)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    isActive ? 'text-white border-transparent shadow-md' : 'border-border bg-card hover:border-slate-400 text-secondary'
                  }`}
                  style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Expandable Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-border"
              style={{ backgroundColor: 'var(--bg-alt)' }}
            >
              <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-wrap gap-6 items-end">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Price Range (₹)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-28 px-3 py-2 rounded-xl border bg-card border-border focus:outline-none focus:border-royal-blue text-sm" />
                    <span className="text-slate-400">—</span>
                    <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-28 px-3 py-2 rounded-xl border bg-card border-border focus:outline-none focus:border-royal-blue text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Minimum Rating</label>
                  <select value={minRating} onChange={e => setMinRating(e.target.value)} className="px-3 py-2 rounded-xl border bg-card border-border focus:outline-none focus:border-royal-blue text-sm">
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5★ & Above</option>
                    <option value="4.0">4.0★ & Above</option>
                    <option value="3.5">3.5★ & Above</option>
                  </select>
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <RotateCcw size={14} /> Clear All
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black">
              {activeCat ? activeCat.name : 'All Services'}
            </h1>
            <p className="text-secondary text-sm mt-0.5">
              {loading ? 'Loading...' : `${services.length} service${services.length !== 1 ? 's' : ''} found`}
              {location?.name && <span> · <MapPin size={12} className="inline text-royal-blue" /> {location.name}</span>}
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-card border border-border rounded-3xl overflow-hidden">
                <div className="h-44 bg-slate-200 dark:bg-slate-800" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {services.map((service) => (
              <motion.div
                key={service.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <ServiceCard service={service} isDark={isDark} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-28 bg-card border border-dashed border-border rounded-3xl">
            <div className="w-20 h-20 bg-alt rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">🔍</div>
            <h3 className="text-2xl font-black mb-3">No services found</h3>
            <p className="text-secondary max-w-sm mx-auto mb-8 text-sm">
              We couldn't find services matching your criteria. Try adjusting your filters or searching in a different city.
            </p>
            <button onClick={clearFilters} className="px-6 py-3 bg-royal-blue text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-royal-blue/20">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
