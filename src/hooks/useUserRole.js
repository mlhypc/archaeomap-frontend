// src/hooks/useUserRole.js

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useUserRole = () => {
  const { user, isAuthenticated } = useAuth();

  const roleInfo = useMemo(() => {
    if (!isAuthenticated || !user?.role) {
      return {
        isUser: false,
        isCurator: false,
        isAdmin: false,
        role: null,
        canManageData: false,
        canManageUsers: false,
        displayRole: 'Guest'
      };
    }

    const role = user.role;
    
    return {
      isUser: role === 'user',
      isCurator: ['curator', 'admin'].includes(role),
      isAdmin: role === 'admin',
      role,
      canManageData: ['curator', 'admin'].includes(role),
      canManageUsers: role === 'admin',
      displayRole: {
        'user': 'User',
        'curator': 'Curator', 
        'admin': 'Administrator'
      }[role] || 'Unknown'
    };
  }, [user, isAuthenticated]);

  return roleInfo;
};

export default useUserRole;