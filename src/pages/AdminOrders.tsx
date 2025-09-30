import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search as SearchIcon, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import BottomNavigation from '../components/BottomNavigation';
import { adminApi } from '../services/api';
import { Order } from '../types';

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let currentFiltered = orders.filter(order =>
      order.product?.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product?.seller?.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filterStatus !== 'all') {
      currentFiltered = currentFiltered.filter(order => order.status === filterStatus);
    }

    setFilteredOrders(currentFiltered);
  }, [searchQuery, filterStatus, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      // Simulate API call for demo
      console.log(`Updating order ${orderId} to status: ${status}`);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={loadOrders} className="mt-4 text-orange-500 hover:text-orange-600">
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
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">All Orders</h1>
              <p className="text-sm text-gray-600">Manage all platform orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 bg-white border-b flex items-center space-x-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by product, seller, or order code"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">Order #{order.code}</p>
                  <p className="text-sm text-gray-600">{order.product?.description}</p>
                  <p className="text-sm text-gray-600">Seller: {order.product?.seller?.businessName}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{order.totalPrice?.toLocaleString()} so'm</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Quantity: {order.quantity}</span>
                <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              {order.status === 'pending' && (
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                    className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                  >
                    <CheckCircle className="w-4 h-4 inline-block mr-1" /> Confirm
                  </button>
                  <button
                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  >
                    <XCircle className="w-4 h-4 inline-block mr-1" /> Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">No orders found.</p>
        )}
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
};

export default AdminOrders;

