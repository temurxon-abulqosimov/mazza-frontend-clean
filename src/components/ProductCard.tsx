import React from 'react';
import { MapPin, Clock, Star, Heart, Phone } from 'lucide-react';
import { Product } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

interface ProductCardProps {
  product: Product;
  distance?: number | null;
  onProductClick: () => void;
  onSellerClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  distance, 
  onProductClick, 
  onSellerClick 
}) => {
  const { t } = useLocalization();

  const getBusinessTypeColor = (businessType: string) => {
    switch (businessType) {
      case 'market':
        return 'bg-green-100 text-green-800';
      case 'bakery':
        return 'bg-yellow-100 text-yellow-800';
      case 'restaurant':
        return 'bg-red-100 text-red-800';
      case 'cafe':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const discountPercentage = getDiscountPercentage(product.price, product.originalPrice);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Product Image */}
      <div className="relative h-48 bg-gray-200">
        <div className="absolute top-2 left-2">
          {discountPercentage && (
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              -{discountPercentage}%
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <button className="p-2 bg-white rounded-full shadow-sm">
            <Heart className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        {/* Placeholder for product image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl"></span>
            </div>
            <p className="text-sm text-gray-600">Product Image</p>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{product.store?.businessName || product.seller?.businessName || 'Unknown Seller'}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBusinessTypeColor(product.store?.businessType || product.seller?.businessType || 'other')}`}>
              {product.store?.businessType || product.seller?.businessType || 'other'}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">
            {product.description || product.name || 'Fresh surplus food available'}
          </p>
          <p className="text-xs text-gray-500">{t('quantity')}: {product.quantity} available</p>
        </div>

        {/* Location, Time, Rating */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{distance ? `${distance.toFixed(1)} km` : 'Nearby'}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>Until {formatTime(product.availableUntil)}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            <span>{product.stats?.averageRating || product.seller?.averageRating || 0}</span>
          </div>
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {product.originalPrice.toFixed(0)} {t('so_m')}
              </span>
            )}
            <span className="text-lg font-bold text-orange-500">
              {product.price.toFixed(0)} {t('so_m')}
            </span>
          </div>
          <button className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {t('available')}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={onProductClick}
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            {t('viewDetails')}
          </button>
          <button
            onClick={onSellerClick}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

