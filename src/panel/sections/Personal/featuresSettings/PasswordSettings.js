// archaeomap-frontend/src/panel/sections/Personal/featuresSettings/PasswordSettings.js

import React from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { COLORS } from '../../../../shared/config/generalUtils';

function PasswordSettings({
  changePasswordData,
  handleChangePasswordInputChange,
  handleChangePasswordSubmit,
  changePasswordLoading,
  changePasswordError,
  changePasswordSuccess,
  clearChangePassword
}) {
  return (
    <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LockIcon sx={{ color: COLORS.secondary, mr: 1.5 }} />
          <Typography variant="h6" sx={{ color: COLORS.secondary }}>
            Change Password
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 3 }}>
          Update your password to keep your account secure
        </Typography>

        {changePasswordSuccess ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <LockIcon sx={{ fontSize: 48, color: COLORS.primary, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, color: COLORS.texts.primary }}>
              Password Changed Successfully!
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 2 }}>
              Your password has been updated. You can now use your new password to log in.
            </Typography>
            <Button
              variant="outlined"
              onClick={clearChangePassword}
              sx={{ 
                px: 3,
                borderColor: COLORS.primary,
                color: COLORS.primary,
                '&:hover': { 
                  borderColor: COLORS.secondary,
                  backgroundColor: COLORS.primary + '10'
                }
              }}
            >
              Change Password Again
            </Button>
          </Box>
        ) : (
          <>
            {changePasswordError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={clearChangePassword}>
                {changePasswordError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleChangePasswordSubmit} noValidate>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Current Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={changePasswordData.currentPassword}
                  onChange={handleChangePasswordInputChange('currentPassword')}
                  disabled={changePasswordLoading}
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

                <TextField
                  label="New Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={changePasswordData.newPassword}
                  onChange={handleChangePasswordInputChange('newPassword')}
                  disabled={changePasswordLoading}
                  autoComplete="new-password"
                  required
                  helperText="At least 6 characters with letters and numbers"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: COLORS.texts.muted }} />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={changePasswordData.confirmPassword}
                  onChange={handleChangePasswordInputChange('confirmPassword')}
                  disabled={changePasswordLoading}
                  autoComplete="new-password"
                  required
                  error={changePasswordData.confirmPassword && changePasswordData.newPassword !== changePasswordData.confirmPassword}
                  helperText={
                    changePasswordData.confirmPassword && changePasswordData.newPassword !== changePasswordData.confirmPassword
                      ? "Passwords don't match"
                      : ""
                  }
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
                  variant="contained"
                  disabled={
                    changePasswordLoading ||
                    !changePasswordData.currentPassword ||
                    !changePasswordData.newPassword ||
                    !changePasswordData.confirmPassword ||
                    changePasswordData.newPassword !== changePasswordData.confirmPassword
                  }
                  sx={{ 
                    mt: 1, 
                    py: 1.25, 
                    maxWidth: 200,
                    backgroundColor: COLORS.primary,
                    '&:hover': { backgroundColor: COLORS.secondary }
                  }}
                >
                  {changePasswordLoading ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PasswordSettings;