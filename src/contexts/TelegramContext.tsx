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

  const setUserProfileState = (profile: UserProfile | null) => {
    setUserProfile(profile);
    if (profile) {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('userProfile');
    }
  };

  const login = async () => {
    if (!initData) {
      console.log('No init data available for authentication');
      // For development, simulate a registered user
      if (process.env.NODE_ENV === 'development') {
        const testUser = user || {
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser"
        };
        setUserProfileState({
          id: testUser.id,
          telegramId: testUser.id.toString(),
          firstName: testUser.first_name,
          lastName: testUser.last_name,
          username: testUser.username,
          role: 'user',
          isRegistered: true
        });
        setUserRole('user');
      }
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Attempting authentication with init data:', initData.substring(0, 50) + '...');
      
      const response = await authApi.authenticate(initData);
      const profile = response.data;
      
      console.log('Authentication successful:', profile);
      
      setUserProfileState({
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
      
      // Check if this is an admin user trying to authenticate
      const isAdminUser = checkIfAdminUser();
      if (isAdminUser) {
        // Show admin login form instead of registration
        setUserProfileState({
          id: 0,
          telegramId: user?.id.toString() || '',
          firstName: user?.first_name || '',
          lastName: user?.last_name,
          username: user?.username,
          role: 'admin',
          isRegistered: false,
          needsPassword: true
        });
      } else {
        // Authentication failed - check if this is an admin user
        const isAdminUser = checkIfAdminUser();
        if (isAdminUser) {
          // Show admin login form
          setUserProfileState({
            id: 0,
            telegramId: user?.id.toString() || '',
            firstName: user?.first_name || '',
            lastName: user?.last_name,
            username: user?.username,
            role: 'admin',
            isRegistered: false,
            needsPassword: true
          });
        } else {
          // For production, if we have user data from Telegram, assume they're registered
          if (user && user.id) {
            // In production, if we have Telegram user data, assume they're registered
            setUserProfileState({
              id: user.id,
              telegramId: user.id.toString(),
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              role: 'user',
              isRegistered: true
            });
            setUserRole('user');
          } else {
            // No user data, they need to register
            setUserProfileState({
              id: 0,
              telegramId: user?.id.toString() || '',
              firstName: user?.first_name || '',
              lastName: user?.last_name,
              username: user?.username,
              role: 'user',
              isRegistered: false
            });
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkIfAdminUser = () => {
    // Check if user is in the admin list from environment
    const adminTelegramId = process.env.REACT_APP_ADMIN_TELEGRAM_ID;
    const currentUserId = user?.id.toString();
    
    if (adminTelegramId && currentUserId === adminTelegramId) {
      return true;
    }
    
    // Also check if user has admin role in localStorage (for development)
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      return profile.role === 'admin';
    }
    
    // For development, check if we're simulating admin
    if (process.env.NODE_ENV === 'development') {
      const savedRole = localStorage.getItem('userRole');
      return savedRole === 'admin';
    }
    
    return false;
  };

  const logout = () => {
    setUserProfileState(null);
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
    setUserProfile: setUserProfileState,
    login,
    logout
  }), [user, userProfile, initData, isReady, isLoading, webApp, userRole]);

  useEffect(() => {
    // For development, immediately set up a test user to prevent loading
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Setting up test user immediately');
      setUser({
        id: 123456789,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        language_code: "uz"
      });
      setUserProfileState({
        id: 123456789,
        telegramId: "123456789",
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        role: "user",
        isRegistered: true
      });
      setUserRole("user");
      setIsReady(true);
      setIsLoading(false);
      return;
    }

    const initializeTelegram = async () => {
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        let data: string | undefined;
        
        try {
          const tg = (window as any).Telegram.WebApp;
          setWebApp(tg);
          
          // Initialize Telegram WebApp safely
          if (tg.ready) tg.ready();
          if (tg.expand) tg.expand();
          
          data = tg.initData;
          setInitData(data || null);
          
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
        } catch (error) {
          console.error('Telegram WebApp initialization error:', error);
          // Fallback to development mode if Telegram WebApp fails
          if (process.env.NODE_ENV === 'development') {
            setUser({
              id: 123456789,
              first_name: "Test",
              last_name: "User",
              username: "testuser",
              language_code: "uz"
            });
            setUserProfileState({
              id: 123456789,
              telegramId: "123456789",
              firstName: "Test",
              lastName: "User",
              username: "testuser",
              role: "user",
              isRegistered: true
            });
            setUserRole("user");
            setIsReady(true);
            setIsLoading(false);
          }
        }
        
        // Try to login after initialization
        try {
          if (data) {
            await login();
          } else {
            // No init data, but we have Telegram WebApp
            // If we have user data from Telegram, assume they're registered
            if (user && user.id) {
              setUserProfileState({
                id: user.id,
                telegramId: user.id.toString(),
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                role: "user",
                isRegistered: true
              });
              setUserRole("user");
            } else {
              // No user data, they need to register
              setUserProfileState({
                id: 0,
                telegramId: user?.id.toString() || '',
                firstName: user?.first_name || '',
                lastName: user?.last_name,
                username: user?.username,
                role: 'user',
                isRegistered: false
              });
            }
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Login error:', error);
          // Fallback to registered user if we have Telegram user data
          if (user && user.id) {
            setUserProfileState({
              id: user.id,
              telegramId: user.id.toString(),
              firstName: user.first_name,
              lastName: user.last_name,
              username: user.username,
              role: "user",
              isRegistered: true
            });
            setUserRole("user");
          }
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
        
        // For development, simulate a registered user immediately
        setUserProfileState({
          id: 123456789,
          telegramId: "123456789",
          firstName: "Test",
          lastName: "User",
          username: "testuser",
          role: "user",
          isRegistered: true
        });
        setUserRole("user");
        setIsLoading(false);
      }
    };

    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(initializeTelegram);
    } else {
      setTimeout(initializeTelegram, 0);
    }

    // Timeout fallback to prevent infinite loading (only for production)
    if (process.env.NODE_ENV === 'production') {
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log('Authentication timeout - setting loading to false');
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout for production

      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};


