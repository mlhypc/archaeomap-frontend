// frontend\src\components\map\MapMain.js - OPTIMIZED VERSION

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, useMediaQuery, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TimeSlider from './TimeSlider';
import { cachedCitiesApi } from '../../../shared/services/cityApi';
import { useAuth } from '../../../shared/contexts/AuthContext';
import L from 'leaflet';

import {
  getCityIcon,
  endedCityIcon,
  HISTORICAL_AGES,
  HISTORICAL_AGE_CONFIG,
  createCityLabel,
  LABEL_VISIBILITY
} from './features/mapUtils';

import { ControlPanel, AuthenticationPanel } from './features/mapControls';
import { getCurrentCityName } from '../../../shared/config/generalUtils';
import CesiumGlobe from './features/CesiumGlobe';

// MAP LAYERS - moved outside component to prevent re-creation
const MAP_LAYERS = {
  cawm: {
    name: 'Ancient World Map',
    url: 'https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png',
    attribution: '&copy; Consortium of Ancient World Mappers (CAWM)',
    maxZoom: 13  // Override default
  },
  arcgis: {
    name: 'ArcGIS',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Source: US National Park Service',
    maxZoom: 13  // Override default
  },
  nasa: {
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  }
};

// Global zoom settings
const MAP_MIN_ZOOM = 1;
const MAP_MAX_ZOOM = 17;

// TIMELINE YEARS - moved outside to prevent re-generation
const generateTimelineYears = () => {
  const timePeriods = [];
  for (let year = -5000; year <= -3300; year += 100) timePeriods.push(year);
  for (let year = -3250; year <= -1200; year += 50) timePeriods.push(year);
  for (let year = -1175; year <= 2025; year += 25) timePeriods.push(year);
  return timePeriods.sort((a, b) => a - b);
};

const TIMELINE_YEARS = generateTimelineYears();

// FILTERING FUNCTIONS - moved outside component
const filterCitiesByAge = (cities, ageFilter) => {
  if (ageFilter === HISTORICAL_AGES.ALL_AGES) return cities;
  const ageConfig = HISTORICAL_AGE_CONFIG[ageFilter];
  return ageConfig ? cities.filter(city => ageConfig.range(city.founded)) : cities;
};

const filterCitiesByYear = (cities, year) => 
  cities.filter(city => city.founded <= year);

const categorizeCitiesByStatus = (cities, year) => {
  const active = [];
  const ended = [];
  cities.forEach(city => {
    (!city.endDate || city.endDate >= year) ? active.push(city) : ended.push(city);
  });
  return { active, ended };
};

// BOUNDS TRACKER - extracted component
function BoundsTracker({ onBoundsChange, onCameraChange }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const updateBounds = () => {
      onBoundsChange(map.getBounds());
      // Also track camera position
      const center = map.getCenter();
      const zoom = map.getZoom();
      onCameraChange({ lat: center.lat, lng: center.lng, zoom });
    };
    updateBounds();
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map, onBoundsChange, onCameraChange]);
  return null;
}

// OPTIMIZED CITY MARKER COMPONENT - Memoized for performance
const OptimizedCityMarker = React.memo(({ 
  city, 
  iconFn, 
  isSelected, 
  onSelect, 
  showLabel,
  labelText,
  status,
  currentYear
}) => {
  // Memoize icon creation to prevent unnecessary recreations
  const icon = useMemo(() => iconFn(city, isSelected), [city, iconFn, isSelected]);
  
  // Memoize label icon creation
  const labelIcon = useMemo(() => {
    return showLabel ? createCityLabel(labelText, isSelected, status) : null;
  }, [showLabel, labelText, isSelected, status]);

  // Memoize click handler
  const handleClick = useCallback(() => onSelect(city), [city, onSelect]);

  return (
    <>
      <Marker
        position={city.coordinates}
        icon={icon}
        eventHandlers={{ click: handleClick }}
      />
      {showLabel && labelIcon && (
        <Marker
          position={city.coordinates}
          icon={labelIcon}
          eventHandlers={{ click: handleClick }}
        />
      )}
    </>
  );
});

