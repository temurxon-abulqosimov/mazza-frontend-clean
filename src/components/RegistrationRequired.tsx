import React from 'react';
import { useTelegram } from '../contexts/TelegramContext';
import { config } from '../config/env';

const RegistrationRequired: React.FC = () => {
  const { webApp, user } = useTelegram();

  const openBot = () => {
    const botUrl = `https://t.me/${config.BOT_USERNAME}`;
    if (webApp) {
      webApp.openTelegramLink(botUrl);
    } else {
      // Fallback for development
      window.open(botUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Required</h1>
          <p className="text-gray-600">
            Hello {user?.first_name}! You need to register in our Telegram bot first to use this mini app.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to register:</h3>
            <ol className="text-sm text-blue-800 space-y-1 text-left">
              <li>1. Click the button below to open our bot</li>
              <li>2. Start a conversation with the bot</li>
              <li>3. Follow the registration process</li>
              <li>4. Choose your role (User/Seller/Admin)</li>
              <li>5. Come back to this mini app</li>
            </ol>
          </div>

          <button
            onClick={openBot}
            className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Open Telegram Bot
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>

          <p className="text-sm text-gray-500">
            After registration, click "Refresh Page" to access your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationRequired;
