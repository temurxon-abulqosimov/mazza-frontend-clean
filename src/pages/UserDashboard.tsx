import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Star, 
  MapPin, 
  Search,
  Heart,
  Bell
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import Logo from '../components/Logo';
import { config } from '../config/env';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { useLocation } from '../contexts/LocationContext';
import { useNotifications } from '../contexts/NotificationContext';
import { productsApi, ordersApi } from '../services/api';
import { Product, Seller } from '../types';
import LocationPermission from '../components/LocationPermission';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, isReady } = useTelegram();
  const { t } = useLocalization();
  const { location, locationPermission, isLoading: locationLoading, requestLocation } = useLocation();
  const { unreadCount, addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'orders' | 'profile'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use location from context, fallback to default location
      const userLocation = location || { latitude: 41.2995, longitude: 69.2401 };
      
      const [productsResponse, ordersResponse] = await Promise.all([
        productsApi.getProductsNearby(userLocation.latitude, userLocation.longitude),
        ordersApi.getMyOrders()
      ]);

      // Handle the new data structure from backend
      const productsData = (productsResponse.data?.products || productsResponse.data || [])
        .filter((p: Product) => p.isActive !== false && ((p.quantity ?? 1) > 0));
      setProducts(productsData);
      setFilteredProducts(
        productsData.filter((p: Product) => selectedCategory === 'all' || p.category === selectedCategory)
      );
      setOrders(ordersResponse.data || []);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        setError(t('pleaseRegister'));
      } else if (err.response?.status === 403) {
        setError(t('accessDenied'));
      } else {
        setError(t('failedToLoadDashboard'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && user && userProfile?.isRegistered) {
      // Load data in background, don't block the main flow
      loadDashboardData();
      
      // Sample notifications disabled to avoid confusion in production-like env
    }
  }, [isReady, user, userProfile, location, addNotification, t]);

  // Filter products when category changes or products are loaded
  useEffect(() => {
    if (products.length > 0) {
      filterProductsByCategory();
    }
  }, [selectedCategory, products]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If no search query, show all products or filter by category
      filterProductsByCategory();
      return;
    }
    
    try {
      setLoading(true);
      
      // Use current location for search
      const userLocation = location || { latitude: 41.2995, longitude: 69.2401 };
      
      // Search products with the query and category filter
      const response = await productsApi.searchProducts(searchQuery, selectedCategory === 'all' ? undefined : selectedCategory);
      // Handle the new data structure from backend
      const productsData = response.data?.products || response.data || [];
      setFilteredProducts(productsData);
    } catch (err) {
      console.error('Search failed:', err);
      setError(t('searchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const filterProductsByCategory = async () => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
      return;
    }
    
    try {
      setLoading(true);
      
      // Use current location for filtering
      const userLocation = location || { latitude: 41.2995, longitude: 69.2401 };
      
      // Search with empty query but with category filter
      const response = await productsApi.searchProducts('', selectedCategory);
      const productsData = response.data?.products || response.data || [];
      setFilteredProducts(productsData);
    } catch (err) {
      console.error('Category filtering failed:', err);
      // Fallback to client-side filtering
      const filtered = products.filter(product => 
        product.store?.businessType === selectedCategory
      );
      setFilteredProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (searchQuery.trim()) {
      // If there's a search query, trigger search with new category
      handleSearch();
    } else {
      // If no search query, filter by category only
      filterProductsByCategory();
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleSellerClick = (sellerId: number) => {
    navigate(`/seller-detail/${sellerId}`);
  };

  const getCategoryEmoji = (category?: string) => {
    switch (category) {
      case 'bread_bakery': return '🍞';
      case 'pastry': return '🥐';
      case 'main_dishes': return '🍽️';
      case 'desserts': return '🍰';
      case 'beverages': return '🥤';
      default: return '🍞';
    }
  };

  const categories = [
    { value: 'all', label: t('allCategories') },
    { value: 'bread_bakery', label: t('breadBakery') },
    { value: 'pastry', label: t('pastry') },
    { value: 'main_dishes', label: t('mainDishes') },
    { value: 'desserts', label: t('desserts') },
    { value: 'beverages', label: t('beverages') },
    { value: 'other', label: t('other') },
  ];

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
            onClick={loadDashboardData}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-white pb-20 overflow-x-hidden">
      {/* Location Permission Modal - with error boundary */}
      {typeof window !== 'undefined' && (
        <LocationPermission 
          onLocationGranted={() => {
            console.log('Location granted, reloading data...');
            loadDashboardData();
          }}
          onLocationDenied={() => {
            console.log('Location denied, using default location');
            // Continue with default location
          }}
        />
      )}
      
      {/* Beautiful Header */}
      <div className="bg-white shadow-sm border-b border-orange-100 sticky top-0 z-50 w-full">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-3">
          {/* Top Row - Logo and Actions */}
          <div className="flex items-center justify-between mb-2">
            <Logo size="sm" showText={true} />
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/user/notifications')}
                className="relative p-2 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200"
              >
                <Bell className="w-4 h-4 text-orange-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className="p-2 bg-orange-50 rounded-xl hover:bg-orange-100 transition-all duration-200"
              >
                <Search className="w-4 h-4 text-orange-600" />
              </button>
            </div>
          </div>
          
          {/* Bottom Row - User Info */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">
                  {userProfile?.firstName?.charAt(0) || user?.first_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {t('discover')}
              </h1>
              <p className="text-xs text-gray-600 flex items-center">
                <MapPin className="w-3 h-3 mr-1 text-orange-500" />
                {location ? t('nearby') : t('findBestDeals')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Search Bar */}
      <div className="bg-white px-4 sm:px-6 py-4 border-b border-orange-100 w-full">
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("searchProductsAndStores")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-2 bottom-2 px-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-200 font-medium"
            >
              {t('searchButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Beautiful Category Filter */}
      <div className="bg-white px-4 sm:px-6 py-4 border-b border-orange-100 w-full">
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {getCategoryEmoji(category.value)} {category.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Featured Products */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                    {t('featuredProducts')}
                  </span>
                </h2>
                <div className="text-sm text-gray-500 bg-orange-100 px-3 py-1 rounded-full">
                  {filteredProducts.length} {t('items')}
                </div>
              </div>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noProductsFound')}</h3>
                  <p className="text-gray-600 mb-4">{t('tryDifferentSearch')}</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 transition-all duration-200 shadow-lg"
                  >
                    {t('clearSearch')}
                  </button>
                </div>
              ) : (
                <div className="grid gap-5">
                  {filteredProducts.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="bg-white rounded-2xl shadow-lg border border-orange-100 p-4 sm:p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group w-full"
                    >
                      <div className="flex space-x-3 sm:space-x-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-md">
                            {product.imageUrl || ((product as any).seller?.id || (product as any).store?.id) ? (
                              <img
                                src={
                                  product.imageUrl || `${config.API_BASE_URL}/webapp/sellers/${((product as any).seller?.id ?? (product as any).store?.id)}/photo`
                                }
                                alt={product.description || product.name}
                                className="w-full h-full object-cover rounded-2xl"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className="text-orange-600 text-2xl">
                                {getCategoryEmoji(product.category)}
                              </div>
                            )}
                          </div>
                          {product.originalPrice && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                            {product.description || product.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-center truncate">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 flex-shrink-0"></span>
                            <span className="truncate">{product.store?.businessName || t('store')}</span>
                          </p>
                          
                          <div className="flex items-center space-x-2 sm:space-x-4 mb-3">
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current flex-shrink-0" />
                              <span className="text-xs sm:text-sm font-medium text-gray-700">{product.stats?.averageRating || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-gray-600">{product.store?.distance || 0} {t('distance')}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                              <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                {product.price.toLocaleString()} {t('so_m')}
                              </span>
                              {product.originalPrice && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through truncate">
                                  {product.originalPrice.toLocaleString()} {t('so_m')}
                                </span>
                              )}
                            </div>
                            <button 
                              className="p-1.5 sm:p-2 bg-orange-100 hover:bg-orange-200 rounded-xl transition-all duration-200 group-hover:scale-110 flex-shrink-0 ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle favorite
                              }}
                            >
                              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('searchResults')}</h2>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600 mb-2">{t('noProductsFound')}</p>
                <p className="text-sm text-gray-500">{t('tryDifferentSearch')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex space-x-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                      {product.imageUrl || ((product as any).seller?.id || (product as any).store?.id) ? (
                        <img
                          src={
                            product.imageUrl || `${config.API_BASE_URL}/webapp/sellers/${((product as any).seller?.id ?? (product as any).store?.id)}/photo`
                          }
                          alt={product.description || product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        ) : (
                          <div className="text-orange-600 text-2xl font-bold">
                            {getCategoryEmoji(product.category)}
                          </div>
                        )}
                      {product.originalPrice && (
                        <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                          -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.description || product.name}</h3>
                      <p className="text-sm text-gray-600">{product.store?.businessName || t('store')}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{product.stats?.averageRating || 0}</span>
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{product.store?.distance || 0} {t('distance')}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {product.price} so'm
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {product.originalPrice} so'm
                            </span>
                          )}
                        </div>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Heart className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('myOrders')}</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{t('noOrdersYet')}</p>
                <p className="text-sm text-gray-500">{t('startExploringProducts')}</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{t('orderNumber')}{order.id}</span>
                      <span className="text-sm text-gray-600">{order.status}</span>
                    </div>
                    <p className="text-sm text-gray-600">{order.product?.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-semibold text-gray-900">${order.totalPrice}</span>
                      <span className="text-sm text-gray-600">{order.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">{t('profile')}</h2>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold">
                    {user?.first_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">@{user?.username}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation currentPage="home" />
    </div>
  );
};

export default UserDashboard;


