import React, { useEffect, useState } from 'react';

const MobileDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      localStorage: typeof Storage !== 'undefined',
      geolocation: 'geolocation' in navigator,
      notifications: 'Notification' in window,
      permissions: 'permissions' in navigator,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }
    };
    setDebugInfo(info);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded max-w-xs z-50">
      <div className="font-bold mb-1">Mobile Debug Info:</div>
      <div>Platform: {debugInfo.platform}</div>
      <div>Screen: {debugInfo.screen?.width}x{debugInfo.screen?.height}</div>
      <div>Window: {debugInfo.window?.innerWidth}x{debugInfo.window?.innerHeight}</div>
      <div>Online: {debugInfo.onLine ? 'Yes' : 'No'}</div>
      <div>LocalStorage: {debugInfo.localStorage ? 'Yes' : 'No'}</div>
      <div>Geolocation: {debugInfo.geolocation ? 'Yes' : 'No'}</div>
      <div>Notifications: {debugInfo.notifications ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default MobileDebug;
