import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { authApi } from "../services/api";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface UserProfile {
  id: number;
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  role: "user" | "seller" | "admin";
  isRegistered: boolean;
}

interface TelegramContextType {
  user: TelegramUser | null;
  userProfile: UserProfile | null;
  initData: string | null;
  isReady: boolean;
  isLoading: boolean;
  webApp: any;
  userRole: "user" | "seller" | "admin";
  setUserRole: (role: "user" | "seller" | "admin") => void;
  login: () => Promise<void>;
  logout: () => void;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  userProfile: null,
  initData: null,
  isReady: false,
  isLoading: false,
  webApp: null,
  userRole: "user",
  setUserRole: () => {},
  login: async () => {},
  logout: () => {},
});

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegram must be used within a TelegramProvider");
  }
  return context;
};

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<any>(null);
  
  // Load userRole from localStorage on initialization
  const [userRole, setUserRoleState] = useState<"user" | "seller" | "admin">(() => {
    const savedRole = localStorage.getItem("userRole") as "user" | "seller" | "admin";
    return savedRole || "user";
  });

  const setUserRole = (role: "user" | "seller" | "admin") => {
    setUserRoleState(role);
    localStorage.setItem("userRole", role);
  };

  const login = async () => {
    if (!initData) {
      console.log('No init data available for authentication');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Attempting authentication with init data:', initData.substring(0, 50) + '...');
      
      const response = await authApi.authenticate(initData);
      const profile = response.data;
      
      console.log('Authentication successful:', profile);
      
      setUserProfile({
        id: profile.id,
        telegramId: profile.telegramId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,
        role: profile.role,
        isRegistered: true
      });
      
      setUserRole(profile.role);
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Authentication failed:', error);
      // User is not registered, they need to register in the bot first
      setUserProfile({
        id: 0,
        telegramId: user?.id.toString() || '',
        firstName: user?.first_name || '',
        lastName: user?.last_name,
        username: user?.username,
        role: 'user',
        isRegistered: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUserProfile(null);
    setUserRole('user');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    localStorage.removeItem('telegramInitData');
  };

  const contextValue = useMemo(() => ({
    user,
    userProfile,
    initData,
    isReady,
    isLoading,
    webApp,
    userRole,
    setUserRole,
    login,
    logout
  }), [user, userProfile, initData, isReady, isLoading, webApp, userRole]);

  useEffect(() => {
    const initializeTelegram = async () => {
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        setWebApp(tg);
        
        tg.ready();
        tg.expand();
        
        const data = tg.initData;
        setInitData(data);
        
        // Store init data in localStorage for API authentication
        if (data) {
          localStorage.setItem('telegramInitData', data);
        }
        
        const userData = tg.initDataUnsafe?.user;
        if (userData) {
          setUser({
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            language_code: userData.language_code
          });
        }
        
        setIsReady(true);
        
        // Try to login after initialization
        if (data) {
          await login();
        } else {
          // No init data, user is not in Telegram WebApp
          setIsLoading(false);
        }
      } else {
        // Fallback for development
        setUser({
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          language_code: "uz"
        });
        setInitData("test_init_data");
        setIsReady(true);
        setIsLoading(false);
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(initializeTelegram);
    } else {
      setTimeout(initializeTelegram, 0);
    }

    // Timeout fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Authentication timeout - setting loading to false');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};


