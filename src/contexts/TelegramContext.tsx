import React, { createContext, useContext, useEffect, useState, useMemo, useRef, startTransition } from "react";
import { authApi, usersApi } from "../services/api";
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
  businessName?: string;
  phoneNumber?: string;
  businessType?: string;
  location?: { latitude: number; longitude: number };
  language?: string;
  status?: string;
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
  isAuthenticated: () => boolean;
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
  isAuthenticated: () => false,
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
  const [userRole, setUserRole] = useState<"user" | "seller" | "admin">(() => {
    // Initialize from localStorage if available
    const storedRole = localStorage.getItem('userRole') as "user" | "seller" | "admin";
    return storedRole || "user";
  });
  const initialized = useRef(false);

  const setUserProfile = (profile: UserProfile | null) => {
    setUserProfileState(profile);
    if (profile) {
      setUserRole(profile.role);
      // Store the role in localStorage for persistence
      localStorage.setItem('userRole', profile.role);
    }
  };

  const logout = () => {
    setUserProfileState(null);
    setUserRole("user");
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    localStorage.removeItem('telegramInitData');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const login = async () => {
    // Simplified login - not used in the new flow
    console.log('Login called but using simplified flow');
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  console.log('TelegramProvider: About to call useEffect');
  
  useEffect(() => {
    const initializeContext = async () => {
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
        console.log('🔍 Extracting Telegram user data...');
        console.log('🔍 tg.initDataUnsafe:', tg.initDataUnsafe);
        console.log('🔍 tg.initData:', tg.initData);
        console.log('🔍 tg.user:', tg.user);
        
        // Try multiple ways to get user data
        let userData = tg.initDataUnsafe?.user;
        console.log('🔍 userData from initDataUnsafe:', userData);
        
        if (!userData && tg.initData) {
          console.log('🔍 Trying to parse initData...');
          const urlParams = new URLSearchParams(tg.initData);
          const userParam = urlParams.get('user');
          console.log('🔍 userParam from initData:', userParam);
          if (userParam) {
            userData = JSON.parse(userParam);
            console.log('🔍 userData from initData parsing:', userData);
          }
        }
        
        if (!userData && tg.user) {
          console.log('🔍 Using tg.user directly');
          userData = tg.user;
        }
        
        if (userData) {
          console.log('✅ Telegram user data found:', userData);
          telegramUser = {
            id: userData.id,
            first_name: userData.first_name,
            last_name: userData.last_name,
            username: userData.username,
            language_code: userData.language_code
          };
          console.log('✅ Final telegramUser:', telegramUser);
        } else {
          console.log('❌ No Telegram user data found');
        }
      } catch (error) {
        console.log('❌ Could not get Telegram user data:', error);
      }
      
      // Create user profile - use real data if available, otherwise defaults
      const finalUser = telegramUser || {
        id: 123456789, // Use a fixed test ID for browser testing
        first_name: "Test",
        last_name: "User",
        username: "testuser",
        language_code: "en"
      };
      
      console.log('🔍 Final user created:', finalUser);
      
      // Check if this is an admin user based on Telegram ID
      const isAdminUser = config.ADMIN_TELEGRAM_ID && finalUser.id.toString() === config.ADMIN_TELEGRAM_ID;
      
        // Store initData for backend authentication
        const initData = tg.initData;
        if (initData) {
          localStorage.setItem('telegramInitData', initData);
          setInitData(initData);
        }
        
        // Check if user exists in database by Telegram ID (your approach)
        // Always try to authenticate, regardless of initData
        if (true) {
          try {
            console.log('Checking if user exists in database by Telegram ID...');
            
            // Use your approach: check if user exists first
            console.log('🔍 Checking user with Telegram ID:', finalUser.id.toString());
            console.log('🔍 Final user object:', finalUser);
            console.log('🔍 About to call usersApi.checkUserExistsByTelegramId...');
            const userCheckResponse = await usersApi.checkUserExistsByTelegramId(finalUser.id.toString());
            console.log('🔍 User check response received:', userCheckResponse);
            console.log('🔍 Response data:', userCheckResponse?.data);
            console.log('🔍 Response exists:', userCheckResponse?.data?.exists);
            
            if (userCheckResponse && userCheckResponse.data && userCheckResponse.data.exists) {
              console.log('✅ User found in database with role:', userCheckResponse.data.role);
              
              // User exists, now authenticate with their actual role
              const userRole = userCheckResponse.data.role;
              const backendUser = userCheckResponse.data.user;
              
              console.log(`Authenticating user with their actual role: ${userRole}`);
              
              const loginData = {
                telegramId: finalUser.id.toString(),
                role: userRole
              };
              
              const authResponse = await authApi.login(loginData);
              
              if (authResponse.data && authResponse.data.access_token) {
                const backendRole = backendUser?.role?.toLowerCase() as "user" | "seller" | "admin" || "user";
                
                console.log('Backend authentication successful:', { role: backendRole, user: backendUser });
                
                const profile: UserProfile = {
                  id: backendUser?.id || finalUser.id,
                  telegramId: backendUser?.telegramId || finalUser.id.toString(),
                  firstName: backendUser?.firstName || finalUser.first_name,
                  lastName: backendUser?.lastName || finalUser.last_name,
                  username: backendUser?.username || finalUser.username,
                  role: backendRole as "user" | "seller" | "admin",
                  isRegistered: true,
                  needsPassword: backendRole === 'admin',
                  businessName: backendUser?.businessName,
                  phoneNumber: backendUser?.phoneNumber,
                  businessType: backendUser?.businessType,
                  location: backendUser?.location,
                  language: backendUser?.language,
                  status: backendUser?.status
                };
                
                // Set all state with backend data
                setUser(finalUser);
                setUserProfileState(profile);
                setUserRole(backendRole as "user" | "seller" | "admin");
                
                // Store the profile and tokens in localStorage for persistence
                localStorage.setItem('userProfile', JSON.stringify(profile));
                localStorage.setItem('userRole', backendRole);
                localStorage.setItem('access_token', authResponse.data.access_token);
                localStorage.setItem('refresh_token', authResponse.data.refresh_token);
                
                // Use setTimeout to ensure state updates are processed
                setTimeout(() => {
                  setIsReady(true);
                  setIsLoading(false);
                  console.log('TelegramContext: User authenticated successfully with role:', backendRole);
                }, 0);
                
                return;
              }
            } else {
              console.log('❌ User not found in database - showing registration screen');
              console.log('❌ User check response was:', userCheckResponse);
              console.log('❌ This means the API call succeeded but user does not exist in database');
              // User is not registered, show registration screen
              const profile: UserProfile = {
                id: finalUser.id,
                telegramId: finalUser.id.toString(),
                firstName: finalUser.first_name,
                lastName: finalUser.last_name,
                username: finalUser.username,
                role: isAdminUser ? 'admin' : 'user',
                isRegistered: false,
                needsPassword: !!isAdminUser
              };
              
              setUser(finalUser);
              setUserProfileState(profile);
              setUserRole(isAdminUser ? 'admin' : 'user');
              
              setTimeout(() => {
                setIsReady(true);
                setIsLoading(false);
                console.log('TelegramContext: User not registered, showing registration screen');
              }, 0);
              
              return;
            }
          } catch (error: any) {
            console.error('❌ Backend authentication failed:', error);
            console.error('❌ Error details:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data,
              url: error.config?.url
            });
            console.error('❌ Full error object:', error);
            // Fall through to default user setup
          }
        }
        
        // Fallback: Set up default user if backend auth fails
        console.log('⚠️ Backend authentication failed, setting up unregistered user');
        const profile: UserProfile = {
          id: finalUser.id,
          telegramId: finalUser.id.toString(),
          firstName: finalUser.first_name,
          lastName: finalUser.last_name,
          username: finalUser.username,
          role: isAdminUser ? 'admin' : 'user',
          isRegistered: false, // This should be false for unregistered users
          needsPassword: !!isAdminUser
        };
      
      // Set all state in a single batch to avoid race conditions
      setUser(finalUser);
      setUserProfileState(profile);
        setUserRole(isAdminUser ? 'admin' : 'user');
      
      // Store the profile in localStorage for persistence
      localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('userRole', isAdminUser ? 'admin' : 'user');
      
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        setIsReady(true);
        setIsLoading(false);
          console.log('TelegramContext: Default user setup with role:', isAdminUser ? 'admin' : 'user');
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
    };

    initializeContext();
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
    logout,
    isAuthenticated
  }), [user, userProfile, initData, isReady, isLoading, webApp, userRole]);

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};