// src/components/panel/AccountSection.js - STEP 2 MIGRATION (refined)

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
  Divider,
  Paper,
  InputAdornment,
  Grid
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
    resetForm();
    clearError();
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleFormFocus = () => {
    if (error) clearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (tabValue === 0) {
      await login(formData.identifier, formData.password);
    } else {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Box sx={{ width: '100%', height: '100%', p: { xs: 2, md: 3 }, overflow: 'auto' }}>
      <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
        {/* Header */}
        <Box variant="panelHeader" sx={{ mb: 2 }}>
          <Typography variant="sectionTitle">Account</Typography>
        </Box>

        {isAuthenticated ? (
          // User Profile Section
          <Paper elevation={1} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <PersonIcon sx={{ fontSize: 72, color: COLORS.primary, mb: 1.5 }} />

              <Typography variant="h5" sx={{ mb: 0.5, color: COLORS.texts.primary }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="h6" sx={{ mb: 0.5, color: COLORS.texts.secondary, fontWeight: 500 }}>
                @{user?.username}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: COLORS.texts.secondary }}>
                {user?.email}
              </Typography>

              <Divider sx={{ my: 2.5 }} />

              <Box sx={{ textAlign: 'left', maxWidth: 460, mx: 'auto' }}>
                <Typography variant="h6" sx={{ mb: 1.5, color: COLORS.primary }}>
                  Profile Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
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

              <Button
                variant="archaeoOutlined"
                onClick={handleLogout}
                disabled={isLoading}
                size="large"
                sx={{ px: 4, py: 1.25 }}
              >
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Logout'}
              </Button>
            </Box>
          </Paper>
        ) : (
          // Authentication Section
          <Paper elevation={1} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}>
            <Typography
              variant="body1"
              sx={{ mb: 2, color: COLORS.texts.secondary, textAlign: 'center' }}
            >
              Sign in to access your account and manage your preferences
            </Typography>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              variant="fullWidth"
              sx={{
                borderBottom: `1px solid ${COLORS.border}`,
                mb: 2.5,
                '& .MuiTab-root': {
                  color: COLORS.texts.secondary,
                  fontFamily: 'Georgia, serif',
                  textTransform: 'none',
                  fontWeight: 600
                },
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

            <Box component="form" onSubmit={handleSubmit} noValidate>
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
                    autoComplete="username email"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: COLORS.texts.muted }} />
                        </InputAdornment>
                      )
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
                    autoComplete="current-password"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: COLORS.texts.muted }} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    variant="archaeo"
                    fullWidth
                    disabled={isLoading || !formData.identifier || !formData.password}
                    sx={{ mt: 1, py: 1.25 }}
                  >
                    {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Login'}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First Name"
                        variant="outlined"
                        value={formData.firstName}
                        onChange={handleInputChange('firstName')}
                        disabled={isLoading}
                        autoComplete="given-name"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last Name"
                        variant="outlined"
                        value={formData.lastName}
                        onChange={handleInputChange('lastName')}
                        disabled={isLoading}
                        autoComplete="family-name"
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    label="Username"
                    variant="outlined"
                    fullWidth
                    value={formData.username}
                    onChange={handleInputChange('username')}
                    disabled={isLoading}
                    helperText="Only letters, numbers, and underscores allowed"
                    autoComplete="username"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon sx={{ color: COLORS.texts.muted }} />
                        </InputAdornment>
                      )
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
                    autoComplete="email"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: COLORS.texts.muted }} />
                        </InputAdornment>
                      )
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
                    autoComplete="new-password"
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: COLORS.texts.muted }} />
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    variant="archaeoSecondary"
                    fullWidth
                    disabled={
                      isLoading ||
                      !formData.username ||
                      !formData.email ||
                      !formData.password
                    }
                    sx={{ mt: 1, py: 1.25 }}
                  >
                    {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Register'}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                color: COLORS.texts.muted,
                fontStyle: 'italic'
              }}
            >
              {tabValue === 0
                ? "Don't have an account? Click Register tab above"
                : 'Already have an account? Click Login tab above'}
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default AccountSection;
