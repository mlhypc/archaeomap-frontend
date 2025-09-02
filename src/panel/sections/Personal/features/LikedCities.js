// archaeomap-frontend/src/panel/sections/Personal/features/LikedCities.js

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  IconButton,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { COLORS } from '../../../../shared/config/generalUtils';

function LikedCities() {
  const [likedCities, setLikedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLikedCities();
  }, []);

  const fetchLikedCities = async () => {
    try {
      setLoading(true);
      // TODO: API call to fetch user's liked cities
      // const response = await cityApi.getLikedCities();
      // setLikedCities(response.data);
      
      // Mock data for now
      setTimeout(() => {
        setLikedCities([
          { id: 1, name: 'Istanbul', period: 'Byzantine', likes: 1245 },
          { id: 2, name: 'Rome', period: 'Roman Empire', likes: 2103 },
          { id: 3, name: 'Athens', period: 'Classical', likes: 891 }
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load liked cities');
      setLoading(false);
    }
  };

  const handleUnlike = async (cityId) => {
    try {
      // TODO: API call to unlike city
      setLikedCities(prev => prev.filter(city => city.id !== cityId));
    } catch (err) {
      setError('Failed to unlike city');
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
        <Typography variant="body2" sx={{ mt: 2, color: COLORS.texts.secondary }}>
          Loading your liked cities...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
        Liked Cities ({likedCities.length})
      </Typography>

      {likedCities.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FavoriteIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 2 }} />
          <Typography variant="body1" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
            No liked cities yet
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
            Explore the map and like cities to see them here!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {likedCities.map((city) => (
            <Grid item xs={12} sm={6} key={city.id}>
              <Card elevation={0} sx={{ 
                border: `1px solid ${COLORS.border}`,
                '&:hover': { 
                  borderColor: COLORS.primary,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                }
              }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOnIcon sx={{ fontSize: 18, color: COLORS.primary, mr: 0.5 }} />
                      <Typography variant="h6" sx={{ color: COLORS.texts.primary }}>
                        {city.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      size="small" 
                      onClick={() => handleUnlike(city.id)}
                      sx={{ color: COLORS.error }}
                    >
                      <FavoriteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Chip 
                    label={city.period} 
                    size="small" 
                    sx={{ 
                      backgroundColor: COLORS.primary + '20',
                      color: COLORS.primary,
                      mb: 1
                    }} 
                  />
                  
                  <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                    {city.likes} total likes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default LikedCities;