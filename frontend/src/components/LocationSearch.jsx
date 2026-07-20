import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';

// Popular Indian cities for instant offline suggestions
const INDIAN_CITIES = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai','Kolkata','Pune','Ahmedabad',
  'Jaipur','Surat','Lucknow','Kanpur','Nagpur','Indore','Bhopal','Visakhapatnam',
  'Patna','Vadodara','Ghaziabad','Ludhiana','Agra','Nashik','Faridabad','Meerut',
  'Rajkot','Varanasi','Srinagar','Amritsar','Allahabad','Howrah','Ranchi','Gwalior',
  'Jodhpur','Coimbatore','Vijayawada','Jabalpur','Madurai','Raipur','Kota','Dhanbad',
  'Aurangabad','Chandigarh','Noida','Gurgaon','Mysore','Thiruvananthapuram','Bhubaneswar',
];

export default function LocationSearch({ onSelect, placeholder = "Enter your city...", initialValue = "", className = "" }) {
  const { detectLocation } = useLocationContext();
  const [query, setQuery] = useState(initialValue || "");
  const [nominatimResults, setNominatimResults] = useState([]);
  const [localResults, setLocalResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Sync query when initialValue changes from outside
  useEffect(() => {
    setQuery(initialValue || "");
  }, [initialValue]);

  // Instant local city filter
  useEffect(() => {
    if (!query || query.length < 1) {
      setLocalResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matched = INDIAN_CITIES.filter(c => c.toLowerCase().startsWith(q)).slice(0, 5);
    setLocalResults(matched);
  }, [query]);

  // Debounced Nominatim search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query || query.length < 3 || !isOpen) {
      setNominatimResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1&featuretype=city`,
          { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(5000) }
        );
        const data = await resp.json();
        setNominatimResults(data);
      } catch {
        setNominatimResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 450);
    return () => clearTimeout(debounceRef.current);
  }, [query, isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (cityName) => {
    setQuery(cityName);
    setNominatimResults([]);
    setLocalResults([]);
    setIsOpen(false);
    if (onSelect) onSelect({ name: cityName });
  };

  const handleSelectNominatim = (result) => {
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.display_name.split(',')[0];
    setQuery(city);
    setNominatimResults([]);
    setLocalResults([]);
    setIsOpen(false);
    if (onSelect) {
      onSelect({
        name: city,
        full: result.display_name,
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
      });
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setQuery('');
    setNominatimResults([]);
    setLocalResults([]);
    if (onSelect) onSelect(null);
  };

  const handleDetect = async () => {
    try {
      setIsDetecting(true);
      const loc = await detectLocation();
      setQuery(loc.name);
      setIsOpen(false);
      if (onSelect) onSelect(loc);
    } catch (err) {
      console.error("Location detect failed:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  // Combine: local cities first, then Nominatim (deduplicated)
  const nomCityNames = nominatimResults.map(r =>
    (r.address?.city || r.address?.town || r.display_name.split(',')[0]).toLowerCase()
  );
  const filteredLocal = localResults.filter(city =>
    !nomCityNames.includes(city.toLowerCase())
  );
  const showDropdown = isOpen && (!query || filteredLocal.length > 0 || nominatimResults.length > 0);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex items-center w-full relative">
        <MapPin className="absolute left-3 text-royal-blue shrink-0 z-10" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-3 rounded-xl outline-none font-medium text-sm
            bg-transparent
            text-slate-900 dark:text-white
            placeholder:text-slate-400
            border border-slate-200 dark:border-slate-600
            focus:border-royal-blue
            transition-colors"
        />
        <div className="absolute right-3 flex items-center gap-1">
          {isLoading && <Loader2 size={16} className="animate-spin text-royal-blue" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-[999] w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">

          {/* Use current location */}
          {!query && (
            <button
              type="button"
              onClick={handleDetect}
              className="w-full text-left px-4 py-3 cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 transition-colors"
            >
              {isDetecting
                ? <Loader2 size={16} className="animate-spin text-royal-blue shrink-0" />
                : <Navigation size={16} className="text-royal-blue shrink-0" />}
              <span className="text-sm font-semibold text-royal-blue">Use current location</span>
            </button>
          )}

          {/* Instant local city matches */}
          {filteredLocal.map((city, idx) => (
            <button
              key={`local-${idx}`}
              type="button"
              onClick={() => handleSelectCity(city)}
              className="w-full text-left px-4 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
            >
              <MapPin size={14} className="text-royal-blue shrink-0" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{city}</span>
              <span className="text-xs text-slate-400 ml-auto">India</span>
            </button>
          ))}

          {/* Nominatim results */}
          {nominatimResults.map((result, idx) => {
            const city = result.address?.city || result.address?.town || result.address?.village || result.display_name.split(',')[0];
            return (
              <button
                key={`nom-${idx}`}
                type="button"
                onClick={() => handleSelectNominatim(result)}
                className="w-full text-left px-4 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
              >
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{city}</p>
                  <p className="text-xs text-slate-400 truncate">{result.display_name}</p>
                </div>
              </button>
            );
          })}

          {/* No results */}
          {query && query.length >= 2 && nominatimResults.length === 0 && filteredLocal.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
              No cities found for &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
