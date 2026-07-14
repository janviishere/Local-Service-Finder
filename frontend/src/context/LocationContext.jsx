import { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

async function reverseGeocode(lat, lng) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  if (!res.ok) throw new Error('Nominatim error');
  return res.json();
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('userLocation');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (location) {
      localStorage.setItem('userLocation', JSON.stringify(location));
    }
  }, [location]);

  const detectLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      } else {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const data = await reverseGeocode(latitude, longitude);
              if (data && data.address) {
                const city =
                  data.address.city ||
                  data.address.town ||
                  data.address.village ||
                  data.address.county ||
                  data.address.state_district ||
                  'Your Location';
                const newLoc = {
                  name: city,
                  lat: latitude,
                  lon: longitude,
                  display_name: data.display_name,
                };
                setLocation(newLoc);
                resolve(newLoc);
              } else {
                reject(new Error('Could not determine city'));
              }
            } catch (err) {
              reject(err);
            }
          },
          (err) => reject(new Error(err.message || 'Location access denied')),
          { timeout: 10000 }
        );
      }
    });
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocationContext = () => useContext(LocationContext);
