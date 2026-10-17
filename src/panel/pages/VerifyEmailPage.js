// archaeomap-frontend/src/panel/pages/VerifyEmailPage.js
//
// Landing page of the verification email: /verify-email#token=<64 hex>. The token comes in the fragment
// (never sent to a server by the browser), is wiped from the address bar at once and posted to the API.
// A signed-in user's profile is refreshed so the Verified badge shows without a reload.

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress, Container } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAuth } from '../../shared/contexts/AuthContext';
import { authService } from '../../shared/services/authApi';
import { COLORS } from '../../shared/config/generalUtils';

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { isAuthenticated, reloadUser } = useAuth();
  const [status, setStatus] = useState('working'); // 'working' | 'done' | 'failed'
  const [message, setMessage] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode runs effects twice; the token is single use
    ran.current = true;

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hash.get('token') || new URLSearchParams(window.location.search).get('token');
    window.history.replaceState(null, '', window.location.pathname);

    if (!token) {
      setStatus('failed');
      setMessage('This link is incomplete. Open the link from the email again, or request a new one from your profile.');
      return;
    }

    authService.verifyEmail(token).then((result) => {
      setStatus(result.success ? 'done' : 'failed');
      setMessage(result.success ? result.message : result.error);
    });
  }, []);

  // Once verified, refresh the signed-in user (isAuthenticated may turn true after the page mounts)
  useEffect(() => {
    if (status === 'done' && isAuthenticated) reloadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isAuthenticated]);

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', py: 4 }}>
      <Paper elevation={0} sx={{ width: '100%', p: { xs: 3, sm: 5 }, textAlign: 'center', border: `1px solid ${COLORS.border}`, borderRadius: 3 }}>
        <Typography sx={{ fontFamily: 'Georgia, serif', color: COLORS.primary, fontSize: '1.6rem', mb: 3 }}>
          ArchaeoMap
        </Typography>

        {status === 'working' && (
          <Box>
            <CircularProgress size={40} sx={{ color: COLORS.primary }} />
            <Typography sx={{ mt: 2, color: COLORS.texts.secondary }}>Verifying your email...</Typography>
          </Box>
        )}

        {status !== 'working' && (
          <Box>
            {status === 'done'
              ? <CheckCircleIcon sx={{ fontSize: 56, color: '#4CAF50' }} />
              : <ErrorOutlineIcon sx={{ fontSize: 56, color: COLORS.primary }} />}
            <Typography variant="h6" sx={{ mt: 1.5, mb: 1, color: COLORS.texts.primary }}>
              {status === 'done' ? 'Email verified' : 'Could not verify'}
            </Typography>
            <Typography sx={{ color: COLORS.texts.secondary, mb: 3 }}>{message}</Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="contained" disableElevation onClick={() => navigate('/', { replace: true })}
                sx={{ backgroundColor: COLORS.primary, '&:hover': { backgroundColor: COLORS.secondary } }}>
                Go to the map
              </Button>
              <Button variant="outlined" onClick={() => navigate('/panel', { replace: true })}
                sx={{ color: COLORS.primary, borderColor: COLORS.border }}>
                {status === 'done' ? 'Open my profile' : 'Sign in'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

export default VerifyEmailPage;
