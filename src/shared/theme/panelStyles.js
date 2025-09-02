// theme/panelStyles.js - MERKEZI PANEL STİL SİSTEMİ

import { COLORS } from '../config/generalUtils';

// PANEL LAYOUT STİLLERİ
export const panelStyles = {
  // Ana container
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    backgroundColor: 'background.default',
    position: 'relative'
  },

  // Mobile AppBar
  mobileAppBar: {
    backgroundColor: 'rgba(248, 245, 238, 0.95)',
    backdropFilter: 'blur(8px)',
    borderBottom: `1px solid ${COLORS.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    color: 'text.primary',
    display: { md: 'none', xs: 'block' }
  },

  // Desktop Header
  desktopHeader: {
    display: { xs: 'none', md: 'flex' },  // ← Buraya da
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    borderBottom: 1,
    borderColor: 'divider',
    backgroundColor: 'rgba(248, 245, 238, 0.9)',
    minHeight: '64px'
  },

  // Panel content wrapper
  content: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
    paddingTop: { xs: '64px', md: 0 }
  },

  // Desktop sidebar
  desktopSidebar: {
    width: '240px',
    borderRight: 1,
    borderColor: 'divider',
    backgroundColor: 'rgba(248, 245, 238, 0.5)',
    display: { xs: 'none', md: 'flex' },  // ← Direkt buraya
    flexDirection: 'column',
    padding: 2,
    overflow: 'auto'
  },

  // Main content area
  main: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },

  // Logo container
  logo: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: { xs: 0, md: 0.5 }
  },

  // Navigation item (active)
  navItemActive: {
    display: 'flex',
    alignItems: 'center',
    padding: 1.5,
    borderRadius: 1,
    cursor: 'pointer',
    marginBottom: 1,
    backgroundColor: 'rgba(119, 73, 54, 0.1)',
    color: 'primary.main',
    '&:hover': {
      backgroundColor: 'rgba(119, 73, 54, 0.15)'
    }
  },

  // Navigation item (inactive)
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: 1.5,
    borderRadius: 1,
    cursor: 'pointer',
    marginBottom: 1,
    backgroundColor: 'transparent',
    color: 'text.secondary',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(119, 73, 54, 0.05)'
    }
  },

  // Category header
  categoryHeader: {
    color: 'text.secondary',
    marginBottom: 2,
    marginTop: 2,
    fontWeight: 'medium',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  // Category divider
  categoryDivider: {
    height: '1px',
    backgroundColor: 'divider',
    my: 2,
    opacity: 0.3
  },

  // Mobile drawer header
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 2,
    borderBottom: 1,
    borderColor: 'divider',
    minHeight: '64px'
  },

  // User info in drawer
  userInfo: {
    padding: 2,
    backgroundColor: 'rgba(248, 245, 238, 0.5)',
    borderBottom: 1,
    borderColor: 'divider'
  },

  // Section container
  sectionContainer: {
    padding: 3,
    height: '100%',
    overflow: 'auto'
  },

  // Placeholder box
  placeholder: {
    padding: 4,
    border: `2px dashed ${COLORS.border}`,
    borderRadius: 2,
    textAlign: 'center',
    backgroundColor: 'rgba(248, 245, 238, 0.3)'
  }
};

// PANEL COMPONENT STİLLERİ
export const panelComponents = {
  // Mobile drawer
  drawer: {
    '& .MuiDrawer-paper': {
      width: '280px',
      backgroundColor: 'background.default',
      borderRight: 1,
      borderColor: 'divider'
    }
  },

  // Role chip
  roleChip: {
    backgroundColor: 'rgba(119, 73, 54, 0.1)',
    color: 'primary.main',
    fontSize: '0.7rem',
    fontWeight: 'medium',
    height: '20px'
  },

  // Navigation icon
  navIcon: {
    mr: 1.5,
    fontSize: '1.2rem'
  },

  // Back button
  backButton: {
    mr: 2,
    color: 'primary.main',
    '&:hover': {
      backgroundColor: 'rgba(119, 73, 54, 0.1)'
    }
  },

  // Menu button
  menuButton: {
    mr: 2
  },

  // Navigation list item
  listItemButton: {
    '&.Mui-selected': {
      backgroundColor: 'rgba(119, 73, 54, 0.1)',
      '& .MuiListItemIcon-root': {
        color: 'primary.main',
      },
      '& .MuiListItemText-primary': {
        color: 'primary.main',
        fontWeight: 'medium'
      }
    }
  }
};

// RESPONSIVE BREAKPOINTS
export const panelBreakpoints = {
  sidebar: {
    xs: 'none',
    md: 'flex'
  },
  mobileBar: {
    xs: 'block', 
    md: 'none'
  }
};

// PANEL TYPOGRAPHY
export const panelTypography = {
  sectionTitle: {
    fontFamily: 'Georgia, serif',
    color: 'primary.main',
    fontSize: '2rem',
    fontWeight: 'normal',
    lineHeight: 1.2,
    marginBottom: 3,
    sx: {
      fontSize: { xs: '1.5rem', md: '2rem' },
      marginBottom: { xs: 2, md: 3 }
    }
  },

  appTitle: {
    fontFamily: 'Georgia, serif',
    color: 'primary.main',
    fontSize: { xs: '1.1rem', md: '1.25rem' }
  },

  username: {
    color: 'text.primary',
    fontWeight: 'medium'
  },

  categoryLabel: {
    color: 'text.secondary',
    fontSize: '0.8rem',
    fontWeight: 'medium',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  }
};

// YARDIMCI FONKSİYONLAR
export const getPanelStyle = (styleName) => panelStyles[styleName];

export const combineStyles = (...styles) => {
  return styles.reduce((combined, style) => ({ ...combined, ...style }), {});
};

// KULLANIM ÖRNEKLERİ
export const panelExamples = {
  // Container kullanımı:
  // <Box sx={panelStyles.container}>
  
  // Active nav item kullanımı:
  // <Box sx={activeSection === item.id ? panelStyles.navItemActive : panelStyles.navItem}>
  
  // Responsive sidebar kullanımı:
  // <Box sx={{...panelStyles.desktopSidebar, display: panelBreakpoints.sidebar}}>
  
  // Typography kullanımı:
  // <Typography sx={panelTypography.sectionTitle}>
};