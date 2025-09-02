// archaeomap-frontend/src/panel/sections/Personal/ProfileSection.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CardActionArea
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ListIcon from '@mui/icons-material/List';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { COLORS } from '../../../shared/config/generalUtils';

// Import mevcut componentleri
import ProfileInfo from './features/ProfileInfo';
import LikedCities from './features/LikedCities';
import CityLists from './features/CityLists';
import AuthenticationForm from './features/AuthenticationForm';

function ProfileSection() {
  const [likedCitiesOpen, setLikedCitiesOpen] = useState(false);
  const [cityListsOpen, setCityListsOpen] = useState(false);
  const [stats, setStats] = useState({
    likedCitiesCount: 0,
    cityListsCount: 0,
    totalCitiesInLists: 0
  });
  
  const { isAuthenticated } = useAuth();

  // Stats yükleme (gerçek API çağrıları ile değiştirilecek)
  useEffect(() => {
    if (isAuthenticated) {
      // TODO: API çağrıları ile gerçek istatistikleri yükle
      setStats({
        likedCitiesCount: 12,
        cityListsCount: 3,
        totalCitiesInLists: 24
      });
    }
  }, [isAuthenticated]);

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
        <Grid container spacing={3}>
          {/* Beğenilen Şehirler Kartı */}
          <Grid item xs={12} md={6}>
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
                      <Typography variant="h4" sx={{ 
                        color: COLORS.texts.primary,
                        fontFamily: 'Georgia, serif',
                        fontWeight: 'bold'
                      }}>
                        {stats.likedCitiesCount}
                      </Typography>
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
          </Grid>

          {/* Şehir Listeleri Kartı */}
          <Grid item xs={12} md={6}>
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
                      <Typography variant="h4" sx={{ 
                        color: COLORS.texts.primary,
                        fontFamily: 'Georgia, serif',
                        fontWeight: 'bold'
                      }}>
                        {stats.cityListsCount}
                      </Typography>
                      <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                        Lists
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
                    Curated lists with {stats.totalCitiesInLists} cities total
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
                    Manage Lists →
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </Grid>

        {/* Beğenilen Şehirler Dialog */}
        <Dialog 
          open={likedCitiesOpen} 
          onClose={() => setLikedCitiesOpen(false)}
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
              onClick={() => setLikedCitiesOpen(false)}
              size="small"
              sx={{ color: COLORS.texts.muted }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <LikedCities />
            </Box>
          </DialogContent>
        </Dialog>

        {/* Şehir Listeleri Dialog */}
        <Dialog 
          open={cityListsOpen} 
          onClose={() => setCityListsOpen(false)}
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
              onClick={() => setCityListsOpen(false)}
              size="small"
              sx={{ color: COLORS.texts.muted }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 3 }}>
              <CityLists />
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

export default ProfileSection;