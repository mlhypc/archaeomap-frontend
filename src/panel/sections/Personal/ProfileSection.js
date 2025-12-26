// archaeomap-frontend/src/panel/sections/Personal/ProfileSection.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CardActionArea,
  CircularProgress
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { COLORS } from '../../../shared/config/generalUtils';
import { likeApi } from '../../../shared/services/userInteractionsApi';

// Import mevcut componentleri
import ProfileInfo from './featuresProfile/ProfileInfo';
import UserLikedCities from './featuresProfile/UserLikedCities';
import UserCityLists from './featuresProfile/UserCityLists';
import AuthenticationForm from './featuresProfile/AuthenticationForm';

function ProfileSection() {
  const [likedCitiesOpen, setLikedCitiesOpen] = useState(false);
  const [cityListsOpen, setCityListsOpen] = useState(false);
  const [stats, setStats] = useState({
    likedCitiesCount: 0,
    cityListsCount: 0,
    totalCitiesInLists: 0
  });
  const [statsLoading, setStatsLoading] = useState(false);
  
  const { isAuthenticated } = useAuth();

  // Stats yükleme - gerçek API ile
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      // Reset stats when user logs out
      setStats({
        likedCitiesCount: 0,
        cityListsCount: 0,
        totalCitiesInLists: 0
      });
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      
      // Get user stats from API
      const result = await likeApi.getUserStats();
      
      if (result.success) {
        setStats({
          likedCitiesCount: result.data.stats.totalLikedCities || 0,
          cityListsCount: result.data.stats.cityCollectionsCount || 0,
          totalCitiesInLists: result.data.stats.totalCitiesInCollections || 0
        });
      } else {
        console.error('Failed to fetch stats:', result.error);
        // Keep default stats on error
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default stats on error
    } finally {
      setStatsLoading(false);
    }
  };

  // Refresh stats when liked cities dialog closes (in case user unliked something)
  const handleLikedCitiesClose = () => {
    setLikedCitiesOpen(false);
    if (isAuthenticated) {
      fetchStats(); // Refresh stats after potential changes
    }
  };

  // Refresh stats when city collections dialog closes
  const handleCityListsClose = () => {
    setCityListsOpen(false);
    if (isAuthenticated) {
      fetchStats(); // Refresh stats after potential changes
    }
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ width: '100%', height: '100%', p: { xs: 2, md: 3 }, overflow: 'auto' }}>
        <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ 
              color: COLORS.primary,
              fontFamily: 'Georgia, serif',
              fontWeight: 'normal',
              fontSize: { xs: '1.75rem', md: '2.25rem' }
            }}>
              Profile
            </Typography>
          </Box>
          <AuthenticationForm />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%', p: { xs: 2, md: 3 }, overflow: 'auto' }}>
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ 
            color: COLORS.primary,
            fontFamily: 'Georgia, serif',
            fontWeight: 'normal',
            fontSize: { xs: '1.75rem', md: '2.25rem' }
          }}>
            Profile
          </Typography>
        </Box>

        {/* Ana Profil Kartı */}
        <Paper elevation={1} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
          <ProfileInfo />
        </Paper>

        {/* İstatistik Kartları */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {/* Beğenilen Şehirler Kartı */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Card 
              elevation={1} 
              sx={{ 
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
            >
              <CardActionArea onClick={() => setLikedCitiesOpen(true)}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FavoriteIcon sx={{ 
                      color: COLORS.primary, 
                      mr: 2, 
                      fontSize: '2rem',
                      p: 1,
                      bgcolor: `${COLORS.primary}15`,
                      borderRadius: 2
                    }} />
                    <Box>
                      {statsLoading ? (
                        <CircularProgress size={24} sx={{ color: COLORS.primary }} />
                      ) : (
                        <Typography variant="h4" sx={{ 
                          color: COLORS.texts.primary,
                          fontFamily: 'Georgia, serif',
                          fontWeight: 'bold'
                        }}>
                          {stats.likedCitiesCount}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                        Cities
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ 
                    color: COLORS.texts.primary,
                    mb: 1,
                    fontFamily: 'Georgia, serif'
                  }}>
                    Liked Cities
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                    Ancient cities you've marked as favorites
                  </Typography>
                  
                  <Typography
                    component="span"
                    sx={{ 
                      mt: 2,
                      color: COLORS.primary,
                      textTransform: 'none',
                      fontWeight: 500,
                      display: 'inline-block',
                      fontSize: '0.875rem'
                    }}
                  >
                    View All →
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>

          {/* Şehir Listeleri Kartı */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
            <Card 
              elevation={1} 
              sx={{ 
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                }
              }}
            >
              <CardActionArea onClick={() => setCityListsOpen(true)}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ListIcon sx={{ 
                      color: COLORS.secondary, 
                      mr: 2, 
                      fontSize: '2rem',
                      p: 1,
                      bgcolor: `${COLORS.secondary}15`,
                      borderRadius: 2
                    }} />
                    <Box>
                      {statsLoading ? (
                        <CircularProgress size={24} sx={{ color: COLORS.secondary }} />
                      ) : (
                        <Typography variant="h4" sx={{ 
                          color: COLORS.texts.primary,
                          fontFamily: 'Georgia, serif',
                          fontWeight: 'bold'
                        }}>
                          {stats.cityListsCount}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                        Collections
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="h6" sx={{ 
                    color: COLORS.texts.primary,
                    mb: 1,
                    fontFamily: 'Georgia, serif'
                  }}>
                    City Collections
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                    Custom lists of cities organized by theme
                  </Typography>
                  
                  <Typography
                    component="span"
                    sx={{ 
                      mt: 2,
                      color: COLORS.secondary,
                      textTransform: 'none',
                      fontWeight: 500,
                      display: 'inline-block',
                      fontSize: '0.875rem'
                    }}
                  >
                    View All →
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        </Box>

        {/* Beğenilen Şehirler Dialog */}
        <Dialog 
          open={likedCitiesOpen} 
          onClose={handleLikedCitiesClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, maxHeight: '80vh' }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            color: COLORS.primary,
            fontFamily: 'Georgia, serif',
            fontSize: '1.5rem'
          }}>
            Liked Cities
            <IconButton 
              onClick={handleLikedCitiesClose}
              size="small"
              sx={{ color: COLORS.texts.muted }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <UserLikedCities />
            </Box>
          </DialogContent>
        </Dialog>

        {/* Şehir Listeleri Dialog */}
        <Dialog 
          open={cityListsOpen} 
          onClose={handleCityListsClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3, maxHeight: '80vh' }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            color: COLORS.primary,
            fontFamily: 'Georgia, serif',
            fontSize: '1.5rem'
          }}>
            City Collections
            <IconButton 
              onClick={handleCityListsClose}
              size="small"
              sx={{ color: COLORS.texts.muted }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <UserCityLists />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default ProfileSection;