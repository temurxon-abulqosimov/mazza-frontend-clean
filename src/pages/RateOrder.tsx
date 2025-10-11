import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, CheckCircle } from 'lucide-react';
import { ordersApi, ratingsApi } from '../services/api';
import { useLocalization } from '../contexts/LocalizationContext';
import { useTelegram } from '../contexts/TelegramContext';

const RateOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLocalization();
  const { user } = useTelegram();
  const [order, setOrder] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      
      try {
        const response = await ordersApi.getOrderById(id);
        setOrder(response.data);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(t('orderLoadError') || 'Failed to load order details');
      }
    };

    loadOrder();
  }, [id, t]);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t('pleaseSelectRating') || 'Please select a rating');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await ratingsApi.createRating({
        rating,
        comment: comment.trim() || undefined,
        orderId: parseInt(id!),
        sellerId: order?.product?.seller?.id,
        type: 'seller'
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
      setError(t('ratingSubmissionFailed') || 'Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6">
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t('ratingSubmitted') || 'Rating Submitted!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('thankYouForRating') || 'Thank you for rating your experience. Your feedback helps us improve our service.'}
            </p>
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3 px-6 rounded-2xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 font-semibold"
            >
              {t('backToOrders') || 'Back to Orders'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-white pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100 w-full">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/orders')}
              className="mr-4 p-3 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {t('rateYourExperience') || 'Rate Your Experience'}
                </span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('rateOrderDescription') || 'How was your experience with this order?'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        {/* Order Summary */}
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {t('orderSummary') || 'Order Summary'}
            </span>
          </h3>
          
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              {order.product?.imageUrl ? (
                <img
                  src={order.product.imageUrl}
                  alt={order.product.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <span className="text-orange-600 text-xl">📦</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                {order.product?.name || order.product?.description}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {t('from')} {order.product?.seller?.businessName}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  {order.totalPrice?.toLocaleString()} {t('so_m')}
                </span>
                <span className="text-sm text-gray-500">
                  {t('quantity')}: {order.quantity}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleRatingSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t('rateSeller') || 'Rate the Seller'}
              </span>
            </h3>
            
            <div className="flex items-center justify-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-2 hover:scale-110 transition-all duration-200"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <p className="text-center text-sm text-gray-600">
              {rating === 0 && (t('selectRating') || 'Select a rating')}
              {rating === 1 && (t('poor') || 'Poor')}
              {rating === 2 && (t('fair') || 'Fair')}
              {rating === 3 && (t('good') || 'Good')}
              {rating === 4 && (t('veryGood') || 'Very Good')}
              {rating === 5 && (t('excellent') || 'Excellent')}
            </p>
          </div>

          {/* Comment */}
          <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t('addComment') || 'Add a Comment (Optional)'}
              </span>
            </h3>
            
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 resize-none"
              placeholder={t('commentPlaceholder') || 'Share your experience with this seller...'}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">⚠</span>
                </div>
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-2xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('submitting') || 'Submitting...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>{t('submitRating') || 'Submit Rating'}</span>
                  <span className="text-xl">⭐</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RateOrder;
