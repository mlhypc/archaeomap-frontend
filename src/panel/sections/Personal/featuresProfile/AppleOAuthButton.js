// archaeomap-frontend/src/panel/sections/Personal/featuresProfile/AppleOAuthButton.js
//
// "Sign in with Apple" in Apple's black style (Human Interface Guidelines: black button, white logo,
// "Sign in with Apple" / "Sign up with Apple"). AuthenticationForm shows it only when the backend reports
// Apple as configured (GET /api/auth/providers).

import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import AppleIcon from '@mui/icons-material/Apple';

function AppleOAuthButton({ type = 'login' }) {
  const handleAppleAuth = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiUrl}/auth/apple`;
  };

  return (
    <Button
      onClick={handleAppleAuth}
      fullWidth
      variant="contained"
      disableElevation
      sx={{
        py: 1.5,
        backgroundColor: '#000000',
        color: '#ffffff',
        textTransform: 'none',
        borderRadius: 2,
        border: '2px solid #000000',
        '&:hover': { backgroundColor: '#1c1c1e', borderColor: '#1c1c1e' },
        '&:active': { transform: 'translateY(1px)' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <AppleIcon sx={{ fontSize: '1.25rem', mr: 1, mt: '-2px', color: '#ffffff' }} />
        <Typography sx={{ fontSize: '0.95rem', fontWeight: 500, color: '#ffffff' }}>
          {type === 'login' ? 'Sign in with Apple' : 'Sign up with Apple'}
        </Typography>
      </Box>
    </Button>
  );
}

export default AppleOAuthButton;
