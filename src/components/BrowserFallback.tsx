import React from 'react';

const BrowserFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Open in Telegram</h1>
          <p className="text-gray-600">
            This mini app is designed to work within Telegram. Please open it from your Telegram bot.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ol className="text-sm text-blue-800 space-y-1 text-left">
              <li>1. Open Telegram on your device</li>
              <li>2. Find our bot in your chats</li>
              <li>3. Tap the mini app button</li>
              <li>4. The app will open properly</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Development Mode:</h3>
            <p className="text-sm text-yellow-800">
              If you're a developer testing, you can use the role switcher buttons below to simulate different user states.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserFallback;
