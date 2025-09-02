// frontend\src\components\map\Sidebar.js - MODE PROP VERSION

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  useMediaQuery,
  Collapse,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { COLORS, formatYear, truncateText, getCurrentCityName, hexToRgb } from '../../../shared/config/generalUtils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { cachedCitiesApi } from '../../../shared/services/cityApi';

function Sidebar({
  selectedCity,
  currentYear,
  hideTitle = true,
  mode = 'city' // Yeni prop: 'city' | 'info'
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');

  // State management
  const [controlHistoryOpen, setControlHistoryOpen] = useState(false);
  const [landmarksOpen, setLandmarksOpen] = useState(false);
  const [cityDetails, setCityDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageCredit, setImageCredit] = useState(null);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const imageCreditAbortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
      if (imageCreditAbortControllerRef.current) imageCreditAbortControllerRef.current.abort();
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

  // Load image credits (only in city mode)
  useEffect(() => {
    if (mode !== 'city') return;

    const loadImageCredits = async () => {
      if (imageCreditAbortControllerRef.current) {
        imageCreditAbortControllerRef.current.abort();
      }

      if (cityDetails?.id && isMountedRef.current) {
        setImageLoaded(false);
        setImageCredit(null);

        imageCreditAbortControllerRef.current = new AbortController();

        try {
          const response = await fetch('/images/city/image_credit.json', {
            signal: imageCreditAbortControllerRef.current.signal
          });

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

          const data = await response.json();

          if (isMountedRef.current && !imageCreditAbortControllerRef.current.signal.aborted) {
            const imageName = `${cityDetails.id}.jpg`;
            if (data[imageName]) {
              setImageCredit(data[imageName]);
            }
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            console.error('Error loading image credits:', error);
          }
        }
      }
    };

    loadImageCredits();
  }, [cityDetails, mode]);

  const handleImageLoad = useCallback(() => {
    if (isMountedRef.current) setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    if (isMountedRef.current) setImageLoaded(false);
  }, []);

  // Common responsive styles
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

  // INFO MODE CONTENT - Same as desktop empty state
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
          © {new Date().getFullYear()} ArchaeoMap —{' '}
          <a href="/about.html" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: 'underline', marginLeft: '4px' }}>
            About
          </a>
        </Box>
      </Box>
    );
  }

  // CITY MODE CONTENT - Original logic with slight modifications

  // Loading state
  if (selectedCity && loading && !cityDetails) {
    return (
      <Box sx={containerSx}>
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

        <Box variant="centerLoading">
          <CircularProgress size={40} sx={{ color: COLORS.primary }} />
          <Typography variant="muted" sx={{ mt: 2 }}>
            Loading city details...
          </Typography>
        </Box>

        <Box sx={footerSx}>
          © {new Date().getFullYear()} ArchaeoMap —{' '}
          <a href="/about.html" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: 'underline', marginLeft: '4px' }}>
            About
          </a>
        </Box>
      </Box>
    );
  }

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

      {cityDetails ? (
        <Box sx={{ flex: 1 }}>
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Typography variant="cityName" sx={{ fontSize: { xs: isSmallMobile ? '1.3rem' : undefined } }}>
            {getCurrentCityName(cityDetails, currentYear)}
          </Typography>

          <Typography variant="subtitle2" sx={{ mt: 0.5, color: COLORS.texts.secondary, fontSize: { xs: isSmallMobile ? '0.7rem' : undefined } }}>
            {cityDetails.country}
          </Typography>

          {/* City Image */}
          {cityDetails.id && (
            <Box sx={{ position: 'relative' }}>
              <Box sx={{
                width: '100%',
                height: '120px',
                mt: 1,
                mb: imageCredit ? 0 : 1,
                borderRadius: '8px',
                overflow: 'hidden',
                display: imageLoaded ? 'block' : 'none'
              }}>
                <img
                  src={`/images/city/${cityDetails.id}.jpg`}
                  alt={`${cityDetails.name}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </Box>

              {imageLoaded && imageCredit && (
                <Box sx={{ width: '100%', textAlign: 'right', mb: 1, mt: -1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: COLORS.texts.muted, fontStyle: 'italic' }}>
                    Photo by{' '}
                    <a href={`https://unsplash.com/@${imageCredit}`} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.secondary, textDecoration: 'none' }}>
                      {imageCredit}
                    </a>
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Dates Box */}
          <Paper variant="datesBox" sx={{ mt: { xs: 1.5, md: 2 } }}>
            <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(76, 120, 137, 0.08)' }}>
              <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS.primary, mr: 1.5 }} />
              <Typography variant="body2" sx={{ fontSize: { xs: isSmallMobile ? '0.75rem' : '0.85rem' }, fontWeight: 500, color: COLORS.texts.primary }}>
                Founded: <span style={{ fontFamily: 'Georgia, serif', color: COLORS.primary }}>{formatYear(cityDetails.founded)}</span>
              </Typography>
            </Box>

            {cityDetails.endDate && (
              <>
                <Box sx={{ p: 1.5, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(180, 0, 0, 0.08)', borderTop: `1px solid ${COLORS.border}` }}>
                  <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(180, 0, 0, 0.8)', mr: 1.5 }} />
                  <Typography variant="body2" sx={{ fontSize: { xs: isSmallMobile ? '0.75rem' : '0.85rem' }, fontWeight: 500, color: COLORS.texts.primary }}>
                    Ended: <span style={{ fontFamily: 'Georgia, serif', color: 'rgba(180, 0, 0, 0.8)' }}>{formatYear(cityDetails.endDate)}</span>
                  </Typography>
                </Box>

                <Box sx={{ backgroundColor: 'rgba(240, 240, 235, 0.4)', borderTop: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ fontSize: { xs: isSmallMobile ? '0.65rem' : '0.7rem' }, lineHeight: 3.0, fontStyle: 'italic', color: COLORS.texts.secondary }}>
                    Existed for {Math.abs(cityDetails.endDate - cityDetails.founded)} years
                  </Typography>
                </Box>
              </>
            )}
          </Paper>

          {/* Description */}
          <Typography variant="body1" sx={{
            mt: { xs: 1.5, md: 2 },
            color: COLORS.texts.secondary,
            lineHeight: 1.5,
            fontSize: { xs: isSmallMobile ? '0.65rem' : '0.9rem' }
          }}>
            {cityDetails.description ? (
              isLandscape && isMobile
                ? truncateText(cityDetails.description, 120)
                : cityDetails.description
            ) : (
              'No description available for this city.'
            )}
          </Typography>

{/* Clean Control History - İyileştirilmiş Renk Paleti */}
          {cityDetails.controlHistory && cityDetails.controlHistory.length > 0 && (
            <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
              {/* Header */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                p: 1.5,
                backgroundColor: controlHistoryOpen
                  ? `rgba(${hexToRgb(COLORS.primary)}, 0.12)`
                  : `rgba(${hexToRgb(COLORS.primary)}, 0.08)`,
                borderRadius: '6px',
                mb: 2,
                border: `1px solid ${COLORS.border}`,
                '&:hover': {
                  backgroundColor: `rgba(${hexToRgb(COLORS.primary)}, 0.14)`
                }
              }} onClick={() => setControlHistoryOpen(!controlHistoryOpen)}>
                <Typography variant="h6" sx={{
                  fontSize: { xs: isSmallMobile ? '0.95rem' : '1.05rem' },
                  color: COLORS.texts.primary,
                  fontWeight: 600
                }}>
                  Historical Control
                </Typography>

                <IconButton size="small" sx={{ color: COLORS.texts.secondary }}>
                  {controlHistoryOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={controlHistoryOpen} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 0 }}>
                  {/* Timeline - GeneralUtils timeline colors kullanılıyor */}
                  <Box sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '12px',
                      top: '0',
                      bottom: '0',
                      width: '2px',
                      backgroundColor: COLORS.timeline.line, // Timeline'a özel renk
                      borderRadius: '1px'
                    }
                  }}>
                    {cityDetails.controlHistory.map((control, index) => (
                      <Box key={index} sx={{
                        position: 'relative',
                        mb: 2.5,
                        pl: 3
                      }}>
                        {/* Timeline dot - GeneralUtils'den timeline dot color */}
                        <Box sx={{
                          position: 'absolute',
                          left: '4px',
                          top: '6px',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: COLORS.timeline.dotPrimary, // Timeline dot primary
                          border: `2px solid ${COLORS.background}`, // Background rengi
                          boxShadow: `0 0 0 2px ${COLORS.border}`
                        }} />

                        {/* Content Card */}
                        <Box sx={{
                          backgroundColor: `${COLORS.background}cc`, // Background + alpha
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: '4px',
                          p: 1.5
                        }}>
                          {/* Period and duration */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="timestamp" sx={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: COLORS.secondary
                            }}>
                              {formatYear(control.startYear)} - {control.endYear ? formatYear(control.endYear) : 'Present'}
                            </Typography>
                            <Typography variant="caption" sx={{
                              fontSize: '0.7rem',
                              color: COLORS.texts.muted,
                              backgroundColor: `${COLORS.primary}20`, // Primary color + alpha
                              px: 0.8,
                              py: 0.2,
                              borderRadius: '10px'
                            }}>
                              {control.endYear
                                ? `${Math.abs(control.endYear - control.startYear)} years`
                                : `${Math.abs(new Date().getFullYear() - control.startYear)} years`
                              }
                            </Typography>
                          </Box>

                          {/* Ruler */}
                          <Typography variant="ruler" sx={{
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            color: COLORS.texts.primary,
                            mb: 0.5
                          }}>
                            {control.ruler}
                          </Typography>

                          {/* Historical name if different */}
                          {control.historical_city_name && control.historical_city_name !== cityDetails.name && (
                            <Typography sx={{
                              fontSize: '0.75rem',
                              color: COLORS.primary,
                              fontStyle: 'italic',
                              mb: 0.5
                            }}>
                              Known as: {control.historical_city_name}
                            </Typography>
                          )}

                          {/* Description */}
                          {!isMobile && control.description && (
                            <Typography variant="body2" sx={{
                              fontSize: '0.8rem',
                              color: COLORS.texts.secondary,
                              lineHeight: 1.4,
                              mt: 0.5
                            }}>
                              {truncateText(control.description, 280)}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Consistent Landmarks - İyileştirilmiş Renk Paleti */}
          {cityDetails.landmarksHistory && cityDetails.landmarksHistory.length > 0 && (
            <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
              {/* Header */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                p: 1.5,
                backgroundColor: landmarksOpen
                  ? `rgba(${hexToRgb(COLORS.secondary)}, 0.12)`
                  : `rgba(${hexToRgb(COLORS.secondary)}, 0.08)`,
                borderRadius: '6px',
                mb: 2,
                border: `1px solid ${COLORS.border}`,
                '&:hover': {
                  backgroundColor: `rgba(${hexToRgb(COLORS.secondary)}, 0.14)`
                }
              }} onClick={() => setLandmarksOpen(!landmarksOpen)}>
                <Typography variant="h6" sx={{
                  fontSize: { xs: isSmallMobile ? '0.95rem' : '1.05rem' },
                  color: COLORS.texts.primary,
                  fontWeight: 600
                }}>
                  Historical Landmarks
                </Typography>

                <IconButton size="small" sx={{ color: COLORS.texts.secondary }}>
                  {landmarksOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={landmarksOpen} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 0 }}>
                  {/* Timeline */}
                  <Box sx={{
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: '12px',
                      top: '0',
                      bottom: '0',
                      width: '2px',
                      backgroundColor: COLORS.timeline.line, // Aynı timeline line color
                      borderRadius: '1px'
                    }
                  }}>
                    {cityDetails.landmarksHistory
                      .sort((a, b) => a.constructionDate - b.constructionDate)
                      .map((landmark, index) => (
                        <Box key={index} sx={{
                          position: 'relative',
                          mb: 2.5,
                          pl: 3
                        }}>
                          {/* Timeline dot - Secondary dot color for landmarks */}
                          <Box sx={{
                            position: 'absolute',
                            left: '4px',
                            top: '6px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: COLORS.timeline.dotSecondary, // Timeline dot secondary 
                            border: `2px solid ${COLORS.background}`,
                            boxShadow: `0 0 0 2px ${COLORS.border}`
                          }} />

                          {/* Content card */}
                          <Box sx={{
                            backgroundColor: `${COLORS.background}cc`, // Background + alpha
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: '4px',
                            p: 1.5
                          }}>
                            {/* Construction date */}
                            <Typography variant="timestamp" sx={{
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              color: COLORS.secondary,
                              mb: 0.5
                            }}>
                              Built: {formatYear(landmark.constructionDate)}
                            </Typography>

                            {/* Landmark name */}
                            <Typography sx={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: COLORS.texts.primary,
                              mb: 0.5
                            }}>
                              {landmark.landmark_name}
                            </Typography>

                            {/* Purpose */}
                            {landmark.purpose && (
                              <Typography sx={{
                                fontSize: '0.75rem',
                                color: COLORS.primary,
                                fontStyle: 'italic',
                                mb: 0.5
                              }}>
                                Purpose: {landmark.purpose}
                              </Typography>
                            )}

                            {/* Description */}
                            {landmark.description && !isMobile && (
                              <Typography variant="body2" sx={{
                                fontSize: '0.8rem',
                                color: COLORS.texts.secondary,
                                lineHeight: 1.4,
                                mt: 0.5
                              }}>
                                {truncateText(landmark.description, 200)}
                              </Typography>
                            )}

                            {/* Significance */}
                            {landmark.significance && !isMobile && (
                              <Typography sx={{
                                fontSize: '0.75rem',
                                color: COLORS.texts.muted,
                                mt: 0.8,
                                pt: 0.8,
                                borderTop: `1px solid ${COLORS.border}`,
                                fontStyle: 'italic'
                              }}>
                                {landmark.significance}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          )}
        </Box>
      ) : (
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

      <Box sx={footerSx}>
        © {new Date().getFullYear()} ArchaeoMap —{' '}
        <a href="/about.html" target="_blank" rel="noopener noreferrer" style={{ color: COLORS.primary, textDecoration: 'underline', marginLeft: '4px' }}>
          About
        </a>
      </Box>
    </Box>
  );
}

export default Sidebar;