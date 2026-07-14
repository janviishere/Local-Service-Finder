import { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';
import { api } from '../lib/api';

export default function LocationSearch({ onSelect, placeholder = "Search for a location...", initialValue = "", className = "" }) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  
  // Debounce search
  useEffect(() => {
    if (!query || query.length < 3 || !isOpen) {
      setResults([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await api.get(`/location/search?q=${encodeURIComponent(query)}`);
        setResults(data || []);
      } catch (error) {
        console.error("Location search failed", error);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce to respect Nominatim limits
    
    return () => clearTimeout(timeoutId);
  }, [query, isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelect = (result) => {
    // Extract city or most relevant part
    let displayName = result.display_name;
    const parts = displayName.split(',');
    const city = parts[0]; // Simple heuristic, works for many queries
    
    setQuery(city);
    setIsOpen(false);
    if (onSelect) {
      onSelect({
        name: city,
        full: displayName,
        lat: result.lat,
        lon: result.lon,
        raw: result
      });
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex items-center w-full relative">
        <MapPin className="absolute left-3 text-royal-blue shrink-0" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-transparent border rounded-xl outline-none text-deep-navy placeholder:text-slate-400 font-medium text-sm border-slate-200 focus:border-royal-blue"
        />
        {isLoading && (
          <div className="absolute right-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-royal-blue border-t-transparent"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(result)}
              className="px-4 py-3 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
            >
              <p className="text-sm font-medium text-deep-navy truncate">{result.display_name.split(',')[0]}</p>
              <p className="text-xs text-slate-500 truncate">{result.display_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
