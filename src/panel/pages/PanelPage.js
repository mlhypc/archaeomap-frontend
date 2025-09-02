// archaeomap-frontend\src\panel\pages\PanelPage.js

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
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ModerationIcon from '@mui/icons-material/Gavel';
import PeopleIcon from '@mui/icons-material/People';

import { useAuth } from '../../shared/contexts/AuthContext';
import useUserRole from '../../shared/hooks/useUserRole';
import ProfileSection from '../sections/Personal/ProfileSection';
import SettingsSection from '../sections/Personal/SettingsSection';
import CityListSection from '../sections/DataManagement/CityListSection';
import UserManagementSection from '../sections/Administration/UserManagementSection';

// MERKEZI STİL SİSTEMİ İMPORT
import { 
  panelStyles, 
  panelComponents, 
  panelTypography 
} from '../../shared/theme/panelStyles';

// Panel sections
const PANEL_SECTIONS = {
  PROFILE: 'profile',
  SETTINGS: 'settings', 
  CITIES: 'cities',
  MY_SUBMISSIONS: 'my-submissions',
  MODERATION: 'moderation',
  USER_MANAGEMENT: 'user-management',
  SYSTEM_SETTINGS: 'system-settings'
};

// Placeholder component
const PlaceholderSection = ({ title, description, icon: Icon }) => (
  <Box sx={panelStyles.sectionContainer}>
    <Typography sx={panelTypography.sectionTitle}>
      {title}
    </Typography>
    
    <Box sx={panelStyles.placeholder}>
      <Icon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.disabled' }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

function PanelPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user, logout } = useAuth();
  
  const { 
    isAdmin, 
    displayRole,
    canManageData,
    canModerate
  } = useUserRole();
  
  const [activeSection, setActiveSection] = useState(PANEL_SECTIONS.PROFILE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items
  const getNavigationItems = () => {
    const items = [];
    
    items.push(
      { 
        id: PANEL_SECTIONS.PROFILE, 
        label: 'Profile', 
        icon: AccountCircleIcon,
        category: 'Personal'
      },
      { 
        id: PANEL_SECTIONS.SETTINGS, 
        label: 'Settings', 
        icon: SettingsIcon,
        category: 'Personal'
      }
    );

    if (canManageData) {
      items.push(
        { 
          id: PANEL_SECTIONS.CITIES, 
          label: 'Cities', 
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

    if (canModerate) {
      items.push({
        id: PANEL_SECTIONS.MODERATION,
        label: 'Moderation',
        icon: ModerationIcon,
        category: 'Moderation'
      });
    }

    if (isAdmin) {
      items.push(
        { 
          id: PANEL_SECTIONS.USER_MANAGEMENT, 
          label: 'Users', 
          icon: PeopleIcon,
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
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case PANEL_SECTIONS.PROFILE:
        return <ProfileSection />;
      case PANEL_SECTIONS.SETTINGS:
        return <SettingsSection />;
      case PANEL_SECTIONS.CITIES:
        return <CityListSection />;
      case PANEL_SECTIONS.MY_SUBMISSIONS:
        return <PlaceholderSection 
          title="My Submissions" 
          description="Track your data submissions and approval status"
          icon={AssignmentIcon}
        />;
      case PANEL_SECTIONS.MODERATION:
        return <PlaceholderSection 
          title="Moderation" 
          description="Review and moderate user submissions"
          icon={ModerationIcon}
        />;
      case PANEL_SECTIONS.USER_MANAGEMENT:
        return <UserManagementSection />;
      case PANEL_SECTIONS.SYSTEM_SETTINGS:
        return <PlaceholderSection 
          title="System Settings" 
          description="Application configuration and system management"
          icon={AdminPanelSettingsIcon}
        />;
      default:
        return <ProfileSection />;
    }
  };

  // Desktop navigation
  const renderDesktopNavigation = () => {
    const navItems = getNavigationItems();
    const categories = [...new Set(navItems.map(item => item.category))];

    return categories.map(category => (
      <Box key={category}>
        <Typography sx={panelStyles.categoryHeader}>
          {category}
        </Typography>
        
        <Box>
          {navItems
            .filter(item => item.category === category)
            .map(item => (
              <Box 
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                sx={activeSection === item.id ? panelStyles.navItemActive : panelStyles.navItem}
              >
                <item.icon sx={panelComponents.navIcon} />
                <Typography variant="body2">{item.label}</Typography>
              </Box>
            ))}
        </Box>
        
        {category !== categories[categories.length - 1] && (
          <Box sx={panelStyles.categoryDivider} />
        )}
      </Box>
    ));
  };

  // Mobile navigation
  const renderMobileNavigation = () => {
    const navItems = getNavigationItems();
    const categories = [...new Set(navItems.map(item => item.category))];

    return categories.map(category => (
      <Box key={category}>
        <Typography sx={{ ...panelStyles.categoryHeader, px: 2, mt: 2, mb: 1 }}>
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
                  sx={panelComponents.listItemButton}
                >
                  <ListItemIcon>
                    <item.icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
        </List>
        
        {category !== categories[categories.length - 1] && <Divider sx={{ my: 1 }} />}
      </Box>
    ));
  };

  return (
    <Box sx={panelStyles.container}>
      {/* Mobile App Bar */}
      <AppBar position="fixed" sx={panelStyles.mobileAppBar}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(true)}
            sx={panelComponents.menuButton}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ ...panelStyles.logo, flex: 1 }}>
            <img 
              src="/archaeomap_primary.svg" 
              alt="ArchaeoMap Logo" 
              style={{ marginRight: theme.spacing(1), height: '20px' }}
            />
            <Typography variant="h6" sx={panelTypography.appTitle}>
              Panel
            </Typography>
          </Box>

          <IconButton 
            onClick={() => navigate('/')}
            color="inherit"
          >
            <ArrowBackIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={panelComponents.drawer}
      >
        <Box sx={panelStyles.drawerHeader}>
          <Box sx={panelStyles.logo}>
            <img 
              src="/archaeomap_primary.svg" 
              alt="ArchaeoMap Logo" 
              style={{ marginRight: theme.spacing(1), height: '20px' }}
            />
            <Typography variant="h6" sx={panelTypography.appTitle}>
              ArchaeoMap Panel
            </Typography>
          </Box>
          
          <IconButton 
            onClick={() => setMobileMenuOpen(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {isAuthenticated && (
  <Box sx={{
    ...panelStyles.userInfo,
    display: 'flex',
    padding: 2
  }}>
    <Box sx={{ 
      flex: 2, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
        {user?.username}
      </Typography>
      <Chip 
        label={displayRole}
        size="small"
        sx={panelComponents.roleChip}
      />
    </Box>
    
    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <IconButton
        onClick={handleLogout}
        color="error"
      >
        <LogoutIcon />
      </IconButton>
    </Box>
  </Box>
        )}

        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {renderMobileNavigation()}
        </Box>
      </Drawer>

      {/* Desktop Header */}
      <Box sx={panelStyles.desktopHeader}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/')}
            sx={panelComponents.backButton}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={panelStyles.logo}>
            <img 
              src="/archaeomap_primary.svg" 
              alt="ArchaeoMap Logo" 
              style={{ marginRight: theme.spacing(1.5), height: '24px' }}
            />
            <Typography variant="h5" sx={panelTypography.appTitle}>
              ArchaeoMap Panel
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated && (
            <>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mr: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {user?.username}
                </Typography>
                <Chip 
                  label={displayRole}
                  size="small"
                  sx={panelComponents.roleChip}
                />
              </Box>
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': { 
                    color: 'error.main',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)'
                  }
                }}
                title="Logout"
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      <Box sx={panelStyles.content}>
        {/* Desktop Sidebar */}
        <Box sx={panelStyles.desktopSidebar} className="archaeo-scrollbar">
          {renderDesktopNavigation()}
        </Box>

        {/* Main Content */}
        <Box sx={panelStyles.main} className="archaeo-scrollbar">
          {renderSectionContent()}
        </Box>
      </Box>
    </Box>
  );
}

export default PanelPage;