import React, { createContext, useContext, useEffect, useState, useMemo, useRef, startTransition } from "react";
import { authApi } from "../services/api";
import { config } from "../config/env";

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
  console.log('TelegramProvider: Component is mounting');
  
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [initData, setInitData] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [webApp, setWebApp] = useState<any>(null);
  const [userRole, setUserRole] = useState<"user" | "seller" | "admin">("user");
  const initialized = useRef(false);

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

  console.log('TelegramProvider: About to call useEffect');
  
  // IMMEDIATE SETUP: Set up test user immediately if not in production
  if (process.env.NODE_ENV !== 'production' && !initialized.current) {
    console.log('TelegramProvider: Immediate setup - setting up test user');
    initialized.current = true;
    
    const testUser = {
      id: 123456789,
      first_name: "Test",
      last_name: "User",
      username: "testuser",
      language_code: "uz"
    };
    
    const testProfile = {
      id: 123456789,
      telegramId: "123456789",
      firstName: "Test",
      lastName: "User",
      username: "testuser",
      role: "user" as const,
      isRegistered: true
    };
    
    // Set state using startTransition to prevent Suspense issues
    startTransition(() => {
      setUser(testUser);
      setUserProfileState(testProfile);
      setUserRole("user");
      setWebApp({ ready: () => {}, expand: () => {} });
      setIsReady(true);
      setIsLoading(false);
      console.log('TelegramProvider: Immediate setup completed');
    });
  }
  
  useEffect(() => {
    console.log('TelegramContext: useEffect is running, initialized.current:', initialized.current);
    
    if (initialized.current) {
      console.log('TelegramContext: Already initialized, skipping');
      return;
    }
    
    try {
      console.log('TelegramContext: Starting initialization');
      initialized.current = true;
      console.log('TelegramContext: NODE_ENV:', process.env.NODE_ENV);
      console.log('TelegramContext: Window object:', typeof window);
      console.log('TelegramContext: Telegram object:', typeof window !== "undefined" ? (window as any).Telegram : 'undefined');
      console.log('TelegramContext: Current state - isReady:', isReady, 'isLoading:', isLoading);
    
    // DEVELOPMENT MODE: Set up test user immediately (always in development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('TelegramContext: Development mode - setting up test user immediately');
      console.log('TelegramContext: Ignoring Telegram WebApp in development mode');
      const testUser = {
        id: 123456789,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        language_code: "uz"
      };
      
      const testProfile = {
        id: 123456789,
        telegramId: "123456789",
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        role: "user" as const,
        isRegistered: true
      };
      
      // Set all state immediately for development
      setUser(testUser);
      setUserProfileState(testProfile);
      setUserRole("user");
      setWebApp({ ready: () => {}, expand: () => {} }); // Mock WebApp for development
      setIsReady(true);
      setIsLoading(false);
      
      console.log('TelegramContext: Development test user set up successfully');
      return;
    }
    
    // FALLBACK: If we're in development but somehow didn't set up the user, do it now
    if (process.env.NODE_ENV !== 'production') {
      console.log('TelegramContext: Development fallback - setting up test user');
      const testUser = {
        id: 123456789,
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        language_code: "uz"
      };
      
      const testProfile = {
        id: 123456789,
        telegramId: "123456789",
        firstName: "Test",
        lastName: "User",
        username: "testuser",
        role: "user" as const,
        isRegistered: true
      };
      
      setUser(testUser);
      setUserProfileState(testProfile);
      setUserRole("user");
      setWebApp({ ready: () => {}, expand: () => {} });
      setIsReady(true);
      setIsLoading(false);
      return;
    }
    
    // PRODUCTION MODE: Check if we have Telegram WebApp
    const hasTelegramWebApp = typeof window !== "undefined" && (window as any).Telegram?.WebApp;
    console.log('TelegramContext: hasTelegramWebApp:', hasTelegramWebApp);
    
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
      
      // Check if this is an admin user based on Telegram ID
      const isAdminUser = finalUser.id.toString() === config.ADMIN_TELEGRAM_ID;
      
      // Check for existing role in localStorage (for sellers who were previously detected)
      const storedProfile = localStorage.getItem('userProfile');
      let detectedRole: 'user' | 'seller' | 'admin' = 'user';
      
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          if (parsedProfile.telegramId === finalUser.id.toString()) {
            detectedRole = parsedProfile.role;
          }
        } catch (error) {
          console.log('Could not parse stored profile:', error);
        }
      }
      
      // Determine final role: admin takes precedence, then stored role, then user
      let finalRole: 'user' | 'seller' | 'admin' = 'user';
      if (isAdminUser) {
        finalRole = 'admin';
      } else if (detectedRole === 'seller') {
        finalRole = 'seller';
      } else {
        finalRole = 'user';
      }
      
      const profile: UserProfile = {
        id: finalUser.id,
        telegramId: finalUser.id.toString(),
        firstName: finalUser.first_name,
        lastName: finalUser.last_name,
        username: finalUser.username,
        role: finalRole,
        isRegistered: true, // KEY: Always true if Telegram WebApp exists
        needsPassword: isAdminUser // Admin needs password in production
      };
      
      // Try backend authentication for sellers (non-blocking)
      if (finalRole === 'user' && !isAdminUser) {
        // Try to authenticate with backend to detect seller role
        try {
          const initData = tg.initData;
          if (initData) {
            localStorage.setItem('telegramInitData', initData);
            // This is non-blocking - we'll update the role if backend responds
            authApi.authenticate(initData).then(response => {
              if (response.data && response.data.role) {
                const backendRole = response.data.role.toLowerCase();
                if (backendRole === 'seller') {
                  console.log('Backend detected seller role, updating...');
                  const updatedProfile = { ...profile, role: 'seller' as const };
                  setUserProfileState(updatedProfile);
                  setUserRole('seller');
                  localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
                }
              }
            }).catch(error => {
              console.log('Backend authentication failed, using default role:', error);
            });
          }
        } catch (error) {
          console.log('Could not attempt backend authentication:', error);
        }
      }
      
      // Set all state in a single batch to avoid race conditions
      setUser(finalUser);
      setUserProfileState(profile);
      setUserRole(finalRole);
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setIsReady(true);
        setIsLoading(false);
        console.log('TelegramContext: User profile set successfully');
      }, 0);
      
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
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setIsReady(true);
        setIsLoading(false);
        console.log('TelegramContext: No Telegram WebApp - showing registration');
      }, 0);
    }
    
    // TIMEOUT FALLBACK: If we're still loading after 1 second in development, force setup
    if (process.env.NODE_ENV !== 'production') {
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.log('TelegramContext: Development timeout fallback - forcing test user setup');
          const testUser = {
            id: 123456789,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            language_code: "uz"
          };
          
          const testProfile = {
            id: 123456789,
            telegramId: "123456789",
            firstName: "Test",
            lastName: "User",
            username: "testuser",
            role: "user" as const,
            isRegistered: true
          };
          
          setUser(testUser);
          setUserProfileState(testProfile);
          setUserRole("user");
          setWebApp({ ready: () => {}, expand: () => {} });
          setIsReady(true);
          setIsLoading(false);
        }
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
    } catch (error) {
      console.error('TelegramContext: Error during initialization:', error);
      // Fallback: set up test user even if there's an error
      if (process.env.NODE_ENV !== 'production') {
        console.log('TelegramContext: Error fallback - setting up test user');
        const testUser = {
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          language_code: "uz"
        };
        
        const testProfile = {
          id: 123456789,
          telegramId: "123456789",
          firstName: "Test",
          lastName: "User",
          username: "testuser",
          role: "user" as const,
          isRegistered: true
        };
        
        setUser(testUser);
        setUserProfileState(testProfile);
        setUserRole("user");
        setWebApp({ ready: () => {}, expand: () => {} });
        setIsReady(true);
        setIsLoading(false);
      }
    }
  }, []);
  
  // TIMEOUT FALLBACK: If still loading after 2 seconds, force setup
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isReady && process.env.NODE_ENV !== 'production') {
        console.log('TelegramContext: Timeout fallback - forcing test user setup');
        const testUser = {
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          language_code: "uz"
        };
        
        const testProfile = {
          id: 123456789,
          telegramId: "123456789",
          firstName: "Test",
          lastName: "User",
          username: "testuser",
          role: "user" as const,
          isRegistered: true
        };
        
        setUser(testUser);
        setUserProfileState(testProfile);
        setUserRole("user");
        setWebApp({ ready: () => {}, expand: () => {} });
        setIsReady(true);
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [isReady]);

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