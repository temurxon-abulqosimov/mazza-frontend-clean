import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';

interface MapViewProps {
  latitude: number;
  longitude: number;
  sellerName?: string;
  className?: string;
}

const MapView: React.FC<MapViewProps> = ({ latitude, longitude, sellerName, className = '' }) => {
  // Create external map URLs
  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const yandexMapsUrl = `https://yandex.com/maps/?ll=${longitude}%2C${latitude}&z=15&pt=${longitude}%2C${latitude},pm2rdm`;
  
  // OpenStreetMap embedded preview (no API key required)
  // Build a small bbox around the point for the iframe
  const bboxPad = 0.01;
  const left = (longitude - bboxPad).toFixed(6);
  const bottom = (latitude - bboxPad).toFixed(6);
  const right = (longitude + bboxPad).toFixed(6);
  const top = (latitude + bboxPad).toFixed(6);
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  const handleMapClick = () => {
    // Open in new tab
    window.open(yandexMapsUrl, '_blank');
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
          {/* OpenStreetMap Preview (embedded) */}
          <div className="w-full h-40 rounded-xl overflow-hidden border border-blue-200">
            <iframe
              title={`OpenStreetMap - ${sellerName || 'seller'}`}
              src={osmEmbedUrl}
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(yandexMapsUrl, '_blank')}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-[#FFCC00] text-black rounded-lg hover:opacity-90 transition-colors text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>Yandex Maps</span>
            </button>
            <button
              onClick={() => window.open(googleMapsUrl, '_blank')}
              className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>Google Maps</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
