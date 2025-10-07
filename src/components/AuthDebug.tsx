import React, { useState, useEffect } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { productsApi, sellersApi } from '../services/api';

const AuthDebug: React.FC = () => {
  const { user, userProfile, isAuthenticated, userRole } = useTelegram();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const info = {
      user,
      userProfile,
      isAuthenticated,
      userRole,
      localStorage: {
        access_token: !!localStorage.getItem('access_token'),
        refresh_token: !!localStorage.getItem('refresh_token'),
        userRole: localStorage.getItem('userRole'),
        userProfile: localStorage.getItem('userProfile')
      },
      timestamp: new Date().toISOString()
    };
    setDebugInfo(info);
  }, [user, userProfile, isAuthenticated, userRole]);

  const testAuth = async () => {
    setTestResults({ loading: true });
    
    try {
      console.log('🧪 Testing authentication...');
      
      // Test seller profile
      const sellerProfile = await sellersApi.getSellerProfile();
      console.log('✅ Seller profile test passed:', sellerProfile.data);
      
      // Test seller products
      const sellerProducts = await productsApi.getSellerProducts();
      console.log('✅ Seller products test passed:', sellerProducts.data);
      
      setTestResults({
        loading: false,
        success: true,
        sellerProfile: sellerProfile.data,
        sellerProducts: sellerProducts.data,
        productCount: sellerProducts.data?.length || 0
      });
    } catch (error: any) {
      console.error('❌ Auth test failed:', error);
      setTestResults({
        loading: false,
        success: false,
        error: {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      });
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    window.location.reload();
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Authentication Debug</h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current State</h3>
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={testAuth}
              disabled={testResults?.loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {testResults?.loading ? 'Testing...' : 'Test Auth'}
            </button>
            <button
              onClick={clearAuth}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Auth
            </button>
          </div>

          {testResults && (
            <div>
              <h3 className="font-semibold mb-2">Test Results</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthDebug;