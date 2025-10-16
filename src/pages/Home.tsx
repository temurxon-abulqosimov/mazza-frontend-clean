import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { productsApi, sellersApi } from '../services/api';
import { Product, Seller } from '../types';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, isReady } = useTelegram();
  const { t } = useLocalization();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Memoize distance calculation to avoid recalculation
  const calculateDistance = useCallback((userLocation: { lat: number; lng: number }, sellerLocation: { latitude: number; longitude: number }) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (sellerLocation.latitude - userLocation.lat) * Math.PI / 180;
    const dLng = (sellerLocation.longitude - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(sellerLocation.latitude * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Memoize categories to avoid recreation on every render
  const categories = useMemo(() => [
    { value: 'all', label: t('allCategories') },
    { value: 'bakery', label: t('bakery') },
    { value: 'restaurant', label: t('restaurant') },
    { value: 'cafe', label: t('cafe') },
    { value: 'grocery', label: t('grocery') },
  ], [t]);

  const loadHomeData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get user location from profile or default to Tashkent
      const getUserLocation = () => {
        if (!userProfile?.location) {
          return { latitude: 41.3111, longitude: 69.2797 };
        }
        
        if (typeof userProfile.location === 'string') {
          // Parse string location if needed
          try {
            const coords = JSON.parse(userProfile.location);
            return { latitude: coords.latitude, longitude: coords.longitude };
          } catch {
            return { latitude: 41.3111, longitude: 69.2797 };
          }
        }
        
        return userProfile.location;
      };
      
      const userLocation = getUserLocation();
      
      // Load data in parallel for better performance
      const [sellersResponse, productsResponse] = await Promise.all([
        sellersApi.getSellersNearby(userLocation.latitude, userLocation.longitude),
        productsApi.getProductsNearby(userLocation.latitude, userLocation.longitude)
      ]);

      const fetchedSellers = sellersResponse.data;
      // Handle the new data structure from backend
      const fetchedProducts = productsResponse.data?.products || productsResponse.data || [];

      // Add distance to sellers
      const sellersWithDistance = fetchedSellers.map((seller: Seller) => ({
        ...seller,
        distance: calculateDistance({ lat: userLocation.latitude, lng: userLocation.longitude }, seller.location)
      }));

      setSellers(sellersWithDistance);
      setProducts(fetchedProducts);
    } catch (err: any) {
      console.error('Failed to load home data:', err);
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        setError(t('pleaseRegister'));
      } else if (err.response?.status === 403) {
        setError(t('accessDenied'));
      } else {
        setError(t('failedToLoadHome'));
      }
    } finally {
      setLoading(false);
    }
  }, [calculateDistance, userProfile]);

  useEffect(() => {
    if (isReady && user && userProfile?.isRegistered) {
      loadHomeData();
    }
  }, [isReady, user, userProfile, loadHomeData]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const userLocation = userProfile?.location || { latitude: 41.3111, longitude: 69.2797 };
      
      const response = await productsApi.searchProducts(searchQuery, selectedCategory);
      // Handle the new data structure from backend
      const productsData = response.data?.products || response.data || [];
      setProducts(productsData);
    } catch (err) {
      console.error('Search failed:', err);
      setError(t('searchFailed'));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, userProfile]);

  const handleProductClick = useCallback((productId: number) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleSellerClick = useCallback((sellerId: number) => {
    navigate(`/seller-detail/${sellerId}`);
  }, [navigate]);

  // Memoize filtered products to avoid recalculation
  const displayedProducts = useMemo(() => products.slice(0, 6), [products]);
  const displayedSellers = useMemo(() => sellers.slice(0, 3), [sellers]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadHomeData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-gray-900">{t('discover')}</h1>
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">San Francisco, CA</span>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="max-w-md mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={t("searchProducts")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Category Chips */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="max-w-md mx-auto overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-3 py-1 rounded-full border text-sm whitespace-nowrap ${selectedCategory === category.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {/* Discover Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('discover')}</h2>
          <div className="grid grid-cols-2 gap-4">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product as any}
                distance={(product as any)?.store?.distance ?? (product as any)?.seller?.distance}
                onProductClick={() => handleProductClick(product.id)}
                onSellerClick={() => handleSellerClick((product as any)?.store?.id ?? (product as any)?.seller?.id)}
              />
            ))}
          </div>
        </div>

        {/* Nearby Sellers */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nearby Sellers</h2>
          <div className="grid gap-4">
            {displayedSellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => handleSellerClick(seller.id)}
                className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex space-x-3">
                  <img
                    src={seller.businessImageUrl || 'https://via.placeholder.com/64x64'}
                    alt={seller.businessName}
                    className="w-16 h-16 object-cover rounded-xl"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{seller.businessName}</h3>
                    <p className="text-sm text-gray-600 capitalize">{seller.businessType}</p>
                    <div className="text-sm text-gray-600 mt-1">
                      {seller.averageRating?.toFixed ? seller.averageRating.toFixed(1) : seller.averageRating} · {seller.distance?.toFixed ? seller.distance.toFixed(1) : seller.distance} km
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;


