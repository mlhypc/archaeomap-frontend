// archaeomap-frontend/src/panel/sections/Personal/featuresSettings/GoogleAccountSettings.js

import React from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { COLORS } from '../../../../shared/config/generalUtils';

function GoogleAccountSettings({
  user,
  unlinkDialogOpen,
  setUnlinkDialogOpen,
  unlinkLoading,
  unlinkError,
  handleGoogleUnlink,
  handleUnlinkDialogClose
}) {
  if (!user?.googleId) {
    return null;
  }

  return (
    <>
      <Card elevation={1} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <GoogleIcon sx={{ color: '#4285f4', mr: 1.5 }} />
            <Typography variant="h6" sx={{ color: '#4285f4' }}>
              Google Account
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 3 }}>
            Your account is connected to Google for easy sign-in
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 2.5,
            bgcolor: 'rgba(66, 133, 244, 0.08)',
            borderRadius: 2,
            border: '1px solid rgba(66, 133, 244, 0.2)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GoogleIcon sx={{ color: '#4285f4', mr: 1.5, fontSize: '1.8rem' }} />
              <Box>
                <Typography variant="body1" sx={{ color: COLORS.texts.primary, fontWeight: 500 }}>
                  Connected to Google
                </Typography>
                <Typography variant="body2" sx={{ color: COLORS.texts.secondary, fontSize: '0.85rem' }}>
                  {user?.email || 'Google account linked'}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<LinkOffIcon />}
              onClick={() => setUnlinkDialogOpen(true)}
              sx={{
                borderColor: '#dc3545',
                color: '#dc3545',
                fontSize: '0.8rem',
                px: 2.5,
                '&:hover': {
                  borderColor: '#c82333',
                  backgroundColor: 'rgba(220, 53, 69, 0.04)'
                }
              }}
            >
              Unlink
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Google Unlink Confirmation Dialog */}
      <Dialog
        open={unlinkDialogOpen}
        onClose={handleUnlinkDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.texts.primary,
          fontFamily: 'Georgia, serif',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LinkOffIcon sx={{ color: '#dc3545', mr: 1.5 }} />
            Unlink Google Account
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body1" sx={{ color: COLORS.texts.primary, mb: 2 }}>
            Are you sure you want to unlink your Google account?
          </Typography>

          <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 2 }}>
            After unlinking, you will:
          </Typography>

          <Box component="ul" sx={{ 
            m: 0, 
            pl: 2, 
            color: COLORS.texts.secondary,
            '& li': { mb: 0.5, fontSize: '0.9rem' }
          }}>
            <li>No longer be able to sign in with Google</li>
            <li>Need to use your email and password to log in</li>
            <li>Still have access to all your data and preferences</li>
          </Box>

          {unlinkError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {unlinkError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleUnlinkDialogClose}
            sx={{ color: COLORS.texts.secondary }}
            disabled={unlinkLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleGoogleUnlink}
            variant="contained"
            disabled={unlinkLoading}
            sx={{
              backgroundColor: '#dc3545',
              '&:hover': { backgroundColor: '#c82333' },
              minWidth: 120
            }}
          >
            {unlinkLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Unlink Account'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default GoogleAccountSettings;