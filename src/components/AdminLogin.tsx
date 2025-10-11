import React, { useState } from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { authApi } from '../services/api';

const AdminLogin: React.FC = () => {
  const { user, setUserProfile, setUserRole, login } = useTelegram();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Use proper API authentication
      const response = await login({
        telegramId: user?.id.toString() || '',
        role: 'ADMIN',
        password: password
      });
      
      if (response.data?.access_token) {
        // Admin login successful
        setUserProfile({
          id: 1,
          telegramId: user?.id.toString() || '',
          firstName: user?.first_name || 'Admin',
          lastName: user?.last_name,
          username: user?.username,
          role: 'ADMIN',
          isRegistered: true
        });
        
        setUserRole('ADMIN');
        localStorage.setItem('userProfile', JSON.stringify({
          id: 1,
          telegramId: user?.id.toString() || '',
          firstName: user?.first_name || 'Admin',
          lastName: user?.last_name,
          username: user?.username,
          role: 'ADMIN',
          isRegistered: true
        }));
        
        // Redirect to admin dashboard
        window.location.href = '/admin';
      } else {
        setError('Invalid credentials');
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">
            Welcome {user?.first_name}! Please enter your admin password to access the admin panel.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Admin Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Access Admin Panel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Admin access is restricted. Contact system administrator if you need assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
