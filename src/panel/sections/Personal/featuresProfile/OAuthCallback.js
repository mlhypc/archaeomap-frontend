// archaeomap-frontend/src/panel/sections/Personal/featuresProfile/OAuthCallback.js

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { COLORS } from '../../../../shared/config/generalUtils';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [processed, setProcessed] = useState(false); // Prevent multiple processing

  useEffect(() => {
    if (processed) return; // Prevent multiple runs
    
    const handleOAuthCallback = async () => {
      try {
        setProcessed(true); // Mark as processed immediately
        
        // Get tokens from URL parameters
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          
          if (error === 'oauth_failed') {
            setErrorMessage('Google authentication failed. Please try again.');
          } else if (error === 'oauth_callback_failed') {
            setErrorMessage('Authentication callback failed. Please try again.');
          } else {
            setErrorMessage('Authentication failed. Please try again.');
          }
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        if (!token || !refreshToken) {
          console.error('Missing tokens in OAuth callback');
          setStatus('error');
          setErrorMessage('Authentication tokens missing. Please try again.');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Login with the received tokens
        const success = await loginWithToken(token, refreshToken);
        
        if (success) {
          setStatus('success');
          
          // Redirect to home after 1 second
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage('Failed to authenticate with received tokens.');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred during authentication.');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, loginWithToken, processed]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: COLORS.background,
      padding: 3
    }}>
      <Box sx={{
        backgroundColor: 'white',
        borderRadius: 3,
        padding: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        maxWidth: 400,
        width: '100%'
      }}>
        {status === 'processing' && (
          <>
            <CircularProgress 
              size={48} 
              sx={{ color: COLORS.primary, mb: 3 }} 
            />
            <Typography variant="h6" sx={{ 
              color: COLORS.texts.primary, 
              mb: 1 
            }}>
              Authenticating...
            </Typography>
            <Typography variant="body2" sx={{ 
              color: COLORS.texts.secondary 
            }}>
              Please wait while we sign you in with Google.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: '50%', 
              backgroundColor: COLORS.success, 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <Typography variant="h4" sx={{ color: 'white' }}>
                ✓
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ 
              color: COLORS.texts.primary, 
              mb: 1 
            }}>
              Welcome to ArchaeoMap!
            </Typography>
            <Typography variant="body2" sx={{ 
              color: COLORS.texts.secondary 
            }}>
              Successfully signed in with Google. Redirecting you to the app...
            </Typography>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              {errorMessage}
            </Alert>
            <Typography variant="body2" sx={{ 
              color: COLORS.texts.secondary 
            }}>
              You will be redirected to the login page in a few seconds...
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default OAuthCallback;