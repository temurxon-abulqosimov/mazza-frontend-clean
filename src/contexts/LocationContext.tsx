import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalization } from './LocalizationContext';

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  location: Location | null;
  locationPermission: 'granted' | 'denied' | 'prompt' | 'unknown';
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextType>({
  location: null,
  locationPermission: 'unknown',
  isLoading: false,
  error: null,
  requestLocation: async () => {},
  clearLocation: () => {},
});

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();

  // Check if geolocation is supported
  const isGeolocationSupported = () => {
    return 'geolocation' in navigator;
  };

  // Get current location permission status
  const checkLocationPermission = async () => {
    if (!isGeolocationSupported()) {
      setLocationPermission('denied');
      setError(t('locationError'));
      return;
    }

    try {
      // Check if we can get high accuracy position (this will trigger permission prompt if needed)
      const permission = await navigator.permissions?.query({ name: 'geolocation' });
      
      if (permission) {
        setLocationPermission(permission.state);
        
        // Listen for permission changes
        permission.addEventListener('change', () => {
          setLocationPermission(permission.state);
        });
      } else {
        // Fallback for browsers that don't support permissions API
        setLocationPermission('prompt');
      }
    } catch (err) {
      console.warn('Permission API not supported, will prompt on location request');
      setLocationPermission('prompt');
    }
  };

  // Request user's current location
  const requestLocation = async (): Promise<void> => {
    if (!isGeolocationSupported()) {
      setError(t('locationError'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const newLocation: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      setLocation(newLocation);
      setLocationPermission('granted');
      setError(null);
      
      // Store location in localStorage for future use
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      
    } catch (err: any) {
      console.error('Location request failed:', err);
      setLocationPermission('denied');
      
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError(t('locationPermissionDenied'));
          break;
        case err.POSITION_UNAVAILABLE:
          setError(t('locationError'));
          break;
        case err.TIMEOUT:
          setError(t('locationError'));
          break;
        default:
          setError(t('locationError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear location data
  const clearLocation = () => {
    setLocation(null);
    setLocationPermission('unknown');
    setError(null);
    localStorage.removeItem('userLocation');
  };

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocation(parsedLocation);
        setLocationPermission('granted');
      } catch (err) {
        console.warn('Failed to parse saved location:', err);
        localStorage.removeItem('userLocation');
      }
    }
    
    // Check permission status
    checkLocationPermission();
  }, []);

  // Auto-request location if permission is granted but no location
  useEffect(() => {
    if (locationPermission === 'granted' && !location && !isLoading) {
      requestLocation();
    }
  }, [locationPermission]);

  const value: LocationContextType = {
    location,
    locationPermission,
    isLoading,
    error,
    requestLocation,
    clearLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
