// archaeomap-frontend/src/panel/sections/Personal/featuresSettings/NotificationSettings.js

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { COLORS } from '../../../../shared/config/generalUtils';

function NotificationSettings({ userSettings, handleSettingsChange }) {
  return (
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
                disabled
              />
            }
            label="Email notifications for important updates"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default NotificationSettings;