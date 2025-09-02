// archaeomap-frontend/src/panel/sections/Personal/features/AuthenticationForm.js

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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Link
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { COLORS } from '../../../../shared/config/generalUtils';

function AuthenticationForm() {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    identifier: '',
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Forgot Password States
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const { 
    login, 
    register, 
    isLoading, 
    error, 
    clearError, 
    requestPasswordReset,
    forgotPasswordLoading,
    forgotPasswordError,
    forgotPasswordSuccess,
    clearForgotPassword
  } = useAuth();

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
  }, [resetForm, clearError]);

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

  // Forgot Password Handlers
  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordEmail('');
    clearForgotPassword();
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail('');
    clearForgotPassword();
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail.trim())) {
      return;
    }

    await requestPasswordReset(forgotPasswordEmail.trim());
  };

  const handleForgotPasswordEmailChange = (event) => {
    setForgotPasswordEmail(event.target.value);
    if (forgotPasswordError) {
      clearForgotPassword();
    }
  };

  return (
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

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link
                component="button"
                type="button"
                onClick={handleForgotPasswordOpen}
                sx={{
                  color: COLORS.primary,
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot Password?
              </Link>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  fullWidth
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
                  fullWidth
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

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={handleForgotPasswordClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          pb: 1,
          color: COLORS.primary, 
          fontFamily: 'Georgia, serif'
        }}>
          Reset Password
          <IconButton 
            onClick={handleForgotPasswordClose}
            size="small"
            sx={{ color: COLORS.texts.muted }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {forgotPasswordSuccess ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <EmailIcon sx={{ fontSize: 48, color: COLORS.primary, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: COLORS.texts.primary }}>
                Check Your Email
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 2 }}>
                We've sent a password reset link to:
              </Typography>
              <Typography variant="body1" sx={{ 
                color: COLORS.primary, 
                fontWeight: 'medium',
                mb: 2
              }}>
                {forgotPasswordEmail}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="body1" sx={{ mb: 3, color: COLORS.texts.secondary }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>

              {forgotPasswordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {forgotPasswordError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleForgotPasswordSubmit} noValidate>
                <TextField
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  fullWidth
                  value={forgotPasswordEmail}
                  onChange={handleForgotPasswordEmailChange}
                  disabled={forgotPasswordLoading}
                  autoComplete="email"
                  autoFocus
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: COLORS.texts.muted }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ mb: 2 }}
                />
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {forgotPasswordSuccess ? (
            <Button
              onClick={handleForgotPasswordClose}
              variant="archaeo"
              sx={{ px: 4 }}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                onClick={handleForgotPasswordClose}
                disabled={forgotPasswordLoading}
                sx={{ color: COLORS.texts.secondary }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleForgotPasswordSubmit}
                variant="archaeo"
                disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()}
                sx={{ px: 4 }}
              >
                {forgotPasswordLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default AuthenticationForm;