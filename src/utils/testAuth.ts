// Test utility for authentication flow
export const testAuthentication = () => {
  console.log('Testing authentication flow...');
  
  // Check if we're in Telegram WebApp
  const isTelegramWebApp = typeof window !== 'undefined' && (window as any).Telegram?.WebApp;
  console.log('Is Telegram WebApp:', isTelegramWebApp);
  
  // Check localStorage for stored data
  const initData = localStorage.getItem('telegramInitData');
  const userProfile = localStorage.getItem('userProfile');
  const userRole = localStorage.getItem('userRole');
  
  console.log('Init Data:', initData ? 'Present' : 'Missing');
  console.log('User Profile:', userProfile ? JSON.parse(userProfile) : 'Missing');
  console.log('User Role:', userRole);
  
  return {
    isTelegramWebApp,
    hasInitData: !!initData,
    hasUserProfile: !!userProfile,
    userRole
  };
};

// Development helper to simulate different user states
export const simulateUserState = (state: 'unregistered' | 'user' | 'seller' | 'admin') => {
  localStorage.clear();
  
  switch (state) {
    case 'unregistered':
      localStorage.setItem('telegramInitData', 'test_init_data');
      break;
    case 'user':
      localStorage.setItem('telegramInitData', 'test_init_data');
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userProfile', JSON.stringify({
        id: 1,
        telegramId: '123456789',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isRegistered: true
      }));
      break;
    case 'seller':
      localStorage.setItem('telegramInitData', 'test_init_data');
      localStorage.setItem('userRole', 'seller');
      localStorage.setItem('userProfile', JSON.stringify({
        id: 2,
        telegramId: '987654321',
        firstName: 'Test',
        lastName: 'Seller',
        role: 'seller',
        isRegistered: true
      }));
      break;
    case 'admin':
      localStorage.setItem('telegramInitData', 'test_init_data');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userProfile', JSON.stringify({
        id: 3,
        telegramId: '555666777',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin',
        isRegistered: true
      }));
      break;
  }
  
  console.log(`Simulated user state: ${state}`);
  window.location.reload();
};
