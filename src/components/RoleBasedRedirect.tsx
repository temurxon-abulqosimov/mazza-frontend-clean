import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';

const RoleBasedRedirect: React.FC = () => {
  const { userRole } = useTelegram();

  console.log('RoleBasedRedirect: Current userRole:', userRole);

  // Redirect based on user role - NO registration needed
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
      // This should never happen since users are pre-registered
      // But if it does, default to user experience
      return <Navigate to="/user" replace />;
  }
};

export default RoleBasedRedirect;

