// src/pages/HomePage.js - UNIFIED DRAWER VERSION

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
  Tooltip,
  Typography,
  Badge
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import ExploreIcon from '@mui/icons-material/Explore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Map from '../sections/Map/MapMain';
import Sidebar from '../sections/Sidebar/Sidebar';
import { useAuth } from '../../shared/contexts/AuthContext';
import { COLORS } from '../../shared/config/generalUtils';

const AppContainer = styled(Box)({
  display: 'flex',
  height: '100vh',
  width: '100%'
});

const MapContainer = styled(Box)({
  flex: 1,
  height: '100%',
  position: 'relative'
});

// Desktop Sidebar Container
const DesktopSidebarContainer = styled(Box)(({ theme }) => ({
  flexShrink: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: COLORS.background,
  transition: 'width 0.3s ease',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

function HomePage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentYear, setCurrentYear] = useState(2000);
  const [sidebarWidth, setSidebarWidth] = useState(360);
  const [isDraggingState, setIsDraggingState] = useState(false);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  // Unified drawer states - 2 state birleşti
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [leftDrawerMode, setLeftDrawerMode] = useState('city'); // 'city' or 'info'

  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle city selection
  const handleSelectCity = useCallback((city) => {
    setSelectedCity(city);
  }, []);

  // Handle year change
  const handleYearChange = useCallback((year) => {
    setCurrentYear(year);
  }, []);

  // Unified drawer controls - handler'lar birleşti
  const openCitySidebar = useCallback(() => {
    setLeftDrawerMode('city');
    setLeftDrawerOpen(true);
  }, []);

  const openInfoSidebar = useCallback(() => {
    setLeftDrawerMode('info'); 
    setLeftDrawerOpen(true);
  }, []);

  const closeLeftDrawer = useCallback(() => {
    setLeftDrawerOpen(false);
  }, []);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    setIsDraggingState(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const delta = e.clientX - dragStartX.current;
      const newWidth = Math.max(0, Math.min(600, dragStartWidth.current + delta));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setIsDraggingState(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setSidebarWidth(prev => (prev < 300 ? 0 : prev));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Navigation
  const navigateToPanel = useCallback(() => {
    navigate('/panel');
  }, [navigate]);

  return (
    <AppContainer>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <DesktopSidebarContainer sx={{ width: sidebarWidth, transition: isDraggingState ? 'none' : 'width 0.3s ease' }}>
        {/* Desktop Header - Sadece Logo + Title */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: 'rgba(248, 245, 238, 0.5)',
          minHeight: '64px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
            <img
              src="/archaeomap_primary.svg"
              alt="ArchaeoMap Logo"
              style={{ marginRight: theme.spacing(1.5), height: '24px' }}
            />
            <Typography
              variant="h5"
              sx={{
                fontFamily: 'Georgia, serif',
                color: COLORS.primary,
                fontSize: '1.4rem'
              }}
            >
              ArchaeoMap
            </Typography>
          </Box>
        </Box>

        {/* Desktop Sidebar Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Sidebar
            selectedCity={sidebarWidth === 0 ? null : selectedCity}
            currentYear={currentYear}
            hideTitle={true}
            mode="city"
          />
        </Box>
      </DesktopSidebarContainer>

      {/* ===== DESKTOP DRAG HANDLE ===== */}
      {!isMobile && sidebarWidth > 0 && (
        <Box
          onMouseDown={handleDragStart}
          sx={{
            width: 6,
            flexShrink: 0,
            cursor: 'col-resize',
            zIndex: 10,
            backgroundColor: 'transparent',
            borderRight: `1px solid ${COLORS.border}`,
            transition: 'background-color 0.15s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '&:hover': {
              backgroundColor: 'rgba(119,73,54,0.10)',
            },
            '&:hover .drag-dots': {
              opacity: 1,
            },
          }}
        >
          <Box
            className="drag-dots"
            sx={{
              opacity: 0,
              transition: 'opacity 0.15s',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              pointerEvents: 'none',
            }}
          >
            {[0, 1, 2].map(i => (
              <Box
                key={i}
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  backgroundColor: COLORS.primary,
                  opacity: 0.5,
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* ===== UNIFIED LEFT DRAWER ===== */}
      <Drawer
        anchor="left"
        open={leftDrawerOpen}
        onClose={closeLeftDrawer}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '360px',
            backgroundColor: COLORS.background,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Mobile Drawer Header with Close Button */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${COLORS.border}`,
          backgroundColor: 'rgba(248, 245, 238, 0.5)',
          minHeight: '64px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/archaeomap_primary.svg"
              alt="ArchaeoMap Logo"
              style={{ marginRight: theme.spacing(1.5), height: '20px' }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Georgia, serif',
                color: COLORS.primary,
                fontSize: '1.2rem'
              }}
            >
              ArchaeoMap
            </Typography>
          </Box>

          <IconButton
            onClick={closeLeftDrawer}
            aria-label="Close panel"
            sx={{
              color: COLORS.primary,
              '&:hover': {
                backgroundColor: 'rgba(119, 73, 54, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Unified Sidebar Content - mode prop ile */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Sidebar
            selectedCity={leftDrawerMode === 'city' ? selectedCity : null}
            currentYear={currentYear}
            hideTitle={true} // Mobile'da header'da zaten var
            mode={leftDrawerMode} // 'city' veya 'info'
          />
        </Box>
      </Drawer>

      {/* ===== MAP CONTAINER ===== */}
      <MapContainer>
        {/* Re-expand tab — only when sidebar is fully collapsed */}
        {!isMobile && sidebarWidth === 0 && (
          <Box
            onClick={() => setSidebarWidth(360)}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1000,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 48,
              backgroundColor: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid rgba(255,255,255,0.5)`,
              borderLeft: 'none',
              borderRadius: '0 8px 8px 0',
              boxShadow: '2px 0 8px rgba(119,73,54,0.12)',
              color: COLORS.primary,
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.85)',
              }
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          </Box>
        )}

        <Map
          onSelectCity={handleSelectCity}
          onYearChange={handleYearChange}
          onAuthClick={navigateToPanel}
          sidebarCollapsed={sidebarWidth === 0}
        />

        {/* ===== MOBILE HEADER & CONTROL PANEL ===== */}
        {isMobile && (
          <>
            {/* Mobile Header with Logo - Glassmorphism */}
            <Box sx={{
              position: 'absolute',
              top: 10,
              left: 12,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '12px',
              padding: '8px 12px',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 4px 16px rgba(119, 73, 54, 0.12)'
            }}>
              <img
                src="/archaeomap_primary.svg"
                alt="ArchaeoMap Logo"
                style={{ height: '18px' }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'Georgia, serif',
                  color: COLORS.primary,
                  fontSize: '1.0rem',
                  fontWeight: 'normal'
                }}
              >
                ArchaeoMap
              </Typography>
            </Box>

            {/* Mobile Control Panel - Sağ tarafta */}
            <Box sx={{
              position: 'absolute',
              top: 64,
              right: 12,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              {/* User/Panel Button */}
              <Tooltip
                title={isAuthenticated ? `Panel - ${user?.username}` : "Panel - Login"}
                placement="left"
                arrow
              >
                <Badge
                  variant="dot"
                  color="error"
                  invisible={isAuthenticated}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#d32f2f',
                      width: 8,
                      height: 8,
                      minWidth: 8,
                      minHeight: 8,
                      right: 4,
                      top: 4,
                      animation: !isAuthenticated ? 'mobilePulse 2s infinite' : 'none',
                      '@keyframes mobilePulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.6 }
                      }
                    }
                  }}
                >
                  <IconButton
                    variant="mobileControl"
                    onClick={navigateToPanel}
                    sx={{
                      color: isAuthenticated ? '#2e7d32' : COLORS.primary
                    }}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </Badge>
              </Tooltip>

              {/* Context-Aware FAB - Info/Explore Combined */}
              {(() => {
                const isExploreMode = selectedCity !== null;
                const fabColor = isExploreMode ? '#daa520' : COLORS.texts.muted;
                const fabAction = isExploreMode ? openCitySidebar : openInfoSidebar;
                const fabIcon = isExploreMode ? <ExploreIcon /> : <InfoIcon />;
                const fabTooltip = isExploreMode ? `Explore ${selectedCity.name}` : 'About ArchaeoMap';
                const showBadge = isExploreMode && !leftDrawerOpen;

                return (
                  <Badge
                    variant="dot"
                    color="secondary"
                    invisible={!showBadge}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#ff9800',
                        width: 8,
                        height: 8,
                        minWidth: 8,
                        minHeight: 8,
                        right: 4,
                        top: 4
                      }
                    }}
                  >
                    <Tooltip title={fabTooltip} placement="left" arrow>
                      <IconButton
                        variant="mobileControl"
                        onClick={fabAction}
                        sx={{
                          color: fabColor,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {fabIcon}
                      </IconButton>
                    </Tooltip>
                  </Badge>
                );
              })()}
            </Box>
          </>
        )}
      </MapContainer>
    </AppContainer>
  );
}

export default HomePage;