// RENDER MARKERS - now using optimized components
const renderCityMarkers = (
  cities,
  iconFn,
  labelFilter,
  visibleKeys,
  selectedCity,
  handleSelectCity,
  showLabels,
  status,
  currentYear
) => {
  return cities.map((city) => {
    const isSelected = selectedCity?.id === city.id;
    const showLabel = showLabels && visibleKeys.includes(labelFilter);
    const labelText = getCurrentCityName(city, currentYear);

    return (
      <OptimizedCityMarker
        key={`${city.id}-${status}`}
        city={city}
        iconFn={iconFn}
        isSelected={isSelected}
        onSelect={handleSelectCity}
        showLabel={showLabel}
        labelText={labelText}
        status={status}
        currentYear={currentYear}
      />
    );
  });
};

// CUSTOM HOOK - extracted map state logic
function useMapState() {
  // CONSOLIDATED STATE - reduced from 15+ useState to 3 compound states
  const [dataState, setDataState] = useState({
    allCities: [],
    currentDisplayData: { active: [], ended: [] },
    availableYears: TIMELINE_YEARS,
    initialLoading: true,
    error: null
  });

  const [uiState, setUiState] = useState({
    selectedCity: null,
    currentYear: -5000,
    ageFilter: HISTORICAL_AGES.ALL_AGES,
    labelFilter: LABEL_VISIBILITY.SHOW_ACTIVE_ONLY.key,
    mapLayerKey: 'cawm',
    showLabels: true,
    enable3D: false, // Toggle for 3D mode
    pitch: 0, // 0-60 degrees
    bearing: 0, // 0-360 degrees
    isTransitioning: false // Track transition state
  });

  const [menuState, setMenuState] = useState({
    ageMenuAnchorEl: null,
    labelMenuAnchorEl: null,
    layerMenuAnchorEl: null
  });

  const [mapState, setMapState] = useState({
    map: null,
    mapBounds: null,
    cameraPosition: { lat: 36, lng: 31, zoom: 6 } // Store camera position
  });

  return {
    dataState, setDataState,
    uiState, setUiState,
    menuState, setMenuState,
    mapState, setMapState
  };
}

