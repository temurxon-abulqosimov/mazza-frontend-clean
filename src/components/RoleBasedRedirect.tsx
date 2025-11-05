import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import RegistrationRequired from './RegistrationRequired';
import LoadingScreen from './LoadingScreen';
import BrowserFallback from './BrowserFallback';
import AdminLogin from './AdminLogin';
import { config } from '../config/env';

const RoleBasedRedirect: React.FC = () => {
  const { userRole, userProfile, isLoading, isReady, webApp, user, setUserProfile, setUserRole } = useTelegram();

  // Auto-detect admin based on Telegram ID from env and require password
  useEffect(() => {
    if (!isReady || !user) return;
    const adminId = (config.ADMIN_TELEGRAM_ID || '').trim();
    if (!adminId) return;
    const currentId = user.id?.toString();
    if (currentId === adminId) {
      // If not already marked as admin, set minimal admin profile and require password
      if (!userProfile || userProfile.role !== 'ADMIN') {
        const adminProfile = {
          id: user.id,
          telegramId: currentId,
          firstName: user.first_name || 'Admin',
          lastName: user.last_name,
          username: user.username,
          role: 'ADMIN' as const,
          isRegistered: true,
          needsPassword: true
        } as const;
        setUserProfile(adminProfile as any);
        setUserRole('ADMIN');
        localStorage.setItem('userProfile', JSON.stringify(adminProfile));
      }
    }
  }, [isReady, user, userProfile, setUserProfile, setUserRole]);

  console.log('RoleBasedRedirect: Current state:', {
    userRole,
    userProfile: userProfile ? { ...userProfile, isRegistered: userProfile.isRegistered } : null,
    isLoading,
    isReady,
    hasWebApp: !!webApp,
    timestamp: new Date().toISOString()
  });

  // If current Telegram user matches admin ID, allow immediate admin auth screen even while loading
  const adminId = (config.ADMIN_TELEGRAM_ID || '').trim();
  const currentId = user?.id?.toString();
  if (adminId && currentId && currentId === adminId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('RoleBasedRedirect: Admin detected by Telegram ID - showing admin login early');
      return <AdminLogin />;
    }
  }

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

  // Show admin login if admin needs password or if no token exists
  if (userProfile && userProfile.role === 'ADMIN') {
    const token = localStorage.getItem('access_token');
    if (!token || userProfile.needsPassword) {
      console.log('RoleBasedRedirect: Admin needs authentication - showing admin login');
      return <AdminLogin />;
    }
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