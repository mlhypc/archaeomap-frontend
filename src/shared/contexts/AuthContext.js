// src/contexts/AuthContext.js - Updated with Forgot Password + Change Password features

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import authService from '../services/authApi';

const AuthContext = createContext();

const AUTH_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error'
};

const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  // Forgot Password Actions
  FORGOT_PASSWORD_REQUEST: 'FORGOT_PASSWORD_REQUEST',
  FORGOT_PASSWORD_SUCCESS: 'FORGOT_PASSWORD_SUCCESS',
  FORGOT_PASSWORD_ERROR: 'FORGOT_PASSWORD_ERROR',
  RESET_PASSWORD_REQUEST: 'RESET_PASSWORD_REQUEST',
  RESET_PASSWORD_SUCCESS: 'RESET_PASSWORD_SUCCESS',
  RESET_PASSWORD_ERROR: 'RESET_PASSWORD_ERROR',
  CLEAR_FORGOT_PASSWORD: 'CLEAR_FORGOT_PASSWORD',
  // Change Password Actions
  CHANGE_PASSWORD_REQUEST: 'CHANGE_PASSWORD_REQUEST',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
  CHANGE_PASSWORD_ERROR: 'CHANGE_PASSWORD_ERROR',
  CLEAR_CHANGE_PASSWORD: 'CLEAR_CHANGE_PASSWORD'
};

