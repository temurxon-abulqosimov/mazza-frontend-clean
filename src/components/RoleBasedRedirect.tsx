import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import RegistrationRequired from './RegistrationRequired';
import LoadingScreen from './LoadingScreen';
import BrowserFallback from './BrowserFallback';

const RoleBasedRedirect: React.FC = () => {
  const { userRole, userProfile, isLoading, isReady, webApp } = useTelegram();

  console.log('RoleBasedRedirect: Current state:', {
    userRole,
    userProfile: userProfile ? { ...userProfile, isRegistered: userProfile.isRegistered } : null,
    isLoading,
    isReady,
    hasWebApp: !!webApp
  });

  // Show loading while initializing
  if (!isReady || isLoading) {
    console.log('RoleBasedRedirect: Showing loading screen');
    return <LoadingScreen />;
  }

  // Check if we're in a regular browser (not Telegram WebApp)
  if (!webApp && process.env.NODE_ENV === 'production') {
    console.log('RoleBasedRedirect: No Telegram WebApp in production - showing browser fallback');
    return <BrowserFallback />;
  }

  // Show registration required if user is not registered
  if (!userProfile || !userProfile.isRegistered) {
    console.log('RoleBasedRedirect: User not registered - showing registration screen');
    return <RegistrationRequired />;
  }

  // Redirect based on user role
  console.log('RoleBasedRedirect: User is registered, redirecting based on role:', userRole);
  
  switch (userRole) {
    case 'user':
      return <Navigate to="/user" replace />;
    case 'seller':
      return <Navigate to="/seller" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/user" replace />;
  }
};

export default RoleBasedRedirect;