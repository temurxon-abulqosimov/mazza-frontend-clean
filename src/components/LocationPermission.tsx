import React from 'react';
import { MapPin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { useLocalization } from '../contexts/LocalizationContext';

interface LocationPermissionProps {
  onLocationGranted?: () => void;
  onLocationDenied?: () => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ 
  onLocationGranted, 
  onLocationDenied 
}) => {
  const { location, locationPermission, isLoading, error, requestLocation } = useLocation();
  const { t } = useLocalization();

  const handleRequestLocation = async () => {
    await requestLocation();
    
    // Call appropriate callback based on result
    if (location) {
      onLocationGranted?.();
    } else {
      onLocationDenied?.();
    }
  };

  // Don't show if location is already granted
  if (locationPermission === 'granted' && location) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
          <Loader className="w-12 h-12 text-orange-500 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('locationPermissionTitle')}
          </h3>
          <p className="text-gray-600">
            {t('locationPermissionGranted')}
          </p>
        </div>
      </div>
    );
  }

  // Show permission denied state
  if (locationPermission === 'denied' || error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('locationRequired')}
          </h3>
          <p className="text-gray-600 mb-4">
            {error || t('locationPermissionDenied')}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRequestLocation}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              {t('enableLocation')}
            </button>
            <button
              onClick={() => onLocationDenied?.()}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show initial permission request
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm text-center">
        <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('locationPermissionTitle')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('locationPermissionMessage')}
        </p>
        <div className="space-y-3">
          <button
            onClick={handleRequestLocation}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            {t('enableLocation')}
          </button>
          <button
            onClick={() => onLocationDenied?.()}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPermission;
