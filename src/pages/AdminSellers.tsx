import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, Store, CheckCircle, XCircle } from 'lucide-react';
import { adminApi } from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

const AdminSellers: React.FC = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getSellers();
      setSellers(response.data || []);
    } catch (error) {
      console.error('Failed to load sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSellerStatusChange = async (sellerId: number, newStatus: string) => {
    try {
      await adminApi.updateSellerStatus(String(sellerId), newStatus);
      setSellers(sellers.map(seller => 
        seller.id === sellerId ? { ...seller, status: newStatus } : seller
      ));
    } catch (error) {
      console.error('Failed to update seller status:', error);
    }
  };

  const filteredSellers = sellers.filter(seller =>
    seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.businessType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers...</p>
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
            <button
              onClick={() => navigate('/admin')}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manage Sellers</h1>
              <p className="text-sm text-gray-600">Seller Management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Sellers List */}
      <div className="p-4">
        <div className="space-y-3">
          {filteredSellers.map((seller) => (
            <div key={seller.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{seller.businessName}</h3>
                    <p className="text-sm text-gray-600">{seller.businessType}</p>
                    <p className="text-sm text-gray-500">{seller.phoneNumber}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        {seller.totalProducts} products
                      </span>
                      <span className="text-sm text-gray-500">
                         {seller.averageRating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    seller.status === 'approved' ? 'bg-green-100 text-green-800' :
                    seller.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {seller.status}
                  </span>
                  <div className="flex space-x-2">
                    {seller.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleSellerStatusChange(seller.id, 'approved')}
                          className="flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleSellerStatusChange(seller.id, 'rejected')}
                          className="flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    {seller.status === 'approved' && (
                      <button
                        onClick={() => handleSellerStatusChange(seller.id, 'rejected')}
                        className="flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    )}
                    {seller.status === 'rejected' && (
                      <button
                        onClick={() => handleSellerStatusChange(seller.id, 'approved')}
                        className="flex items-center px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredSellers.length === 0 && (
            <div className="text-center py-8">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No sellers found</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
};

export default AdminSellers; 
