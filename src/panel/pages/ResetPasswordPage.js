// src/pages/ResetPasswordPage.js - Password reset page for email links

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Container,
  IconButton
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../shared/contexts/AuthContext';
import { COLORS } from '../../shared/config/generalUtils';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isTokenValid, setIsTokenValid] = useState(null); // null, true, false
  const [tokenValidating, setTokenValidating] = useState(true);

  const {
    resetPassword,
    verifyResetToken,
    resetPasswordLoading,
    resetPasswordError,
    resetPasswordSuccess,
    clearForgotPassword
  } = useAuth();

  // Verify token on component mount - SIMPLIFIED
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false);
      setTokenValidating(false);
      return;
    }

    // Simple token existence check - no API call needed
    setIsTokenValid(true);
    setTokenValidating(false);
    
    // Clear any previous forgot password state once
    clearForgotPassword();
  }, [token]); // Only token dependency

  // Navigate to login after successful reset
  useEffect(() => {
    if (resetPasswordSuccess) {
      const timer = setTimeout(() => {
        navigate('/panel', { replace: true });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [resetPasswordSuccess, navigate]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear password mismatch error when user types in either field
    if (field === 'confirmPassword' && validationErrors.passwordMismatch) {
      setValidationErrors(prev => ({ ...prev, passwordMismatch: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain both letters and numbers';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.passwordMismatch = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await resetPassword(token, formData.password);
    
    // Form will be disabled and success message shown via resetPasswordSuccess state
  };

  const handleBackToLogin = () => {
    navigate('/panel', { replace: true });
  };

  // Loading state while verifying token
  if (tokenValidating) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ color: COLORS.texts.secondary }}>
            Verifying reset link...
          </Typography>
        </Paper>
      </Container>
    );
  }

  // Invalid token state
  if (isTokenValid === false) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            This reset link is invalid or has expired.
          </Alert>
          <Typography variant="body1" sx={{ mb: 3, color: COLORS.texts.secondary }}>
            Password reset links expire after 1 hour for security reasons.
          </Typography>
          <Button
            variant="archaeo"
            onClick={handleBackToLogin}
            sx={{ px: 4 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  // Success state
  if (resetPasswordSuccess) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: COLORS.primary, mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 2, color: COLORS.texts.primary }}>
            Password Reset Successful!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, color: COLORS.texts.secondary }}>
            Your password has been updated successfully. You can now log in with your new password.
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
            Redirecting to login page in a few seconds...
          </Typography>
          <Button
            variant="archaeo"
            onClick={handleBackToLogin}
            sx={{ mt: 2, px: 4 }}
          >
            Go to Login Now
          </Button>
        </Paper>
      </Container>
    );
  }

  // Main reset form
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <img 
          src="/archaeomap_primary.svg" 
          alt="ArchaeoMap Logo" 
          style={{ height: '40px', marginBottom: '16px' }}
        />
        <Typography
          variant="h4"
          sx={{ 
            fontFamily: 'Georgia, serif',
            color: COLORS.primary,
            mb: 1
          }}
        >
          Reset Your Password
        </Typography>
        <Typography variant="body1" sx={{ color: COLORS.texts.secondary }}>
          Enter your new password below
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ p: 4 }}>
        {resetPasswordError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {resetPasswordError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={resetPasswordLoading}
            error={!!validationErrors.password}
            helperText={validationErrors.password || 'At least 6 characters with letters and numbers'}
            autoComplete="new-password"
            required
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: COLORS.texts.muted }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    disabled={resetPasswordLoading}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            disabled={resetPasswordLoading}
            error={!!validationErrors.confirmPassword || !!validationErrors.passwordMismatch}
            helperText={validationErrors.confirmPassword || validationErrors.passwordMismatch}
            autoComplete="new-password"
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: COLORS.texts.muted }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    disabled={resetPasswordLoading}
                  >
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Button
            type="submit"
            variant="archaeo"
            fullWidth
            disabled={resetPasswordLoading || !formData.password || !formData.confirmPassword}
            sx={{ mb: 2, py: 1.5 }}
          >
            {resetPasswordLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Update Password'
            )}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={handleBackToLogin}
            disabled={resetPasswordLoading}
            startIcon={<ArrowBackIcon />}
            sx={{ 
              color: COLORS.texts.secondary,
              '&:hover': {
                backgroundColor: 'rgba(119, 73, 54, 0.05)'
              }
            }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ResetPasswordPage;