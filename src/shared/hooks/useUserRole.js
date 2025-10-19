// src/hooks/useUserRole.js - UPDATED FOR NEW ROLE SYSTEM

import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const useUserRole = () => {
  const { user, isAuthenticated } = useAuth();

  const roleInfo = useMemo(() => {
    if (!isAuthenticated || !user?.role) {
      return {
        isStandard: false,
        isContributor: false,
        isModerator: false,
        isAdmin: false,
        role: null,
        canManageData: false,
        canManageUsers: false,
        canModerate: false,
        displayRole: 'Guest',
        // Legacy support for existing code
        isUser: false,
        isCurator: false
      };
    }

    const role = user.role;
    
    return {
      // New role system (Roman Empire themed)
      isStandard: role === 'plebeian',
      isContributor: ['equestrian', 'senator', 'imperator'].includes(role),
      isModerator: ['senator', 'imperator'].includes(role),
      isAdmin: role === 'imperator',
      role,
      canManageData: ['equestrian', 'senator', 'imperator'].includes(role),
      canManageUsers: role === 'imperator',
      canModerate: ['senator', 'imperator'].includes(role),
      displayRole: {
        'plebeian': 'Plebeian',
        'equestrian': 'Equestrian',
        'senator': 'Senator',
        'imperator': 'Imperator'
      }[role] || 'Unknown',

      // Legacy support for existing code (mapped to new roles)
      isUser: role === 'plebeian',
      isCurator: ['equestrian', 'senator', 'imperator'].includes(role)
    };
  }, [user, isAuthenticated]);

  return roleInfo;
};

export default useUserRole;