// MAIN COMPONENT - optimized
function MapComponent(props) {
  const { 
    onSelectCity = () => {}, 
    onYearChange = () => {}, 
    onAuthClick = () => {} 
  } = props || {};

  // CUSTOM HOOK USAGE
  const {
    dataState, setDataState,
    uiState, setUiState,
    menuState, setMenuState,
    mapState, setMapState
  } = useMapState();

  const cityDetailsCache = useRef(new Map());
  const cameraPositionRef = useRef(mapState.cameraPosition); // Ref for camera position (no re-render)
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, isAuthenticated } = useAuth();

  // OPTIMIZED: Load initial data effect
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const bulkResult = await cachedCitiesApi.getBulkTimelineData();
        if (!bulkResult.success) {
          throw new Error(`Bulk data loading failed: ${bulkResult.error}`);
        }

        setDataState(prev => ({
          ...prev,
          allCities: bulkResult.data.cities || [],
          initialLoading: false,
          error: null
        }));

      } catch (err) {
        console.error('Initial data loading error:', err);
        setDataState(prev => ({
          ...prev,
          error: err.message || 'Failed to load initial data',
          initialLoading: false
        }));
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OPTIMIZED: Client-side filtering effect
  useEffect(() => {
    if (!dataState.allCities.length || uiState.currentYear === null) {
      setDataState(prev => ({
        ...prev,
        currentDisplayData: { active: [], ended: [] }
      }));
      return;
    }

    let filteredCities = filterCitiesByAge(dataState.allCities, uiState.ageFilter);
    filteredCities = filterCitiesByYear(filteredCities, uiState.currentYear);
    const categorizedData = categorizeCitiesByStatus(filteredCities, uiState.currentYear);

    setDataState(prev => ({
      ...prev,
      currentDisplayData: categorizedData
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataState.allCities, uiState.currentYear, uiState.ageFilter]);

  // OPTIMIZED: Callback to parent effect
  useEffect(() => {
    onSelectCity(uiState.selectedCity);
  }, [uiState.selectedCity, onSelectCity]);

  // OPTIMIZED: City selection handler with caching
  const handleSelectCity = useCallback(async (city) => {
    if (!city) {
      setUiState(prev => ({ ...prev, selectedCity: null }));
      return;
    }

    setUiState(prev => ({
      ...prev,
      selectedCity: prev.selectedCity?.id === city.id ? null : city
    }));

    if (uiState.selectedCity?.id === city.id) return;

    // Background detail fetching
    if (!cityDetailsCache.current.has(city.id)) {
      try {
        const result = await cachedCitiesApi.getCityDetails(city.id);
        if (result.success) {
          cityDetailsCache.current.set(city.id, result.data);
          setUiState(prev => {
            if (prev.selectedCity?.id === city.id) {
              return { ...prev, selectedCity: result.data };
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Failed to fetch city details:', error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState.selectedCity?.id]);

  // OPTIMIZED: Visible cities calculation with memoized bounds and filtering
  const padBounds = useMemo(() => {
    return mapState.mapBounds?.pad(0.1) || null; // Reduced padding for better performance
  }, [mapState.mapBounds]);

  const visibleCities = useMemo(() => {
    if (!padBounds) return { active: [], ended: [] };
    
    // More efficient filtering function
    const filterAndEnhance = (cities) => {
      const result = [];
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        if (city.coordinates && padBounds.contains(L.latLng(city.coordinates))) {
          // Cache icon size calculation for better performance
          const iconSize = city.PeriodIconSize?.find(p => 
            uiState.currentYear >= p.start && uiState.currentYear <= p.end
          )?.iconSize || 5;
          result.push({ ...city, iconSize });
        }
      }
      return result;
    };
    
    return {
      active: filterAndEnhance(dataState.currentDisplayData.active),
      ended: filterAndEnhance(dataState.currentDisplayData.ended)
    };
  }, [dataState.currentDisplayData, padBounds, uiState.currentYear]);

  // OPTIMIZED: Map resize handler
  useEffect(() => {
    if (!mapState.map) return;
    const resize = () => {
      setTimeout(() => mapState.map.invalidateSize(), 100);
      if (isMobile) mapState.map.setZoom(3);
    };
    resize();
    window.addEventListener('orientationchange', resize);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('orientationchange', resize);
      window.removeEventListener('resize', resize);
    };
  }, [mapState.map, isMobile]);

  // OPTIMIZED: Callback handlers
  const handleYearChange = useCallback((year) => {
    setUiState(prev => ({ ...prev, currentYear: year }));
    onYearChange(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onYearChange]);

  const handleBoundsChange = useCallback((bounds) => {
    setMapState(prev => ({ ...prev, mapBounds: bounds }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCameraChange = useCallback((camera) => {
    // Update ref immediately (no re-render)
    cameraPositionRef.current = camera;

    // Only update state when switching modes (will be handled by toggle3D)
    // This prevents constant re-renders during pan/zoom
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapReady = useCallback((map) => {
    setMapState(prev => ({ ...prev, map }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // OPTIMIZED: Menu toggle handlers (toggle open/close on click)
  const handleAgeMenuOpen = useCallback((event) => {
    setMenuState(prev => ({
      ...prev,
      ageMenuAnchorEl: prev.ageMenuAnchorEl ? null : event.currentTarget
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLabelMenuOpen = useCallback((event) => {
    setMenuState(prev => ({
      ...prev,
      labelMenuAnchorEl: prev.labelMenuAnchorEl ? null : event.currentTarget
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLayerMenuOpen = useCallback((event) => {
    setMenuState(prev => ({
      ...prev,
      layerMenuAnchorEl: prev.layerMenuAnchorEl ? null : event.currentTarget
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAgeMenuClose = useCallback(() => {
    setMenuState(prev => ({ ...prev, ageMenuAnchorEl: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLabelMenuClose = useCallback(() => {
    setMenuState(prev => ({ ...prev, labelMenuAnchorEl: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLayerMenuClose = useCallback(() => {
    setMenuState(prev => ({ ...prev, layerMenuAnchorEl: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setUiState(prev => ({ ...prev, [filterType]: value }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Simple 3D toggle - sync camera position only when switching
  const toggle3D = useCallback(() => {
    // Update state with latest camera position from ref
    setMapState(prev => ({
      ...prev,
      cameraPosition: cameraPositionRef.current
    }));

    setUiState(prev => ({
      ...prev,
      enable3D: !prev.enable3D,
      pitch: !prev.enable3D ? 45 : 0,
      bearing: 0, // Reset rotation
      isTransitioning: true // Start transition
    }));

    // End transition after 600ms (same as CSS transition duration)
    setTimeout(() => {
      setUiState(prev => ({
        ...prev,
        isTransitioning: false
      }));
    }, 600);
  }, [setMapState, setUiState]);

  // Error display
  if (dataState.error) {
    return (
      <Box sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}>
        <Alert
          severity="info"
          sx={{ maxWidth: 400 }}
          action={
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'none',
                border: '1px solid currentColor',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          }
        >
          <Box sx={{ fontWeight: 'medium', mb: 0.5 }}>
            We're currently offline
          </Box>
          <Box sx={{ fontSize: '0.875rem', opacity: 0.9 }}>
            We'll be back soon. Please check back later or try refreshing the page.
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100%',
      width: '100%',
      position: 'relative',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }}>
      {/* Initial loading overlay */}
      {dataState.initialLoading && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={50} />
            <Box sx={{ mt: 3, fontSize: '1.1rem', color: 'text.primary', fontWeight: 'medium' }}>
              Loading ArchaeoMap...
            </Box>
            <Box sx={{ mt: 1, fontSize: '0.9rem', color: 'text.secondary' }}>
              Preparing historical city data
            </Box>
          </Box>
        </Box>
      )}

      {/* Authentication Panel */}
      <AuthenticationPanel
        user={user}
        isAuthenticated={isAuthenticated}
        onAuthClick={onAuthClick}
      />

      {/* Control Panel */}
      <ControlPanel
        enable3D={uiState.enable3D}
        toggle3D={toggle3D}
        ageFilter={uiState.ageFilter}
        setAgeFilter={(value) => handleFilterChange('ageFilter', value)}
        ageMenuAnchorEl={menuState.ageMenuAnchorEl}
        setAgeMenuAnchorEl={handleAgeMenuOpen}
        ageMenuClose={handleAgeMenuClose}
        labelFilter={uiState.labelFilter}
        setLabelFilter={(value) => handleFilterChange('labelFilter', value)}
        labelMenuAnchorEl={menuState.labelMenuAnchorEl}
        setLabelMenuAnchorEl={handleLabelMenuOpen}
        labelMenuClose={handleLabelMenuClose}
        mapLayerKey={uiState.mapLayerKey}
        setMapLayerKey={(value) => handleFilterChange('mapLayerKey', value)}
        layerMenuAnchorEl={menuState.layerMenuAnchorEl}
        setLayerMenuAnchorEl={handleLayerMenuOpen}
        layerMenuClose={handleLayerMenuClose}
        mapLayers={MAP_LAYERS}
      />

      {/* Conditional rendering: 3D Globe or 2D Map with smooth transitions */}
      {/* Render 3D if enabled OR transitioning FROM 3D */}
      {(uiState.enable3D || (uiState.isTransitioning && !uiState.enable3D)) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: uiState.enable3D ? 1 : 0,
            visibility: uiState.enable3D ? 'visible' : 'hidden',
            transition: 'opacity 0.6s ease-in-out, visibility 0.6s ease-in-out',
            zIndex: uiState.enable3D ? 1 : 0
          }}
        >
          {/* 3D GLOBE VIEW */}
          <CesiumGlobe
            cities={[...dataState.currentDisplayData.active, ...dataState.currentDisplayData.ended]}
            selectedCity={uiState.selectedCity}
            onCityClick={handleSelectCity}
            onCameraChange={handleCameraChange}
            currentYear={uiState.currentYear}
            showLabels={uiState.showLabels}
            labelFilter={uiState.labelFilter}
            cameraPosition={mapState.cameraPosition}
          />
        </Box>
      )}

      {/* Render 2D if disabled OR transitioning TO 3D */}
      {(!uiState.enable3D || (uiState.isTransitioning && uiState.enable3D)) && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: !uiState.enable3D ? 1 : 0,
            visibility: !uiState.enable3D ? 'visible' : 'hidden',
            transition: 'opacity 0.6s ease-in-out, visibility 0.6s ease-in-out',
            zIndex: !uiState.enable3D ? 1 : 0
          }}
        >
          {/* 2D MAP VIEW */}
          <MapContainer
          key={`map-${mapState.cameraPosition.lat}-${mapState.cameraPosition.lng}-${mapState.cameraPosition.zoom}`}
          center={[mapState.cameraPosition.lat, mapState.cameraPosition.lng]}
          zoom={mapState.cameraPosition.zoom}
          minZoom={MAP_MIN_ZOOM}
          maxZoom={MAP_LAYERS[uiState.mapLayerKey].maxZoom || MAP_MAX_ZOOM}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          whenCreated={handleMapReady}
          worldCopyJump={false}
          maxBounds={[
            [-90, -180], // Southwest corner
            [90, 180]    // Northeast corner
          ]}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            key={uiState.mapLayerKey}
            url={MAP_LAYERS[uiState.mapLayerKey].url}
            attribution={MAP_LAYERS[uiState.mapLayerKey].attribution}
          />

          <BoundsTracker
            onBoundsChange={handleBoundsChange}
            onCameraChange={handleCameraChange}
          />

          {/* OPTIMIZED: Memoized 2D city markers */}
          <CityMarkers
            visibleCities={visibleCities}
            selectedCity={uiState.selectedCity}
            handleSelectCity={handleSelectCity}
            labelFilter={uiState.labelFilter}
            showLabels={uiState.showLabels}
            currentYear={uiState.currentYear}
          />
        </MapContainer>
      </Box>
      )}

      {/* TimeSlider */}
      {!dataState.initialLoading && (
        <TimeSlider
          onYearChange={handleYearChange}
          currentYear={uiState.currentYear}
          availableYears={dataState.availableYears}
        />
      )}
    </Box>
  );
}

// EXTRACTED COMPONENT - City markers rendering with deep memoization
const CityMarkers = React.memo(({ 
  visibleCities, 
  selectedCity, 
  handleSelectCity, 
  labelFilter, 
  showLabels, 
  currentYear 
}) => {
  // Memoized visible keys calculation
  const visibleKeys = useMemo(() => ({
    active: [LABEL_VISIBILITY.SHOW_ALL.key, LABEL_VISIBILITY.SHOW_ACTIVE_ONLY.key],
    ended: [LABEL_VISIBILITY.SHOW_ALL.key, LABEL_VISIBILITY.SHOW_ENDED_ONLY.key]
  }), []);

  // Memoized icon functions to prevent recreations
  const activeCityIconFn = useCallback((city, isSelected) => getCityIcon(city, isSelected), []);
  const endedCityIconFn = useCallback(() => endedCityIcon, []);

  // Memoize active cities rendering
  const activeMarkers = useMemo(() => 
    renderCityMarkers(
      visibleCities.active,
      activeCityIconFn,
      labelFilter,
      visibleKeys.active,
      selectedCity,
      handleSelectCity,
      showLabels,
      'active',
      currentYear
    ), [
      visibleCities.active, 
      activeCityIconFn, 
      labelFilter, 
      visibleKeys.active, 
      selectedCity, 
      handleSelectCity, 
      showLabels, 
      currentYear
    ]);

  // Memoize ended cities rendering  
  const endedMarkers = useMemo(() => 
    renderCityMarkers(
      visibleCities.ended,
      endedCityIconFn,
      labelFilter,
      visibleKeys.ended,
      selectedCity,
      handleSelectCity,
      showLabels,
      'ended',
      currentYear
    ), [
      visibleCities.ended, 
      endedCityIconFn, 
      labelFilter, 
      visibleKeys.ended, 
      selectedCity, 
      handleSelectCity, 
      showLabels, 
      currentYear
    ]);

  return (
    <>
      {/* Active Cities */}
      {activeMarkers}
      {/* Ended Cities */}
      {endedMarkers}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for deep memoization
  return (
    prevProps.visibleCities.active.length === nextProps.visibleCities.active.length &&
    prevProps.visibleCities.ended.length === nextProps.visibleCities.ended.length &&
    prevProps.selectedCity?.id === nextProps.selectedCity?.id &&
    prevProps.labelFilter === nextProps.labelFilter &&
    prevProps.showLabels === nextProps.showLabels &&
    prevProps.currentYear === nextProps.currentYear
  );
});

export default React.memo(MapComponent);