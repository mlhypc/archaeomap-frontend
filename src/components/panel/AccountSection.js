// src/components/panel/AccountSection.js - STEP 2 MIGRATION

import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../config/generalUtils';

function AccountSection() {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    identifier: '',
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const { login, register, logout, isLoading, error, clearError, user, isAuthenticated } = useAuth();

  const resetForm = useCallback(() => {
    setFormData({
      identifier: '',
      email: '',
      username: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  }, []);

  useEffect(() => {
    resetForm();
    clearError();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    resetForm();
    clearError();
  };

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleFormFocus = () => {
    if (error) clearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const result = tabValue === 0 
      ? await login(formData.identifier, formData.password)
      : await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: 3, overflow: 'auto' }}>
      <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto' }}>
        
        {/* DEĞIŞIKLIK 1: Header - panelHeader variant kullanıldı */}
        <Box variant="panelHeader">
          <Typography variant="sectionTitle">
            Account
          </Typography>
        </Box>

        {isAuthenticated ? (
          // User Profile Section
          <Box>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PersonIcon sx={{ fontSize: 80, color: COLORS.primary, mb: 2 }} />
              
              {/* DEĞIŞIKLIK 2: Typography variant kullanıldı */}
              <Typography variant="h5" sx={{ mb: 1, color: COLORS.texts.primary }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="h6" sx={{ mb: 1, color: COLORS.texts.secondary }}>
                @{user?.username}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: COLORS.texts.secondary }}>
                {user?.email}
              </Typography>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ textAlign: 'left', maxWidth: '400px', mx: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                  Profile Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 0.5 }}>
                      Full Name
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.texts.primary }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 0.5 }}>
                      Username
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.texts.primary }}>
                      {user?.username}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 0.5 }}>
                      Email Address
                    </Typography>
                    <Typography variant="body1" sx={{ color: COLORS.texts.primary }}>
                      {user?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* DEĞIŞIKLIK 3: Button variant kullanıldı */}
              <Button 
                variant="archaeoOutlined"
                onClick={handleLogout}
                disabled={isLoading}
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Logout'}
              </Button>
            </Box>
          </Box>
        ) : (
          // Authentication Section
          <Box>
            <Typography variant="body1" sx={{ mb: 3, color: COLORS.texts.secondary, textAlign: 'center' }}>
              Sign in to access your account and manage your preferences
            </Typography>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ 
                borderBottom: `1px solid ${COLORS.border}`, mb: 3,
                '& .MuiTab-root': { color: COLORS.texts.secondary, fontFamily: 'Georgia, serif' },
                '& .Mui-selected': { color: COLORS.primary }
              }}
            >
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
                {typeof error === 'string' ? error : 'Authentication failed. Please check your inputs.'}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {tabValue === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Email or Username"
                    variant="outlined"
                    fullWidth
                    value={formData.identifier}
                    onChange={handleInputChange('identifier')}
                    onFocus={handleFormFocus}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ color: COLORS.texts.muted, mr: 1 }} />
                    }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    onFocus={handleFormFocus}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ color: COLORS.texts.muted, mr: 1 }} />
                    }}
                  />
                  
                  {/* DEĞIŞIKLIK 3 (devamı): Login button için archaeo variant */}
                  <Button
                    type="submit"
                    variant="archaeo"
                    fullWidth
                    disabled={isLoading || !formData.identifier || !formData.password}
                    sx={{ mt: 2, py: 1.5 }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="First Name"
                      variant="outlined"
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                      disabled={isLoading}
                    />
                    <TextField
                      label="Last Name"
                      variant="outlined"
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                      disabled={isLoading}
                    />
                  </Box>
                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    disabled={isLoading}
                    helperText="Only letters, numbers, and underscores allowed"
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ color: COLORS.texts.muted, mr: 1 }} />
                    }}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    variant="outlined"
                    fullWidth
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={isLoading}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ color: COLORS.texts.muted, mr: 1 }} />
                    }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    fullWidth
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    disabled={isLoading}
                    helperText="At least 6 characters with letters and numbers"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ color: COLORS.texts.muted, mr: 1 }} />
                    }}
                  />
                  
                  {/* Register button için archaeoSecondary variant */}
                  <Button
                    type="submit"
                    variant="archaeoSecondary"
                    fullWidth
                    disabled={isLoading || !formData.username || !formData.email || !formData.password}
                    sx={{ mt: 2, py: 1.5 }}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', textAlign: 'center', color: COLORS.texts.muted, fontStyle: 'italic'
              }}
            >
              {tabValue === 0 
                ? "Don't have an account? Click Register tab above" 
                : "Already have an account? Click Login tab above"
              }
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AccountSection;