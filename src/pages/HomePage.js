// src/pages/HomePage.js - UNIFIED DRAWER VERSION

import React, { useState, useCallback } from 'react';
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
import Map from '../components/map/MapMain';
import Sidebar from '../components/map/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../config/generalUtils';

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
  width: 360,
  flexShrink: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: COLORS.background,
  borderRight: `1px solid ${COLORS.border}`,
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

// Desktop Header Component
const DesktopSidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${COLORS.border}`,
  backgroundColor: 'rgba(248, 245, 238, 0.5)',
  minHeight: '64px'
}));

function HomePage() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentYear, setCurrentYear] = useState(2000);

  // Unified drawer states - 2 state birleşti
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [leftDrawerMode, setLeftDrawerMode] = useState('city'); // 'city' or 'info'

  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery('(max-width:360px)');

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

  // Navigation
  const navigateToPanel = useCallback(() => {
    navigate('/panel');
  }, [navigate]);

  return (
    <AppContainer>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <DesktopSidebarContainer>
        {/* Desktop Header - Sadece Logo + Title */}
        <DesktopSidebarHeader>
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
        </DesktopSidebarHeader>

        {/* Desktop Sidebar Content */}
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Sidebar
            selectedCity={selectedCity}
            currentYear={currentYear}
            hideTitle={true} // Header'da zaten var
            mode="city" // Desktop always city mode
          />
        </Box>
      </DesktopSidebarContainer>

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
        <Map
          onSelectCity={handleSelectCity}
          onYearChange={handleYearChange}
          onAuthClick={navigateToPanel}
        />

        {/* ===== MOBILE HEADER & CONTROL PANEL ===== */}
        {isMobile && (
          <>
            {/* Mobile Header with Logo - Desktop ile tutarlı */}
            <Box sx={{
              position: 'absolute',
              top: 10,
              left: 12,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(248, 245, 238, 0.9)',
              border: `1px solid ${COLORS.border}`,
              borderRadius: '4px',
              padding: '8px 12px',
              backdropFilter: 'blur(4px)'
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
              top: 70, // Header'ın altında
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
              >
                <Badge
                  color="error"
                  variant="dot"
                  invisible={isAuthenticated}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#c91818ff'
                    }
                  }}
                >
                  <IconButton
                    variant="control"
                    onClick={navigateToPanel}
                    sx={{
                      color: isAuthenticated ? '#2e7d32' : COLORS.primary,
                    }}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                </Badge>
              </Tooltip>

              {/* Context-Aware FAB - Info/Explore Combined */}
              {(() => {
                const isExploreMode = selectedCity !== null;
                const fabColor = isExploreMode ? '#daa520' : COLORS.texts.muted; // gold vs grey
                const fabAction = isExploreMode ? openCitySidebar : openInfoSidebar; // Updated actions
                const fabIcon = isExploreMode ? <ExploreIcon /> : <InfoIcon />;
                const fabTooltip = isExploreMode ? `Explore ${selectedCity.name}` : 'About ArchaeoMap';
                
                return (
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={!isExploreMode || leftDrawerOpen}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: '#e66b13ff'
                      }
                    }}
                  >
                    <Tooltip title={fabTooltip} placement="left">
                      <IconButton
                        variant="control"
                        onClick={fabAction}
                        sx={{
                          color: fabColor,
                          transition: 'all 0.3s ease', // Smooth color/icon transition
                          position: 'relative',
                          // Icon transition effect
                          '& svg': {
                            transition: 'all 0.2s ease'
                          }
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