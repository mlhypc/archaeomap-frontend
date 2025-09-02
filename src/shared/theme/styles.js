// frontend\src\theme\styles.js - OPTIMIZED & ENHANCED VERSION

import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { GlobalStyles } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { COLORS } from '../config/generalUtils';

// ENHANCED THEME WITH BETTER ORGANIZATION
const theme = createTheme({
  // PALETTE - Centralized color system
  palette: {
    primary: {
      main: COLORS.primary,
      light: COLORS.secondary,
      dark: '#5d3a2a',
      contrastText: '#fff',
    },
    secondary: {
      main: COLORS.secondary,
      light: '#c6b893',
      dark: '#5f4b31',
      contrastText: '#fff',
    },
    background: {
      default: COLORS.background,
      paper: '#fbf3e2',
    },
    text: {
      primary: COLORS.texts.primary,
      secondary: COLORS.texts.secondary,
      disabled: COLORS.texts.muted,
    },
    // Custom color variants
    archaeo: {
      primary: COLORS.primary,
      secondary: COLORS.secondary,
      background: COLORS.background,
      border: COLORS.border,
      muted: COLORS.texts.muted
    }
  },

  // BREAKPOINTS - Responsive system
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    }
  },

  // SPACING - Consistent spacing system
  spacing: 8, // Base unit
  
  // SHAPE - Border radius system
  shape: {
    borderRadius: 4,
    borderRadiusLarge: 8,
    borderRadiusXLarge: 12
  },

  // SHADOWS - Consistent shadow system
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.1)',
    '2px 0 8px rgba(0,0,0,0.05)',
    '0 8px 16px rgba(0,0,0,0.15)',
    // ... rest of default shadows
    ...Array(20).fill('0 0 0 rgba(0,0,0,0)')
  ],

  // ENHANCED TYPOGRAPHY
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'sans-serif',
    ].join(','),
    
    // Custom typography variants with responsive scaling
    appTitle: {
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      fontWeight: 'normal',
      fontSize: '2rem',
      lineHeight: 1.2,
      marginBottom: '1.5rem',
      '@media (max-width:960px)': {
        fontSize: '1.75rem',
        marginBottom: '1rem',
      },
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
        marginBottom: '0.75rem',
      }
    },
    
    sectionTitle: {
      fontFamily: 'Georgia, serif',
      color: COLORS.primary,
      fontSize: '2rem',
      fontWeight: 'normal',
      lineHeight: 1.2,
      marginBottom: '1.5rem',
      '@media (max-width:960px)': {
        fontSize: '1.75rem',
        marginBottom: '1rem',
      }
    },
    
    cityName: {
      fontFamily: 'Georgia, serif',
      color: COLORS.texts.primary,
      fontWeight: 'normal',
      fontSize: '1.5rem',
      lineHeight: 1.3,
      '@media (max-width:600px)': {
        fontSize: '1.3rem',
      }
    },
    
    // Utility typography variants
    timestamp: {
      fontSize: '0.75rem',
      color: COLORS.secondary,
      fontWeight: 'bold',
      lineHeight: 1.4
    },
    
    ruler: {
      fontSize: '0.8rem',
      color: COLORS.texts.primary,
      fontWeight: 'medium',
      lineHeight: 1.4
    },
    
    muted: {
      color: COLORS.texts.muted,
      fontSize: '0.8rem',
      lineHeight: 1.4,
      '@media (max-width:600px)': {
        fontSize: '0.7rem',
      }
    }
  },

  // COMPREHENSIVE COMPONENT OVERRIDES
  components: {
    // ENHANCED PAPER VARIANTS
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#fbf3e2',
        },
      },
      variants: [
        {
          props: { variant: 'sidebar' },
          style: {
            backgroundColor: COLORS.background,
            borderRight: `1px solid ${COLORS.border}`,
            boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }
        },
        {
          props: { variant: 'control' },
          style: {
            backgroundColor: 'rgba(248, 245, 238, 0.9)',
            border: `1px solid ${COLORS.border}`,
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(248, 245, 238, 0.95)'
            }
          }
        },
        {
          props: { variant: 'infoBox' },
          style: {
            backgroundColor: '#fbf3e2',
            border: `1px solid ${COLORS.border}`,
            padding: '1rem'
          }
        },
        {
          props: { variant: 'datesBox' },
          style: {
            backgroundColor: '#fbf3e2',
            border: `1px solid ${COLORS.border}`,
            padding: 0,
            overflow: 'hidden'
          }
        }
      ]
    },

    // ENHANCED BOX VARIANTS - Layout utilities
    MuiBox: {
      variants: [
        {
          props: { variant: 'appContainer' },
          style: {
            display: 'flex',
            height: '100vh',
            width: '100%'
          }
        },
        {
          props: { variant: 'sidebarContainer' },
          style: {
            width: '100%',
            maxWidth: '360px',
            height: '100%',
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: COLORS.background,
            '@media (max-width:960px)': {
              padding: '1rem',
              maxWidth: '100%'
            },
            '@media (max-width:600px)': {
              padding: '0.75rem'
            }
          }
        },
        {
          props: { variant: 'panelHeader' },
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid ${COLORS.border}`
          }
        },
        {
          props: { variant: 'filterContainer' },
          style: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: 'rgba(248, 245, 238, 0.5)',
            borderRadius: '8px',
            border: `1px solid ${COLORS.border}`,
            '@media (max-width:960px)': {
              flexDirection: 'column',
              gap: '0.75rem'
            }
          }
        },
        {
          props: { variant: 'centerLoading' },
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            color: COLORS.texts.secondary,
            flex: 1
          }
        },
        {
          props: { variant: 'emptyState' },
          style: {
            textAlign: 'center',
            padding: '3rem 1rem',
            color: COLORS.texts.muted,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }
        },
        {
          props: { variant: 'timeline' },
          style: {
            position: 'relative',
            marginTop: '0.5rem',
            paddingLeft: '2rem',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '1.5rem',
              top: '1.5rem',
              bottom: '1.5rem',
              width: '2px',
              backgroundColor: COLORS.timeline.line
            }
          }
        },
        {
          props: { variant: 'timelineItem' },
          style: {
            position: 'relative',
            marginBottom: '1.5rem',
            paddingLeft: '1rem',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: '-0.75rem',
              top: '0.25rem',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: COLORS.timeline.dotPrimary,
              zIndex: 1
            }
          }
        }
      ]
    },

    // ENHANCED TYPOGRAPHY VARIANTS - FIXED
    MuiTypography: {
      variants: [
        {
          props: { variant: 'appTitle' },
          style: {
            fontFamily: 'Georgia, serif',
            color: COLORS.primary,
            fontWeight: 'normal',
            fontSize: '2rem',
            lineHeight: 1.2,
            marginBottom: '1.5rem',
            '@media (max-width:960px)': {
              fontSize: '1.75rem',
              marginBottom: '1rem',
            },
            '@media (max-width:600px)': {
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
            }
          }
        },
        {
          props: { variant: 'sectionTitle' },
          style: {
            fontFamily: 'Georgia, serif',
            color: COLORS.primary,
            fontSize: '2rem',
            fontWeight: 'normal',
            lineHeight: 1.2,
            marginBottom: '1.5rem',
            '@media (max-width:960px)': {
              fontSize: '1.75rem',
              marginBottom: '1rem',
            }
          }
        },
        {
          props: { variant: 'cityName' },
          style: {
            fontFamily: 'Georgia, serif',
            color: COLORS.texts.primary,
            fontWeight: 'normal',
            fontSize: '1.5rem',
            lineHeight: 1.3,
            '@media (max-width:600px)': {
              fontSize: '1.3rem',
            }
          }
        },
        {
          props: { variant: 'timestamp' },
          style: {
            fontSize: '0.75rem',
            color: COLORS.secondary,
            fontWeight: 'bold',
            lineHeight: 1.4
          }
        },
        {
          props: { variant: 'ruler' },
          style: {
            fontSize: '0.8rem',
            color: COLORS.texts.primary,
            fontWeight: 'medium',
            lineHeight: 1.4
          }
        },
        {
          props: { variant: 'muted' },
          style: {
            color: COLORS.texts.muted,
            fontSize: '0.8rem',
            lineHeight: 1.4,
            '@media (max-width:600px)': {
              fontSize: '0.7rem',
            }
          }
        }
      ]
    },

    // ENHANCED BUTTON VARIANTS
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
          fontWeight: 'medium',
        },
      },
      variants: [
        {
          props: { variant: 'archaeo' },
          style: {
            backgroundColor: COLORS.primary,
            color: 'white',
            padding: '0.75rem 1.5rem',
            '&:hover': {
              backgroundColor: '#5d3a2a'
            }
          }
        },
        {
          props: { variant: 'archaeoSecondary' },
          style: {
            backgroundColor: COLORS.secondary,
            color: 'white',
            padding: '0.75rem 1.5rem',
            '&:hover': {
              backgroundColor: '#7a6441'
            }
          }
        },
        {
          props: { variant: 'archaeoOutlined' },
          style: {
            borderColor: COLORS.primary,
            color: COLORS.primary,
            padding: '0.75rem 1.5rem',
            '&:hover': {
              borderColor: COLORS.primary,
              backgroundColor: 'rgba(119, 73, 54, 0.1)'
            }
          }
        }
      ]
    },

    // ENHANCED ICONBUTTON VARIANTS
    MuiIconButton: {
      variants: [
        {
          props: { variant: 'control' },
          style: {
            backgroundColor: 'rgba(248, 245, 238, 0.9)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            '&:hover': { 
              backgroundColor: 'rgba(248, 245, 238, 0.95)',
              transform: 'scale(1.05)'
            }
          }
        },
        {
          props: { variant: 'nav' },
          style: {
            backgroundColor: 'rgba(248, 245, 238, 0.8)',
            padding: '8px',
            borderRadius: '8px',
            color: COLORS.primary,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(248, 245, 238, 0.95)',
              transform: 'scale(1.1)'
            },
            '&.Mui-disabled': {
              opacity: 0.3,
              backgroundColor: 'rgba(248, 245, 238, 0.5)',
              color: COLORS.texts.muted
            }
          }
        }
      ]
    },

    // ENHANCED TEXTFIELD
    MuiTextField: {
      variants: [
        {
          props: { variant: 'archaeo' },
          style: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: COLORS.border,
              },
              '&:hover fieldset': {
                borderColor: COLORS.primary,
              },
              '&.Mui-focused fieldset': {
                borderColor: COLORS.primary,
              },
            }
          }
        }
      ]
    },

    // ENHANCED CHIP
    MuiChip: {
      variants: [
        {
          props: { variant: 'status' },
          style: {
            fontWeight: 'medium',
            fontSize: '0.75rem'
          }
        }
      ]
    },

    // ENHANCED DIVIDER
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: COLORS.border,
        },
      },
    },

    // ENHANCED TABLE
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: COLORS.background,
          fontWeight: 'bold',
          color: COLORS.texts.primary
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(119, 73, 54, 0.02)'
          }
        }
      }
    }
  },

  // CUSTOM THEME EXTENSIONS
  custom: {
    // Layout dimensions
    layout: {
      sidebarWidth: '360px',
      sidebarWidthCollapsed: '60px',
      headerHeight: '64px',
      controlPanelWidth: '240px'
    },
    
    // Animation durations
    transitions: {
      fast: '0.15s',
      medium: '0.2s',
      slow: '0.3s'
    },
    
    // Z-index scale
    zIndex: {
      map: 1,
      controls: 1000,
      sidebar: 1100,
      header: 1200,
      modal: 1300,
      tooltip: 1400
    },
    
    // Common mixins
    mixins: {
      flexCenter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      flexBetween: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      },
      absoluteCenter: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      },
      glassmorphism: {
        backgroundColor: 'rgba(248, 245, 238, 0.9)',
        backdropFilter: 'blur(4px)',
        border: `1px solid ${COLORS.border}`
      }
    }
  }
});

// OPTIMIZED GLOBAL STYLES - Reduced and more efficient
const globalStyles = {
  // Base styles
  'body, html, #root': {
    margin: 0,
    padding: 0,
    height: '100%',
    fontFamily: theme.typography.fontFamily,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    backgroundColor: COLORS.background
  },
  
  '*': {
    boxSizing: 'border-box',
  },

  // LEAFLET MAP STYLES - Optimized
  '.leaflet-label-wrapper': {
    background: 'none !important',
    border: 'none !important',
    boxShadow: 'none !important',
  },
  
  '.city-label': {
    position: 'absolute',
    top: '-30px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'Georgia, serif',
    fontSize: '11px',
    color: 'rgba(67, 52, 34, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    padding: '3px 8px',
    pointerEvents: 'auto',
    cursor: 'pointer',
    boxShadow: '0 0 1px rgba(0,0,0,0.2)',
    transition: 'all 0.2s ease',
    
    '&.selected': {
      backgroundColor: '#daa520',
      color: 'rgb(62, 62, 60)',
    },
    
    '&.ended': {
      color: '#a72626',
    }
  },

  // SCROLLBAR STYLES
  '.archaeo-scrollbar': {
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
  },

  // ANIMATION KEYFRAMES
  '@keyframes fadeIn': {
    from: { opacity: 0 },
    to: { opacity: 1 }
  },

  '@keyframes slideInRight': {
    from: { transform: 'translateX(100%)' },
    to: { transform: 'translateX(0)' }
  },

  '@keyframes slideInLeft': {
    from: { transform: 'translateX(-100%)' },
    to: { transform: 'translateX(0)' }
  },

  // UTILITY CLASSES - Most commonly used only
  '.fade-in': { animation: 'fadeIn 0.3s ease-in-out' },
  '.slide-in-right': { animation: 'slideInRight 0.3s ease-out' },
  '.slide-in-left': { animation: 'slideInLeft 0.3s ease-out' },
  '.transition-fast': { transition: 'all 0.15s ease' },
  '.transition-medium': { transition: 'all 0.2s ease' },
  '.transition-slow': { transition: 'all 0.3s ease' },
  
  // Layout utilities
  '.flex-center': theme.custom.mixins.flexCenter,
  '.flex-between': theme.custom.mixins.flexBetween,
  '.absolute-center': theme.custom.mixins.absoluteCenter,
  '.glassmorphism': theme.custom.mixins.glassmorphism,
  
  // Common spacing
  '.p-xs': { padding: '0.5rem' },
  '.p-sm': { padding: '0.75rem' },
  '.p-md': { padding: '1rem' },
  '.p-lg': { padding: '1.5rem' },
  '.p-xl': { padding: '2rem' },
  
  '.m-xs': { margin: '0.5rem' },
  '.m-sm': { margin: '0.75rem' },
  '.m-md': { margin: '1rem' },
  '.m-lg': { margin: '1.5rem' },
  '.m-xl': { margin: '2rem' },

  // Visibility utilities
  '.mobile-only': {
    '@media (min-width: 960px)': { display: 'none !important' }
  },
  '.desktop-only': {
    '@media (max-width: 960px)': { display: 'none !important' }
  }
};

// THEME PROVIDER COMPONENT
const AppTheme = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles styles={globalStyles} />
      {children}
    </ThemeProvider>
  );
};

// THEME HOOKS - For easier usage in components
export const useArchaeoTheme = () => theme;

// UTILITY FUNCTIONS - For programmatic theme access
export const getColor = (colorPath) => {
  return colorPath.split('.').reduce((obj, key) => obj?.[key], theme.palette);
};

export const getSpacing = (multiplier = 1) => `${multiplier * 0.5}rem`;

export const getBreakpoint = (size) => theme.breakpoints.values[size];

export default AppTheme;