// archaeomap-frontend/src/panel/sections/Personal/featuresSettings/AppearanceSettings.js

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import { COLORS } from '../../../../shared/config/generalUtils';

function AppearanceSettings({ userSettings, handleSettingsChange }) {
  return (
    <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PaletteIcon sx={{ color: COLORS.primary, mr: 1.5 }} />
          <Typography variant="h6" sx={{ color: COLORS.primary }}>
            Appearance
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth disabled>
            <InputLabel>Theme</InputLabel>
            <Select
              value={userSettings.theme}
              label="Theme"
              onChange={handleSettingsChange('theme')}
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="auto">Auto (System)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth disabled>
            <InputLabel>Language</InputLabel>
            <Select
              value={userSettings.language}
              label="Language"
              onChange={handleSettingsChange('language')}
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
                disabled
              />
            }
            label="Show helpful tooltips"
          />
        </Box>
      </CardContent>
    </Card>
  );
}

export default AppearanceSettings;