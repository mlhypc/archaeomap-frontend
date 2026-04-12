// archaeomap-frontend\src\panel\pages\PanelPage.js

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

import { useAuth } from '../../shared/contexts/AuthContext';
import useUserRole from '../../shared/hooks/useUserRole';
import ProfileSection from '../sections/Personal/ProfileSection';
import SettingsSection from '../sections/Personal/SettingsSection';
import ApplyForContributorSection from '../sections/Personal/ApplyForContributorSection';
import CityManage from '../sections/Moderation/CityManageSection';
import UserManagementSection from '../sections/Administration/UserManagementSection';
import ModerationSection from '../sections/Moderation/ModerationSection';
import PendingApplicationsSection from '../sections/Moderation/featuresModeration/PendingApplicationsSection';

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
  APPLY_CONTRIBUTOR: 'apply-contributor',
  CITIES: 'cities',
  MY_SUBMISSIONS: 'my-submissions',
  MODERATION: 'moderation',
  PENDING_APPLICATIONS: 'pending-applications',
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
  const { isAuthenticated, user, logout } = useAuth();
  
  const { 
    isAdmin, 
    displayRole,
    canManageData,
    canModerate
  } = useUserRole();
  
  const [activeSection, setActiveSection] = useState(PANEL_SECTIONS.PROFILE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // DÜZELTME: Navigation items'ı useMemo ile optimize et
  const navigationItems = useMemo(() => {
    const items = [];
    
    // Personal (herkes için)
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

    // Apply for Equestrian (sadece user role için)
    if (user?.role === 'user') {
      items.push({
        id: PANEL_SECTIONS.APPLY_CONTRIBUTOR,
        label: 'Apply for Equestrian',
        icon: TrendingUpIcon,
        category: 'Personal'
      });
    }

    // Contribution (contributor+ için)
    if (canManageData) {
      items.push(
        { 
          id: PANEL_SECTIONS.MY_SUBMISSIONS, 
          label: 'My Submissions', 
          icon: AssignmentIcon,
          category: 'Contribution'
        }
      );
    }

    // Moderation (moderator+ için)
    if (canModerate) {
      items.push(
        {
          id: PANEL_SECTIONS.MODERATION,
          label: 'Moderation',
          icon: ModerationIcon,
          category: 'Moderation'
        },
        {
          id: PANEL_SECTIONS.PENDING_APPLICATIONS,
          label: 'Pending Applications',
          icon: HowToVoteIcon,
          category: 'Moderation'
        },
        { 
          id: PANEL_SECTIONS.CITIES, 
          label: 'Cities', 
          icon: LocationCityIcon,
          category: 'Moderation'
        }
      );
    }

    // Administration (admin için)
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
  }, [canManageData, canModerate, isAdmin, user?.role]);

  const handleNavigation = React.useCallback((sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // DÜZELTME: Component'leri persist et, her render'da yeni oluşturma
  const sectionComponents = useMemo(() => ({
    [PANEL_SECTIONS.PROFILE]: <ProfileSection />,
    [PANEL_SECTIONS.SETTINGS]: <SettingsSection />,
    [PANEL_SECTIONS.APPLY_CONTRIBUTOR]: <ApplyForContributorSection />,
    [PANEL_SECTIONS.CITIES]: <CityManage />,
    [PANEL_SECTIONS.MY_SUBMISSIONS]: <PlaceholderSection
      title="My Submissions"
      description="Track your data submissions and approval status"
      icon={AssignmentIcon}
    />,
    [PANEL_SECTIONS.MODERATION]: <ModerationSection />,
    [PANEL_SECTIONS.PENDING_APPLICATIONS]: <PendingApplicationsSection />,
    [PANEL_SECTIONS.USER_MANAGEMENT]: <UserManagementSection />,
    [PANEL_SECTIONS.SYSTEM_SETTINGS]: <PlaceholderSection
      title="System Settings"
      description="Application configuration and system management"
      icon={AdminPanelSettingsIcon}
    />
  }), []); // Boş dependency - component'ler sadece bir kez oluşturulur

  // DÜZELTME: Desktop navigation'ı useMemo ile optimize et
  const desktopNavigation = useMemo(() => {
    const categories = [...new Set(navigationItems.map(item => item.category))];

    return categories.map(category => (
      <Box key={category}>
        <Typography sx={panelStyles.categoryHeader}>
          {category}
        </Typography>

        <Box>
          {navigationItems
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
  }, [navigationItems, activeSection, handleNavigation]);

  // DÜZELTME: Mobile navigation'ı useMemo ile optimize et
  const mobileNavigation = useMemo(() => {
    const categories = [...new Set(navigationItems.map(item => item.category))];

    return categories.map(category => (
      <Box key={category}>
        <Typography sx={{ ...panelStyles.categoryHeader, px: 2, mt: 2, mb: 1 }}>
          {category}
        </Typography>

        <List dense>
          {navigationItems
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
  }, [navigationItems, activeSection, handleNavigation]);

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
            aria-label="Back to map"
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
            aria-label="Close menu"
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
                aria-label="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        <Box sx={{ overflow: 'auto', flex: 1 }}>
          {mobileNavigation}
        </Box>
      </Drawer>

      {/* Desktop Header */}
      <Box sx={panelStyles.desktopHeader}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={() => navigate('/')}
            aria-label="Back to map"
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
          {desktopNavigation}
        </Box>

        {/* Main Content - DÜZELTME: Section'ları gizle/göster, remount etme */}
        <Box sx={panelStyles.main} className="archaeo-scrollbar">
          {Object.entries(sectionComponents).map(([sectionId, component]) => (
            <Box
              key={sectionId}
              sx={{
                display: activeSection === sectionId ? 'block' : 'none',
                height: '100%'
              }}
            >
              {component}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default PanelPage;