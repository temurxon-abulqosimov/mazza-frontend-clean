import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import RegistrationRequired from './RegistrationRequired';
import LoadingScreen from './LoadingScreen';
import BrowserFallback from './BrowserFallback';

const RoleBasedRedirect: React.FC = () => {
  const { userRole, userProfile, isLoading, isReady, webApp } = useTelegram();

  console.log('RoleBasedRedirect: Current userRole:', userRole);
  console.log('RoleBasedRedirect: userProfile:', userProfile);
  console.log('RoleBasedRedirect: isLoading:', isLoading);
  console.log('RoleBasedRedirect: isReady:', isReady);
  console.log('RoleBasedRedirect: webApp:', webApp);

  // Show loading while initializing
  if (!isReady || isLoading) {
    return <LoadingScreen />;
  }

  // Check if we're in a regular browser (not Telegram WebApp)
  if (!webApp && process.env.NODE_ENV === 'production') {
    return <BrowserFallback />;
  }

  // Show registration required if user is not registered
  if (!userProfile || !userProfile.isRegistered) {
    return <RegistrationRequired />;
  }

  // Redirect based on user role
  switch (userRole) {
    case 'user':
      console.log('RoleBasedRedirect: Redirecting to /user');
      return <Navigate to="/user" replace />;
    case 'seller':
      console.log('RoleBasedRedirect: Redirecting to /seller');
      return <Navigate to="/seller" replace />;
    case 'admin':
      console.log('RoleBasedRedirect: Redirecting to /admin');
      return <Navigate to="/admin" replace />;
    default:
      console.log('RoleBasedRedirect: Default redirect to /user');
      return <Navigate to="/user" replace />;
  }
};

export default RoleBasedRedirect;

