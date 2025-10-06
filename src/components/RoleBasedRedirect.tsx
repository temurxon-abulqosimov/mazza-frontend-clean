import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import RegistrationRequired from './RegistrationRequired';
import LoadingScreen from './LoadingScreen';
import BrowserFallback from './BrowserFallback';
import AdminLogin from './AdminLogin';

const RoleBasedRedirect: React.FC = () => {
  const { userRole, userProfile, isLoading, isReady, webApp } = useTelegram();

  console.log('RoleBasedRedirect: Current state:', {
    userRole,
    userProfile: userProfile ? { ...userProfile, isRegistered: userProfile.isRegistered } : null,
    isLoading,
    isReady,
    hasWebApp: !!webApp,
    timestamp: new Date().toISOString()
  });

  // Show loading while initializing
  if (!isReady || isLoading) {
    console.log('RoleBasedRedirect: Showing loading screen - isReady:', isReady, 'isLoading:', isLoading);
    return <LoadingScreen />;
  }

  // Additional safety check: if we're ready but no userProfile yet, show loading
  if (isReady && !userProfile) {
    console.log('RoleBasedRedirect: Ready but no userProfile yet - showing loading');
    return <LoadingScreen />;
  }

  // Check if we're in a regular browser (not Telegram WebApp)
  if (!webApp && process.env.NODE_ENV === 'production') {
    console.log('RoleBasedRedirect: No Telegram WebApp in production - showing browser fallback');
    return <BrowserFallback />;
  }

  // Show admin login if admin needs password
  if (userProfile && userProfile.role === 'ADMIN' && userProfile.needsPassword) {
    console.log('RoleBasedRedirect: Admin needs password - showing admin login');
    return <AdminLogin />;
  }

  // Show registration required if user is not registered
  if (!userProfile || !userProfile.isRegistered) {
    console.log('RoleBasedRedirect: User not registered - showing registration screen');
    return <RegistrationRequired />;
  }

  // Redirect based on user role
  console.log('RoleBasedRedirect: User is registered, redirecting based on role:', userRole);
  
  // Use userProfile.role as the source of truth, fallback to userRole
  const actualRole = userProfile?.role || userRole;
  
  switch (actualRole) {
    case 'USER':
      return <Navigate to="/user" replace />;
    case 'SELLER':
      return <Navigate to="/seller" replace />;
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/user" replace />;
  }
};

export default RoleBasedRedirect;