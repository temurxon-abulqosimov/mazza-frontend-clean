import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Store, Shield, Settings, LogOut, ArrowLeft, Bell } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';

const Profile: React.FC = () => {
  const { user, userProfile, isReady, userRole } = useTelegram();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      setLoading(false);
    }
  }, [isReady]);

  const handleLogout = () => {
    // Clear user data and redirect to home
    localStorage.clear();
    window.location.reload();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'seller':
        return <Store className="w-5 h-5 text-blue-500" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <User className="w-5 h-5 text-green-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'seller':
        return t('seller');
      case 'admin':
        return t('admin');
      default:
        return t('user');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-20">
      {/* Beautiful Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              {t('profile')}
            </span>
          </h1>
          <LanguageSwitcher compact={true} showLabel={false} />
        </div>
      </div>

      {/* Beautiful User Info Card */}
      <div className="p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Profile Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>
            
            {/* User Details */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {userProfile?.firstName || user?.first_name} {userProfile?.lastName || user?.last_name}
              </h2>
              <p className="text-gray-600 flex items-center justify-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                @{userProfile?.username || user?.username}
              </p>
              
              {/* Role Badge */}
              <div className="flex items-center justify-center space-x-2 mt-3">
                {getRoleIcon(userRole)}
                <span className="px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 rounded-full text-sm font-medium">
                  {getRoleLabel(userRole)}
                </span>
                {userProfile?.status && (
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                    userProfile.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    userProfile.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {userProfile.status}
                  </span>
                )}
              </div>
            </div>
            
            {/* Business Info */}
            {(userProfile?.businessName || userProfile?.phoneNumber || userProfile?.businessType) && (
              <div className="w-full bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 space-y-4">
                {userProfile?.businessName && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <Store className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">{t('businessName')}</p>
                      <p className="font-semibold text-gray-900">{userProfile.businessName}</p>
                    </div>
                  </div>
                )}
                
                {userProfile?.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                      <span className="text-green-600 text-sm">📞</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">{t('phoneNumber')}</p>
                      <p className="font-semibold text-gray-900">{userProfile.phoneNumber}</p>
                    </div>
                  </div>
                )}
                
                {userProfile?.businessType && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                      <span className="text-purple-600 text-sm">🏪</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">{t('businessType')}</p>
                      <p className="font-semibold text-gray-900">{userProfile.businessType}</p>
                    </div>
                  </div>
                )}
                
                {userProfile?.location && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <span className="text-orange-600 text-sm">📍</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">{t('location')}</p>
                      <p className="font-semibold text-gray-900 text-xs">
                        {typeof userProfile.location === 'string' 
                          ? userProfile.location 
                          : `${userProfile.location.latitude.toFixed(4)}, ${userProfile.location.longitude.toFixed(4)}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Beautiful Menu Items */}
      <div className="px-6 space-y-6">
        {/* Account Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t('accountSection')}
              </span>
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/settings/account')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-2xl transition-all duration-200 hover:scale-[1.02] group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-gray-900 font-semibold text-lg">{t('accountSettings')}</span>
                    <p className="text-sm text-gray-600">{t('manageYourAccount')}</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:text-orange-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {t('settingsSection')}
              </span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl">
                <LanguageSwitcher showLabel={true} compact={false} />
              </div>
              
              <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-2xl transition-all duration-200 hover:scale-[1.02] group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-gray-900 font-semibold text-lg">{t('notifications')}</span>
                    <p className="text-sm text-gray-600">{t('manageNotifications')}</p>
                  </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180 group-hover:text-orange-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-3xl shadow-lg border border-red-100 overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-6 bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 rounded-3xl transition-all duration-200 hover:scale-[1.02] group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                <LogOut className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <span className="text-red-600 font-semibold text-lg">{t('logout')}</span>
                <p className="text-sm text-red-500">{t('signOutOfAccount')}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
};

export default Profile;

