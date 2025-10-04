import React from 'react';
import { useTelegram } from '../contexts/TelegramContext';

const AuthDebug: React.FC = () => {
  const { user, userProfile, isReady, isLoading, webApp, userRole } = useTelegram();

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>isReady: {isReady ? '✅' : '❌'}</div>
        <div>isLoading: {isLoading ? '⏳' : '✅'}</div>
        <div>hasWebApp: {webApp ? '✅' : '❌'}</div>
        <div>hasUser: {user ? '✅' : '❌'}</div>
        <div>hasUserProfile: {userProfile ? '✅' : '❌'}</div>
        <div>userRole: {userRole}</div>
        <div>isRegistered: {userProfile?.isRegistered ? '✅' : '❌'}</div>
        {user && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div>User ID: {user.id}</div>
            <div>Name: {user.first_name}</div>
          </div>
        )}
        {userProfile && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div>Profile ID: {userProfile.id}</div>
            <div>Role: {userProfile.role}</div>
            <div>Telegram ID: {userProfile.telegramId}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebug;
