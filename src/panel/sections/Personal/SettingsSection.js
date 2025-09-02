// archaeomap-frontend\src\panel\sections\Personal\SettingsSection.js

import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  InputAdornment,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { COLORS } from '../../../shared/config/generalUtils';

function SettingsSection() {
  // Change Password States
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Other Settings States
  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    browserNotifications: false,
    showTooltips: true
  });

  const { 
    user, 
    isAuthenticated,
    changePassword,
    changePasswordLoading,
    changePasswordError,
    changePasswordSuccess,
    clearChangePassword
  } = useAuth();

  // Change Password Handlers
  const handleChangePasswordInputChange = (field) => (event) => {
    setChangePasswordData((prev) => ({ 
      ...prev, 
      [field]: event.target.value 
    }));
    // Clear any previous errors when user starts typing
    if (changePasswordError) {
      clearChangePassword();
    }
  };

  const handleChangePasswordSubmit = async (event) => {
    event.preventDefault();
    
    if (!changePasswordData.currentPassword || 
        !changePasswordData.newPassword || 
        !changePasswordData.confirmPassword) {
      return;
    }

    if (changePasswordData.newPassword !== changePasswordData.confirmPassword) {
      return;
    }

    const result = await changePassword(
      changePasswordData.currentPassword, 
      changePasswordData.newPassword
    );

    if (result.success) {
      // Clear form on success
      setChangePasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  // Settings Handlers
  const handleSettingsChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setUserSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsSave = () => {
    // TODO: Implement settings save functionality
    console.log('Settings saved:', userSettings);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ width: '100%', height: '100%', p: { xs: 2, md: 3 }, overflow: 'auto' }}>
        <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
          <Paper elevation={1} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, textAlign: 'center' }}>
            <SettingsIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              Please Log In
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              You need to be logged in to access your settings
            </Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', p: { xs: 2, md: 3 }, overflow: 'auto' }}>
      <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
        {/* Header */}
        <Box variant="panelHeader" sx={{ mb: 3 }}>
          <Typography variant="sectionTitle">Settings</Typography>
          <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mt: 0.5 }}>
            Manage your account preferences and security settings
          </Typography>
        </Box>

        {/* Change Password Section */}
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
                  variant="archaeoOutlined"
                  onClick={clearChangePassword}
                  sx={{ px: 3 }}
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
                      variant="archaeo"
                      disabled={
                        changePasswordLoading ||
                        !changePasswordData.currentPassword ||
                        !changePasswordData.newPassword ||
                        !changePasswordData.confirmPassword ||
                        changePasswordData.newPassword !== changePasswordData.confirmPassword
                      }
                      sx={{ mt: 1, py: 1.25, maxWidth: 200 }}
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

        {/* Application Settings */}
        <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PaletteIcon sx={{ color: COLORS.primary, mr: 1.5 }} />
              <Typography variant="h6" sx={{ color: COLORS.primary }}>
                Appearance
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Theme</InputLabel>
                <Select
                  value={userSettings.theme}
                  label="Theme"
                  onChange={handleSettingsChange('theme')}
                  disabled // Temporarily disabled until implementation
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto (System)</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={userSettings.language}
                  label="Language"
                  onChange={handleSettingsChange('language')}
                  disabled // Temporarily disabled until implementation
                  startAdornment={<LanguageIcon sx={{ color: COLORS.texts.muted, mr: 1 }} />}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="tr">Türkçe</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.showTooltips}
                    onChange={handleSettingsChange('showTooltips')}
                    disabled // Temporarily disabled until implementation
                  />
                }
                label="Show helpful tooltips"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ color: COLORS.tertiary, mr: 1.5 }} />
              <Typography variant="h6" sx={{ color: COLORS.tertiary }}>
                Notifications
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 3 }}>
              Configure how you'd like to receive updates and notifications
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.emailNotifications}
                    onChange={handleSettingsChange('emailNotifications')}
                    disabled // Temporarily disabled until implementation
                  />
                }
                label="Email notifications for important updates"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={userSettings.browserNotifications}
                    onChange={handleSettingsChange('browserNotifications')}
                    disabled // Temporarily disabled until implementation
                  />
                }
                label="Browser push notifications"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Save Settings Button */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="archaeoOutlined"
            onClick={handleSettingsSave}
            disabled // Temporarily disabled until full implementation
            sx={{ px: 4, py: 1.25 }}
          >
            Save Preferences
          </Button>
          <Typography variant="caption" sx={{ 
            display: 'block', 
            mt: 1, 
            color: COLORS.texts.muted,
            fontStyle: 'italic'
          }}>
            Additional settings will be available in future updates
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default SettingsSection;