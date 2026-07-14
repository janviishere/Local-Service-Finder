import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, onLocationFound }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 10));
    },
  });

  return position === null ? null : <Marker position={position} />;
}

async function reverseGeocode(lat, lng) {
  // Call Nominatim directly – no backend required, and no CORS issues from the browser
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) throw new Error('Nominatim error');
  return res.json();
}

export default function MapPicker({ onSelectLocation }) {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressName, setAddressName] = useState('');

  // Default center: Madhya Pradesh / Central India
  const defaultCenter = [23.2599, 77.4126];

  const handleLocationFound = async (latlng) => {
    setLoading(true);
    try {
      const data = await reverseGeocode(latlng.lat, latlng.lng);
      if (data && data.address) {
        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.county ||
          data.address.state_district ||
          'Selected Location';

        setAddressName(city);

        if (onSelectLocation) {
          onSelectLocation({
            name: city,
            full: data.display_name,
            lat: latlng.lat,
            lon: latlng.lng,
          });
        }
      } else {
        setAddressName('Selected Location');
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setAddressName('Location selected');
      if (onSelectLocation) {
        onSelectLocation({
          name: 'Selected Location',
          full: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
          lat: latlng.lat,
          lon: latlng.lng,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md">
      {/* Overlay badge */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 max-w-xs">
        {loading ? (
          <Loader size={16} className="text-royal-blue animate-spin" />
        ) : (
          <MapPin size={16} className="text-royal-blue flex-shrink-0" />
        )}
        <span className="text-sm font-semibold text-deep-navy truncate">
          {loading ? 'Finding location…' : addressName || 'Click on map to select your city'}
        </span>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '400px', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationFound={handleLocationFound}
        />
      </MapContainer>
    </div>
  );
}
