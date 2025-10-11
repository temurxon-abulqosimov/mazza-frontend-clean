import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Store,
  Package,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Bell,
  Settings,
  ShoppingBag,
  Star,
  DollarSign,
  Tag,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import MapView from '../components/MapView';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { useNotifications } from '../contexts/NotificationContext';
import { io, Socket } from 'socket.io-client';
import { config } from '../config/env';
import { dashboardApi, productsApi, ordersApi, sellersApi, ratingsApi } from '../services/api';
import { Product, Seller } from '../types';
import ImageUpload from '../components/ImageUpload';
import Notification, { NotificationProps } from '../components/Notification';

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, isReady } = useTelegram();
  const { t } = useLocalization();
  const { unreadCount, addNotification, clearNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'profile' | 'analytics'>('dashboard');
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  // Realtime: connect to socket.io and subscribe to seller room
  useEffect(() => {
    if (!seller?.id) return;
    const socket: Socket = io(config.API_BASE_URL, { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('subscribe', { type: 'seller', id: seller.id });
    });
    
    // Handle new order notifications
    socket.on('notification', (notificationData: any) => {
      if (notificationData.type === 'order_created') {
        addNotification({
          type: 'order',
          title: notificationData.title,
          message: notificationData.message,
          sellerId: String(seller.id),
          orderId: notificationData.orderId,
          productId: notificationData.productId,
          actionUrl: notificationData.actionUrl
        });
      }
    });
    
    // Handle order data updates
    socket.on('orderCreated', (order: any) => {
      setOrders((prev) => [order, ...prev]);
    });
    socket.on('orderStatusChanged', (order: any) => {
      setOrders((prev) => prev.map(o => o.id === order.id ? order : o));
    });
    
    return () => {
      socket.disconnect();
    };
  }, [seller?.id, addNotification, t]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  

  // Notification state
  const [notification, setNotification] = useState<NotificationProps>({
    type: 'success',
    title: '',
    message: '',
    isVisible: false,
    onClose: () => setNotification(prev => ({ ...prev, isVisible: false }))
  });

  // Sync active tab with URL hash
  // Sync active tab with URL hash
  useEffect(() => {
    const hash = location.hash.substring(1);
    if (hash && ['dashboard', 'products', 'orders', 'profile', 'analytics'].includes(hash)) {
      setActiveTab(hash as any);
    }
  }, [location.hash]);

  useEffect(() => {
    const hash = location.hash.substring(1);
    if (hash && ['dashboard', 'products', 'orders', 'profile', 'analytics'].includes(hash)) {
      setActiveTab(hash as any);
    }
  }, [location.hash]);

  // Sync active tab with URL hash
  useEffect(() => {
    const hash = location.hash.substring(1);
    if (hash && ['dashboard', 'products', 'orders', 'profile', 'analytics'].includes(hash)) {
      setActiveTab(hash as any);
    }
  }, [location.hash]);

  useEffect(() => {
    if (isReady && user) {
      // Load data in background, don't block the main flow
      loadSellerData();
      
      // Sample notifications disabled to avoid confusion in production-like env
    }
  }, [isReady, user, userProfile, addNotification, t]);

  // Debug function to reset sample notifications (for testing)
  const resetSampleNotifications = () => {
    localStorage.removeItem('sampleNotificationsAdded');
    localStorage.removeItem('sampleNotificationsAddedUser');
    clearNotifications();
    localStorage.removeItem('notifications');
    window.location.reload();
  };

  useEffect(() => {
    console.log('🔧 Rendering products:', { products, productsLength: products.length, productsType: typeof products });
  }, [products]);

  // Remove simulated notifications
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (Math.random() > 0.7) {
  //       setNewOrdersCount(prev => prev + 1);
  //       showNotification(
  //         'info',
  //         'New Order Received!',
  //         'You have received a new order. Check the Orders tab to view details.'
  //       );
  //     }
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true,
      onClose: () => setNotification(prev => ({ ...prev, isVisible: false }))
    });
  };

  const loadSellerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔧 Loading seller data...');
      console.log('🔧 Auth token exists:', !!localStorage.getItem('access_token'));
      console.log('🔧 User role:', localStorage.getItem('userRole'));
      
      // Load data with individual error handling
      const sellerPromise = sellersApi.getSellerProfile().catch(err => {
        console.error('❌ Failed to load seller profile:', err);
        return null;
      });
      
      const productsPromise = productsApi.getSellerProducts().catch(err => {
        console.error('❌ Failed to load products:', err);
        return { data: [] };
      });
      
      const ordersPromise = dashboardApi.getSellerOrders().catch(err => {
        console.error('❌ Failed to load orders:', err);
        return { data: [] };
      });
      
      const [sellerResponse, productsResponse, ordersResponse] = await Promise.all([
        sellerPromise,
        productsPromise,
        ordersPromise
      ]);

      console.log('✅ Seller data loaded:', {
        seller: sellerResponse?.data,
        products: productsResponse?.data,
        orders: ordersResponse?.data
      });

      console.log('🔧 Products data details:', {
        productsResponse: productsResponse,
        productsData: productsResponse?.data,
        productsArray: Array.isArray(productsResponse?.data),
        productsLength: productsResponse?.data?.length || 0,
        productsType: typeof productsResponse?.data
      });

      if (sellerResponse) {
        setSeller(sellerResponse.data);
      }
      setProducts(productsResponse?.data || []);
      setOrders(ordersResponse?.data || []);
      
      console.log('🔧 State updated:', {
        seller: sellerResponse?.data,
        products: productsResponse?.data || [],
        orders: ordersResponse?.data || []
      });

      // Fetch average rating for this seller
      if (sellerResponse?.data?.id) {
        try {
          console.log('🔧 Fetching rating for seller ID:', sellerResponse.data.id);
          const avgRes = await ratingsApi.getAverageRatingBySeller(String(sellerResponse.data.id));
          console.log('✅ Rating response:', avgRes.data);
          console.log('✅ Average rating value:', avgRes.data?.averageRating);
          console.log('✅ Average rating type:', typeof avgRes.data?.averageRating);
          setAverageRating(avgRes.data?.averageRating ?? null);
        } catch (e: any) {
          console.warn('Failed to fetch average rating:', e);
          console.warn('Rating error details:', {
            status: e.response?.status,
            data: e.response?.data,
            message: e.message
          });
          setAverageRating(null);
        }
      }
    } catch (err: any) {
      console.error('❌ Failed to load seller data:', err);
      console.error('❌ Error details:', {
        status: err.response?.status,
        message: err.message,
        data: err.response?.data
      });
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You need seller permissions to view this page.');
      } else {
        setError('Failed to load dashboard data. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    navigate('/seller/products/create');
  };

  const handleEditProduct = (productId: number) => {
    navigate(`/seller/products/edit/${productId}`);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.deleteProduct(String(productId));
        setProducts(products.filter(p => p.id !== productId));
        showNotification('success', 'Product Deleted', 'Product has been successfully deleted.');
      } catch (err) {
        console.error('Failed to delete product:', err);
        showNotification('error', 'Delete Failed', 'Failed to delete product. Please try again.');
      }
    }
  };

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await ordersApi.updateOrderStatus(String(orderId), newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      showNotification('success', 'Order Updated', `Order status changed to ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update order:', err);
      showNotification('error', 'Update Failed', 'Failed to update order status.');
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (file) {
      try {
        console.log('Uploading business image:', file);
        setLoading(true);
        
        // Upload the image using the sellers API
        const response = await sellersApi.uploadBusinessImage(file);
        
        if (response.data) {
          // Reload seller data to get updated image
          await loadSellerData();
          showNotification('success', 'Image Uploaded', 'Business image has been updated successfully.');
        }
      } catch (err: any) {
        console.error('Failed to upload image:', err);
        showNotification('error', 'Upload Failed', err.response?.data?.message || 'Failed to upload image. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Notification */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={notification.onClose}
        duration={4000}
      />

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/seller/notifications')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{t('myStore')}</h1>
                  <p className="text-sm text-gray-600">{userProfile?.businessName || seller?.businessName || 'Your Business'}</p>
                  {userProfile?.businessType && (
                    <p className="text-xs text-gray-500">{userProfile.businessType}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {newOrdersCount > 0 && (
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 text-orange-500" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {newOrdersCount}
                  </span>
                </div>
              )}
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={resetSampleNotifications}
                  className="p-2 hover:bg-gray-100 rounded-lg text-xs"
                  title="Reset sample notifications"
                >
                  🔄
                </button>
              )}
              <button
                onClick={() => setActiveTab('profile')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="flex overflow-x-auto">
          {[
            { id: 'dashboard', label: t('dashboard'), icon: BarChart3 },
            { id: 'products', label: t('myProducts'), icon: Package },
            { id: 'orders', label: `Orders ${newOrdersCount > 0 ? `(${newOrdersCount})` : ''}`, icon: ShoppingBag },
            
            { id: 'profile', label: t('profile'), icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">{t('totalProducts')}</p>
                    <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">{t('totalOrders')}</p>
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">{t('revenue')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toLocaleString()} {t('so_m')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">{t('rating')}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageRating !== null && averageRating > 0 ? averageRating.toFixed(1) : '-'}
                    </p>
                    {averageRating !== null && averageRating === 0 && (
                      <p className="text-xs text-gray-500">{t('noRatingsYet')}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCreateProduct}
                  className="flex items-center justify-center p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t('addProduct')}
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="flex items-center justify-center p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t('viewOrders')}
                </button>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentOrders')}</h3>
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.code}</p>
                      <p className="text-sm text-gray-600">{order.product?.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.totalPrice?.toLocaleString()} {t('so_m')}</p>
                      <p className="text-sm text-gray-600">{order.status}</p>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-center py-4">{t('noOrdersYet')}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('myProducts')}</h3>
              <button
                onClick={handleCreateProduct}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addProduct')}
              </button>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.description}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.description}</h4>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>Price: {product.price?.toLocaleString()} {t('so_m')}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Package className="w-4 h-4 mr-1" />
                          <span>Stock: {product.quantity} units</span>
                        </div>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <div className="flex items-center text-sm text-green-600">
                            <Tag className="w-4 h-4 mr-1" />
                            <span>Sale: {product.originalPrice.toLocaleString()} {t('so_m')}  {product.price.toLocaleString()} {t('so_m')}</span>
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Category: {product.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-500 mb-6">Start building your store by adding your first product</p>
                  <button
                    onClick={handleCreateProduct}
                    className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Product
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('orders')}</h3>
              {newOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {newOrdersCount} new
                </span>
              )}
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.code}</p>
                      <p className="text-sm text-gray-600">{order.product?.description}</p>
                      <p className="text-sm text-gray-600">Quantity: {order.quantity}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.totalPrice?.toLocaleString()} {t('so_m')}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'pending' ? t('pending') : order.status === 'confirmed' ? t('confirmed') : order.status === 'completed' ? t('completed') : t('cancelled')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Actions */}
                  <div className="flex space-x-2 pt-3 border-t">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleOrderStatusChange(order.id, 'confirmed')}
                          className="flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('confirm')}
                        </button>
                        <button
                          onClick={() => handleOrderStatusChange(order.id, 'cancelled')}
                          className="flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {t('cancel')}
                        </button>
                      </>
                    )}
                    {/* After confirm, no extra action needed */}
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('noOrdersYet')}</p>
                  <p className="text-sm text-gray-400">Orders will appear here when customers place them</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {t('profile')}
                </span>
              </h3>
              <p className="text-gray-600">{t('manageYourBusinessProfile')}</p>
            </div>
            
            {/* Business Image Upload */}
            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-sm">📸</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900">{t('businessImage')}</h4>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4">
                <ImageUpload
                  onImageSelect={handleImageUpload}
                  currentImageUrl={seller?.businessImageUrl}
                  label="Upload Business Image"
                  maxSize={5}
                />
              </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900">{t('businessInformation')}</h4>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {t('businessName')}
                  </label>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4">
                    <input
                      type="text"
                      value={userProfile?.businessName || seller?.businessName || ''}
                      className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-medium"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {t('businessType')}
                  </label>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4">
                    <input
                      type="text"
                      value={userProfile?.businessType || seller?.businessType || ''}
                      className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-medium"
                      readOnly
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    {t('phoneNumber')}
                  </label>
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4">
                    <input
                      type="text"
                      value={userProfile?.phoneNumber || seller?.phoneNumber || ''}
                      className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-medium"
                      readOnly
                    />
                  </div>
                </div>
                
                {userProfile?.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      {t('location')}
                    </label>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4">
                      <input
                        type="text"
                        value={typeof userProfile.location === 'string' 
                          ? userProfile.location 
                          : `${userProfile.location.latitude.toFixed(4)}, ${userProfile.location.longitude.toFixed(4)}`}
                        className="w-full px-4 py-3 bg-white border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-medium"
                        readOnly
                      />
                    </div>
                  </div>
                )}
                
                {/* Location Map */}
                {userProfile?.location && (
                  <div>
                    <MapView
                      latitude={typeof userProfile.location === 'string' 
                        ? JSON.parse(userProfile.location).latitude 
                        : userProfile.location.latitude}
                      longitude={typeof userProfile.location === 'string' 
                        ? JSON.parse(userProfile.location).longitude 
                        : userProfile.location.longitude}
                      sellerName={userProfile?.businessName || seller?.businessName}
                    />
                  </div>
                )}
                
                {userProfile?.status && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      {t('status')}
                    </label>
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4">
                      <div className={`px-4 py-3 rounded-xl font-medium text-center ${
                        userProfile.status === 'APPROVED' ? 'bg-green-100 text-green-800 border border-green-200' :
                        userProfile.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        <div className="flex items-center justify-center space-x-2">
                          <span className={`w-2 h-2 rounded-full ${
                            userProfile.status === 'APPROVED' ? 'bg-green-500' :
                            userProfile.status === 'PENDING' ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}></span>
                          <span>{userProfile.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{t('analytics')}</h3>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}
      </div>

      <BottomNavigation currentPage={activeTab} />
    </div>
  );
};

export default SellerDashboard;













