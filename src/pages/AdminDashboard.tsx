import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Store, Package, TrendingUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegram } from '../contexts/TelegramContext';
import { authApi } from '../services/api';
import { useLocalization } from '../contexts/LocalizationContext';
import { adminApi } from '../services/api';

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  totalOrders: number;
  pendingSellers: number;
  recentActivity: any[];
}

const AdminDashboard: React.FC = () => {
  const { user, isReady } = useTelegram();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ensureAdminAuth = async () => {
      if (!isReady || !user) return;
      try {
        // If we already have a token, try loading; otherwise attempt env-based admin login
        const token = localStorage.getItem('access_token');
        if (!token) {
          const adminTelegramId = process.env.REACT_APP_ADMIN_TELEGRAM_ID;
          const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
          if (adminTelegramId && adminPassword) {
            await authApi.login({ telegramId: adminTelegramId, role: 'ADMIN', password: adminPassword });
          }
        }
        await loadDashboardData();
      } catch (e: any) {
        setError(e.response?.data?.message || 'Admin authentication failed.');
        setLoading(false);
      }
    };
    ensureAdminAuth();
  }, [isReady, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('AdminDashboard: Loading admin dashboard data...');
      
      const statsResponse = await adminApi.getDashboard();
      console.log('AdminDashboard: Stats response:', statsResponse);
      
      setAdminStats(statsResponse.data);
    } catch (err: any) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Platform Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Sellers</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.totalSellers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{adminStats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleQuickAction('/admin/users')}
              className="flex items-center justify-center p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </button>
            <button
              onClick={() => handleQuickAction('/admin/sellers')}
              className="flex items-center justify-center p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Store className="w-5 h-5 mr-2" />
              Manage Sellers
            </button>
            <button
              onClick={() => handleQuickAction('/admin/orders')}
              className="flex items-center justify-center p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              View Orders
            </button>
            <button
              onClick={() => handleQuickAction('/admin/analytics')}
              className="flex items-center justify-center p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Recent Events list styled like design */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
          <div className="space-y-3">
            {(adminStats?.recentActivity || [
              { icon: 'seller', title: 'New seller "Green Eats" registered.', time: '2 hours ago' },
              { icon: 'product', title: 'Product "Artisan Bread" stock updated.', time: '5 hours ago' },
              { icon: 'user', title: 'User "John Doe" updated profile details.', time: 'Yesterday' },
              { icon: 'system', title: 'System maintenance completed.', time: '2 days ago' },
              { icon: 'product', title: 'New product "Organic Veggie Box" listed.', time: '3 days ago' },
            ]).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">🥗</div>
                  <div>
                    <p className="text-sm text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
                <button className="text-orange-600 text-sm">›</button>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full text-orange-600 text-sm font-medium">View All Events</button>
        </div>
      </div>

      <BottomNavigation currentPage="home" />
    </div>
  );
};

export default AdminDashboard;


