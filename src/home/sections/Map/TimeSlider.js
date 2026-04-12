// frontend\src\components\map\TimeSlider.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Slider,
  Typography,
  Paper,
  Tooltip,
  useMediaQuery,
  Chip,
  IconButton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import TimelineIcon from '@mui/icons-material/Timeline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { COLORS, HISTORICAL_PERIODS, formatYear } from '../../../shared/config/generalUtils';

const SliderContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  backgroundColor: 'rgba(255, 255, 255, 0.55)',
  borderRadius: '12px',
  maxWidth: '100%',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 4px 16px 0 rgba(119, 73, 54, 0.1)',
  transition: 'all 0.2s ease'
}));

const NavButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: theme.spacing(1),
  borderRadius: '8px',
  color: COLORS.primary,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    color: COLORS.primary,
    transform: 'scale(1.1)'
  },
  '&.Mui-disabled': {
    opacity: 0.4,
    backgroundColor: 'transparent',
    color: COLORS.texts.muted
  },
  transition: 'all 0.2s ease',
  position: 'relative'
}));

const ValueLabelComponent = React.memo(function ValueLabelComponent(props) {
  const { children, value } = props;
  return (
    <Tooltip
      arrow
      placement="top"
      title={<Typography variant="body2" sx={{ fontFamily: 'Georgia, serif' }}>{formatYear(value)}</Typography>}
    >
      {children}
    </Tooltip>
  );
});

function TimeSlider({ currentYear, onYearChange, availableYears = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLandscape = useMediaQuery('(orientation: landscape) and (max-height: 500px)');

  const minYear = availableYears[0] || -3300;
  const maxYear = availableYears[availableYears.length - 1] || 2025;

  const [year, setYear] = useState(currentYear || minYear);
  const [expanded, setExpanded] = useState(!isMobile);

  useEffect(() => {
    if (currentYear !== undefined) setYear(currentYear);
  }, [currentYear]);

  const marks = useMemo(() => {
    return availableYears.map(y => ({
      value: y,
      label: '' // TÃ¼m label'lar boÅŸ
    }));
  }, [availableYears]);

  const findNextYear = useCallback((direction) => {
    const index = availableYears.indexOf(year);
    if (index === -1) return year;
    return direction === 'forward'
      ? availableYears[Math.min(index + 1, availableYears.length - 1)]
      : availableYears[Math.max(index - 1, 0)];
  }, [year, availableYears]);

  const handleSliderChange = useCallback((event, newValue) => {
    let targetYear = newValue;
    if (!availableYears.includes(targetYear)) {
      targetYear = availableYears.reduce((prev, curr) =>
        Math.abs(curr - newValue) < Math.abs(prev - newValue) ? curr : prev
      );
    }
    setYear(targetYear);
    if (onYearChange) onYearChange(targetYear);
  }, [availableYears, onYearChange]);

  const handleForward = () => {
    const newYear = findNextYear('forward');
    setYear(newYear);
    if (onYearChange) onYearChange(newYear);
  };

  const handleBackward = () => {
    const newYear = findNextYear('backward');
    setYear(newYear);
    if (onYearChange) onYearChange(newYear);
  };

  const toggleExpanded = () => setExpanded(prev => !prev);

  const currentPeriod = useMemo(() => {
    return HISTORICAL_PERIODS.find(p => year >= p.start && year <= p.end) || {
      name: 'Unknown Period',
      color: '#cccccc'
    };
  }, [year]);

  const sliderStyles = useMemo(() => ({
    color: currentPeriod.color,
    '& .MuiSlider-thumb': { 
      height: 12, 
      width: 12,
      backgroundColor: currentPeriod.color
    },
    '& .MuiSlider-track': { 
      height: 4,
      backgroundColor: currentPeriod.color
    },
    '& .MuiSlider-rail': { 
      height: 4,
      backgroundColor: currentPeriod.color,
      opacity: 0.3
    },
    '& .MuiSlider-mark': { display: 'none' },
    '& .MuiSlider-markLabel': {
      fontSize: isMobile ? '0.5rem' : '0.6rem',
      color: theme.palette.text.secondary
    }
  }), [theme, isMobile, currentPeriod.color]);

  const containerStyles = useMemo(() => ({
    width: isMobile ? 'calc(100% - 32px)' : '600px',
    maxWidth: isMobile ? 'calc(100% - 32px)' : '80%',
    position: 'fixed',
    bottom: isMobile ? (isLandscape ? 12 : 60) : 20,
    // Center in the map area (excluding sidebar on desktop)
    left: isMobile ? '50%' : 'calc(360px + (100% - 360px) / 2)',
    transform: 'translateX(-50%)',
    height: expanded ? 'auto' : '48px',
    overflow: 'hidden',
    opacity: expanded ? 1 : 0.9,
    '&:hover': { opacity: 1 },
    zIndex: 9
  }), [isMobile, isLandscape, expanded]);

  return (
    <Box sx={{ position: 'relative'}}>
      <SliderContainer elevation={3} sx={containerStyles}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: expanded ? 1 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ color: theme.palette.primary.main, mr: 1, fontSize: isMobile ? '1.2rem' : '1.4rem' }} />
            <Typography variant="subtitle1" sx={{ fontFamily: 'Georgia, serif', fontSize: isMobile ? '0.9rem' : '1rem', color: theme.palette.primary.main }}>
              Timeline
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: currentPeriod.color, fontSize: isMobile ? '0.7rem' : '0.9rem', fontWeight: 'bold' }}>
              {currentPeriod.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip label={formatYear(year)} size="small" color="secondary" sx={{ mr: 1, backgroundColor: currentPeriod.color, minWidth: '48px', color: '#fff', fontFamily: 'Georgia, serif', fontSize: '0.7rem' }} />
            <IconButton size="small" onClick={toggleExpanded} aria-label={expanded ? "Collapse timeline" : "Expand timeline"} sx={{ color: theme.palette.primary.main, p: 0.5 }}>
              {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Box>
        </Box>

        {expanded && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <NavButton onClick={handleBackward} disabled={year <= minYear} sx={{ mt: -0.7 }}>
              <ArrowBackIcon sx={{ fontSize: 20, stroke: 'currentColor', strokeWidth: 0.7 }} />
            </NavButton>
            
            <Box sx={{ flex: 1 }}>
              <Slider
                value={year}
                min={minYear}
                max={maxYear}
                step={null}
                onChange={handleSliderChange}
                valueLabelDisplay="off"
                marks={marks}
                components={{ ValueLabel: ValueLabelComponent }}
                sx={sliderStyles}
              />
            </Box>
            
           <NavButton onClick={handleForward} disabled={year >= maxYear} sx={{ mt: -0.8 }}>
              <ArrowForwardIcon sx={{ fontSize: 20, stroke: 'currentColor', strokeWidth: 0.7 }} />
            </NavButton>
          </Box>
        )}
      </SliderContainer>
    </Box>
  );
}

export default React.memo(TimeSlider);