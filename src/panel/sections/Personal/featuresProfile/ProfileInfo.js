// archaeomap-frontend/src/panel/sections/Personal/features/ProfileInfo.js

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Alert,
  Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { authService } from '../../../../shared/services/authApi';
import { COLORS } from '../../../../shared/config/generalUtils';

function ProfileInfo() {
  const { user } = useAuth();
  // Unverified email: a banner with a button that mails a new verification link
  const [verifySending, setVerifySending] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null); // { ok, text }
  const sendVerification = async () => {
    setVerifySending(true);
    const result = await authService.resendVerification();
    setVerifySending(false);
    setVerifyResult({ ok: result.success, text: result.success ? result.message : result.error });
  };

  // Email visibility comes directly from user preferences - no local state needed
  const emailVisible = user?.preferences?.showEmail ?? false;

  const formatMemberSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Stack spacing={3}>
      {/* Main Profile Header */}
      <Stack direction="row" spacing={{ xs: 2, sm: 3 }} alignItems="center">
        <Avatar
          src={user?.profileImageUrl || undefined}
          sx={{
            width: { xs: 64, sm: 80 },
            height: { xs: 64, sm: 80 },
            flexShrink: 0,
            bgcolor: COLORS.primary,
            fontSize: '2rem',
            fontFamily: 'Georgia, serif',
            fontWeight: 600
          }}
        >
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </Avatar>

        {/* minWidth 0 lets the text column shrink below its content (long names and emails wrap instead of
            pushing the page sideways on phones) */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            sx={{
              color: COLORS.texts.primary,
              fontFamily: 'Georgia, serif',
              fontWeight: 500,
              fontSize: { xs: '1.5rem', sm: undefined },
              overflowWrap: 'anywhere',
              mb: 0.5
            }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <BadgeIcon sx={{ fontSize: '1rem', color: COLORS.texts.muted }} />
            <Typography
              variant="body1"
              sx={{
                color: COLORS.texts.secondary,
                fontWeight: 500
              }}
            >
              @{user?.username}
            </Typography>
          </Stack>

          {/* Email section - only show if emailVisible is true */}
          {emailVisible && (
            <Stack direction="row" spacing={1} useFlexGap alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
              <EmailIcon sx={{ fontSize: '1rem', color: COLORS.texts.muted }} />
              <Typography variant="body1" sx={{ color: COLORS.texts.muted, minWidth: 0, overflowWrap: 'anywhere' }}>
                {user?.email}
              </Typography>

              {user?.emailVerified && (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: '0.8rem' }} />}
                  label="Verified"
                  size="small"
                  sx={{
                    height: 20,
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    color: '#4CAF50',
                    '& .MuiChip-icon': { color: '#4CAF50' }
                  }}
                />
              )}
            </Stack>
          )}
        </Box>
      </Stack>

      {/* Email not verified yet (email/password accounts; Google and Apple arrive verified) */}
      {user && !user.emailVerified && (
        <Alert
          severity={verifyResult?.ok ? 'success' : 'info'}
          action={!verifyResult?.ok && (
            <Button color="inherit" size="small" disabled={verifySending} onClick={sendVerification} sx={{ whiteSpace: 'nowrap' }}>
              {verifySending ? 'Sending...' : 'Send link'}
            </Button>
          )}
        >
          {verifyResult
            ? verifyResult.text
            : 'Your email address is not verified yet. We can send you a verification link.'}
        </Alert>
      )}

      {/* Additional Info */}
      <Stack direction="row" spacing={3} useFlexGap sx={{ pt: 2, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap', rowGap: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarTodayIcon sx={{ fontSize: '1.1rem', color: COLORS.primary }} />
          <Box>
            <Typography variant="body2" sx={{ color: COLORS.texts.muted, fontSize: '0.8rem' }}>
              Member since
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.texts.primary, fontWeight: 500 }}>
              {user?.createdAt ? formatMemberSince(user.createdAt) : 'Recently'}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <PersonIcon sx={{ fontSize: '1.1rem', color: COLORS.primary }} />
          <Box>
            <Typography variant="body2" sx={{ color: COLORS.texts.muted, fontSize: '0.8rem' }}>
              Role
            </Typography>
            <Typography variant="body1" sx={{ color: COLORS.texts.primary, fontWeight: 500 }}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'User'}
            </Typography>
          </Box>
        </Stack>

        {user?.lastLoginAt && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Box>
              <Typography variant="body2" sx={{ color: COLORS.texts.muted, fontSize: '0.8rem' }}>
                Last active
              </Typography>
              <Typography variant="body1" sx={{ color: COLORS.texts.primary, fontWeight: 500 }}>
                {new Date(user.lastLoginAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default ProfileInfo;