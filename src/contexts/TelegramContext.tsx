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
  needsPassword?: boolean;
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
  setUserProfile: (profile: UserProfile | null) => void;
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
  setUserProfile: () => {},
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
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<any>(null);
  const [userRole, setUserRole] = useState<"user" | "seller" | "admin">("user");

  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      setUserRole(profile.role);
    }
  };

  const logout = () => {
    setUserProfileState(null);
    setUserRole("user");
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    localStorage.removeItem('telegramInitData');
  };

  const login = async () => {
    // Simplified login - not used in the new flow
    console.log('Login called but using simplified flow');
  };

  useEffect(() => {
    console.log('TelegramContext: Starting initialization');
    
    // SIMPLIFIED LOGIC: Check if we have Telegram WebApp
    const hasTelegramWebApp = typeof window !== "undefined" && (window as any).Telegram?.WebApp;
    
    if (hasTelegramWebApp) {
      console.log('Telegram WebApp detected - user is registered');
      
      // Get Telegram WebApp instance
      const tg = (window as any).Telegram.WebApp;
      setWebApp(tg);
      
      // Initialize Telegram WebApp
      if (tg.ready) tg.ready();
      if (tg.expand) tg.expand();
      
      // Try to get real user data, but don't fail if we can't
      let telegramUser: TelegramUser | null = null;
      
      try {
        // Try multiple ways to get user data
        let userData = tg.initDataUnsafe?.user;
        
        if (!userData && tg.initData) {
          const urlParams = new URLSearchParams(tg.initData);
          const userParam = urlParams.get('user');
          if (userParam) {
            userData = JSON.parse(userParam);
          }
        }
        
        if (!userData && tg.user) {
          userData = tg.user;
        }
        
        if (userData) {
          telegramUser = {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            language_code: userData.language_code
          };
        }
      } catch (error) {
        console.log('Could not get Telegram user data:', error);
      }
      
      // Create user profile - use real data if available, otherwise defaults
      const finalUser = telegramUser || {
        id: Date.now(),
        first_name: "User",
        last_name: "",
        username: "user",
        language_code: "en"
      };
      
      const profile: UserProfile = {
        id: finalUser.id,
        telegramId: finalUser.id.toString(),
        firstName: finalUser.first_name,
        lastName: finalUser.last_name,
        username: finalUser.username,
        role: "user", // Default to user, can be enhanced later
        isRegistered: true // KEY: Always true if Telegram WebApp exists
      };
      
      // Set all state
      setUser(finalUser);
      setUserProfileState(profile);
      setUserRole("user");
      setIsReady(true);
      setIsLoading(false);
      
      console.log('TelegramContext: User profile set successfully');
      
    } else {
      console.log('No Telegram WebApp - showing registration screen');
      
      // No Telegram WebApp - user needs to register
      setUserProfileState({
        id: 0,
        telegramId: '',
        firstName: '',
        lastName: '',
        username: '',
        role: 'user',
        isRegistered: false
      });
      setIsReady(true);
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    userProfile,
    initData,
    isReady,
    isLoading,
    webApp,
    userRole,
    setUserRole,
    setUserProfile: setUserProfileState,
    login,
    logout
  }), [user, userProfile, initData, isReady, isLoading, webApp, userRole]);

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};