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
      const productsData = productsResponse.data?.products || productsResponse.data || [];
      setProducts(productsData);
      setFilteredProducts(productsData);
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
      
      // Add sample notifications for testing (only once)
      const hasSampleNotifications = localStorage.getItem('sampleNotificationsAddedUser');
      if (!hasSampleNotifications && user?.id) {
        // Add sample notifications for users
        addNotification({
          type: 'order',
          title: t('orderConfirmed') || 'Order Confirmed',
          message: t('orderConfirmationMessage') || 'Your order has been confirmed and is being processed.',
          userId: user.id.toString(),
        });
        
        addNotification({
          type: 'system',
          title: t('welcomeUser') || 'Welcome to Mazza',
          message: t('welcomeUserMessage') || 'Welcome to Mazza! Discover amazing products from local sellers.',
        });
        
        localStorage.setItem('sampleNotificationsAddedUser', 'true');
      }
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
    <div className="min-h-screen bg-gray-50 pb-20">
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/user/notifications')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{t('discover')}</h1>
            </div>
            <button
              onClick={() => setActiveTab('search')}
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
              placeholder={t("searchProductsAndStores")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {t('searchButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="max-w-md mx-auto">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto p-4">
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* Featured Products */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('featuredProducts')}</h2>
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
                  {filteredProducts.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex space-x-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.description || product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-orange-600 text-2xl font-bold">
                            {product.name?.charAt(0) || '🍞'}
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
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.description || product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-orange-600 text-2xl font-bold">
                          {product.name?.charAt(0) || '🍞'}
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


