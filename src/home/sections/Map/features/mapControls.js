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
  Avatar,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import LabelIcon from '@mui/icons-material/Label';
import LayersIcon from '@mui/icons-material/Layers';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckIcon from '@mui/icons-material/Check';
import ViewInArIcon from '@mui/icons-material/ViewInAr';

import { COLORS } from '../../../../shared/config/generalUtils';
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
        zIndex: 9,
        borderRadius: '12px',
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
  disabled = false,
  ...props
}) => {
  const theme = useTheme();

  const button = (
    <IconButton
      variant="control"
      onClick={onClick}
      size="medium"
      disabled={disabled}
      sx={{
        color: isActive ? theme.palette.primary.main : color,
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.4)' : 'transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          transform: 'scale(1.05)'
        },
        '&.Mui-disabled': {
          color: 'rgba(119, 73, 54, 0.4)',
          backgroundColor: 'transparent',
          opacity: 0.5
        },
        ...props.sx
      }}
      {...props}
    >
      <Icon />
    </IconButton>
  );

  // If disabled, wrap in span for Tooltip to work
  return (
    <MuiTooltip
      title={tooltip}
      arrow
      placement="bottom"
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      {disabled ? <span>{button}</span> : button}
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
      elevation: 0,
      sx: {
        mt: 0.5,
        ml: '4px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.5) !important',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: '0 4px 16px 0 rgba(119, 73, 54, 0.12)',
        overflow: 'hidden'
      }
    }}
    MenuListProps={{
      sx: {
        padding: '4px',
        backgroundColor: 'transparent !important'
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
      backgroundColor: 'transparent !important',
      '&:hover': {
        backgroundColor: 'rgba(119, 73, 54, 0.08) !important'
      },
      '&.Mui-selected': {
        backgroundColor: 'rgba(119, 73, 54, 0.12) !important',
        '&:hover': {
          backgroundColor: 'rgba(119, 73, 54, 0.16) !important'
        }
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

  if (isMobile) return null;

  const tooltip = isAuthenticated ? (
    <Box>
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{user?.username}</Typography>
      <Typography variant="caption" sx={{ opacity: 0.8 }}>Click to manage account</Typography>
    </Box>
  ) : 'Login / Register';

  return (
    <ControlContainer position="topLeft">
      <MuiTooltip title={tooltip} arrow placement="bottom" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
        <IconButton
          onClick={onAuthClick}
          size="medium"
          aria-label={isAuthenticated ? "Account settings" : "Login or register"}
          sx={{
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)', transform: 'scale(1.05)' },
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
        >
          {isAuthenticated ? (
            <Avatar
              src={user?.profileImageUrl || undefined}
              sx={{ width: 28, height: 28, fontSize: '0.85rem', bgcolor: COLORS.primary }}
            >
              {!user?.profileImageUrl && (user?.username?.[0]?.toUpperCase() || '?')}
            </Avatar>
          ) : (
            <AccountCircleIcon sx={{ color: COLORS.primary }} />
          )}
        </IconButton>
      </MuiTooltip>
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
  mapLayers,
  enable3D,
  toggle3D
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
            tooltip={enable3D ? "Map layers not available in 3D mode" : `Map layer: ${currentLayer.name}`}
            onClick={enable3D ? undefined : setLayerMenuAnchorEl}
            color="#6d4c41"
            aria-label="Change map base layer"
            disabled={enable3D}
            sx={{
              ...(enable3D && {
                opacity: 0.5,
                cursor: 'not-allowed',
                pointerEvents: 'auto'
              })
            }}
          />

          {/* 3D Toggle - Last button (rightmost) */}
          <ControlButton
            icon={ViewInArIcon}
            tooltip={enable3D ? "Switch to 2D View" : "Switch to 3D View"}
            onClick={toggle3D}
            color={COLORS.primary}
            isActive={enable3D}
            aria-label={enable3D ? "Switch to 2D" : "Switch to 3D"}
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
    id="layer-menu"
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