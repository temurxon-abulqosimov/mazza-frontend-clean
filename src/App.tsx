import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TelegramProvider } from './contexts/TelegramContext';
import { LocalizationProvider } from './contexts/LocalizationContext';
import './App.css';

// Components (imported first)
import RoleBasedRedirect from './components/RoleBasedRedirect';
import RoleSwitcher from './components/RoleSwitcher';
import LoadingScreen from './components/LoadingScreen';

// Lazy load all pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const SellerDetail = lazy(() => import('./pages/SellerDetail'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const SellerDashboard = lazy(() => import('./pages/SellerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminSellers = lazy(() => import('./pages/AdminSellers'));
const AdminAnalytics = lazy(() => import('./pages/AdminAnalytics'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const ProductCreate = lazy(() => import('./pages/ProductCreate'));
const ProductEdit = lazy(() => import('./pages/ProductEdit'));

// Loading component for Suspense fallback
const PageLoader = () => <LoadingScreen />;

function App() {
  return (
    <TelegramProvider>
      <LocalizationProvider>
        <Router>
          <div className="App">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Role-based redirect - NO registration needed */}
                <Route path="/" element={<RoleBasedRedirect />} />
                
                {/* User routes - Product discovery and ordering */}
                <Route path="/user" element={<UserDashboard />} />
                <Route path="/user/orders" element={<Orders />} />
                <Route path="/user/profile" element={<Profile />} />
                
                {/* Seller routes - Product management and dashboard */}
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/seller/orders" element={<Orders />} />
                <Route path="/seller/profile" element={<Profile />} />
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
                
                {/* Fallback - redirect to role-based home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            
            {/* Development role switcher - only in development */}
            {process.env.NODE_ENV === 'development' && <RoleSwitcher />}
          </div>
        </Router>
      </LocalizationProvider>
    </TelegramProvider>
  );
}

export default App;

