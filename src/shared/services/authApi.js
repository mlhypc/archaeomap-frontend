// archaeomap-frontend\src\shared\services\authApi.js

import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for registration/email sending
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token to headers
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('archaeomap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('archaeomap_token');
      localStorage.removeItem('archaeomap_refresh_token');
    }
    return Promise.reject(error);
  }
);

// Authentication API functions
export const authService = {
  // Get current user
  async getCurrentUser() {
    try {
      const response = await authApi.get('/auth/me');
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user info'
      };
    }
  },

  // Login user
  async login(identifier, password) {
    try {
      const response = await authApi.post('/auth/login', {
        identifier,
        password
      });

      const { user, tokens } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('archaeomap_token', tokens.accessToken);
      localStorage.setItem('archaeomap_refresh_token', tokens.refreshToken);

      return {
        success: true,
        user,
        tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await authApi.post('/auth/register', userData);
      const { user, tokens } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('archaeomap_token', tokens.accessToken);
      localStorage.setItem('archaeomap_refresh_token', tokens.refreshToken);

      return {
        success: true,
        user,
        tokens
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  },

  // Refresh token
  async refreshToken(refreshToken) {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
      
      // Update stored tokens
      localStorage.setItem('archaeomap_token', accessToken);
      localStorage.setItem('archaeomap_refresh_token', newRefreshToken);

      return {
        success: true,
        tokens: {
          accessToken,
          refreshToken: newRefreshToken
        }
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Token refresh failed'
      };
    }
  },

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('archaeomap_token');
      if (token) {
        await authApi.post('/auth/logout');
      }
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    } finally {
      // Always clear local storage
      localStorage.removeItem('archaeomap_token');
      localStorage.removeItem('archaeomap_refresh_token');
    }
  },

  // Update user profile (name, bio, etc.)
  async updateProfile(profileData) {
    try {
      const response = await authApi.put('/auth/profile', profileData);
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed'
      };
    }
  },

  // Update user preferences specifically
  async updatePreferences(preferences) {
    try {
      const response = await authApi.put('/auth/preferences', { preferences });
      return {
        success: true,
        user: response.data.user,
        preferences: response.data.preferences,
        message: response.data.message
      };
    } catch (error) {
      console.error('Preferences update error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update preferences'
      };
    }
  },

  // Helper function - update single preference
  async updateSinglePreference(key, value) {
    return await this.updatePreferences({ [key]: value });
  },

  // Helper function - update privacy settings
  async updatePrivacySettings(privacySettings) {
    const preferences = {};
    
    if (typeof privacySettings.showEmail !== 'undefined') {
      preferences.showEmail = privacySettings.showEmail;
    }
    if (typeof privacySettings.profileVisible !== 'undefined') {
      preferences.profileVisible = privacySettings.profileVisible;
    }
    if (typeof privacySettings.allowCitySharing !== 'undefined') {
      preferences.allowCitySharing = privacySettings.allowCitySharing;
    }
    
    return await this.updatePreferences(preferences);
  },

  // FORGOT PASSWORD FUNCTIONS
  
  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await authApi.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message || 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Request password reset error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'No account found with this email address'
        };
      } else if (error.response?.status === 429) {
        return {
          success: false,
          error: 'Too many reset requests. Please try again later'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to send password reset email'
      };
    }
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await authApi.post('/auth/reset-password', { 
        token, 
        newPassword 
      });
      
      return {
        success: true,
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error;
        if (errorMsg?.includes('expired')) {
          return {
            success: false,
            error: 'Reset link has expired. Please request a new one'
          };
        } else if (errorMsg?.includes('invalid')) {
          return {
            success: false,
            error: 'Invalid reset link. Please request a new one'
          };
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to reset password'
      };
    }
  },

  // Verify reset token (optional - to check token validity before showing reset form)
  async verifyResetToken(token) {
    try {
      const response = await authApi.post('/auth/verify-reset-token', { token });
      return {
        success: true,
        valid: true,
        email: response.data.email // Backend might return the associated email
      };
    } catch (error) {
      console.error('Verify reset token error:', error);
      return {
        success: false,
        valid: false,
        error: error.response?.data?.error || 'Invalid or expired reset token'
      };
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await authApi.put('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      
      return {
        success: true,
        message: response.data.message || 'Password changed successfully'
      };
    } catch (error) {
      console.error('Change password error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error;
        if (errorMsg?.includes('incorrect')) {
          return {
            success: false,
            error: 'Current password is incorrect'
          };
        } else if (errorMsg?.includes('different')) {
          return {
            success: false,
            error: 'New password must be different from current password'
          };
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to change password'
      };
    }
  },

  // USER MANAGEMENT FUNCTIONS (Admin only)
  
  // Get all users
  async getAllUsers() {
    try {
      const response = await authApi.get('/auth/users');
      return {
        success: true,
        users: response.data.users
      };
    } catch (error) {
      console.error('Get all users error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch users'
      };
    }
  },

  // Update user role
  async updateUserRole(userId, role) {
    try {
      const response = await authApi.put(`/auth/users/${userId}/role`, { role });
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      console.error('Update user role error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update user role'
      };
    }
  },

  // GOOGLE OAUTH FUNCTIONS

  // Get user info using OAuth token
  async getOAuthUserInfo(token) {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('OAuth user info error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get OAuth user info'
      };
    }
  },

  // Unlink Google account
  async unlinkGoogleAccount() {
    try {
      const response = await authApi.post('/auth/oauth/unlink');
      return {
        success: true,
        user: response.data.user,
        message: response.data.message
      };
    } catch (error) {
      console.error('Unlink Google account error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to unlink Google account',
        requiresPassword: error.response?.data?.requiresPassword || false
      };
    }
  }
};

export default authService;