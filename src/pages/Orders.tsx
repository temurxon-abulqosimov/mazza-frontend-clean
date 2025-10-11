import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, MapPin, Phone, ArrowLeft, Package, User, Star, ShoppingBag } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { ordersApi } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { config } from '../config/env';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';

interface Order {
  id: number;
  code: string;
  status: 'pending' | 'completed' | 'cancelled' | 'confirmed';
  totalPrice: number;
  quantity: number;
  createdAt: string;
  product: {
    id: number;
    price: number;
    originalPrice: number;
    description: string;
    imageUrl?: string;
    seller: {
      id: number;
      businessName: string;
      businessType: string;
      phoneNumber: string;
      businessImageUrl: string;
      averageRating: number;
      distance: number;
    };
  };
}

const Orders: React.FC = () => {
  const { user } = useTelegram();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock orders with CORRECT price calculations
  const mockOrders: Order[] = [
    {
      id: 1,
      code: 'UZ1A2B3C4D',
      status: 'pending',
      
      totalPrice: 30000, // 15000 * 2 = 30000
      quantity: 2,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      product: {
        id: 1,
        price: 15000,
        originalPrice: 25000,
        description: 'Fresh Artisan Bread - Sourdough Loaf',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        seller: {
          id: 1,
          businessName: 'Bakery Corner',
          businessType: 'bakery',
          phoneNumber: '+998901234567',
          businessImageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          averageRating: 4.8,
          distance: 0.5
        }
      }
    },
    {
      id: 2,
      code: 'UZ2B3C4D5E',
      status: 'confirmed',
      
      totalPrice: 25000, // 25000 * 1 = 25000
      quantity: 1,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      product: {
        id: 2,
        price: 25000,
        originalPrice: 40000,
        description: 'Margherita Pizza Slice - Fresh Mozzarella',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
        seller: {
          id: 2,
          businessName: 'Pizza Palace',
          businessType: 'restaurant',
          phoneNumber: '+998901234568',
          businessImageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
          averageRating: 4.6,
          distance: 1.2
        }
      }
    },
    {
      id: 3,
      code: 'UZ3C4D5E6F',
      status: 'cancelled',
      totalPrice: 12000, // 4000 * 3 = 12000
      quantity: 3,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      product: {
        id: 3,
        price: 4000,
        originalPrice: 6000,
        description: 'Fresh Croissants - Assorted',
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        seller: {
          id: 1,
          businessName: 'Bakery Corner',
          businessType: 'bakery',
          phoneNumber: '+998901234567',
          businessImageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          averageRating: 4.8,
          distance: 0.5
        }
      }
    }
  ];

  useEffect(() => {
    const loadOrders = async () => {
      if (!user?.id) {
        // Use mock data for demonstration
        setOrders(mockOrders);
        setLoading(false);
        return;
      }
      
      try {
        const response = await ordersApi.getUserOrders(user.id.toString());
        setOrders(response.data);
      } catch (err) {
        // Fallback to mock data
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, mockOrders]);

  // Realtime user order updates
  useEffect(() => {
    if (!user?.id) return;
    const socket: Socket = io(config.API_BASE_URL, { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('subscribe', { type: 'user', id: user.id });
    });
    
    // Handle order status change notifications
    socket.on('notification', (notificationData: any) => {
      if (notificationData.type === 'order_confirmed' || notificationData.type === 'order_cancelled' || notificationData.type === 'order_completed') {
        console.log('Order notification received:', notificationData);
        
        // If order is confirmed and requires rating, show rating prompt
        if (notificationData.type === 'order_confirmed' && notificationData.metadata?.requiresRating) {
          // Reload orders to show updated status
          setOrders(prev => prev.map(o => o.id === notificationData.orderId ? { ...o, status: 'confirmed' } : o));
          
          // Show a prompt to rate the order
          setTimeout(() => {
            if (window.confirm(t('orderConfirmedRatePrompt') || 'Your order has been confirmed! Would you like to rate your experience?')) {
              navigate(`/orders/${notificationData.orderId}/rate`);
            }
          }, 1000);
        }
      }
    });
    
    socket.on('orderStatusChanged', (updated: any) => {
      setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, status: updated.status } : o));
    });
    
    return () => { socket.disconnect(); };
  }, [user?.id]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'confirmed':
        return <Package className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('completed') || 'Completed';
      case 'cancelled':
        return t('cancelled') || 'Cancelled';
      case 'confirmed':
        return t('confirmed') || 'Confirmed';
      default:
        return t('pending') || 'Pending';
    }
  };

  const calculateSavings = (order: Order) => {
    return (order.product.originalPrice - order.product.price) * order.quantity;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loadingOrders') || 'Loading orders...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">{t('myOrders') || 'My Orders'}</h1>
            </div>
            <div className="text-sm text-gray-500">
              {orders.length} {t('orders') || 'orders'}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg"
            >
              {t('retry') || 'Retry'}
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noOrdersYet') || 'No orders yet'}</h3>
            <p className="text-gray-500 mb-6">{t('startExploringProducts') || 'Start exploring products to place your first order!'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              {t('browseProducts') || 'Browse Products'}
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => {
              const savings = calculateSavings(order);
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl">
                  {/* Order Header with Gradient */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 border-b border-orange-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          {getStatusIcon(order.status)}
                        </div>
                        <div className="ml-4">
                          <p className="font-bold text-gray-900 text-lg">{t('order')} #{order.code}</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(order.createdAt).toLocaleDateString('uz-UZ', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full shadow-sm ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <div className="flex space-x-4">
                      <div className="relative">
                        <img 
                          src={order.product.imageUrl || order.product.seller.businessImageUrl} 
                          alt={order.product.description}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 shadow-md"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400';
                          }}
                        />
                        {savings > 0 && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                            -{Math.round((savings / (order.product.originalPrice * order.quantity)) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                          {order.product.description}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4 text-orange-500" />
                            <span className="font-medium">{order.product.seller.businessName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{order.product.seller.averageRating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{order.product.seller.distance} {t('distance')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Order Summary */}
                  <div className="px-5 pb-5">
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">{t('quantity')}:</span>
                        <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-full text-sm">{order.quantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">{t('unitPrice')}:</span>
                        <span className="font-semibold text-gray-900">{order.product.price.toLocaleString()} {t('so_m')}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between items-center bg-green-50 p-2 rounded-lg">
                          <span className="text-green-700 font-medium">💚 {t('savings') || 'Savings'}:</span>
                          <span className="font-bold text-green-700">{savings.toLocaleString()} {t('so_m')}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-bold text-lg">{t('total')}:</span>
                          <span className="text-orange-600 font-bold text-xl">{order.totalPrice.toLocaleString()} {t('so_m')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="px-5 pb-5">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/seller-detail/${order.product.seller.id}`)}
                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 shadow-sm font-medium"
                      >
                        <Phone className="w-5 h-5" />
                        <span>{t('contactSeller')}</span>
                      </button>
                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => navigate(`/orders/${order.id}/rate`)}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-lg font-medium"
                        >
                          <Star className="w-5 h-5" />
                          <span>{t('rateOrder') || 'Rate Order'}</span>
                        </button>
                      )}
                      {order.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/product-detail/${order.product.id}`)}
                          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg font-medium"
                        >
                          <Package className="w-5 h-5" />
                          <span>{t('reorder')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation currentPage="orders" />
    </div>
  );
};

export default Orders;

