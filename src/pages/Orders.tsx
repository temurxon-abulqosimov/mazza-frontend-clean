import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, MapPin, Phone, ArrowLeft, Package, User, Star, ShoppingBag } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { ordersApi } from '../services/api';
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
          <p className="mt-4 text-gray-600">{t('loading') || 'Loading orders...'}</p>
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
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <div className="ml-3">
                          <p className="font-semibold text-gray-900">{t('order') || 'Order'} #{order.code}</p>
                          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex space-x-4">
                      <img 
                        src={order.product.imageUrl || order.product.seller.businessImageUrl} 
                        alt={order.product.description}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                          {order.product.description}
                        </h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                          <User className="w-3 h-3" />
                          <span>{order.product.seller.businessName}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                            <span>{order.product.seller.averageRating}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span>{order.product.seller.distance} km</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('quantity') || 'Quantity'}:</span>
                          <span className="font-medium">{order.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">{t('unitPrice') || 'Unit Price'}:</span>
                          <span className="font-medium">{order.product.price.toLocaleString()} {t('so_m') || 'so\'m'}</span>
                        </div>
                        {savings > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('savings') || 'Savings'}:</span>
                            <span className="font-medium text-green-600">-{savings.toLocaleString()} {t('so_m') || 'so\'m'}</span>
                          </div>
                        )}
                        <hr className="border-gray-200" />
                        <div className="flex justify-between text-base font-semibold">
                          <span className="text-gray-900">{t('total') || 'Total'}:</span>
                          <span className="text-orange-500">{order.totalPrice.toLocaleString()} {t('so_m') || 'so\'m'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate(`/seller-detail/${order.product.seller.id}`)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {t('contactSeller') || 'Contact Seller'}
                      </button>
                      {order.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/product-detail/${order.product.id}`)}
                          className="flex-1 flex items-center justify-center px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          {t('reorder') || 'Reorder'}
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

