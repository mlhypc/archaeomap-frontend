// archaeomap-frontend/src/panel/sections/Personal/featuresSettings/PrivacySettings.js

import React from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import { COLORS } from '../../../../shared/config/generalUtils';

function PrivacySettings({ 
  privacySettings, 
  handlePrivacyChange,
  preferencesLoading,
  preferencesError,
  clearPreferencesStatus 
}) {
  return (
    <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PrivacyTipIcon sx={{ color: COLORS.tertiary, mr: 1.5 }} />
          <Typography variant="h6" sx={{ color: COLORS.tertiary }}>
            Privacy & Visibility
          </Typography>
          {preferencesLoading && (
            <CircularProgress size={16} sx={{ ml: 1, color: COLORS.tertiary }} />
          )}
        </Box>

        <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 3 }}>
          Control what information is visible to other users. Settings are saved automatically.
        </Typography>

        {preferencesError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearPreferencesStatus}>
            {preferencesError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <FormControlLabel
            control={
              <Switch
                checked={privacySettings.showEmail}
                onChange={handlePrivacyChange('showEmail')}
                color="primary"
                disabled={preferencesLoading}
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ color: COLORS.texts.primary }}>
                  Show email address in profile
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.texts.muted, fontSize: '0.8rem' }}>
                  When disabled, your email will not appear in your profile at all
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={privacySettings.profileVisible}
                onChange={handlePrivacyChange('profileVisible')}
                color="primary"
                disabled={preferencesLoading}
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ color: COLORS.texts.primary }}>
                  Public profile visibility
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.texts.muted, fontSize: '0.8rem' }}>
                  Allow other users to view your profile information
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch
                checked={privacySettings.allowCitySharing}
                onChange={handlePrivacyChange('allowCitySharing')}
                color="primary"
                disabled={preferencesLoading}
              />
            }
            label={
              <Box>
                <Typography variant="body1" sx={{ color: COLORS.texts.primary }}>
                  Share liked cities publicly
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.texts.muted, fontSize: '0.8rem' }}>
                  Show your liked cities in public recommendations and explore features
                </Typography>
              </Box>
            }
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default PrivacySettings;