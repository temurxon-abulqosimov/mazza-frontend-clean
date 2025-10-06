import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Star, 
  MapPin, 
  Search,
  Heart
} from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { productsApi, ordersApi } from '../services/api';
import { Product, Seller } from '../types';

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile, isReady } = useTelegram();
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'orders' | 'profile'>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user location for product discovery
      const userLocation = userProfile?.location || { latitude: 41.2995, longitude: 69.2401 }; // Default to Tashkent
      
      const [productsResponse, ordersResponse] = await Promise.all([
        productsApi.getProductsNearby(userLocation.latitude, userLocation.longitude),
        ordersApi.getMyOrders()
      ]);

      // Handle the new data structure from backend
      const productsData = productsResponse.data?.products || productsResponse.data || [];
      setProducts(productsData);
      setOrders(ordersResponse.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady && user) {
      // Load data in background, don't block the main flow
      loadDashboardData();
    }
  }, [isReady, user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const userLocation = userProfile?.location || { latitude: 41.2995, longitude: 69.2401 };
      
      const response = await productsApi.searchProducts(searchQuery, selectedCategory);
      // Handle the new data structure from backend
      const productsData = response.data?.products || response.data || [];
      setProducts(productsData);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
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
    { value: 'bakery', label: 'Bakery' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'grocery', label: 'Grocery' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            Retry
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
            <h1 className="text-lg font-semibold text-gray-900">{t('discover')}</h1>
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

      {/* Category Filter */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="max-w-md mx-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
              <div className="grid gap-4">
                {products.slice(0, 6).map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product.id)}
                    className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex space-x-3">
                      <img
                        src={product.imageUrl || product.store?.imageUrl || 'https://via.placeholder.com/64x64'}
                        alt={product.description || product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.description || product.name}</h3>
                        <p className="text-sm text-gray-600">{product.store?.businessName || 'Store'}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{product.stats?.averageRating || 0}</span>
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{product.store?.distance || 0} km</span>
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
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Results</h2>
            <div className="grid gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product.id)}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex space-x-3">
                    <img
                      src={product.imageUrl || product.store?.imageUrl || 'https://via.placeholder.com/64x64'}
                      alt={product.description || product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.description || product.name}</h3>
                      <p className="text-sm text-gray-600">{product.store?.businessName || 'Store'}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{product.stats?.averageRating || 0}</span>
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{product.store?.distance || 0} km</span>
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
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders yet</p>
                <p className="text-sm text-gray-500">Start exploring products to place your first order!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Order #{order.id}</span>
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
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
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


