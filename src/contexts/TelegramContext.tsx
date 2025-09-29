import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  initData: string | null;
  isReady: boolean;
  webApp: any;
  userRole: 'user' | 'seller' | 'admin';
  setUserRole: (role: 'user' | 'seller' | 'admin') => void;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  initData: null,
  isReady: false,
  webApp: null,
  userRole: 'user',
  setUserRole: () => {},
});

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
};

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always provide a default user for development
  const [user, setUser] = useState<TelegramUser | null>({
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    language_code: 'uz'
  });
  const [initData, setInitData] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<any>(null);
  const [userRole, setUserRoleState] = useState<'user' | 'seller' | 'admin'>('user');

  // Enhanced setUserRole function that properly updates state
  const setUserRole = (role: 'user' | 'seller' | 'admin') => {
    setUserRoleState(role);
    localStorage.setItem('userRole', role);
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    initData,
    isReady,
    webApp,
    userRole,
    setUserRole
  }), [user, initData, isReady, webApp, userRole]);

  useEffect(() => {
    // Initialize immediately for faster loading
    const initializeTelegram = () => {
      // Check if we're in Telegram WebApp environment
      if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        setWebApp(tg);
        
        // Initialize the WebApp
        tg.ready();
        tg.expand();
        
        // Get init data
        const data = tg.initData;
        setInitData(data);
        
        // Parse user data
        if (data) {
          const urlParams = new URLSearchParams(data);
          const userStr = urlParams.get('user');
          if (userStr) {
            try {
              const userData = JSON.parse(userStr);
              setUser(userData);
              
              // Get role from URL parameters or backend
              const roleFromUrl = urlParams.get('role') as 'user' | 'seller' | 'admin';
              if (roleFromUrl) {
                setUserRole(roleFromUrl);
              } else {
                // Check localStorage for development
                const savedRole = localStorage.getItem('userRole') as 'user' | 'seller' | 'admin';
                if (savedRole) {
                  setUserRole(savedRole);
                }
              }
            } catch (error) {
              console.error('Error parsing user data:', error);
            }
          }
        }
      } else {
        // For development/testing in browser - create mock initData
        const mockUser = {
          id: 123456789,
          first_name: 'Test',
          last_name: 'User',
          username: 'testuser',
          language_code: 'uz'
        };
        
        const mockInitData = `user=${encodeURIComponent(JSON.stringify(mockUser))}&auth_date=${Math.floor(Date.now() / 1000)}&hash=mock_hash_for_development`;
        setInitData(mockInitData);
        
        // Check role from localStorage for development
        const savedRole = localStorage.getItem('userRole') as 'user' | 'seller' | 'admin';
        if (savedRole) {
          setUserRole(savedRole);
        }
      }
      
      setIsReady(true);
    };

    // Use requestIdleCallback for better performance
    if (window.requestIdleCallback) {
      window.requestIdleCallback(initializeTelegram);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      setTimeout(initializeTelegram, 0);
    }
  }, []);

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};
