import { createContext, useContext, useState } from 'react';

const LocationContext = createContext();

// Try multiple free IP geolocation APIs in sequence
async function detectByIP() {
  const apis = [
    async () => {
      const r = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      const d = await r.json();
      if (d.city) return { name: d.city, lat: d.latitude, lon: d.longitude, display_name: `${d.city}, ${d.region}` };
    },
    async () => {
      const r = await fetch('https://ip-api.com/json/?fields=city,lat,lon,regionName', { signal: AbortSignal.timeout(4000) });
      const d = await r.json();
      if (d.city) return { name: d.city, lat: d.lat, lon: d.lon, display_name: `${d.city}, ${d.regionName}` };
    },
    async () => {
      const r = await fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(4000) });
      const d = await r.json();
      if (d.cityName) return { name: d.cityName, lat: d.latitude, lon: d.longitude, display_name: `${d.cityName}, ${d.regionName}` };
    },
  ];

  for (const fn of apis) {
    try {
      const result = await fn();
      if (result) return result;
    } catch {
      // try next
    }
  }
  return null;
}

// Reverse geocode using Google Maps (already loaded on page)
function reverseGeocodeGoogle(lat, lng) {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.Geocoder) return reject(new Error('Google Maps not loaded'));
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const comp = results[0].address_components.find(c =>
          c.types.includes('locality') ||
          c.types.includes('administrative_area_level_2') ||
          c.types.includes('administrative_area_level_3')
        );
        const city = comp ? comp.long_name : 'Your Location';
        resolve({ name: city, lat, lon: lng, display_name: results[0].formatted_address });
      } else {
        reject(new Error('Geocoding failed'));
      }
    });
  });
}

// Reverse geocode using Nominatim as last resort
async function reverseGeocodeNominatim(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(5000) }
  );
  const data = await res.json();
  const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Your Location';
  return { name: city, lat, lon: lng, display_name: data.display_name };
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);

  const detectLocation = async () => {
    // Step 1: Instant IP-based detection (no permission required)
    const ipLoc = await detectByIP();
    if (ipLoc) {
      setLocation(ipLoc);
      return ipLoc;
    }

    // Step 2: Fall back to browser GPS with fast timeout
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            // Use Nominatim for reverse geocoding (no API key needed)
            const loc = await reverseGeocodeNominatim(latitude, longitude);
            setLocation(loc);
            resolve(loc);
          } catch (err) {
            reject(err);
          }
        },
        (err) => reject(new Error(err.message || 'Location access denied')),
        { timeout: 8000, maximumAge: 300000 }
      );
    });
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocationContext = () => useContext(LocationContext);
