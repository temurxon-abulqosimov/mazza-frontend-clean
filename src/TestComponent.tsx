import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">Mazza App</h1>
        <p className="text-gray-600 mb-8">Telegram Mini App for Food Surplus</p>
        <div className="bg-white p-6 rounded-lg shadow-lg">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
