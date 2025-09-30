import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">M</span>
        </div>
        <div className="flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Loading Mazza</h2>
        </div>
        <p className="text-gray-600">Setting up your experience...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;

