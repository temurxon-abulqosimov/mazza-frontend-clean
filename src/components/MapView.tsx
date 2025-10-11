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
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&markers=color:red%7C${latitude},${longitude}&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dOWWgUfOzuBvHg`;

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
            className="w-full h-32 bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={handleMapClick}
          >
            <img
              src={staticMapUrl}
              alt={`Map showing ${sellerName || 'seller'} location`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to a placeholder if the static map fails
                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hcCBVbmF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';
              }}
            />
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
