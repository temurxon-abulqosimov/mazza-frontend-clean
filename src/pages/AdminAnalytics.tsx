import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3, Users, Store, Package, DollarSign, Calendar, Download, Filter } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import BottomNavigation from '../components/BottomNavigation';
import { useTelegram } from '../contexts/TelegramContext';

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate();
  const { user, isReady } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Mock data for charts
  const userGrowthData = [
    { name: 'Jan', users: 120, newUsers: 20 },
    { name: 'Feb', users: 180, newUsers: 25 },
    { name: 'Mar', users: 250, newUsers: 30 },
    { name: 'Apr', users: 320, newUsers: 35 },
    { name: 'May', users: 400, newUsers: 40 },
    { name: 'Jun', users: 480, newUsers: 45 },
    { name: 'Jul', users: 560, newUsers: 50 },
  ];

  const orderTrendsData = [
    { name: 'Mon', orders: 45, revenue: 120000 },
    { name: 'Tue', orders: 52, revenue: 135000 },
    { name: 'Wed', orders: 48, revenue: 128000 },
    { name: 'Thu', orders: 61, revenue: 155000 },
    { name: 'Fri', orders: 55, revenue: 142000 },
    { name: 'Sat', orders: 67, revenue: 168000 },
    { name: 'Sun', orders: 58, revenue: 148000 },
  ];

  const sellerPerformanceData = [
    { name: 'Bakery Corner', orders: 45, revenue: 120000, rating: 4.8 },
    { name: 'Pizza Palace', orders: 38, revenue: 95000, rating: 4.6 },
    { name: 'Coffee Shop', orders: 32, revenue: 78000, rating: 4.7 },
    { name: 'Fresh Market', orders: 28, revenue: 65000, rating: 4.5 },
    { name: 'Deli Store', orders: 25, revenue: 58000, rating: 4.4 },
  ];

  const categoryDistribution = [
    { name: 'Bread & Bakery', value: 35, color: '#8884d8' },
    { name: 'Main Dishes', value: 25, color: '#82ca9d' },
    { name: 'Beverages', value: 20, color: '#ffc658' },
    { name: 'Desserts', value: 15, color: '#ff7c7c' },
    { name: 'Other', value: 5, color: '#8dd1e1' },
  ];

  const recentActivity = [
    { type: 'user', message: 'New user registered', time: '2 hours ago', icon: Users, color: 'blue' },
    { type: 'seller', message: 'New seller application', time: '4 hours ago', icon: Store, color: 'orange' },
    { type: 'order', message: 'Order completed', time: '6 hours ago', icon: Package, color: 'green' },
    { type: 'user', message: 'User profile updated', time: '8 hours ago', icon: Users, color: 'blue' },
    { type: 'seller', message: 'Seller approved', time: '12 hours ago', icon: Store, color: 'orange' },
  ];

  useEffect(() => {
    if (isReady && user) {
      setLoading(false);
    }
  }, [isReady, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin')}
                className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-600">Platform Analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button className="flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                <Download className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="p-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
                <p className="text-xs text-green-600">+12% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Store className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Active Sellers</p>
                <p className="text-2xl font-bold text-gray-900">89</p>
                <p className="text-xs text-green-600">+8% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">5,678</p>
                <p className="text-xs text-green-600">+23% this month</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">$45,678</p>
                <p className="text-xs text-green-600">+15% this month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User Growth Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Total Users</span>
                <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                <span className="text-sm text-gray-600">New Users</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="newUsers" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Order Trends</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Orders</span>
                <div className="w-3 h-3 bg-green-500 rounded-full ml-4"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Seller Performance */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Sellers</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sellerPerformanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 bg-${activity.color}-100 rounded-full flex items-center justify-center mr-3`}>
                    <Icon className={`w-4 h-4 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.message}</p>
                    <p className="text-sm text-gray-600">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNavigation currentPage="analytics" />
    </div>
  );
};

export default AdminAnalytics;
