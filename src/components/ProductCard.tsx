import React from 'react';
import { MapPin, Clock, Star, Heart, Phone } from 'lucide-react';
import { config } from '../config/env';
import { Product } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';
import { formatTime } from '../utils/timeFormat';

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
  const { t, language } = useLocalization();

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

  const getDiscountPercentage = (price: number, originalPrice?: number) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const discountPercentage = getDiscountPercentage(product.price, product.originalPrice);

  const imageSrc = (() => {
    if (product.imageUrl && product.imageUrl.length > 0) return product.imageUrl;
    const storeId = (product as any)?.store?.id;
    const sellerId = (product as any)?.seller?.id;
    if (storeId) return `${config.API_BASE_URL}/webapp/sellers/${storeId}/photo`;
    if (sellerId) return `${config.API_BASE_URL}/webapp/sellers/${sellerId}/photo`;
    return '';
  })();

  return (
    <div onClick={onProductClick} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Product Image */}
      <div className="relative h-44 sm:h-56 bg-gray-100">
        {discountPercentage && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow">
            -{discountPercentage}%
          </span>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow">
          <Heart className="w-4 h-4 text-gray-500" />
        </button>

        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.description || product.name || 'product'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              const fallback = (e.currentTarget.nextElementSibling as HTMLElement);
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}

        {/* Placeholder */}
        <div className={`absolute inset-0 items-center justify-center text-orange-600 ${imageSrc ? 'hidden' : 'flex'}`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-2xl">🍱</span>
            </div>
            <p className="text-xs text-gray-500">{t('freshSurplusFood')}</p>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{product.store?.businessName || product.seller?.businessName || t('unknownSeller')}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBusinessTypeColor(product.store?.businessType || product.seller?.businessType || 'other')}`}>
              {product.store?.businessType || product.seller?.businessType || 'other'}
            </span>
          </div>
        </div>

        {/* Product Details */}
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">
            {product.description || product.name || t('freshSurplusFood')}
          </p>
          <p className="text-xs text-gray-500">{t('quantity')}: {product.quantity} {t('quantityAvailable')}</p>
        </div>

        {/* Location, Time, Rating */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{typeof distance === 'number' ? `${distance.toFixed(1)} km` : (product.store?.distance ? `${(product.store.distance as number).toFixed(1)} km` : t('nearby'))}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            <span>{t('until')} {formatTime(product.availableUntil, language)}</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1 text-yellow-400" />
            <span>{(((product as any)?.store?.averageRating ?? product.seller?.averageRating ?? product.stats?.averageRating) ?? 0).toFixed ? ((
              (product as any)?.store?.averageRating ?? product.seller?.averageRating ?? product.stats?.averageRating ?? 0) as number
            ).toFixed(1) : ((product as any)?.store?.averageRating ?? product.seller?.averageRating ?? product.stats?.averageRating ?? 0)}</span>
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
          <button onClick={(e) => { e.stopPropagation(); onSellerClick(); }} className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50">
            {t('seeSeller')}
          </button>
        </div>
        {/* Bottom CTA */}
        <button
          onClick={onProductClick}
          className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
        >
          {t('viewDetails')}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

