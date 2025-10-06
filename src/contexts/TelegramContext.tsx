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
  role: "USER" | "SELLER" | "ADMIN";
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
  userRole: "USER" | "SELLER" | "ADMIN";
  setUserRole: (role: "USER" | "SELLER" | "ADMIN") => void;
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
  userRole: "USER",
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
  const [userRole, setUserRole] = useState<"USER" | "SELLER" | "ADMIN">(() => {
    // Initialize from localStorage if available
    const storedRole = localStorage.getItem('userRole') as "USER" | "SELLER" | "ADMIN";
    return storedRole || "USER";
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
    setUserRole("USER");
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
    
    // Check for debug mode in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug') === 'true';
    console.log('🔧 Debug mode from URL:', debugMode);
    
    // DEVELOPMENT MODE: Set up test user immediately (always in development)
    // Also use in production for debugging
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost' || debugMode) {
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
        
        // Try to get user data from URL parameters directly
        if (!userData) {
          console.log('🔍 Trying to get user data from URL parameters...');
          const urlParams = new URLSearchParams(window.location.search);
          const userParam = urlParams.get('user');
          console.log('🔍 userParam from URL:', userParam);
          if (userParam) {
            try {
              userData = JSON.parse(decodeURIComponent(userParam));
              console.log('🔍 userData from URL parsing:', userData);
            } catch (e) {
              console.log('🔍 Failed to parse user from URL:', e);
            }
          }
        }
        
        // Try to get user data from Telegram WebApp initDataUnsafe after a delay
        if (!userData && tg.initDataUnsafe) {
          console.log('🔍 Checking initDataUnsafe after delay...');
          setTimeout(() => {
            if (tg.initDataUnsafe?.user) {
              console.log('🔍 Found user in initDataUnsafe after delay:', tg.initDataUnsafe.user);
            }
          }, 500);
        }
        
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
        
        // Try to get user data from Telegram WebApp after initialization
        if (!userData) {
          console.log('🔍 Trying to get user data from Telegram WebApp after initialization...');
          // Check if user data is available after WebApp initialization
          if (tg.initDataUnsafe?.user) {
            userData = tg.initDataUnsafe.user;
            console.log('🔍 userData from initDataUnsafe after init:', userData);
          }
          
          // Try to get user data from Telegram WebApp properties
          if (!userData && tg.user) {
            userData = tg.user;
            console.log('🔍 userData from tg.user after init:', userData);
          }
          
          // Try to get user data from Telegram WebApp initData
          if (!userData && tg.initData) {
            try {
              const urlParams = new URLSearchParams(tg.initData);
              const userParam = urlParams.get('user');
              if (userParam) {
                userData = JSON.parse(userParam);
                console.log('🔍 userData from tg.initData after init:', userData);
              }
            } catch (e) {
              console.log('🔍 Failed to parse user from tg.initData after init:', e);
            }
          }
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
      
      // Create user profile - use real data if available, otherwise show registration
      let finalUser = telegramUser;
      
      // If no real Telegram user data, try to get it from URL or other sources
      if (!telegramUser) {
        console.log('❌ No real Telegram user data found - trying alternative methods');
        console.log('❌ This means the Telegram WebApp is not providing user data');
        
        // Try to get user data from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        console.log('🔍 Trying to get user from URL params:', userParam);
        
        if (userParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userParam));
            console.log('🔍 Found user data in URL:', userData);
            telegramUser = {
              id: userData.id,
              first_name: userData.first_name,
              last_name: userData.last_name,
              username: userData.username,
              language_code: userData.language_code
            };
          } catch (e) {
            console.log('🔍 Failed to parse user from URL:', e);
          }
        }
        
        // If still no user data, try to use a known test user for debugging
        if (!telegramUser) {
          console.log('❌ No user data found anywhere - trying with known test user for debugging');
          
          // For debugging purposes, try with the known registered user
          telegramUser = {
            id: 7577215779,
            first_name: "509",
            last_name: "User",
            username: "testuser",
            language_code: "uz"
          };
          
          console.log('🔧 Using test user for debugging:', telegramUser);
        }
      }
      
      console.log('🔍 Final user created:', finalUser);
      
      // Check if this is an admin user based on Telegram ID
      const isAdminUser = config.ADMIN_TELEGRAM_ID && finalUser?.id.toString() === config.ADMIN_TELEGRAM_ID;
      
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
            console.log('🔍 Checking user with Telegram ID:', finalUser?.id.toString());
            console.log('🔍 Final user object:', finalUser);
            console.log('🔍 About to call usersApi.checkUserExistsByTelegramId...');
            console.log('🔍 API Base URL:', process.env.REACT_APP_API_BASE_URL || 'https://ulgur-backend-production-53b2.up.railway.app');
            console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
            
            const userCheckResponse = await usersApi.checkUserExistsByTelegramId(finalUser?.id.toString() || '');
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
                telegramId: finalUser?.id.toString() || '',
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
                  id: backendUser?.id || finalUser?.id || 0,
                  telegramId: backendUser?.telegramId || finalUser?.id.toString() || '',
                  firstName: finalUser?.first_name || '', // Use Telegram data for name
                  lastName: finalUser?.last_name,
                  username: finalUser?.username,
                  role: backendRole as "USER" | "SELLER" | "ADMIN",
                  isRegistered: true,
                  needsPassword: backendRole === 'ADMIN',
                  businessName: backendUser?.businessName,
                  phoneNumber: backendUser?.phoneNumber,
                  businessType: backendUser?.businessType,
                  location: backendUser?.location,
                  language: backendUser?.language || finalUser?.language_code || 'uz',
                  status: backendUser?.status
                };
                
                // Set all state with backend data
                setUser(finalUser);
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
              console.log('❌ Telegram ID that was checked:', finalUser?.id.toString());
              console.log('❌ User needs to register via Telegram bot first');
              // User is not registered, show registration screen
              const profile: UserProfile = {
                id: finalUser?.id || 0,
                telegramId: finalUser?.id.toString() || '',
                firstName: finalUser?.first_name || '',
                lastName: finalUser?.last_name,
                username: finalUser?.username,
                role: isAdminUser ? 'ADMIN' : 'USER',
                isRegistered: false,
                needsPassword: !!isAdminUser
              };
              
              setUser(finalUser);
              setUserProfileState(profile);
               setUserRole(isAdminUser ? 'ADMIN' : 'USER');
              
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
        }
        
        // Fallback: Set up default user if backend auth fails
        console.log('⚠️ Backend authentication failed, setting up unregistered user');
        const profile: UserProfile = {
          id: finalUser?.id || 0,
          telegramId: finalUser?.id.toString() || '',
          firstName: finalUser?.first_name || '',
          lastName: finalUser?.last_name,
          username: finalUser?.username,
          role: isAdminUser ? 'ADMIN' : 'USER',
          isRegistered: false, // This should be false for unregistered users
          needsPassword: !!isAdminUser
        };
      
      // Set all state in a single batch to avoid race conditions
      setUser(finalUser);
      setUserProfileState(profile);
               setUserRole(isAdminUser ? 'ADMIN' : 'USER');
      
      // Store the profile in localStorage for persistence
      localStorage.setItem('userProfile', JSON.stringify(profile));
         localStorage.setItem('userRole', isAdminUser ? 'ADMIN' : 'USER');
      
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
        role: 'USER',
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
      if (process.env.NODE_ENV === 'development') {
        console.log('TelegramContext: Error fallback - setting up test user');
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
        
        setUser(testUser);
        setUserProfileState(testProfile);
        setUserRole("USER");
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
      if (!isReady && process.env.NODE_ENV === 'development') {
        console.log('TelegramContext: Timeout fallback - forcing test user setup');
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
        
        setUser(testUser);
        setUserProfileState(testProfile);
        setUserRole("USER");
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