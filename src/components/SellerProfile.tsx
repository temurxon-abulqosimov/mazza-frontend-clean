import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, MapPin, Clock, Phone, Upload, CheckCircle, XCircle } from 'lucide-react';
import { sellersApi } from '../services/api';
import { Seller, BusinessType, SellerVerificationStatus } from '../types';
import { useTelegram } from '../contexts/TelegramContext';
import ImageUpload from './ImageUpload';

const SellerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, isReady } = useTelegram();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: BusinessType.OTHER,
    phoneNumber: '',
    opensAt: '',
    closesAt: '',
  });

  const [businessImage, setBusinessImage] = useState<File | null>(null);
  const [currentBusinessImage, setCurrentBusinessImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isReady && user) {
      loadSellerProfile();
    }
  }, [isReady, user]);

  const loadSellerProfile = async () => {
    try {
      const response = await sellersApi.getSellerProfile();
      const sellerData = response.data;
      setSeller(sellerData);
      
      setFormData({
        businessName: sellerData.businessName || '',
        businessType: sellerData.businessType || BusinessType.OTHER,
        phoneNumber: sellerData.phoneNumber || '',
        opensAt: sellerData.opensAt ? formatTimeFromMinutes(sellerData.opensAt) : '',
        closesAt: sellerData.closesAt ? formatTimeFromMinutes(sellerData.closesAt) : '',
      });
      
      setCurrentBusinessImage(sellerData.businessImageUrl || undefined);
    } catch (err) {
      setError('Failed to load seller profile');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeFromMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatTimeToMinutes = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (file: File | null) => {
    setBusinessImage(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        phoneNumber: formData.phoneNumber,
        opensAt: formData.opensAt ? formatTimeToMinutes(formData.opensAt) : undefined,
        closesAt: formData.closesAt ? formatTimeToMinutes(formData.closesAt) : undefined,
      };

      await sellersApi.updateSellerProfile(updateData);
      setSuccess('Profile updated successfully!');
      
      await loadSellerProfile();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getVerificationStatusColor = (status: SellerVerificationStatus) => {
    switch (status) {
      case SellerVerificationStatus.VERIFIED:
        return 'text-green-600 bg-green-100';
      case SellerVerificationStatus.REJECTED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getVerificationStatusIcon = (status: SellerVerificationStatus) => {
    switch (status) {
      case SellerVerificationStatus.VERIFIED:
        return <CheckCircle className="w-4 h-4" />;
      case SellerVerificationStatus.REJECTED:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const businessTypeOptions = [
    { value: BusinessType.CAFE, label: 'Cafe' },
    { value: BusinessType.RESTAURANT, label: 'Restaurant' },
    { value: BusinessType.MARKET, label: 'Market' },
    { value: BusinessType.BAKERY, label: 'Bakery' },
    { value: BusinessType.OTHER, label: 'Other' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/dashboard/seller')}
            className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Business Profile</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {seller && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full mr-3 ${getVerificationStatusColor(seller.verificationStatus)}`}>
                  {getVerificationStatusIcon(seller.verificationStatus)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verification Status</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {seller.verificationStatus.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImageUrl={currentBusinessImage}
            label="Business Image"
            maxSize={5}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Store className="w-4 h-4 inline mr-2" />
              Business Name
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
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
              name="businessType"
              value={formData.businessType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            >
              {businessTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+998 90 123 45 67"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Opens At
              </label>
              <input
                type="time"
                name="opensAt"
                value={formData.opensAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Closes At
              </label>
              <input
                type="time"
                name="closesAt"
                value={formData.closesAt}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerProfile;

