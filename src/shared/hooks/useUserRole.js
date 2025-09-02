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
      // New role system
      isStandard: role === 'standard',
      isContributor: ['contributor', 'moderator', 'admin'].includes(role),
      isModerator: ['moderator', 'admin'].includes(role),
      isAdmin: role === 'admin',
      role,
      canManageData: ['contributor', 'moderator', 'admin'].includes(role),
      canManageUsers: role === 'admin',
      canModerate: ['moderator', 'admin'].includes(role),
      displayRole: {
        'standard': 'User',
        'contributor': 'Contributor',
        'moderator': 'Moderator',
        'admin': 'Administrator'
      }[role] || 'Unknown',
      
      // Legacy support for existing code (mapped to new roles)
      isUser: role === 'standard',
      isCurator: ['contributor', 'moderator', 'admin'].includes(role)
    };
  }, [user, isAuthenticated]);

  return roleInfo;
};

export default useUserRole;