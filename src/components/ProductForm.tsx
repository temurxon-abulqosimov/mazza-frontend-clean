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

  // Multi-step form state
  const [step, setStep] = useState<1 | 2 | 3>(1);

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
      setError(t('productLoadError') || 'Failed to load product details');
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
      setError(t('productDescriptionRequired'));
      setLoading(false);
      return;
    }
    if (formData.description.trim().length < 3) {
      setError(t('productDescriptionMinLength'));
      setLoading(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError(t('validPriceRequired'));
      setLoading(false);
      return;
    }
    if (!formData.availableUntil) {
      setError(t('availableUntilRequired'));
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

  // Step navigation with lightweight per-step validation to match UX
  const nextStep = () => {
    if (step === 1) {
      if (!formData.description.trim()) {
        setError(t('productDescriptionRequired'));
        return;
      }
    }
    if (step === 2) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError(t('validPriceRequired'));
        return;
      }
    }
    setError(null);
    setStep((prev => (prev + 1) as 2 | 3));
  };

  const prevStep = () => {
    setError(null);
    setStep((prev => (prev - 1) as 1 | 2));
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
    <div className="min-h-screen w-full bg-gradient-to-b from-orange-50 to-white pb-20 overflow-x-hidden">
      {/* Notification */}
      <Notification
        type={notification.type}
        title={notification.title}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={notification.onClose}
        duration={4000}
      />

      {/* Beautiful Header */}
      <div className="bg-white shadow-sm border-b border-orange-100 w-full">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/seller')}
              className="mr-4 p-3 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5 text-orange-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                  {mode === 'create' ? t('addProduct') : t('editProduct')}
                </span>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {mode === 'create' ? t('createNewProduct') : t('updateProductDetails')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Form */}
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        {seller && (
          <div className="mb-6 bg-white rounded-3xl shadow-sm border border-orange-100 p-5">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mr-2">
                <Store className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Your store</div>
                <div className="font-semibold text-gray-900">{seller.businessName}</div>
              </div>
            </div>
            <div className="text-sm text-gray-700 mt-2">
              <div className="flex items-start">
                <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>{seller.address || 'Address will appear after you share location in bot'}</span>
              </div>
              {seller.location && (
                <div className="mt-1 text-xs text-gray-500">
                  Lat: {seller.location.latitude}, Lon: {seller.location.longitude}
                </div>
              )}
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠</span>
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="bg-white rounded-3xl shadow-sm border p-4 mb-4">
          <div className="flex items-center justify-between">
            {[
              { id: 1, label: t('details') || 'Details' },
              { id: 2, label: t('pricing') || 'Pricing' },
              { id: 3, label: t('availability') || 'Availability' },
            ].map((s, idx) => (
              <div key={s.id} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= (s.id as number) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>{s.id}</div>
                <span className={`ml-2 text-sm ${step === (s.id as number) ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>{s.label}</span>
                {idx < 2 && <div className={`flex-1 h-px mx-2 ${step > (s.id as number) ? 'bg-orange-300' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-24">
          {/* STEP 1: Details */}
          {step === 1 && (
            <>
              <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm">📝</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('productDescription') || 'Product Description'}</h3>
                  <span className="text-red-500 text-sm font-medium">*</span>
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 resize-none"
                  placeholder={t('productDescriptionPlaceholder') || 'Enter product description'}
                />
              </div>

              <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-sm">📦</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{t('productDetails') || 'Product Details'}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-3">
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
                      className="w-full px-4 py-3 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-3">
                      {t('category')}
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 2: Pricing */}
          {step === 2 && (
            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('pricing') || 'Pricing'}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-3">
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
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200"
                      placeholder="0.00"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-500 text-sm font-medium">{t('so_m')}</span>
                  </div>
                </div>
                <div>
                  <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-3">
                    {t('originalPrice') || 'Original Price'}
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
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200"
                      placeholder="0.00"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-500 text-sm font-medium">{t('so_m')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Availability */}
          {step === 3 && (
            <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{t('availability') || 'Availability'}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-3">
                    {t('availableFrom')}
                  </label>
                  <div className="relative flex-1">
                    <input
                      type="datetime-local"
                      id="availableFrom"
                      name="availableFrom"
                      value={formData.availableFrom}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200"
                    />
                    <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="availableUntil" className="block text-sm font-medium text-gray-700 mb-3">
                    {t('availableUntil')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex-1">
                    <input
                      type="datetime-local"
                      id="availableUntil"
                      name="availableUntil"
                      value={formData.availableUntil}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 pl-12 bg-gray-50 border border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all duration-200"
                    />
                    <Clock className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sticky Step Controls */}
          <div className="fixed left-0 right-0 bottom-0 z-40">
            <div className="mx-auto max-w-md px-4 pb-safe pt-2">
              <div className="bg-white border-t border-orange-200 rounded-t-2xl shadow-lg p-3 flex items-center space-x-3">
                {step > 1 && (
                  <button type="button" onClick={prevStep} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50">
                    {t('previous') || 'Previous'}
                  </button>
                )}
                {step < 3 && (
                  <button type="button" onClick={nextStep} className="flex-[2] bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-200 shadow">
                    {t('next') || 'Next'}
                  </button>
                )}
                {step === 3 && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white py-3.5 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('loading')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>{mode === 'create' ? (t('addProduct') || 'Add Product') : (t('updateProduct') || 'Update Product')}</span>
                        <span className="text-xl">✨</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

