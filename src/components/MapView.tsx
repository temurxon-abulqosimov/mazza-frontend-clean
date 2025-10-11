import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface MapViewProps {
  latitude: number;
  longitude: number;
  sellerName?: string;
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({ latitude, longitude, sellerName, className = '' }) => {
  // Create Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
  // Create OpenStreetMap URL
  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
  
  // Create static map image URL (using Google Maps Static API)
  // Note: This is a placeholder key - you need to replace with your actual Google Maps API key
  const hasApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY && process.env.REACT_APP_GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY';
  const staticMapUrl = hasApiKey 
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&markers=color:red%7C${latitude},${longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    : null;

  const handleMapClick = () => {
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Location</h3>
          </div>
          <button
            onClick={handleMapClick}
            className="flex items-center space-x-1 px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open Map</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {/* Static Map Preview */}
          <div 
            className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center border-2 border-dashed border-blue-200"
            onClick={handleMapClick}
          >
            {hasApiKey && staticMapUrl ? (
              <img
                src={staticMapUrl}
                alt={`Map showing ${sellerName || 'seller'} location`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a placeholder if the static map fails
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="w-full h-full flex flex-col items-center justify-center text-blue-600">
                        <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span class="text-sm font-semibold">Map Preview</span>
                        <span class="text-xs text-blue-500">Tap to open in external map</span>
                      </div>
                    `;
                  }
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-blue-600">
                <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-sm font-semibold">Map Preview</span>
                <span className="text-xs text-blue-500">Tap to open in external map</span>
              </div>
            )}
          </div>
          
          {/* Coordinates */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">Latitude:</span>
                <span className="font-mono text-xs">{latitude.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Longitude:</span>
                <span className="font-mono text-xs">{longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(googleMapsUrl, '_blank')}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => window.open(openStreetMapUrl, '_blank')}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>OpenStreetMap</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
