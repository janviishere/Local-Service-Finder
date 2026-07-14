import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useLocationContext } from '../context/LocationContext';
import { api } from '../lib/api';
import ServiceCard from '../components/ServiceCard';
import { Filter, Search, Check, MapPin, X } from 'lucide-react';

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const routerLocation = useLocation();
  const queryParams = new URLSearchParams(routerLocation.search);
  
  const [categoryFilter, setCategoryFilter] = useState(queryParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  const { isDark } = useTheme();
  const { location, setLocation } = useLocationContext();

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await api.get('/categories');
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Services
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
        setServices(data);
      } catch (error) {
        console.error("Failed to fetch services", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [categoryFilter, location, debouncedSearch, minPrice, maxPrice, minRating]);

  const clearFilters = () => {
    setCategoryFilter('');
    setSearchQuery('');
    setDebouncedSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    // Optionally clear location: setLocation(null);
  };

  const activeCategoryName = categoryFilter 
    ? categories.find(c => c.slug === categoryFilter)?.name 
    : 'All Services';

  // Sidebar Component for reuse in desktop & mobile
  const FiltersSidebar = () => (
    <div className="flex flex-col gap-8">
      {/* Search Bar (Mobile only inside filter, desktop has its own) */}
      <div className="md:hidden">
        <label className="text-xs font-bold uppercase tracking-wider text-secondary mb-3 block">Search</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="What do you need?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border bg-card border-border focus:outline-none focus:border-blue-500 transition-colors shadow-sm text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-bold uppercase tracking-wider text-secondary">Categories</label>
          {categoryFilter && (
            <button onClick={() => setCategoryFilter('')} className="text-xs text-blue-500 hover:text-blue-600 font-semibold">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setCategoryFilter('')}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
              categoryFilter === '' 
                ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold border' 
                : 'bg-transparent border-transparent text-secondary hover:bg-card border'
            }`}
          >
            <span className="text-sm">All Categories</span>
            {categoryFilter === '' && <Check size={16} />}
          </button>

          {categories.map(cat => {
            const isActive = categoryFilter === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.slug)}
                className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400 font-bold border shadow-sm' 
                    : 'bg-transparent border-transparent text-secondary hover:bg-card border hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg opacity-80">{cat.icon}</span>
                  <span className="text-sm">{cat.name}</span>
                </div>
                {isActive && <Check size={16} />}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-secondary mb-3 block">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border bg-card border-border focus:outline-none focus:border-blue-500 text-sm"
          />
          <span className="text-secondary">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border bg-card border-border focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-secondary mb-3 block">Minimum Rating</label>
        <select 
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="w-full px-3 py-3 rounded-xl border bg-card border-border focus:outline-none focus:border-blue-500 text-sm"
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5 & Above</option>
          <option value="4.0">4.0 & Above</option>
          <option value="3.5">3.5 & Above</option>
          <option value="3.0">3.0 & Above</option>
        </select>
      </div>

      {location?.name && (
        <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <label className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-2 block">Current Location</label>
          <div className="flex items-center gap-2 text-primary font-medium">
            <MapPin size={16} className="text-blue-500" />
            {location.name}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-24 bg-primary text-primary transition-colors duration-300">
      
      {/* Hero Header */}
      <div className="bg-alt border-b border-border mb-8 pb-8 pt-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">
                {activeCategoryName}
              </h1>
              <p className="text-secondary text-lg">
                {services.length} {services.length === 1 ? 'professional' : 'professionals'} available 
                {location?.name && <span> in <strong className="text-primary">{location.name}</strong></span>}
              </p>
            </div>
            
            {/* Desktop Search Bar */}
            <div className="hidden md:block w-full max-w-md">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search for any service..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border bg-card border-border focus:outline-none focus:border-blue-500 transition-all shadow-sm focus:shadow-md text-base"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full"
                  >
                    <X size={16} className="text-slate-500" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden flex items-center justify-center gap-2 w-full py-3 bg-card border border-border rounded-xl font-bold shadow-sm"
            >
              <Filter size={18} /> Filters & Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 shrink-0">
          <div className="sticky top-28 p-6 rounded-3xl border bg-card border-border shadow-sm">
            <FiltersSidebar />
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileFiltersOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-primary z-50 p-6 overflow-y-auto border-r border-border md:hidden shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black">Filters</h2>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-card rounded-full border border-border">
                    <X size={20} />
                  </button>
                </div>
                <FiltersSidebar />
                <button 
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full mt-8 py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30"
                >
                  Show {services.length} Results
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content (Grid) */}
        <main className="flex-1 min-w-0">
          
          {/* Active Filter Pills */}
          {(categoryFilter || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm text-secondary">Active filters:</span>
              {categoryFilter && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-500/20">
                  {activeCategoryName}
                  <button onClick={() => setCategoryFilter('')} className="hover:bg-blue-500/20 rounded-full p-0.5"><X size={14} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold border border-blue-500/20">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:bg-blue-500/20 rounded-full p-0.5"><X size={14} /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-sm text-secondary hover:text-primary underline underline-offset-2 ml-2">
                Clear all
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-card border border-border rounded-2xl h-80">
                  <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-t-2xl" />
                  <div className="p-5 space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-full"
                >
                  <ServiceCard service={service} isDark={isDark} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-card border border-border border-dashed rounded-3xl shadow-sm">
              <div className="w-20 h-20 bg-alt rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No services found</h3>
              <p className="text-secondary max-w-sm mx-auto mb-8">
                We couldn't find any services matching your criteria. Try adjusting your filters or search in a different area.
              </p>
              <button 
                onClick={clearFilters}
                className="px-6 py-3 bg-primary border border-border rounded-full font-bold hover:bg-alt transition-colors shadow-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
