import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Store, Star, MapPin, Clock, Package } from 'lucide-react';
import { sellersApi, productsApi } from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

const SellerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSeller = async () => {
      if (!id) return;
      
      try {
        const response = await sellersApi.getSellerById(id);
        setSeller(response.data);
        setProducts(response.data.products || []);
      } catch (err) {
        console.error('Failed to load seller:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSeller();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Seller not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Go Home
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
            <button
              onClick={() => navigate('/')}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Seller Details</h1>
              <p className="text-sm text-gray-600">{seller.businessName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="p-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{seller.businessName}</h2>
              <p className="text-sm text-gray-600">{seller.businessType}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  {seller.averageRating || 'No rating'}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Package className="w-4 h-4 mr-1" />
                  {seller.totalProducts || 0} products
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>Location: {seller.location?.latitude}, {seller.location?.longitude}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span>Hours: {seller.opensAt}:00 - {seller.closesAt}:00</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <span>Phone: {seller.phoneNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Products</h3>
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.description}</h4>
                  <p className="text-sm text-gray-600 mt-1">{product.category}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-lg font-bold text-orange-600">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      Qty: {product.quantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation currentPage="profile" />
    </div>
  );
};

export default SellerDetail;
