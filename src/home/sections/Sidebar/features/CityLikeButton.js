// archaeomap-frontend/src/home/sections/Sidebar/features/UserInteractions.js

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Snackbar, Alert, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { COLORS } from '../../../../shared/config/generalUtils';
import { likeApi } from '../../../../shared/services/userInteractionsApi';
import { useAuth } from '../../../../shared/contexts/AuthContext';

function UserInteractions({ cityId }) {
  const [likeStatus, setLikeStatus] = useState({ liked: false, likesCount: 0 });
  const [likeLoading, setLikeLoading] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [likeAnimation, setLikeAnimation] = useState(false);
  const lastClickTime = useRef(0);
  const { isAuthenticated } = useAuth();

  // Load like status when city changes
  useEffect(() => {
    if (cityId) {
      fetchLikeStatus();
    }
  }, [cityId]);

  const fetchLikeStatus = async () => {
    try {
      const result = await likeApi.getCityLikeStatus(cityId);
      if (result.success) {
        setLikeStatus({
          liked: result.data.liked,
          likesCount: result.data.likesCount
        });
      }
    } catch (error) {
      console.error('Failed to fetch like status:', error);
    }
  };

  // Format large numbers (1.2K, 1.2M, etc.)
  const formatLikeCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return count.toLocaleString();
  };

  const handleLikeToggle = async () => {
    // Double-click protection (throttle to 500ms)
    const now = Date.now();
    if (now - lastClickTime.current < 500) return;
    lastClickTime.current = now;

    // Check authentication first
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }

    if (!cityId || likeLoading) return;
    
    setLikeLoading(true);
    setErrorMessage(''); // Clear previous errors
    
    try {
      const result = await likeApi.toggleCityLike(cityId);
      if (result.success) {
        const wasLiked = likeStatus.liked;
        setLikeStatus({
          liked: result.data.liked,
          likesCount: result.data.likesCount
        });
        
        // Trigger animation only when liking (not unliking)
        if (!wasLiked && result.data.liked) {
          setLikeAnimation(true);
          setTimeout(() => setLikeAnimation(false), 300);
        }
      } else {
        if (result.needsAuth) {
          setLoginPromptOpen(true);
        } else {
          setErrorMessage(result.error || 'Failed to update like status');
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCloseLoginPrompt = () => {
    setLoginPromptOpen(false);
  };

  const handleCloseError = () => {
    setErrorMessage('');
  };

  return (
    <>
      {/* Like Button */}
      <Box
        onClick={handleLikeToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: likeLoading ? 'default' : 'pointer',
          padding: '4px 8px',
          borderRadius: '16px',
          backgroundColor: likeStatus.liked 
            ? `${COLORS.primary}15` 
            : 'transparent',
          border: `1px solid ${likeStatus.liked ? COLORS.primary : COLORS.border}`,
          transition: 'all 0.2s ease',
          width: 'fit-content',
          opacity: likeLoading ? 0.6 : 1,
          '&:hover': {
            backgroundColor: likeStatus.liked 
              ? `${COLORS.primary}25` 
              : `${COLORS.primary}10`,
            borderColor: COLORS.primary,
            transform: 'scale(1.02)'
          }
        }}
      >
        {likeStatus.liked ? (
          <FavoriteIcon sx={{ 
            fontSize: '1rem', 
            color: COLORS.primary,
            transition: 'all 0.2s ease',
            transform: likeAnimation ? 'scale(1.3)' : 'scale(1)',
            animation: likeAnimation ? 'pulse 0.3s ease' : 'none',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.3)' },
              '100%': { transform: 'scale(1)' }
            }
          }} />
        ) : (
          <FavoriteBorderIcon sx={{ 
            fontSize: '1rem', 
            color: COLORS.texts.secondary,
            transition: 'all 0.2s ease'
          }} />
        )}
        
        <Typography sx={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: likeStatus.liked ? COLORS.primary : COLORS.texts.secondary,
          transition: 'all 0.2s ease'
        }}>
          Like
        </Typography>
        
        <Typography sx={{
          fontSize: '0.8rem',
          color: COLORS.texts.muted,
          fontWeight: 400
        }}>
          ({formatLikeCount(likeStatus.likesCount)})
        </Typography>
      </Box>

      {/* Login Prompt Snackbar */}
      <Snackbar
        open={loginPromptOpen}
        autoHideDuration={6000}
        onClose={handleCloseLoginPrompt}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseLoginPrompt} 
          severity="info" 
          sx={{ 
            width: '100%',
            bgcolor: COLORS.background,
            border: `1px solid ${COLORS.primary}`,
            '& .MuiAlert-icon': {
              color: COLORS.primary
            }
          }}
          action={
            <Button 
              color="primary" 
              size="small"
              onClick={handleCloseLoginPrompt}
              sx={{ 
                color: COLORS.primary,
                fontWeight: 500
              }}
            >
              Got it
            </Button>
          }
        >
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.texts.primary }}>
            Please log in to like cities and save your favorites!
          </Typography>
        </Alert>
      </Snackbar>

      {/* Error Message Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%',
            bgcolor: COLORS.background,
            border: `1px solid ${COLORS.error}`,
            '& .MuiAlert-icon': {
              color: COLORS.error
            }
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.texts.primary }}>
            {errorMessage}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}

export default UserInteractions;