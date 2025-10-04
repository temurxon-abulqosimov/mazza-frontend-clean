import React from 'react';
import { testAuthentication, simulateUserState } from './utils/testAuth';

const TestComponent: React.FC = () => {
  const authStatus = testAuthentication();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">Mazza App</h1>
        <p className="text-gray-600 mb-8">Telegram Mini App for Food Surplus</p>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">App Status</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Frontend:</span>
              <span className="text-green-600"> Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Backend:</span>
              <span className="text-green-600"> Running</span>
            </div>
            <div className="flex items-center justify-between">
              <span>TypeScript:</span>
              <span className="text-green-600"> Configured</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Telegram WebApp:</span>
              <span className={authStatus.isTelegramWebApp ? "text-green-600" : "text-yellow-600"}>
                {authStatus.isTelegramWebApp ? "Detected" : "Not Detected (Dev Mode)"}
              </span>
            </div>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Development Tools</h2>
            <p className="text-sm text-gray-600 mb-4">
              Test different user states for development:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => simulateUserState('unregistered')}
                className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
              >
                Unregistered User
              </button>
              <button
                onClick={() => simulateUserState('user')}
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600"
              >
                Regular User
              </button>
              <button
                onClick={() => simulateUserState('seller')}
                className="bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600"
              >
                Seller
              </button>
              <button
                onClick={() => simulateUserState('admin')}
                className="bg-purple-500 text-white px-3 py-2 rounded text-sm hover:bg-purple-600"
              >
                Admin (Logged In)
              </button>
              <button
                onClick={() => simulateUserState('admin_unregistered')}
                className="bg-orange-500 text-white px-3 py-2 rounded text-sm hover:bg-orange-600"
              >
                Admin (Password Required)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click any button to simulate that user state and reload the app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestComponent;

