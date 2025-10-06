import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { usersApi, authApi } from '../services/api';

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
  role: "USER" | "SELLER" | "ADMIN";
  isRegistered: boolean;
  needsPassword?: boolean;
  businessName?: string;
  phoneNumber?: string;
  businessType?: string;
  location?: string;
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
  userRole: "USER" | "SELLER" | "ADMIN";
  setUserRole: (role: "USER" | "SELLER" | "ADMIN") => void;
  login: (data: any) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  userProfile: null,
  initData: null,
  isReady: false,
  isLoading: false,
  webApp: null,
  userRole: "USER",
  setUserRole: () => {},
  login: async () => ({}),
  logout: () => {},
  isAuthenticated: false,
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
  const [userRole, setUserRoleState] = useState<"USER" | "SELLER" | "ADMIN">("USER");

  const setUserRole = (role: "USER" | "SELLER" | "ADMIN") => {
    setUserRoleState(role);
    localStorage.setItem("userRole", role);
  };

  const login = async (data: any) => {
    try {
      const response = await authApi.login(data);
      if (response.data?.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        return response;
      }
      throw new Error('No access token received');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userRole');
    setUser(null);
    setUserProfileState(null);
    setUserRole("USER");
  };

  const isAuthenticated = !!localStorage.getItem('access_token');

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
    logout,
    isAuthenticated
  }), [user, userProfile, initData, isReady, isLoading, webApp, userRole, isAuthenticated]);

  useEffect(() => {
    const initializeContext = async () => {
      console.log('🔧 Initializing TelegramContext...');
      console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
      console.log('🔧 Window object:', typeof window);
      console.log('🔧 Telegram object:', typeof window !== "undefined" ? (window as any).Telegram : 'undefined');
      console.log('🔧 Current state - isReady:', isReady, 'isLoading:', isLoading);
    
      // DEVELOPMENT MODE: Set up test user immediately (always in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('TelegramContext: Development mode - setting up test user immediately');
        console.log('TelegramContext: Ignoring Telegram WebApp in development mode');
        const testUser = {
          id: 7577215779,
          first_name: "509",
          last_name: "User",
          username: "testuser",
          language_code: "uz"
        };
        
        const testProfile = {
          id: 7577215779,
          telegramId: "7577215779",
          firstName: "509",
          lastName: "User",
          username: "testuser",
          role: "USER" as const,
          isRegistered: true
        };
        
        // Set all state immediately for development
        setUser(testUser);
        setUserProfileState(testProfile);
        setUserRole("USER");
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
        
        // Wait a bit for WebApp to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try to get real user data, but don't fail if we can't
        let telegramUser: TelegramUser | null = null;
        
        try {
          console.log('🔍 Extracting Telegram user data...');
          console.log('🔍 tg.initDataUnsafe:', tg.initDataUnsafe);
          console.log('🔍 tg.initDataUnsafe.user:', tg.initDataUnsafe?.user);
          console.log('🔍 tg.initData:', tg.initData);
          console.log('🔍 tg.user:', tg.user);
          console.log('🔍 tg object keys:', Object.keys(tg));
          
          // Try multiple ways to get user data
          let userData = tg.initDataUnsafe?.user;
          console.log('🔍 userData from initDataUnsafe:', userData);
          
          // If no user data from initDataUnsafe, try parsing initData
          if (!userData && tg.initData) {
            console.log('🔍 Trying to parse initData...');
            try {
              const urlParams = new URLSearchParams(tg.initData);
              const userParam = urlParams.get('user');
              console.log('🔍 userParam from initData:', userParam);
              if (userParam) {
                userData = JSON.parse(decodeURIComponent(userParam));
                console.log('🔍 userData from initData parsing:', userData);
              }
            } catch (e) {
              console.log('🔍 Failed to parse initData:', e);
            }
          }
          
          if (userData) {
            telegramUser = {
              id: userData.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username,
              language_code: userData.language_code
            };
            console.log('🔍 Telegram user extracted:', telegramUser);
          }
        } catch (error) {
          console.error('Error extracting Telegram user data:', error);
        }
        
        // If no real Telegram user data, show registration screen
        if (!telegramUser) {
          console.log('❌ No real Telegram user data found - showing registration screen');
          
          const profile: UserProfile = {
            id: 0,
            telegramId: '',
            firstName: '',
            lastName: '',
            username: '',
            role: 'USER' as "USER" | "SELLER" | "ADMIN",
            isRegistered: false
          };
          
          setUserProfileState(profile);
          setUserRole('USER');
          
          setTimeout(() => {
            setIsReady(true);
            setIsLoading(false);
            console.log('TelegramContext: No Telegram user data - showing registration screen');
          }, 0);
          
          return;
        }
        
        // Store initData if available
        if (tg.initData) {
          localStorage.setItem('telegramInitData', tg.initData);
          setInitData(tg.initData);
        }
        
        // ALWAYS check if user exists in database by Telegram ID
        // This is the core approach: search database by Telegram ID
        try {
          console.log('🔍 SEARCHING DATABASE BY TELEGRAM ID:', telegramUser.id.toString());
          console.log('🔍 Telegram user object:', telegramUser);
          console.log('🔍 About to call usersApi.checkUserExistsByTelegramId...');
          console.log('🔍 API Base URL:', process.env.REACT_APP_API_BASE_URL || 'https://ulgur-backend-production-53b2.up.railway.app');
          console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
          
          const userCheckResponse = await usersApi.checkUserExistsByTelegramId(telegramUser.id.toString());
          console.log('🔍 User check response received:', userCheckResponse);
          console.log('🔍 Response data:', userCheckResponse?.data);
          console.log('🔍 Response exists:', userCheckResponse?.data?.exists);
            
          if (userCheckResponse && userCheckResponse.data && userCheckResponse.data.exists) {
            console.log('✅ User found in database with role:', userCheckResponse.data.role);
            console.log('✅ User check response data:', userCheckResponse.data);
            console.log('✅ Backend user data:', userCheckResponse.data.user);
            
            // User exists, now authenticate with their actual role
            const userRole = userCheckResponse.data.role;
            const backendUser = userCheckResponse.data.user;
            
            console.log(`🔐 Authenticating user with their actual role: ${userRole}`);
            console.log(`🔐 Backend user object:`, backendUser);
            
            const loginData = {
              telegramId: telegramUser.id.toString(),
              role: userRole
            };
            
            console.log(`🔐 Login data:`, loginData);
            const authResponse = await authApi.login(loginData);
            console.log('🔐 Auth response received:', authResponse);
            console.log('🔐 Auth response data:', authResponse.data);
            console.log('🔐 Access token exists:', !!authResponse.data?.access_token);
            
            if (authResponse.data && authResponse.data.access_token) {
              // Use backend role directly (already uppercase)
              const backendRole = userRole as "USER" | "SELLER" | "ADMIN" || "USER";
              
              console.log('🎉 Backend authentication successful!');
              console.log('🎉 User role from backend:', userRole);
              console.log('🎉 Final role for frontend:', backendRole);
              console.log('🎉 Backend user data:', backendUser);
              
              const profile: UserProfile = {
                id: backendUser?.id || telegramUser?.id || 0,
                telegramId: backendUser?.telegramId || telegramUser?.id.toString() || '',
                firstName: telegramUser?.first_name || '', // Use Telegram data for name
                lastName: telegramUser?.last_name,
                username: telegramUser?.username,
                role: backendRole as "USER" | "SELLER" | "ADMIN",
                isRegistered: true,
                needsPassword: backendRole === 'ADMIN',
                businessName: backendUser?.businessName,
                phoneNumber: backendUser?.phoneNumber,
                businessType: backendUser?.businessType,
                location: backendUser?.location,
                language: backendUser?.language || telegramUser?.language_code || 'uz',
                status: backendUser?.status
              };
              
              // Set all state with backend data
              setUser(telegramUser);
              setUserProfileState(profile);
              setUserRole(backendRole as "USER" | "SELLER" | "ADMIN");
              
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
            } else {
              console.log('❌ Authentication failed - no access token received');
              console.log('❌ Auth response was:', authResponse);
              console.log('❌ Auth response data:', authResponse.data);
            }
          } else {
            console.log('❌ User not found in database - showing registration screen');
            console.log('❌ User check response was:', userCheckResponse);
            console.log('❌ This means the user is not registered in the database');
            console.log('❌ Telegram ID that was checked:', telegramUser.id.toString());
            console.log('❌ User needs to register via Telegram bot first');
            
            // User is not registered, show registration screen
            const profile: UserProfile = {
              id: telegramUser?.id || 0,
              telegramId: telegramUser?.id.toString() || '',
              firstName: telegramUser?.first_name || '',
              lastName: telegramUser?.last_name,
              username: telegramUser?.username,
              role: 'USER',
              isRegistered: false,
              needsPassword: false
            };
            
            setUser(telegramUser);
            setUserProfileState(profile);
            setUserRole('USER');
            
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
          console.error('❌ Error stack:', error.stack);
          // Fall through to default user setup
        }
      } else {
        console.log('❌ No Telegram WebApp detected - showing registration screen');
        
        const profile: UserProfile = {
          id: 0,
          telegramId: '',
          firstName: '',
          lastName: '',
          username: '',
          role: 'USER' as "USER" | "SELLER" | "ADMIN",
          isRegistered: false
        };
        
        setUserProfileState(profile);
        setUserRole('USER');
        
        setTimeout(() => {
          setIsReady(true);
          setIsLoading(false);
          console.log('TelegramContext: No Telegram WebApp - showing registration screen');
        }, 0);
      }
    };

    initializeContext();
  }, []);

  return (
    <TelegramContext.Provider value={contextValue}>
      {children}
    </TelegramContext.Provider>
  );
};


