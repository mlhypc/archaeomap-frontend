// src/services/authApi.js

import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await authApi.put('/auth/profile', profileData);
      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Profile update failed'
      };
    }
  }
};

export default authService;