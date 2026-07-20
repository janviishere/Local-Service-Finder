import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Loader, Search, Navigation } from 'lucide-react';

// Fix Leaflet's default icon paths when bundled with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickHandler({ onLocationFound }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onLocationFound(lat, lng, null); // trigger loading immediately
      try {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await resp.json();
        const city =
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          'Selected Location';
        onLocationFound(lat, lng, { city, full: data.display_name });
      } catch {
        onLocationFound(lat, lng, { city: 'Selected Location', full: `${lat.toFixed(5)}, ${lng.toFixed(5)}` });
      }
    },
  });
  return null;
}

export default function MapPicker({ onSelectLocation, height = 400 }) {
  const [marker, setMarker]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [address, setAddress]   = useState('');
  const [search, setSearch]     = useState('');
  const [results, setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [center, setCenter]     = useState([20.5937, 78.9629]); // India

  const handleLocationFound = useCallback((lat, lng, info) => {
    setMarker([lat, lng]);
    setCenter([lat, lng]);
    if (!info) {
      setLoading(true);
      setAddress('Finding address…');
      return;
    }
    setLoading(false);
    setAddress(info.city);
    if (onSelectLocation) {
      onSelectLocation({ name: info.city, full: info.full, lat, lon: lng });
    }
  }, [onSelectLocation]);

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await resp.json();
      setResults(data);
    } catch {
      // fail silently
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    const city = r.address?.city || r.address?.town || r.address?.village || r.display_name.split(',')[0];
    setResults([]);
    setSearch('');
    handleLocationFound(lat, lng, { city, full: r.display_name });
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md relative" style={{ height }}>
      {/* Search box overlay */}
      <div className="absolute top-3 left-3 right-3 z-[1000] space-y-1">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search area, locality or city…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl shadow-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg hover:bg-blue-500 transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            {searching ? <Loader size={14} className="animate-spin" /> : <Navigation size={14} />}
            Go
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-48 overflow-y-auto">
            {results.map((r, i) => (
              <button key={i} onClick={() => selectResult(r)}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-2 transition-colors">
                <MapPin size={12} className="text-blue-500 mt-1 flex-shrink-0" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected address chip */}
      {(address || loading) && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2 max-w-[80%]">
          {loading
            ? <Loader size={14} className="text-blue-600 animate-spin flex-shrink-0" />
            : <MapPin size={14} className="text-blue-600 flex-shrink-0" />}
          <span className="text-sm font-semibold text-slate-700 dark:text-white truncate">{address || 'Finding location…'}</span>
        </div>
      )}

      {/* Map */}
      <MapContainer
        center={center}
        zoom={marker ? 14 : 5}
        style={{ height: '100%', width: '100%' }}
        key={center.join(',')}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <ClickHandler onLocationFound={handleLocationFound} />
        {marker && <Marker position={marker} />}
      </MapContainer>
    </div>
  );
}
