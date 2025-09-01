// frontend\src\config\mapControls.js - OPTIMIZED VERSION

import React from 'react';
import {
  IconButton,
  Tooltip as MuiTooltip,
  Fade,
  Paper,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import LabelIcon from '@mui/icons-material/Label';
import LayersIcon from '@mui/icons-material/Layers';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckIcon from '@mui/icons-material/Check';

import { COLORS } from './generalUtils';
import {
  HISTORICAL_AGE_CONFIG,
  LABEL_VISIBILITY,
  LABEL_VISIBILITY_LOOKUP
} from './mapUtils';

// === SHARED CONTROL COMPONENTS ===

// Reusable Control Container
const ControlContainer = ({ children, position = 'topRight', sx = {} }) => {
  const positionStyles = {
    topRight: { top: 12, right: 12 },
    topLeft: { top: 12, left: 12 },
    bottomLeft: { bottom: 12, left: 12 },
    bottomRight: { bottom: 12, right: 12 }
  };

  return (
    <Paper
      variant="control"
      sx={{
        position: 'absolute',
        zIndex: 1000,
        ...positionStyles[position],
        ...sx
      }}
    >
      {children}
    </Paper>
  );
};

// Reusable Control Button with enhanced styling
const ControlButton = ({ 
  icon: Icon, 
  tooltip, 
  onClick, 
  color = COLORS.primary,
  isActive = false,
  ...props 
}) => {
  const theme = useTheme();
  
  return (
    <MuiTooltip
      title={tooltip}
      arrow 
      placement="bottom"
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      <IconButton
        variant="control"
        onClick={onClick}
        size="medium"
        sx={{
          color: isActive ? theme.palette.primary.main : color,
          backgroundColor: isActive ? 'rgba(119, 73, 54, 0.1)' : undefined,
          ...props.sx
        }}
        {...props}
      >
        <Icon />
      </IconButton>
    </MuiTooltip>
  );
};

// Reusable Control Menu
const ControlMenu = ({ 
  anchorEl, 
  onClose, 
  children,
  id,
  ...props 
}) => (
  <Menu
    id={id}
    anchorEl={anchorEl}
    keepMounted
    open={Boolean(anchorEl)}
    onClose={onClose}
    PaperProps={{
      elevation: 3,
      sx: {
        mt: 0.2,
        ml: '4px',
        backgroundColor: 'rgba(248, 245, 238, 0.95)',
        backdropFilter: 'blur(4px)',
        borderRadius: '4px'
      }
    }}
    {...props}
  >
    {children}
  </Menu>
);

// Reusable Menu Item with selection indicator
const ControlMenuItem = ({ 
  selected, 
  onClick, 
  children, 
  color,
  dense = true,
  ...props 
}) => (
  <MenuItem
    onClick={onClick}
    dense={dense}
    sx={{ 
      minWidth: '220px',
      '&:hover': {
        backgroundColor: 'rgba(119, 73, 54, 0.05)'
      }
    }}
    {...props}
  >
    <ListItemIcon sx={{ minWidth: '32px' }}>
      {selected && (
        <CheckIcon 
          fontSize="small" 
          sx={{ color: color || COLORS.primary }} 
        />
      )}
    </ListItemIcon>
    <ListItemText primary={children} />
  </MenuItem>
);

// === AUTHENTICATION PANEL ===
export const AuthenticationPanel = ({
  user,
  isAuthenticated,
  onAuthClick
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Hide on mobile to prevent duplication with FAB controls
  if (isMobile) return null;

  return (
    <ControlContainer position="topLeft">
      <ControlButton
        icon={AccountCircleIcon}
        tooltip={
          isAuthenticated ? (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {user?.username}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Click to manage account
              </Typography>
            </Box>
          ) : (
            'Login / Register'
          )
        }
        onClick={onAuthClick}
        color={isAuthenticated ? '#2e7d32' : COLORS.primary}
        isActive={isAuthenticated}
        sx={{
          position: 'relative',
          ...(isAuthenticated && {
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 2,
              right: 2,
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              border: '1.5px solid white',
              boxShadow: '0 0 0 1px rgba(76, 175, 80, 0.3)'
            }
          })
        }}
        aria-label={isAuthenticated ? "Account settings" : "Login or register"}
      />
    </ControlContainer>
  );
};

// === MAP CONTROL PANEL ===
export const ControlPanel = ({
  ageFilter,
  setAgeFilter,
  ageMenuAnchorEl,
  setAgeMenuAnchorEl,
  ageMenuClose,
  labelFilter,
  setLabelFilter,
  labelMenuAnchorEl,
  setLabelMenuAnchorEl,
  labelMenuClose,
  mapLayerKey,
  setMapLayerKey,
  layerMenuAnchorEl,
  setLayerMenuAnchorEl,
  layerMenuClose,
  mapLayers
}) => {
  // Get current configs
  const ageProps = HISTORICAL_AGE_CONFIG[ageFilter];
  const labelProps = LABEL_VISIBILITY_LOOKUP[labelFilter];
  const currentLayer = mapLayers[mapLayerKey];

  return (
    <>
      <ControlContainer position="topRight">
        <Stack direction="row">
          {/* Age Filter */}
          <ControlButton
            icon={HistoryIcon}
            tooltip={ageProps.tooltip}
            onClick={setAgeMenuAnchorEl}
            color={ageProps.color}
            aria-label="Filter cities by historical age"
          />

          {/* Label Filter */}
          <ControlButton
            icon={LabelIcon}
            tooltip={labelProps?.tooltip || 'Filter city labels'}
            onClick={setLabelMenuAnchorEl}
            color={labelProps?.color}
            aria-label="Filter label visibility"
          />

          {/* Map Layer Selector */}
          <ControlButton
            icon={LayersIcon}
            tooltip={`Map layer: ${currentLayer.name}`}
            onClick={setLayerMenuAnchorEl}
            color="#6d4c41"
            aria-label="Change map base layer"
          />
        </Stack>
      </ControlContainer>

      {/* Control Menus */}
      <AgeMenu
        ageFilter={ageFilter}
        anchorEl={ageMenuAnchorEl}
        onClose={ageMenuClose}
        onFilterSelect={setAgeFilter}
      />

      <LabelMenu
        labelFilter={labelFilter}
        anchorEl={labelMenuAnchorEl}
        onClose={labelMenuClose}
        onFilterSelect={setLabelFilter}
      />

      <MapLayerMenu
        mapLayerKey={mapLayerKey}
        anchorEl={layerMenuAnchorEl}
        onClose={layerMenuClose}
        onSelect={setMapLayerKey}
        mapLayers={mapLayers}
      />
    </>
  );
};

// === SPECIALIZED MENUS ===

// Age Filter Menu
export const AgeMenu = ({ ageFilter, anchorEl, onClose, onFilterSelect }) => (
  <ControlMenu
    id="age-menu"
    anchorEl={anchorEl}
    onClose={onClose}
  >
    {Object.keys(HISTORICAL_AGE_CONFIG).map((key) => (
      <ControlMenuItem
        key={key}
        selected={ageFilter === key}
        onClick={() => {
          onFilterSelect(key);
          onClose();
        }}
        color={HISTORICAL_AGE_CONFIG[key].color}
      >
        {HISTORICAL_AGE_CONFIG[key].tooltip}
      </ControlMenuItem>
    ))}
  </ControlMenu>
);

// Label Filter Menu
export const LabelMenu = ({ labelFilter, anchorEl, onClose, onFilterSelect }) => (
  <ControlMenu
    id="label-menu"
    anchorEl={anchorEl}
    onClose={onClose}
  >
    {Object.values(LABEL_VISIBILITY).map((option) => (
      <ControlMenuItem
        key={option.key}
        selected={labelFilter === option.key}
        onClick={() => {
          onFilterSelect(option.key);
          onClose();
        }}
        color={option.color}
      >
        {option.label}
      </ControlMenuItem>
    ))}
  </ControlMenu>
);

// Map Layer Menu
const MapLayerMenu = ({ mapLayerKey, anchorEl, onClose, onSelect, mapLayers }) => (
  <ControlMenu
    anchorEl={anchorEl}
    onClose={onClose}
  >
    {Object.entries(mapLayers).map(([key, layer]) => (
      <ControlMenuItem
        key={key}
        selected={mapLayerKey === key}
        onClick={() => {
          onSelect(key);
          onClose();
        }}
      >
        {layer.name}
      </ControlMenuItem>
    ))}
  </ControlMenu>
);