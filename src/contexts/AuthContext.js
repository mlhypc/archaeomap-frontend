// src/contexts/AuthContext.js
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
  UPDATE_USER: 'UPDATE_USER'
};

const initialState = {
  user: null,
  token: localStorage.getItem('archaeomap_token'),
  refreshToken: localStorage.getItem('archaeomap_refresh_token'),
  status: AUTH_STATES.IDLE,
  error: null
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
        error: null
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

  // Simple clearError function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.status === AUTH_STATES.AUTHENTICATED,
    isLoading: state.status === AUTH_STATES.LOADING,
    error: state.error,
    login,
    register,
    logout,
    updateProfile,
    clearError
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