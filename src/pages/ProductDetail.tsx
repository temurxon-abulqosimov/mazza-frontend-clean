import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Star, MapPin, CheckCircle } from 'lucide-react';
import { productsApi, ratingsApi } from '../services/api';
import * as Api from '../services/api';
import { useLocalization } from '../contexts/LocalizationContext';
import { useTelegram } from '../contexts/TelegramContext';
import Notification, { NotificationProps } from '../components/Notification';
import { useNotifications } from '../contexts/NotificationContext';
import MapView from '../components/MapView';
import { config } from '../config/env';

const ProductDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useLocalization();
  const { user } = useTelegram();
  const { addNotification } = useNotifications();
  const [product, setProduct] = useState<any>(null);
  const [sellerImageUrl, setSellerImageUrl] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<NotificationProps>({
    type: 'success',
    title: '',
    message: '',
    isVisible: false,
    onClose: () => setNotification(prev => ({ ...prev, isVisible: false }))
  });

  // New UI/logic state
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Array<any>>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          const response = await productsApi.getProductById(id);
          setProduct(response.data);
          // Load reviews for this product for everyone (seller and users)
          try {
            const ratingsRes = await ratingsApi.getRatingsByProduct(id);
            setReviews(ratingsRes.data || []);
          } catch {
            setReviews(response.data?.reviews || []);
          }
          const p = response.data;
          if ((!p?.imageUrl || p.imageUrl.length === 0) && p?.seller?.id) {
            try {
              const url = await productsApi.getSellerImageUrl(p.seller.id);
              setSellerImageUrl(url);
            } catch {
              setSellerImageUrl(null);
            }
          } else {
            setSellerImageUrl(null);
          }

          // Compute distance from user to seller if possible
          try {
            const computeDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
              const toRad = (v: number) => (v * Math.PI) / 180;
              const R = 6371;
              const dLat = toRad(lat2 - lat1);
              const dLon = toRad(lon2 - lon1);
              const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              return Math.round(R * c * 10) / 10;
            };
            const sellerLoc = p?.seller?.location;
            if (sellerLoc?.latitude && sellerLoc?.longitude) {
              let userLatLng: { lat: number; lng: number } | null = null;
              const storedProfile = localStorage.getItem('userProfile');
              if (storedProfile) {
                try {
                  const parsed = JSON.parse(storedProfile);
                  if (parsed?.location?.latitude && parsed?.location?.longitude) {
                    userLatLng = { lat: parsed.location.latitude, lng: parsed.location.longitude };
                  }
                } catch {}
              }
              if (!userLatLng && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const d = computeDistance(pos.coords.latitude, pos.coords.longitude, sellerLoc.latitude, sellerLoc.longitude);
                  setDistanceKm(d);
                });
              } else if (userLatLng) {
                const d = computeDistance(userLatLng.lat, userLatLng.lng, sellerLoc.latitude, sellerLoc.longitude);
                setDistanceKm(d);
              }
            }
          } catch {}
        } catch (error) {
          console.error('Failed to fetch product:', error);
          showNotification('error', t('error'), t('failedToLoadProduct'));
          setProduct(null);
        }
      }
    };
    fetchProduct();
  }, [id]);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true,
      onClose: () => setNotification(prev => ({ ...prev, isVisible: false }))
    });
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'bread_bakery': return '🍞';
      case 'pastry': return '🥐';
      case 'main_dishes': return '🍽️';
      case 'desserts': return '🍰';
      case 'beverages': return '🥤';
      default: return '🍞';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'bread_bakery': return t('breadBakery');
      case 'pastry': return t('pastry');
      case 'main_dishes': return t('mainDishes');
      case 'desserts': return t('desserts');
      case 'beverages': return t('beverages');
      default: return t('other');
    }
  };

  const handleConfirmOrder = async () => {
    if (!product || !user) {
      showNotification('error', t('error'), t('userNotFound'));
      return;
    }

    setLoading(true);
    setShowOrderConfirm(false);

    try {
      // Validate quantity
      if (quantity > (product.quantity || 1)) {
        showNotification(
          'error',
          t('error'),
          t('quantityExceedsAvailable')
        );
        return;
      }

      // Create the order
      const orderData = {
        productId: product.id,
        quantity: quantity,
        totalPrice: product.price * quantity
      };

      console.log('Creating order:', orderData);
      
      const response = await Api.ordersApi.createOrder(orderData);
      const order = response.data;
      
      console.log('Order created successfully:', order);
      
      showNotification(
        'success',
        t('orderConfirmed'),
        `${t('orderConfirmationMessage')} ${t('orderNumber')}: ${order.code}`
      );

      // Add notification for user
      addNotification({
        type: 'order',
        title: t('orderConfirmed'),
        message: `${t('orderConfirmationMessage')} ${t('orderNumber')}: ${order.code}`,
        orderId: order.id,
        userId: user?.id?.toString(),
      });

      // Add notification for seller
      addNotification({
        type: 'order',
        title: t('newOrderReceived'),
        message: t('newOrderReceivedMessage'),
        orderId: order.id,
        sellerId: product.seller?.id?.toString(),
      });

      // Navigate back to home after a delay
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error: any) {
      console.error('Failed to create order:', error);
      
      // Show error notification
      showNotification(
        'error',
        t('orderFailed'),
        t('orderFailedMessage')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!id || !newRating) return;
    try {
      setSubmittingReview(true);
      const payload: any = { productId: Number(id), rating: newRating, comment: newComment };
      await ratingsApi.createRating(payload);
      setReviews([{ id: Date.now(), rating: newRating, comment: newComment, createdAt: new Date().toISOString(), user }, ...reviews]);
      setNewComment('');
      setNewRating(5);
      showNotification('success', t('thankYou'), t('reviewSubmitted'));
    } catch (e) {
      showNotification('error', t('error'), t('failedToSubmitReview'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('productNotFound')}</h2>
          <button onClick={() => navigate(-1)} className="text-orange-500 hover:text-orange-600">
            {t('goBack')}
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;
  const savings = (product.originalPrice - product.price) * quantity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={notification.onClose}
        duration={5000}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{t('productDetails')}</h1>
          </div>
        </div>
      </div>

      {/* Product Image - maintain 3:2 ratio, cover-fit */}
      <div className="w-full relative overflow-hidden" style={{ aspectRatio: '3 / 2' }}>
        {product.imageUrl || sellerImageUrl ? (
          <img
            src={(product.imageUrl && product.imageUrl.length > 0) ? product.imageUrl : (sellerImageUrl || '')}
            alt={product.description || product.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-200"></div>
        <div className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center text-orange-600 ${(product.imageUrl || sellerImageUrl) ? 'hidden' : 'flex'}`}>
          <div className="text-6xl font-bold mb-2">
            {getCategoryEmoji(product.category)}
          </div>
          <div className="text-sm font-medium text-orange-700">
            {product.name || t('product')}
          </div>
          <div className="text-xs text-orange-500 mt-1">
            {getCategoryName(product.category)}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="bg-white p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{product.description || product.name}</h2>
            <div className="flex items-center text-sm text-gray-600">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="mr-2">{(product.seller?.averageRating ?? product.stats?.averageRating ?? 0).toFixed ? ((product.seller?.averageRating ?? product.stats?.averageRating ?? 0) as number).toFixed(1) : (product.seller?.averageRating ?? product.stats?.averageRating ?? 0)}</span>
              <span className="ml-2">{((product.seller?.distance ?? distanceKm) ? `${((product.seller?.distance ?? distanceKm) as number).toFixed(1)} km` : t('nearby'))}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{product.price.toLocaleString()} {t('so_m')}</div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-sm text-gray-500 line-through">
                {product.originalPrice.toLocaleString()} {t('so_m')}
              </div>
            )}
          </div>
        </div>

        {/* Seller Info */}
        <div className="border-t pt-3 mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{product.seller.businessName}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{((product.seller?.distance ?? distanceKm) ? `${((product.seller?.distance ?? distanceKm) as number).toFixed(1)} km` : t('nearby'))}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seller Location Map */}
        {product.seller?.location && (
          <div className="mt-6">
            <MapView
              latitude={product.seller.location.latitude}
              longitude={product.seller.location.longitude}
              sellerName={product.seller.businessName}
            />
          </div>
        )}

        {/* Order Form */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('confirmYourOrder')}</h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('product')}</span>
              <span className="font-medium">{product.description}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t('unitPrice')}</span>
              <span className="font-medium">{product.price.toLocaleString()} {t('so_m')}</span>
            </div>
            
            {savings > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>{t('savings')}</span>
                <span className="font-medium">-{savings.toLocaleString()} {t('so_m')}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-gray-600">{t('quantity')}</span>
                <span className="text-xs text-gray-500 ml-2">({t('available')}: {product.quantity || 1})</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity || 1, quantity + 1))}
                  disabled={quantity >= (product.quantity || 1)}
                  className={`w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 ${
                    quantity >= (product.quantity || 1) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="flex justify-between text-lg font-semibold">
                <span>{t('total')}</span>
                <span>{totalPrice.toLocaleString()} {t('so_m')}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowOrderConfirm(true)}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? t('placingOrder') : t('confirmOrder')}
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white p-4 mt-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('reviews')}</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-600">{t('noReviewsYet')}</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border rounded-lg p-3">
                <div className="flex items-center mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 mr-1 ${i < (r.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                <div className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add Review */}
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} onClick={() => setNewRating(i + 1)} className="mr-1">
                <Star className={`w-5 h-5 ${i < newRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('shareYourThoughts')}
            className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
            rows={3}
          />
          <button
            disabled={submittingReview}
            onClick={handleSubmitReview}
            className="mt-2 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {submittingReview ? t('submitting') : t('submitReview')}
          </button>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showOrderConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('confirmYourOrder')}</h3>
              <p className="text-gray-600 mb-4">
                {product.description} x {quantity}
              </p>
              <div className="text-xl font-bold text-gray-900 mb-6">
                {totalPrice.toLocaleString()} so'm
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOrderConfirm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={loading}
                  className="flex-1 py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('placing') : t('confirmOrder')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;


