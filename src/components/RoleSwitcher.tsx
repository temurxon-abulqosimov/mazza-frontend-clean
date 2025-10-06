import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../contexts/TelegramContext';
import { User, Store, Shield } from 'lucide-react';

const RoleSwitcher: React.FC = () => {
  const { userRole, setUserRole, setUserProfile, userProfile } = useTelegram();
  const navigate = useNavigate();

  const handleRoleChange = (role: 'USER' | 'SELLER' | 'ADMIN') => {
    console.log('RoleSwitcher: Button clicked for role:', role);
    console.log('RoleSwitcher: Current userRole before change:', userRole);
    
    // Update the user role
    setUserRole(role);
    
    // Update the user profile with the new role
    if (userProfile) {
      const updatedProfile = { ...userProfile, role };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    }
    
    console.log('RoleSwitcher: setUserRole called with:', role);
    
    // Force navigation to root to trigger RoleBasedRedirect
    navigate('/');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  console.log('RoleSwitcher: Rendering with userRole:', userRole);

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-4 border">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Dev: Switch Role</h3>
      <div className="text-xs text-gray-500 mb-2">Current: {userRole}</div>
      <div className="space-y-2">
        <button
          onClick={() => handleRoleChange('USER')}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
            userRole === 'USER' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <User className="w-4 h-4 mr-2" />
          User
        </button>
        <button
          onClick={() => handleRoleChange('SELLER')}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
            userRole === 'SELLER' 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Store className="w-4 h-4 mr-2" />
          Seller
        </button>
        <button
          onClick={() => handleRoleChange('ADMIN')}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm ${
            userRole === 'ADMIN' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin
        </button>
      </div>
    </div>
  );
};

export default RoleSwitcher;

