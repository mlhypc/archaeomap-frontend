// archaeomap-frontend/src/home/sections/Sidebar/features/CityDetails.js

import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  useMediaQuery,
  Collapse,
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { COLORS, formatYear, truncateText, getCurrentCityName, hexToRgb } from '../../../../shared/config/generalUtils';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadIcon from '@mui/icons-material/Download';
import CityLikeButton from './CityLikeButton';
import CityAddCollectionButton from './CityAddCollectionButton';
import { citiesApi } from '../../../../shared/services/cityApi';

function CityDetails({ cityDetails, currentYear }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');

  // Local state for collapsible sections
  const [controlHistoryOpen, setControlHistoryOpen] = useState(false);
  const [landmarksOpen, setLandmarksOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageCredit, setImageCredit] = useState(null);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(false);
  }, []);

  // Set image credit from backend data
  React.useEffect(() => {
    if (cityDetails?.image_credit) {
      setImageCredit(cityDetails.image_credit);
    } else {
      setImageCredit(null);
    }
  }, [cityDetails?.image_credit]);

  if (!cityDetails) return null;

  return (
    <Box sx={{ flex: 1 }}>
      {/* City Header */}
      <Typography variant="cityName" sx={{ fontSize: { xs: isSmallMobile ? '1.3rem' : undefined } }}>
        {getCurrentCityName(cityDetails, currentYear)}
      </Typography>

      <Typography variant="subtitle2" sx={{ 
        mt: 0.5, 
        color: COLORS.texts.secondary, 
        fontSize: { xs: isSmallMobile ? '0.7rem' : '0.85rem' }
      }}>
        {cityDetails.country}
      </Typography>

      {/* City Actions */}
      <Box sx={{
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
        alignItems: 'center',
        mt: 1
      }}>
        <CityLikeButton cityId={cityDetails.id} />
        <CityAddCollectionButton cityId={cityDetails.id} />
        <Box
          onClick={() => citiesApi.exportCity(cityDetails.id, cityDetails.name)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '16px',
            border: `1px solid ${COLORS.border}`,
            transition: 'all 0.2s ease',
            width: 'fit-content',
            '&:hover': {
              backgroundColor: `${COLORS.primary}10`,
              borderColor: COLORS.primary,
              transform: 'scale(1.02)'
            }
          }}
        >
          <DownloadIcon sx={{ fontSize: '1rem', color: COLORS.texts.secondary }} />
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: COLORS.texts.secondary }}>
            JSON
          </Typography>
        </Box>
      </Box>

      {/* City Image */}
      {cityDetails.image_url && (
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
              src={`${(process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '')}${cityDetails.image_url}`}
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
                {cityDetails.image_credit_link ? (
                  <a href={cityDetails.image_credit_link} target="_blank" rel="noopener noreferrer" style={{ color: COLORS.secondary, textDecoration: 'none' }}>
                    {imageCredit}
                  </a>
                ) : (
                  <span style={{ color: COLORS.secondary }}>{imageCredit}</span>
                )}
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

      {/* Control History */}
      {cityDetails.controlHistory && cityDetails.controlHistory.length > 0 && (
        <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
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
              <Box sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '12px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  backgroundColor: COLORS.timeline.line,
                  borderRadius: '1px'
                }
              }}>
                {cityDetails.controlHistory.map((control, index) => (
                  <Box key={index} sx={{
                    position: 'relative',
                    mb: 2.5,
                    pl: 3
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      left: '4px',
                      top: '6px',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: COLORS.timeline.dotPrimary,
                      border: `2px solid ${COLORS.background}`,
                      boxShadow: `0 0 0 2px ${COLORS.border}`
                    }} />

                    <Box sx={{
                      backgroundColor: `${COLORS.background}cc`,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      p: 1.5
                    }}>
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
                          backgroundColor: `${COLORS.primary}20`,
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

                      <Typography variant="ruler" sx={{
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        color: COLORS.texts.primary,
                        mb: 0.5
                      }}>
                        {control.ruler}
                      </Typography>

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

      {/* Landmarks History */}
      {cityDetails.landmarksHistory && cityDetails.landmarksHistory.length > 0 && (
        <Box sx={{ mt: { xs: 1.5, md: 2 } }}>
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
              <Box sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: '12px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  backgroundColor: COLORS.timeline.line,
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
                      <Box sx={{
                        position: 'absolute',
                        left: '4px',
                        top: '6px',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: COLORS.timeline.dotSecondary,
                        border: `2px solid ${COLORS.background}`,
                        boxShadow: `0 0 0 2px ${COLORS.border}`
                      }} />

                      <Box sx={{
                        backgroundColor: `${COLORS.background}cc`,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '4px',
                        p: 1.5
                      }}>
                        <Typography variant="timestamp" sx={{
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: COLORS.secondary,
                          mb: 0.5
                        }}>
                          Built: {formatYear(landmark.constructionDate)}
                        </Typography>

                        <Typography sx={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: COLORS.texts.primary,
                          mb: 0.5
                        }}>
                          {landmark.landmark_name}
                        </Typography>

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
  );
}

export default CityDetails;