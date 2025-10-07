import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, DollarSign, Store } from 'lucide-react';
import { productsApi, sellersApi } from '../services/api';
import { CreateProductDto, ProductCategory } from '../types';
import Notification, { NotificationProps } from './Notification';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';

interface ProductFormProps {
  mode: 'create' | 'edit';
}

const ProductForm: React.FC<ProductFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t, language } = useLocalization();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState<any>(null);
  
  // Notification state
  const [notification, setNotification] = useState<NotificationProps>({
    type: 'success',
    title: '',
    message: '',
    isVisible: false,
    onClose: () => setNotification(prev => ({ ...prev, isVisible: false }))
  });
  
  const [formData, setFormData] = useState({
    description: '', // Product description (will be sent as name to backend)
    price: '',
    originalPrice: '',
    quantity: '1',
    availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to 24 hours from now
    availableFrom: '',
    category: ProductCategory.OTHER,
  });

  const loadSellerData = async () => {
    try {
      const response = await sellersApi.getSellerProfile();
      setSeller(response.data);
    } catch (err) {
      console.error('Failed to load seller data:', err);
    }
  };

  const loadProduct = useCallback(async () => {
    try {
      const response = await productsApi.getProductById(String(id));
      const product = response.data;
      
      setFormData({
        description: product.name || product.description || '', // Use name as description for editing
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        quantity: product.quantity.toString(),
        availableUntil: product.availableUntil ? new Date(product.availableUntil).toISOString().slice(0, 16) : '',
        availableFrom: product.availableFrom ? new Date(product.availableFrom).toISOString().slice(0, 16) : '',
        category: product.category || ProductCategory.OTHER,
      });
    } catch (error) {
      console.error('Failed to load product:', error);
      setError('Failed to load product details');
    }
  }, [id]);

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadProduct();
    }
    loadSellerData();
  }, [mode, id, loadProduct]);

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true,
      onClose: () => setNotification(prev => ({ ...prev, isVisible: false }))
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.description.trim()) {
      setError('Product description is required');
      setLoading(false);
      return;
    }
    if (formData.description.trim().length < 3) {
      setError('Product description must be at least 3 characters');
      setLoading(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      setLoading(false);
      return;
    }
    if (!formData.availableUntil) {
      setError('Available until date is required');
      setLoading(false);
      return;
    }

    try {
      const productData: CreateProductDto = {
        name: formData.description, // Send description as name to backend
        description: formData.description, // Also send as description
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        quantity: parseInt(formData.quantity),
        availableUntil: formData.availableUntil, // Send as string, backend will transform
        availableFrom: formData.availableFrom || undefined,
        category: formData.category,
        // sellerId will be set by backend automatically
      };

      console.log('ProductForm: Submitting product data:', productData);

      if (mode === 'edit' && id) {
        const response = await productsApi.updateProduct(String(id), productData);
        console.log('ProductForm: Product updated successfully:', response.data);
        showNotification(
          'success',
          t('success'),
          t('productUpdated')
        );
        setTimeout(() => {
          navigate('/seller-dashboard');
        }, 2000);
      } else {
        const response = await productsApi.createProduct(productData);
        console.log('ProductForm: Product created successfully:', response.data);
        showNotification(
          'success',
          t('success'),
          t('productCreated')
        );
        setTimeout(() => {
          navigate('/seller-dashboard');
        }, 2000);
      }
    } catch (err: any) {
      console.error('ProductForm: Submit error:', err);
      showNotification(
        'error',
        t('error'),
        t('productCreationFailed')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const categoryOptions = [
    { value: ProductCategory.BREAD_BAKERY, label: t('breadBakery') },
    { value: ProductCategory.PASTRY, label: t('pastry') },
    { value: ProductCategory.MAIN_DISHES, label: t('mainDishes') },
    { value: ProductCategory.DESSERTS, label: t('desserts') },
    { value: ProductCategory.BEVERAGES, label: t('beverages') },
    { value: ProductCategory.OTHER, label: t('other') },
  ];

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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/seller')}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Add Product' : 'Edit Product'}
            </h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Image Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Image
            </label>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {seller?.businessImageUrl ? (
                    <img
                      src={seller.businessImageUrl}
                      alt={seller.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    {t('productImageDescription')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {seller?.businessName || t('yourBusiness')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('productDescription') || 'Product Description'} *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder={t('productDescriptionPlaceholder') || 'Enter product description'}
            />
          </div>

          {/* Price Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                {t('salePrice') || 'Sale Price'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">{language === 'uz' ? 'so\'m' : 'сум'}</span>
              </div>
            </div>

            <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                {t('originalPrice') || 'Original Price (Optional)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="originalPrice"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="0.00"
                />
                <span className="absolute left-3 top-2.5 text-gray-400 text-sm">{language === 'uz' ? 'so\'m' : 'сум'}</span>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              {t('quantityAvailable')}
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              {t('category')}
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-2">
                {t('availableFrom')}
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="availableFrom"
                  name="availableFrom"
                  value={formData.availableFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="availableUntil" className="block text-sm font-medium text-gray-700 mb-2">
                {t('availableUntil')}
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="availableUntil"
                  name="availableUntil"
                  value={formData.availableUntil}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('loading') : mode === 'create' ? t('addProduct') : t('updateProduct')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

