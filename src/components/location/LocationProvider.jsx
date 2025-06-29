import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/api/entities';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default function LocationProvider({ children }) {
  const [location, setLocation] = useState({
    coordinates: null,
    city: null,
    isLoading: false,
    hasPermission: null,
    error: null
  });

  // Israeli cities with coordinates for reverse geocoding
  const israeliCities = [
    { name: 'תל אביב', lat: 32.0853, lng: 34.7818, radius: 15 },
    { name: 'ירושלים', lat: 31.7683, lng: 35.2137, radius: 20 },
    { name: 'חיפה', lat: 32.7940, lng: 34.9896, radius: 15 },
    { name: 'ראשון לציון', lat: 31.9730, lng: 34.8066, radius: 10 },
    { name: 'פתח תקווה', lat: 32.0878, lng: 34.8878, radius: 10 },
    { name: 'אשדוד', lat: 31.8044, lng: 34.6553, radius: 12 },
    { name: 'נתניה', lat: 32.3215, lng: 34.8532, radius: 12 },
    { name: 'באר שבע', lat: 31.2518, lng: 34.7915, radius: 15 },
    { name: 'חולון', lat: 32.0117, lng: 34.7725, radius: 8 },
    { name: 'רמת גן', lat: 32.0719, lng: 34.8229, radius: 8 }
  ];

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestCity = (lat, lng) => {
    let nearestCity = null;
    let minDistance = Infinity;

    israeliCities.forEach(city => {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < city.radius && distance < minDistance) {
        minDistance = distance;
        nearestCity = city.name;
      }
    });

    return nearestCity || 'אחר';
  };

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        hasPermission: false
      }));
      return;
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nearestCity = findNearestCity(latitude, longitude);
        
        const newLocation = {
          coordinates: { lat: latitude, lng: longitude },
          city: nearestCity,
          isLoading: false,
          hasPermission: true,
          error: null
        };

        setLocation(newLocation);

        // Save to user profile
        try {
          await User.updateMyUserData({
            city: nearestCity,
            coordinates: { lat: latitude, lng: longitude }
          });
        } catch (error) {
          console.error('Error saving location to user profile:', error);
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setLocation(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: false,
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const checkExistingLocation = async () => {
    try {
      const user = await User.me();
      if (user.city && user.coordinates) {
        setLocation({
          coordinates: user.coordinates,
          city: user.city,
          isLoading: false,
          hasPermission: true,
          error: null
        });
      }
    } catch (error) {
      console.error('Error loading user location:', error);
    }
  };

  useEffect(() => {
    checkExistingLocation();
  }, []);

  const contextValue = {
    ...location,
    requestLocation,
    cities: israeliCities,
    calculateDistance
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}