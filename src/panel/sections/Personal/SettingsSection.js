// archaeomap-frontend/src/panel/sections/Personal/SettingsSection.js

import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { COLORS } from '../../../shared/config/generalUtils';

// Import modular components
import ProfilePictureSettings from './featuresSettings/ProfilePictureSettings';
import PrivacySettings from './featuresSettings/PrivacySettings';
import PasswordSettings from './featuresSettings/PasswordSettings';
import AppearanceSettings from './featuresSettings/AppearanceSettings';
import NotificationSettings from './featuresSettings/NotificationSettings';
import GoogleAccountSettings from './featuresSettings/GoogleAccountSettings';

function SettingsSection() {
  // Change Password States
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Privacy Settings States - loaded from user preferences
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: false,
    profileVisible: true,
    allowCitySharing: true
  });

  // Other Settings States - loaded from user preferences
  const [userSettings, setUserSettings] = useState({
    theme: 'light',
    language: 'en',
    emailNotifications: true,
    showTooltips: true
  });

  // Success notification state
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);

  // Google unlink states
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [unlinkError, setUnlinkError] = useState(null);

  const { 
    user, 
    isAuthenticated,
    changePassword,
    changePasswordLoading,
    changePasswordError,
    changePasswordSuccess,
    clearChangePassword,
    updatePrivacySettings,
    updateUserPreferences,
    preferencesLoading,
    preferencesError,
    preferencesSuccess,
    clearPreferencesStatus,
    unlinkGoogleAccount
  } = useAuth();

  // Load preferences from user data when component mounts or user changes
  useEffect(() => {
    if (user?.preferences) {
      const prefs = user.preferences;
      
      setPrivacySettings({
        showEmail: prefs.showEmail ?? false,
        profileVisible: prefs.profileVisible ?? true,
        allowCitySharing: prefs.allowCitySharing ?? true
      });
      
      setUserSettings({
        theme: prefs.theme ?? 'light',
        language: prefs.language ?? 'en',
        emailNotifications: prefs.emailNotifications ?? true,
        showTooltips: prefs.showTooltips ?? true
      });
    }
  }, [user?.preferences]);

  // Show success notification when preferences are saved
  useEffect(() => {
    if (preferencesSuccess) {
      setShowSuccessSnackbar(true);
      // Auto-clear after showing notification
      setTimeout(() => {
        clearPreferencesStatus();
      }, 1000);
    }
  }, [preferencesSuccess, clearPreferencesStatus]);

  // Change Password Handlers
  const handleChangePasswordInputChange = (field) => (event) => {
    setChangePasswordData((prev) => ({ 
      ...prev, 
      [field]: event.target.value 
    }));
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
      setChangePasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  // Privacy Settings Handlers - Save immediately when changed
  const handlePrivacyChange = (field) => (event) => {
    const value = event.target.checked;
    
    // Update local state immediately for UI responsiveness
    setPrivacySettings((prev) => ({
      ...prev,
      [field]: value
    }));

    // Save to backend asynchronously
    updatePrivacySettings({ [field]: value })
      .then((result) => {
        if (!result.success) {
          // Revert local state if save failed
          setPrivacySettings((prev) => ({
            ...prev,
            [field]: !value
          }));
        }
      })
      .catch((error) => {
        console.error('Privacy setting save failed:', error);
        // Revert local state if save failed
        setPrivacySettings((prev) => ({
          ...prev,
          [field]: !value
        }));
      });
  };

  // Settings Handlers - For future implementation
  const handleSettingsChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setUserSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingsSave = async () => {
    // Save appearance and notification settings
    try {
      await updateUserPreferences(userSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Handle Google unlink
  const handleGoogleUnlink = async () => {
    setUnlinkLoading(true);
    setUnlinkError(null);

    try {
      const result = await unlinkGoogleAccount();
      
      if (result.success) {
        setUnlinkDialogOpen(false);
        setUnlinkError(null);
        setShowSuccessSnackbar(true);
      } else {
        setUnlinkError(result.error);
        if (result.requiresPassword) {
          setUnlinkError('You must set a password before unlinking your Google account');
        }
      }
    } catch (error) {
      setUnlinkError('Failed to unlink Google account');
    } finally {
      setUnlinkLoading(false);
    }
  };

  // Handle dialog close - clear error when closing
  const handleUnlinkDialogClose = () => {
    setUnlinkDialogOpen(false);
    setUnlinkError(null);
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ 
            color: COLORS.primary,
            fontFamily: 'Georgia, serif',
            fontWeight: 'normal',
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}>
            Settings
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mt: 0.5 }}>
            Manage your account preferences and security settings
          </Typography>
        </Box>

        {/* Profile Picture */}
        <ProfilePictureSettings />

        {/* Privacy Settings */}
        <PrivacySettings
          privacySettings={privacySettings}
          handlePrivacyChange={handlePrivacyChange}
          preferencesLoading={preferencesLoading}
          preferencesError={preferencesError}
          clearPreferencesStatus={clearPreferencesStatus}
        />

        {/* Change Password Section */}
        <PasswordSettings
          changePasswordData={changePasswordData}
          handleChangePasswordInputChange={handleChangePasswordInputChange}
          handleChangePasswordSubmit={handleChangePasswordSubmit}
          changePasswordLoading={changePasswordLoading}
          changePasswordError={changePasswordError}
          changePasswordSuccess={changePasswordSuccess}
          clearChangePassword={clearChangePassword}
        />

        {/* Application Settings */}
        <AppearanceSettings
          userSettings={userSettings}
          handleSettingsChange={handleSettingsChange}
        />

        {/* Notification Settings */}
        <NotificationSettings
          userSettings={userSettings}
          handleSettingsChange={handleSettingsChange}
        />

        {/* Google Account Settings */}
        <GoogleAccountSettings
          user={user}
          unlinkDialogOpen={unlinkDialogOpen}
          setUnlinkDialogOpen={setUnlinkDialogOpen}
          unlinkLoading={unlinkLoading}
          unlinkError={unlinkError}
          handleGoogleUnlink={handleGoogleUnlink}
          handleUnlinkDialogClose={handleUnlinkDialogClose}
        />

        {/* Save Settings Button */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleSettingsSave}
            disabled
            sx={{ 
              px: 4, 
              py: 1.25,
              borderColor: COLORS.primary,
              color: COLORS.primary,
              '&:hover': { 
                borderColor: COLORS.secondary,
                backgroundColor: COLORS.primary + '10'
              }
            }}
          >
            Save Preferences
          </Button>
          <Typography variant="caption" sx={{ 
            display: 'block', 
            mt: 1, 
            color: COLORS.texts.muted,
            fontStyle: 'italic'
          }}>
            Privacy settings are saved automatically. Other settings will be available in future updates.
          </Typography>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={showSuccessSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSuccessSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setShowSuccessSnackbar(false)} 
            severity="success" 
            sx={{ width: '100%' }}
            icon={<CheckCircleIcon fontSize="inherit" />}
          >
            Settings saved successfully
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default SettingsSection;