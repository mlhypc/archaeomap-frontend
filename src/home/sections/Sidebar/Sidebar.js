// archaeomap-frontend/src/home/sections/Sidebar/Sidebar.js

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  useMediaQuery,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { COLORS } from '../../../shared/config/generalUtils';
import { cachedCitiesApi } from '../../../shared/services/cityApi';
import CityDetails from './features/CityDetails';

function Sidebar({
  selectedCity,
  currentYear,
  hideTitle = true,
  mode = 'city' // 'city' | 'info'
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');

  // State management
  const [cityDetails, setCityDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // Load city details (only in city mode)
  useEffect(() => {
    if (mode !== 'city') return;

    const loadCityDetails = async () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();

      if (!selectedCity) {
        if (isMountedRef.current) {
          setCityDetails(null);
          setError(null);
        }
        return;
      }

      // If city already has full details, use them
      if (selectedCity.description !== undefined || selectedCity.controlHistory) {
        if (isMountedRef.current) {
          setCityDetails(selectedCity);
          setError(null);
        }
        return;
      }

      abortControllerRef.current = new AbortController();

      if (isMountedRef.current) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await cachedCitiesApi.getCityDetails(selectedCity.id);

        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          if (result.success) {
            setCityDetails(result.data);
          } else {
            setError(result.error);
            setCityDetails(selectedCity);
          }
        }
      } catch (err) {
        if (isMountedRef.current && !abortControllerRef.current.signal.aborted) {
          console.error('Failed to load city details:', err);
          setError('Failed to load city details');
          setCityDetails(selectedCity);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    loadCityDetails();
  }, [selectedCity, mode]);

  // Responsive container styles
  const containerSx = {
    width: '100%',
    maxWidth: 'none',
    scrollbarGutter: 'stable',

    '&::-webkit-scrollbar': { width: '6px' },
    '&::-webkit-scrollbar-track': {
      background: COLORS.background,
      borderRadius: '3px'
    },
    '&::-webkit-scrollbar-thumb': {
      background: COLORS.border,
      borderRadius: '3px',
      '&:hover': { background: COLORS.secondary }
    },
    scrollbarWidth: 'thin',
    scrollbarColor: `${COLORS.border} ${COLORS.background}`,
    height: isLandscape && isMobile ? 'auto' : '100%',
    backgroundColor: COLORS.background,
    p: { xs: 2, sm: 2.5, md: 2 },
    overflowY: 'auto',
    boxSizing: 'border-box',
    borderRight: `1px solid ${COLORS.border}`,
    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column'
  };

  const titleSx = {
    fontFamily: 'Georgia, serif',
    color: COLORS.primary,
    mb: 0
  };

  const footerSx = {
    mt: { xs: isLandscape ? 2 : 4, md: 6 },
    pt: { xs: 1.5, md: 2 },
    pb: { xs: 2, md: 2.5 },
    marginTop: 'auto',
    textAlign: 'center',
    fontSize: { xs: isSmallMobile ? '0.65rem' : '0.75rem' },
    color: COLORS.texts.muted,
    fontFamily: 'Georgia, serif',
    borderTop: `1px solid ${COLORS.border}`
  };

  // INFO MODE - Empty state when no city selected
  if (mode === 'info') {
    return (
      <Box sx={containerSx}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box variant="emptyState">
            <Typography variant="muted" sx={{ fontSize: { xs: isSmallMobile ? '0.8rem' : undefined } }}>
              Select a city on the map to view details
            </Typography>
            <Paper variant="infoBox" sx={{ mt: { xs: 1.5, md: 2 } }}>
              <Typography variant="body2" sx={{ color: COLORS.secondary, fontSize: { xs: isSmallMobile ? '0.75rem' : undefined } }}>
                Explore historic cities from around the world. Discover their stories and cultural heritage.
              </Typography>
            </Paper>
          </Box>
        </Box>

        <Box sx={footerSx}>
          © {new Date().getFullYear()} ArchaeoMap –{' '}
          <a href="/about.html" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: 'underline', marginLeft: '4px' }}>
            About
          </a>
        </Box>
      </Box>
    );
  }

  // CITY MODE CONTENT
  return (
    <Box sx={containerSx} className="archaeo-scrollbar">
      {/* Title section - city mode */}
      {!hideTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 1.5, md: 2 } }}>
          <img
            src="/archaeomap_primary.svg"
            alt="ArchaeoMap Logo"
            style={{ marginRight: theme.spacing(2), height: isSmallMobile ? '20px' : '24px' }}
          />
          <Typography variant={isMobile ? (isSmallMobile ? "h5" : "h4") : "h4"} sx={titleSx}>
            ArchaeoMap
          </Typography>
        </Box>
      )}

      {/* Loading State */}
      {selectedCity && loading && !cityDetails && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={40} sx={{ color: COLORS.primary }} />
          <Typography variant="muted" sx={{ mt: 2 }}>
            Loading city details...
          </Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* City Content */}
      {cityDetails ? (
        <CityDetails cityDetails={cityDetails} currentYear={currentYear} />
      ) : !loading && (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box variant="emptyState">
            <Typography variant="muted" sx={{ fontSize: { xs: isSmallMobile ? '0.8rem' : undefined } }}>
              Select a city on the map to view details
            </Typography>
            <Paper variant="infoBox" sx={{ mt: { xs: 1.5, md: 2 } }}>
              <Typography variant="body2" sx={{ color: COLORS.secondary, fontSize: { xs: isSmallMobile ? '0.75rem' : undefined } }}>
                Explore historic cities from around the world. Discover their stories and cultural heritage.
              </Typography>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box sx={footerSx}>
        © {new Date().getFullYear()} ArchaeoMap –{' '}
        <a href="/about.html" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: 'underline', marginLeft: '4px' }}>
          About
        </a>
      </Box>
    </Box>
  );
}

export default Sidebar;