import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Package, BarChart3 } from 'lucide-react';
import { useLocalization } from '../contexts/LocalizationContext';
import { useTelegram } from '../contexts/TelegramContext';

interface BottomNavigationProps {
  currentPage: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocalization();
  const { userRole } = useTelegram();

  // Different navigation items based on user role
  const getNavItems = () => {
    if (userRole === 'SELLER') {
      // For sellers, use hash fragments to trigger internal tab switching
      return [
        { id: 'dashboard', label: t('home'), icon: Home, path: '/seller#dashboard' },
        { id: 'products', label: t('products'), icon: Package, path: '/seller#products' },
        { id: 'orders', label: t('orders'), icon: ShoppingBag, path: '/seller#orders' },
        { id: 'analytics', label: t('analytics'), icon: BarChart3, path: '/seller#analytics' },
        { id: 'profile', label: t('profile'), icon: User, path: '/seller#profile' },
      ];
    } else if (userRole === 'ADMIN') {
      return [
        { id: 'home', label: t('home'), icon: Home, path: '/admin' },
        { id: 'analytics', label: t('analytics'), icon: BarChart3, path: '/admin/analytics' },
        { id: 'orders', label: t('orders'), icon: ShoppingBag, path: '/admin/orders' },
        { id: 'profile', label: t('profile'), icon: User, path: '/admin' },
      ];
    } else {
      // Default user navigation
      return [
        { id: 'home', label: t('home'), icon: Home, path: '/user' },
        { id: 'search', label: t('search'), icon: Search, path: '/search' },
        { id: 'orders', label: t('orders'), icon: ShoppingBag, path: '/user/orders' },
        { id: 'profile', label: t('profile'), icon: User, path: '/user/profile' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          // For seller/admin roles, check if currentPage matches the tab id
          const isActive = userRole === 'SELLER' || userRole === 'ADMIN'
            ? currentPage === item.id
            : location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center py-3 px-2 ${
                isActive ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-500'}`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;

