import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';

export default function MapPicker({ onSelectLocation }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressName, setAddressName] = useState('');

  const defaultCenter = { lat: 23.2599, lng: 77.4126 };

  useEffect(() => {
    let intervalId;

    const initMap = () => {
      if (window.google && window.google.maps && mapRef.current && !map) {
        const initialMap = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 6,
          disableDefaultUI: false,
        });
        setMap(initialMap);

        const initialMarker = new window.google.maps.Marker({
          map: initialMap,
        });
        setMarker(initialMarker);

        initialMap.addListener('click', (e) => {
          const latLng = e.latLng;
          initialMarker.setPosition(latLng);
          initialMap.panTo(latLng);
          initialMap.setZoom(Math.max(initialMap.getZoom(), 10));
          handleLocationFound(latLng.lat(), latLng.lng());
        });
        
        if (intervalId) clearInterval(intervalId);
      }
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      intervalId = setInterval(initMap, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [mapRef, map]);

  const handleLocationFound = async (lat, lng) => {
    setLoading(true);
    try {
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        const geocoder = new window.google.maps.Geocoder();
        const response = await geocoder.geocode({ location: { lat, lng } });
        
        if (response.results && response.results.length > 0) {
          const result = response.results[0];
          
          let city = 'Selected Location';
          for (let component of result.address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
              break;
            } else if (component.types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
          }
          
          setAddressName(city);

          if (onSelectLocation) {
            onSelectLocation({
              name: city,
              full: result.formatted_address,
              lat: lat,
              lon: lng,
            });
          }
        } else {
          setAddressName('Location selected');
          if (onSelectLocation) {
            onSelectLocation({
              name: 'Selected Location',
              full: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              lat: lat,
              lon: lng,
            });
          }
        }
      }
    } catch (error) {
      console.error('Geocoding failed:', error);
      setAddressName('Location selected');
      if (onSelectLocation) {
        onSelectLocation({
          name: 'Selected Location',
          full: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat: lat,
          lon: lng,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md" style={{ height: '400px' }}>
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
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