const initialState = {
  user: null,
  token: localStorage.getItem('archaeomap_token'),
  refreshToken: localStorage.getItem('archaeomap_refresh_token'),
  status: AUTH_STATES.IDLE,
  error: null,
  // Forgot Password State
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: false,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
  // Change Password State
  changePasswordLoading: false,
  changePasswordError: null,
  changePasswordSuccess: false
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        status: AUTH_STATES.LOADING,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      // Store tokens in localStorage
      localStorage.setItem('archaeomap_token', action.payload.token);
      localStorage.setItem('archaeomap_refresh_token', action.payload.refreshToken);
      
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        status: AUTH_STATES.AUTHENTICATED,
        error: null
      };

    case AUTH_ACTIONS.LOGOUT:
      // Clear tokens from localStorage
      localStorage.removeItem('archaeomap_token');
      localStorage.removeItem('archaeomap_refresh_token');
      
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        status: AUTH_STATES.IDLE,
        error: null,
        // Clear forgot password state on logout
        forgotPasswordLoading: false,
        forgotPasswordError: null,
        forgotPasswordSuccess: false,
        resetPasswordLoading: false,
        resetPasswordError: null,
        resetPasswordSuccess: false,
        // Clear change password state on logout
        changePasswordLoading: false,
        changePasswordError: null,
        changePasswordSuccess: false
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        status: AUTH_STATES.ERROR,
        error: action.payload
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      // Only clear error if there is one to avoid unnecessary renders
      if (!state.error) return state;
      
      return {
        ...state,
        error: null,
        status: state.user ? AUTH_STATES.AUTHENTICATED : AUTH_STATES.IDLE
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload
      };

    // Forgot Password Cases
    case AUTH_ACTIONS.FORGOT_PASSWORD_REQUEST:
      return {
        ...state,
        forgotPasswordLoading: true,
        forgotPasswordError: null,
        forgotPasswordSuccess: false
      };

    case AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        forgotPasswordLoading: false,
        forgotPasswordSuccess: true,
        forgotPasswordError: null
      };

    case AUTH_ACTIONS.FORGOT_PASSWORD_ERROR:
      return {
        ...state,
        forgotPasswordLoading: false,
        forgotPasswordError: action.payload,
        forgotPasswordSuccess: false
      };

    case AUTH_ACTIONS.RESET_PASSWORD_REQUEST:
      return {
        ...state,
        resetPasswordLoading: true,
        resetPasswordError: null,
        resetPasswordSuccess: false
      };

    case AUTH_ACTIONS.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        resetPasswordLoading: false,
        resetPasswordSuccess: true,
        resetPasswordError: null
      };

    case AUTH_ACTIONS.RESET_PASSWORD_ERROR:
      return {
        ...state,
        resetPasswordLoading: false,
        resetPasswordError: action.payload,
        resetPasswordSuccess: false
      };

    case AUTH_ACTIONS.CLEAR_FORGOT_PASSWORD:
      return {
        ...state,
        forgotPasswordLoading: false,
        forgotPasswordError: null,
        forgotPasswordSuccess: false,
        resetPasswordLoading: false,
        resetPasswordError: null,
        resetPasswordSuccess: false
      };

    // Change Password Cases
    case AUTH_ACTIONS.CHANGE_PASSWORD_REQUEST:
      return {
        ...state,
        changePasswordLoading: true,
        changePasswordError: null,
        changePasswordSuccess: false
      };

    case AUTH_ACTIONS.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        changePasswordLoading: false,
        changePasswordSuccess: true,
        changePasswordError: null
      };

    case AUTH_ACTIONS.CHANGE_PASSWORD_ERROR:
      return {
        ...state,
        changePasswordLoading: false,
        changePasswordError: action.payload,
        changePasswordSuccess: false
      };

    case AUTH_ACTIONS.CLEAR_CHANGE_PASSWORD:
      return {
        ...state,
        changePasswordLoading: false,
        changePasswordError: null,
        changePasswordSuccess: false
      };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app start
  useEffect(() => {
    if (state.token && !state.user) {
      getCurrentUser();
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      
      const result = await authService.getCurrentUser();
      
      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            token: state.token,
            refreshToken: state.refreshToken
          }
        });
      } else {
        logout();
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      logout();
    }
  };

  const login = async (identifier, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      
      const result = await authService.login(identifier, password);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            token: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken
          }
        });
        return { success: true, user: result.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      
      const result = await authService.register(userData);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: result.user,
            token: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken
          }
        });
        return { success: true, user: result.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING });
      
      const result = await authService.updateProfile(profileData);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: result.user
        });
        return { success: true, user: result.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Profile update failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // FORGOT PASSWORD FUNCTIONS

  const requestPasswordReset = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.FORGOT_PASSWORD_REQUEST });
      
      const result = await authService.requestPasswordReset(email);

      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.FORGOT_PASSWORD_SUCCESS });
        return { success: true, message: result.message };
      } else {
        dispatch({
          type: AUTH_ACTIONS.FORGOT_PASSWORD_ERROR,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Failed to send reset email';
      dispatch({
        type: AUTH_ACTIONS.FORGOT_PASSWORD_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_REQUEST });
      
      const result = await authService.resetPassword(token, newPassword);

      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.RESET_PASSWORD_SUCCESS });
        return { success: true, message: result.message };
      } else {
        dispatch({
          type: AUTH_ACTIONS.RESET_PASSWORD_ERROR,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Failed to reset password';
      dispatch({
        type: AUTH_ACTIONS.RESET_PASSWORD_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const verifyResetToken = async (token) => {
    try {
      const result = await authService.verifyResetToken(token);
      return result;
    } catch (error) {
      console.error('Verify reset token error:', error);
      return { success: false, valid: false, error: 'Invalid or expired token' };
    }
  };

  // CHANGE PASSWORD FUNCTIONS

  const changePassword = async (currentPassword, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CHANGE_PASSWORD_REQUEST });
      
      const result = await authService.changePassword(currentPassword, newPassword);

      if (result.success) {
        dispatch({ type: AUTH_ACTIONS.CHANGE_PASSWORD_SUCCESS });
        return { success: true, message: result.message };
      } else {
        dispatch({
          type: AUTH_ACTIONS.CHANGE_PASSWORD_ERROR,
          payload: result.error
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Failed to change password';
      dispatch({
        type: AUTH_ACTIONS.CHANGE_PASSWORD_ERROR,
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  // Simple clearError function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Clear forgot password state
  const clearForgotPassword = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_FORGOT_PASSWORD });
  };

  // Clear change password state
  const clearChangePassword = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_CHANGE_PASSWORD });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    // User state
    user: state.user,
    token: state.token,
    isAuthenticated: state.status === AUTH_STATES.AUTHENTICATED,
    isLoading: state.status === AUTH_STATES.LOADING,
    error: state.error,
    
    // Forgot password state
    forgotPasswordLoading: state.forgotPasswordLoading,
    forgotPasswordError: state.forgotPasswordError,
    forgotPasswordSuccess: state.forgotPasswordSuccess,
    resetPasswordLoading: state.resetPasswordLoading,
    resetPasswordError: state.resetPasswordError,
    resetPasswordSuccess: state.resetPasswordSuccess,
    
    // Change password state
    changePasswordLoading: state.changePasswordLoading,
    changePasswordError: state.changePasswordError,
    changePasswordSuccess: state.changePasswordSuccess,
    
    // Auth functions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    
    // Forgot password functions
    requestPasswordReset,
    resetPassword,
    verifyResetToken,
    clearForgotPassword,
    
    // Change password functions
    changePassword,
    clearChangePassword
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;