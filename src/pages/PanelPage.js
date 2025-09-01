// src/pages/PanelPage.js - Mobil navigasyon düzeltilmiş

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  IconButton, 
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ListIcon from '@mui/icons-material/List';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocationCityIcon from '@mui/icons-material/LocationCity';

import { COLORS } from '../config/generalUtils';
import { useAuth } from '../contexts/AuthContext';
import useUserRole from '../hooks/useUserRole';
import AccountSection from '../components/panel/AccountSection';
import CityListSection from '../components/panel/CityListSection';

// Styled Components
const PanelContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  backgroundColor: COLORS.background,
  position: 'relative'
});

const MobileAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'rgba(248, 245, 238, 0.95)',
  backdropFilter: 'blur(8px)',
  borderBottom: `1px solid ${COLORS.border}`,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  [theme.breakpoints.up('md')]: {
    display: 'none'
  }
}));

const DesktopHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${COLORS.border}`,
  backgroundColor: 'rgba(248, 245, 238, 0.9)',
  minHeight: '64px',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

const PanelContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    paddingTop: '64px' // AppBar height
  }
}));

const DesktopSidebar = styled(Box)(({ theme }) => ({
  width: '240px',
  borderRight: `1px solid ${COLORS.border}`,
  backgroundColor: 'rgba(248, 245, 238, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '280px',
    backgroundColor: COLORS.background,
    borderRight: `1px solid ${COLORS.border}`
  }
}));

const PanelMain = styled(Box)({
  flex: 1,
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column'
});

const Logo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1)
}));

const NavItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  borderRadius: '4px',
  cursor: 'pointer',
  marginBottom: theme.spacing(1),
  backgroundColor: active ? 'rgba(119, 73, 54, 0.1)' : 'transparent',
  color: active ? COLORS.primary : COLORS.texts.secondary,
  '&:hover': {
    backgroundColor: active ? 'rgba(119, 73, 54, 0.1)' : 'rgba(119, 73, 54, 0.05)'
  }
}));

// Panel sections - same as before
const PANEL_SECTIONS = {
  ACCOUNT: 'account',
  SETTINGS: 'settings',
  MY_LISTS: 'my-lists',
  FAVORITES: 'favorites',
  DATA_ENTRY: 'data-entry',
  MY_SUBMISSIONS: 'my-submissions',
  CITY_LIST: 'city-list',
  USER_MANAGEMENT: 'user-management',
  APPROVAL_QUEUE: 'approval-queue',
  SYSTEM_SETTINGS: 'system-settings'
};

// Placeholder components - same as before
const PlaceholderSection = ({ title, description, icon: Icon }) => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" sx={{ 
      fontFamily: 'Georgia, serif', 
      color: COLORS.primary, 
      mb: 3 
    }}>
      {title}
    </Typography>
    <Box sx={{ 
      p: 4,
      border: `2px dashed ${COLORS.border}`,
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <Icon sx={{ fontSize: 60, color: COLORS.texts.muted, mb: 2 }} />
      <Typography variant="h6" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

function PanelPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();
  const { isUser, isCurator, isAdmin, displayRole } = useUserRole();
  
  const [activeSection, setActiveSection] = useState(PANEL_SECTIONS.ACCOUNT);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items configuration
  const getNavigationItems = () => {
    const items = [];
    
    // General sections
    items.push(
      { 
        id: PANEL_SECTIONS.ACCOUNT, 
        label: 'Account', 
        icon: AccountCircleIcon,
        category: 'General'
      },
      { 
        id: PANEL_SECTIONS.SETTINGS, 
        label: 'Settings', 
        icon: SettingsIcon,
        category: 'General'
      }
    );

    // User sections
    if (isAuthenticated) {
      items.push(
        { 
          id: PANEL_SECTIONS.FAVORITES, 
          label: 'Favorites', 
          icon: CheckCircleIcon,
          category: 'My Collections'
        },
        { 
          id: PANEL_SECTIONS.MY_LISTS, 
          label: 'My Lists', 
          icon: ListIcon,
          category: 'My Collections'
        }
      );
    }

    // Curator sections
    if (isCurator) {
      items.push(
        { 
          id: PANEL_SECTIONS.DATA_ENTRY, 
          label: 'Add City', 
          icon: AddLocationIcon,
          category: 'Data Management'
        },
        { 
          id: PANEL_SECTIONS.CITY_LIST, 
          label: 'City List', 
          icon: LocationCityIcon,
          category: 'Data Management'
        },
        { 
          id: PANEL_SECTIONS.MY_SUBMISSIONS, 
          label: 'My Submissions', 
          icon: AssignmentIcon,
          category: 'Data Management'
        }
      );
    }

    // Admin sections
    if (isAdmin) {
      items.push(
        { 
          id: PANEL_SECTIONS.USER_MANAGEMENT, 
          label: 'Users', 
          icon: PeopleIcon,
          category: 'Administration'
        },
        { 
          id: PANEL_SECTIONS.APPROVAL_QUEUE, 
          label: 'Approvals', 
          icon: CheckCircleIcon,
          category: 'Administration'
        },
        { 
          id: PANEL_SECTIONS.SYSTEM_SETTINGS, 
          label: 'System', 
          icon: AdminPanelSettingsIcon,
          category: 'Administration'
        }
      );
    }

    return items;
  };

  const handleNavigation = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false); // Close mobile menu after selection
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case PANEL_SECTIONS.ACCOUNT:
        return <AccountSection />;
      case PANEL_SECTIONS.SETTINGS:
        return <PlaceholderSection 
          title="Settings" 
          description="User preferences, theme, and application settings"
          icon={SettingsIcon}
        />;
      case PANEL_SECTIONS.MY_LISTS:
        return <PlaceholderSection 
          title="My Lists" 
          description="Create and manage your city collections"
          icon={ListIcon}
        />;
      case PANEL_SECTIONS.FAVORITES:
        return <PlaceholderSection 
          title="Favorites" 
          description="Your liked cities and saved locations"
          icon={CheckCircleIcon}
        />;
      case PANEL_SECTIONS.DATA_ENTRY:
        return <PlaceholderSection 
          title="Data Entry" 
          description="Add new cities and archaeological data"
          icon={AddLocationIcon}
        />;
      case PANEL_SECTIONS.MY_SUBMISSIONS:
        return <PlaceholderSection 
          title="My Submissions" 
          description="Track your data submissions and approval status"
          icon={AssignmentIcon}
        />;
      case PANEL_SECTIONS.CITY_LIST:
        return <CityListSection />;
      case PANEL_SECTIONS.USER_MANAGEMENT:
        return <PlaceholderSection 
          title="User Management" 
          description="Manage users, roles, and permissions"
          icon={PeopleIcon}
        />;
      case PANEL_SECTIONS.APPROVAL_QUEUE:
        return <PlaceholderSection 
          title="Approval Queue" 
          description="Review and approve data submissions"
          icon={CheckCircleIcon}
        />;
      case PANEL_SECTIONS.SYSTEM_SETTINGS:
        return <PlaceholderSection 
          title="System Settings" 
          description="Application configuration and system management"
          icon={AdminPanelSettingsIcon}
        />;
      default:
        return <AccountSection />;
    }
  };

  // Render navigation items
  const renderNavigationItems = (isDrawer = false) => {
    const navItems = getNavigationItems();
    const categories = [...new Set(navItems.map(item => item.category))];

    return categories.map(category => (
      <Box key={category}>
        {isDrawer ? (
          <>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: COLORS.texts.secondary,
                mb: 1,
                mt: 2,
                px: 2,
                fontWeight: 'medium'
              }}
            >
              {category}
            </Typography>
            <List dense>
              {navItems
                .filter(item => item.category === category)
                .map(item => (
                  <ListItem key={item.id} disablePadding>
                    <ListItemButton
                      selected={activeSection === item.id}
                      onClick={() => handleNavigation(item.id)}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(119, 73, 54, 0.1)',
                          '& .MuiListItemIcon-root': {
                            color: COLORS.primary,
                          },
                          '& .MuiListItemText-primary': {
                            color: COLORS.primary,
                            fontWeight: 'medium'
                          }
                        }
                      }}
                    >
                      <ListItemIcon>
                        <item.icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        primaryTypographyProps={{
                          variant: 'body2'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
            </List>
            {category !== categories[categories.length - 1] && <Divider sx={{ my: 1 }} />}
          </>
        ) : (
          <>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: COLORS.texts.secondary,
                mb: 2,
                fontWeight: 'medium'
              }}
            >
              {category}
            </Typography>
            <Box>
              {navItems
                .filter(item => item.category === category)
                .map(item => (
                  <NavItem 
                    key={item.id}
                    active={activeSection === item.id}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <item.icon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                    <Typography variant="body2">{item.label}</Typography>
                  </NavItem>
                ))}
            </Box>
            {category !== categories[categories.length - 1] && (
              <Box sx={{ height: '1px', backgroundColor: COLORS.border, my: 2, opacity: 0.5 }} />
            )}
          </>
        )}
      </Box>
    ));
  };

  return (
    <PanelContainer>
      {/* Mobile App Bar */}
      <MobileAppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(true)}
            sx={{ mr: 2, color: COLORS.primary }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <img 
              src="/archaeomap_primary.svg" 
              alt="ArchaeoMap Logo" 
              style={{ marginRight: theme.spacing(1), height: '20px' }}
            />
            <Typography
              variant="h6"
              sx={{ 
                fontFamily: 'Georgia, serif',
                color: COLORS.primary,
                fontSize: '1.1rem'
              }}
            >
              Panel
            </Typography>
          </Box>

          <IconButton 
            onClick={() => navigate('/')}
            sx={{ color: COLORS.primary }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Toolbar>
      </MobileAppBar>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: `1px solid ${COLORS.border}`
        }}>
          <Logo>
            <img 
              src="/archaeomap_primary.svg" 
              alt="ArchaeoMap Logo" 
              style={{ marginRight: theme.spacing(1), height: '20px' }}
            />
            <Typography
              variant="h6"
              sx={{ 
                fontFamily: 'Georgia, serif',
                color: COLORS.primary
              }}
            >
              ArchaeoMap Panel
            </Typography>
          </Logo>
          
          <IconButton 
            onClick={() => setMobileMenuOpen(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User info in drawer */}
        {isAuthenticated && (
          <Box sx={{ 
            p: 2, 
            backgroundColor: 'rgba(248, 245, 238, 0.5)',
            borderBottom: `1px solid ${COLORS.border}`
          }}>
            <Typography variant="body2" sx={{ color: COLORS.texts.primary, fontWeight: 'medium' }}>
              {user?.username}
            </Typography>
            <Chip 
              label={displayRole}
              size="small"
              sx={{ 
                mt: 0.5,
                backgroundColor: 'rgba(119, 73, 54, 0.1)',
                color: COLORS.primary,
                fontSize: '0.7rem'
              }}
            />
          </Box>
        )}

        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {renderNavigationItems(true)}
        </Box>
      </MobileDrawer>

      {/* Desktop Header */}
      <DesktopHeader>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/')}
            sx={{ 
              mr: 2, color: COLORS.primary,
              '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.1)' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Logo>
            <img 
              src="/archaeomap_primary.svg" 
              alt="ArchaeoMap Logo" 
              style={{ marginRight: theme.spacing(1.5), height: '24px' }}
            />
            <Typography
              variant="h5"
              sx={{ 
                fontFamily: 'Georgia, serif',
                color: COLORS.primary
              }}
            >
              ArchaeoMap Panel
            </Typography>
          </Logo>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated && (
            <>
              <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                {user?.username}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: COLORS.primary, 
                  fontWeight: 'medium',
                  backgroundColor: 'rgba(119, 73, 54, 0.1)',
                  px: 1,
                  py: 0.5,
                  borderRadius: '4px'
                }}
              >
                {displayRole}
              </Typography>
            </>
          )}
        </Box>
      </DesktopHeader>

      <PanelContent>
        {/* Desktop Sidebar */}
        <DesktopSidebar>
          {renderNavigationItems(false)}
        </DesktopSidebar>

        {/* Main Content */}
        <PanelMain>
          {renderSectionContent()}
        </PanelMain>
      </PanelContent>
    </PanelContainer>
  );
}

export default PanelPage;