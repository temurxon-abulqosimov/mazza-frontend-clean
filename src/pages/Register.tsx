import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, User, Store, Phone, Clock } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegram } from '../contexts/TelegramContext';
import { usersApi, sellersApi } from '../services/api';
import { BusinessType } from '../types';

const Register: React.FC = () => {
  const { user, webApp } = useTelegram();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [registrationType, setRegistrationType] = useState<'user' | 'seller' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [language, setLanguage] = useState('uz');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.MARKET);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'user' || type === 'seller') {
      setRegistrationType(type);
    }
  }, [searchParams]);

  const handleUserRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = {
        telegramId: user?.id.toString() || '',
        phoneNumber,
        language,
        location: webApp?.initDataUnsafe?.user?.id ? {
          latitude: 41.3111,
          longitude: 69.2797
        } : undefined
      };

      console.log('Attempting to register user with data:', userData);
      const response = await usersApi.createUser(userData);
      console.log('Registration successful:', response);
      // Show success message with Open Mini App button
    } catch (err: any) {
      console.error('Registration failed:', err);
      console.error('Error response:', err.response?.data);
      setError(`Failed to register as user: ${err.response?.data?.message || err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const sellerData = {
        telegramId: user?.id.toString() || '',
        phoneNumber,
        businessName,
        businessType,
        language,
        opensAt: opensAt ? parseInt(opensAt.split(':')[0]) * 60 + parseInt(opensAt.split(':')[1]) : undefined,
        closesAt: closesAt ? parseInt(closesAt.split(':')[0]) * 60 + parseInt(closesAt.split(':')[1]) : undefined,
        location: webApp?.initDataUnsafe?.user?.id ? {
          latitude: 41.3111,
          longitude: 69.2797
        } : undefined,
        status: 'pending'
      };

      await sellersApi.createSeller(sellerData);
      // Show success message with Open Mini App button
    } catch (err) {
      setError('Failed to register as seller. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!registrationType) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <h1 className="text-xl font-bold text-gray-900">Choose Registration Type</h1>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="space-y-4">
            <button
              onClick={() => setRegistrationType('user')}
              className="w-full p-6 bg-white rounded-lg shadow-sm border-2 border-orange-200 hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Register as User</h3>
                  <p className="text-sm text-gray-600">Buy surplus food from local businesses</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setRegistrationType('seller')}
              className="w-full p-6 bg-white rounded-lg shadow-sm border-2 border-orange-200 hover:border-orange-300 transition-colors"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <Store className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900">Register as Seller</h3>
                  <p className="text-sm text-gray-600">Sell your surplus food to customers</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <BottomNavigation currentPage="profile" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/profile')}
            className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Register as {registrationType === 'user' ? 'User' : 'Seller'}
          </h1>
        </div>
      </div>

      <div className="px-4 py-6">
        <form onSubmit={registrationType === 'user' ? handleUserRegistration : handleSellerRegistration}>
          <div className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="uz">O'zbek</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            {/* Seller-specific fields */}
            {registrationType === 'seller' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Store className="w-4 h-4 inline mr-2" />
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your business name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value={BusinessType.MARKET}>Market</option>
                    <option value={BusinessType.BAKERY}>Bakery</option>
                    <option value={BusinessType.RESTAURANT}>Restaurant</option>
                    <option value={BusinessType.CAFE}>Cafe</option>
                    <option value={BusinessType.OTHER}>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Opens At
                    </label>
                    <input
                      type="time"
                      value={opensAt}
                      onChange={(e) => setOpensAt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closes At
                    </label>
                    <input
                      type="time"
                      value={closesAt}
                      onChange={(e) => setClosesAt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Registering...' : `Register as ${registrationType === 'user' ? 'User' : 'Seller'}`}
            </button>
          </div>
        </form>
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
};

export default Register;
