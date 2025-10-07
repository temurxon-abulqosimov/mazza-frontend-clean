import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider } from './contexts/TelegramContext';
import { LocalizationProvider } from './contexts/LocalizationContext';
import { LocationProvider } from './contexts/LocationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import MobileErrorBoundary from './components/MobileErrorBoundary';
import './App.css';

// Components (imported first)
import RoleBasedRedirect from './components/RoleBasedRedirect';
import RoleSwitcher from './components/RoleSwitcher';
import LoadingScreen from './components/LoadingScreen';
import AuthDebug from './components/AuthDebug';

// Import main dashboard components directly to prevent Suspense issues
import UserDashboard from './pages/UserDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Development components
import TestComponent from './TestComponent';
import MobileDebug from './components/MobileDebug';

// Lazy load other pages for better performance
const Search = lazy(() => import('./pages/Search'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SellerDetail = lazy(() => import('./pages/SellerDetail'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSellers = lazy(() => import('./pages/AdminSellers'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const ProductCreate = lazy(() => import('./pages/ProductCreate'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <MobileErrorBoundary>
        <TelegramProvider>
          <LocalizationProvider>
            <LocationProvider>
              <NotificationProvider>
                <Router>
            <div className="App">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                {/* Role-based redirect with registration check */}
                <Route path="/" element={<RoleBasedRedirect />} />
                
                {/* User routes - Product discovery and ordering */}
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/user/orders" element={<Orders />} />
                <Route path="/user/profile" element={<Profile />} />
                <Route path="/user/notifications" element={<Notifications />} />
                
                {/* Seller routes - Product management and dashboard */}
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/seller/orders" element={<Orders />} />
                <Route path="/seller/profile" element={<Profile />} />
                <Route path="/seller/notifications" element={<Notifications />} />
                <Route path="/seller/products/create" element={<ProductCreate />} />
                <Route path="/seller/products/edit/:id" element={<ProductEdit />} />
                
                {/* Admin routes - Platform management */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/profile" element={<Profile />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/sellers" element={<AdminSellers />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                
                {/* Settings routes */}
                <Route path="/settings/account" element={<AccountSettings />} />
                
                {/* Shared routes - Available to all roles */}
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/seller-detail/:id" element={<SellerDetail />} />
                <Route path="/search" element={<Search />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                
                {/* Development routes */}
                {process.env.NODE_ENV === 'development' && (
                  <Route path="/test" element={<TestComponent />} />
                )}
                
                {/* Fallback - redirect to role-based home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            
            {/* Development role switcher - only in development */}
            {process.env.NODE_ENV === 'development' && <RoleSwitcher />}
            
            {/* Development auth debug - only in development */}
            {process.env.NODE_ENV === 'development' && <AuthDebug />}
            
            {/* Mobile debug info - only in development */}
            {process.env.NODE_ENV === 'development' && <MobileDebug />}
          </div>
        </Router>
              </NotificationProvider>
            </LocationProvider>
          </LocalizationProvider>
        </TelegramProvider>
      </MobileErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;

