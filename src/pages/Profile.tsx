import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Store, Shield, Settings, LogOut, ArrowLeft, MapPin, Clock, Star, Bell, Lock, Globe } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTelegram } from '../contexts/TelegramContext';
import { useLocalization } from '../contexts/LocalizationContext';

const Profile: React.FC = () => {
  const { user, isReady, userRole } = useTelegram();
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">{t('profile')}</h1>
          <LanguageSwitcher compact={true} showLabel={false} />
        </div>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-600">@{user?.username}</p>
              <div className="flex items-center mt-2">
                {getRoleIcon(userRole)}
                <span className="ml-2 text-sm text-gray-600">{getRoleLabel(userRole)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 space-y-4">
        {/* Account Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('accountSection')}</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/settings/account')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <Settings className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">{t('accountSettings')}</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('settingsSection')}</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg">
                <LanguageSwitcher showLabel={true} compact={false} />
              </div>
              
              <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-gray-900">{t('notifications')}</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-lg shadow-sm border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-4 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-2" />
            {t('logout')}
          </button>
        </div>
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
};

export default Profile;
