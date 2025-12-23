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
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { COLORS } from '../../../../shared/config/generalUtils';
import { likeApi } from '../../../../shared/services/userInteractionsApi';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { useCitySearch } from '../../../../shared/hooks/useCitySearch';

function LikedCities() {
  const [likedCities, setLikedCities] = useState([]);
  const [displayedCities, setDisplayedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { isAuthenticated } = useAuth();
  const { availableCities, loading: searchLoading, searchCities, clearSearch } = useCitySearch();

  useEffect(() => {
    if (isAuthenticated) {
      fetchLikedCities();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchLikedCities = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await likeApi.getUserLikedCities(page, 20, 'recent');
      
      if (result.success) {
        setLikedCities(result.data.likedCities);
        // Only update displayed cities if not currently searching
        if (!isSearching) {
          setDisplayedCities(result.data.likedCities);
        }
        setPagination(result.data.pagination);
      } else {
        if (result.needsAuth) {
          setError('Please log in to view your liked cities');
        } else {
          setError(result.error || 'Failed to load liked cities');
        }
      }
    } catch (err) {
      console.error('Failed to fetch liked cities:', err);
      setError('Failed to load liked cities');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (cityId, isCurrentlyLiked) => {
    try {
      const result = await likeApi.toggleCityLike(cityId);
      
      if (result.success) {
        if (isCurrentlyLiked) {
          // Remove from liked cities
          setLikedCities(prev => prev.filter(city => city.id !== cityId));
          if (isSearching) {
            // Update displayed cities - mark as not liked if it's from API results
            setDisplayedCities(prev => 
              prev.map(city => 
                city.id === cityId ? { ...city, isLiked: false } : city
              )
            );
          }
        } else {
          // Add to liked cities and update displayed cities immediately
          const cityToUpdate = displayedCities.find(city => city.id === cityId);
          if (cityToUpdate) {
            // Update the city in displayed cities to show as liked
            setDisplayedCities(prev => 
              prev.map(city => 
                city.id === cityId ? { ...city, isLiked: true, likedAt: new Date().toISOString() } : city
              )
            );
          }
          // Refresh liked cities in background for future searches
          fetchLikedCities();
        }
      } else {
        if (result.needsAuth) {
          setError('Please log in to like/unlike cities');
        } else {
          setError(result.error || 'Failed to like/unlike city');
        }
      }
    } catch (err) {
      console.error('Failed to like/unlike city:', err);
      setError('Failed to like/unlike city');
    }
  };

  // Hybrid search logic
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setDisplayedCities(likedCities);
      setIsSearching(false);
      clearSearch();
      return;
    }

    setIsSearching(true);
    
    // Filter liked cities first
    const filteredLikedCities = likedCities.filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase())
    ).map(city => ({ ...city, isLiked: true }));

    // Search all cities via API
    searchCities(query);
    
    // Show liked cities immediately
    setDisplayedCities(filteredLikedCities);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDisplayedCities(likedCities);
    setIsSearching(false);
    clearSearch();
  };

  // Combine liked cities with API results when search results arrive
  useEffect(() => {
    if (isSearching && availableCities.length > 0) {
      const likedCityIds = likedCities.map(city => city.id);
      
      // Filter liked cities based on search query
      const filteredLikedCities = likedCities.filter(city => 
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(city => ({ ...city, isLiked: true }));
      
      // Add API results that are not already liked
      const newCities = availableCities
        .filter(city => !likedCityIds.includes(city.id))
        .map(city => ({ 
          ...city, 
          name: city.generic_city_name || city.name,
          tier: city.tier || null,
          likes: city.likes || 0,
          likedAt: null,
          isLiked: false 
        }));
      
      // Combine: liked cities first, then new cities
      setDisplayedCities([...filteredLikedCities, ...newCities]);
    }
  }, [availableCities, isSearching, likedCities, searchQuery]);

  // Update displayed cities when liked cities change (only if not searching)
  useEffect(() => {
    if (!searchQuery && !isSearching) {
      setDisplayedCities(likedCities);
    }
  }, [likedCities, searchQuery, isSearching]);

  const formatDate = (dateString) => {
    if (!dateString) return 'recently';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'recently';
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'recently';
    }
  };

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <FavoriteIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 2 }} />
        <Typography variant="body1" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
          Please log in to view your liked cities
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
          Sign in to save and manage your favorite cities
        </Typography>
      </Box>
    );
  }

  // Loading state
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

  // Error state
  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <IconButton
            color="inherit"
            size="small"
            onClick={() => fetchLikedCities()}
          >
            <Typography variant="body2">Retry</Typography>
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Stats info */}
      <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mb: 2 }}>
        {likedCities.length} cities total
      </Typography>

      {/* Search Input */}
      {likedCities.length > 0 && (
        <TextField
          fullWidth
          size="small"
          placeholder="Search your liked cities..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {searchLoading && isSearching ? (
                  <CircularProgress size={16} sx={{ color: COLORS.primary }} />
                ) : (
                  <SearchIcon sx={{ color: COLORS.texts.muted }} />
                )}
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch}>
                  <ClearIcon sx={{ color: COLORS.texts.muted }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: COLORS.border,
              },
              '&:hover fieldset': {
                borderColor: COLORS.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: COLORS.primary,
              },
            },
          }}
        />
      )}

      {/* Results Info */}
      {searchQuery && (
        <Typography variant="body2" sx={{ mb: 2, color: COLORS.texts.secondary }}>
          {displayedCities.filter(city => city.isLiked).length} liked cities and {displayedCities.filter(city => !city.isLiked).length} new cities found for "{searchQuery}"
        </Typography>
      )}

      {displayedCities.length === 0 && !loading && !searchLoading ? (
        searchQuery ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SearchIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 2 }} />
            <Typography variant="body1" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
              No cities found matching "{searchQuery}"
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
              Try searching with different keywords
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FavoriteIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 2 }} />
            <Typography variant="body1" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
              No liked cities yet
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
              Explore the map and like cities to see them here!
            </Typography>
          </Box>
        )
      ) : (
        <Grid container spacing={2}>
          {displayedCities.map((city) => (
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
                      onClick={() => handleToggleLike(city.id, city.isLiked !== false)}
                      sx={{ color: city.isLiked !== false ? COLORS.error : COLORS.texts.muted }}
                      title={city.isLiked !== false ? "Unlike this city" : "Like this city"}
                    >
                      <FavoriteIcon 
                        fontSize="small" 
                        sx={{ 
                          color: city.isLiked !== false ? COLORS.error : COLORS.texts.muted,
                          '&:hover': {
                            color: COLORS.error
                          }
                        }}
                      />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                      {city.country}
                    </Typography>
                    {city.isLiked !== false && (
                      <Chip 
                        label="Already liked" 
                        size="small" 
                        sx={{ 
                          backgroundColor: COLORS.success + '20',
                          color: COLORS.success,
                          fontSize: '0.7rem',
                          height: '20px'
                        }} 
                      />
                    )}
                  </Box>

                  {city.founded && (
                    <Chip 
                      label={`Founded: ${city.founded < 0 ? `${Math.abs(city.founded)} BC` : `${city.founded} AD`}`}
                      size="small" 
                      sx={{ 
                        backgroundColor: COLORS.primary + '20',
                        color: COLORS.primary,
                        mb: 1,
                        mr: 1
                      }} 
                    />
                  )}

                  {city.tier && (
                    <Chip 
                      label={`Tier ${city.tier}`}
                      size="small" 
                      sx={{ 
                        backgroundColor: COLORS.secondary + '20',
                        color: COLORS.secondary,
                        mb: 1
                      }} 
                    />
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                      {city.likes} total likes
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                      {city.isLiked !== false ? `Liked ${formatDate(city.likedAt)}` : 'Not liked yet'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination for future use */}
      {pagination && pagination.total_pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
            Page {pagination.current_page} of {pagination.total_pages} 
            ({pagination.total_count} cities total)
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default LikedCities;