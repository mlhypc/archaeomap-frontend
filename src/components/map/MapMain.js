// frontend\src\components\map\MapMain.js - OPTIMIZED VERSION

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, useMediaQuery, Alert, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import TimeSlider from './TimeSlider';
import { cachedCitiesApi } from '../../services/cityApi';
import { useAuth } from '../../contexts/AuthContext';
import L from 'leaflet';

import {
  getCityIcon,
  endedCityIcon,
  HISTORICAL_AGES,
  HISTORICAL_AGE_CONFIG,
  createCityLabel,
  LABEL_VISIBILITY
} from '../../config/mapUtils';

import { ControlPanel, AuthenticationPanel } from '../../config/mapControls';
import { getCurrentCityName } from '../../config/generalUtils';

// MAP LAYERS - moved outside component to prevent re-creation
const MAP_LAYERS = {
  arcgis: {
    name: 'ArcGIS',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Source: US National Park Service',
    maxZoom: 17
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 17
  },
  nasa: {
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 17
  }
};

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
function BoundsTracker({ onBoundsChange }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const updateBounds = () => onBoundsChange(map.getBounds());
    updateBounds();
    map.on('moveend', updateBounds);
    map.on('zoomend', updateBounds);
    return () => {
      map.off('moveend', updateBounds);
      map.off('zoomend', updateBounds);
    };
  }, [map, onBoundsChange]);
  return null;
}

// RENDER MARKERS - optimized function
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
  return cities.map((city) => (
    <React.Fragment key={`fragment-${city.id}`}>
      <Marker
        position={city.coordinates}
        icon={iconFn(city, selectedCity?.id === city.id)}
        eventHandlers={{ click: () => handleSelectCity(city) }}
      />
      {showLabels && visibleKeys.includes(labelFilter) && (
        <Marker
          position={city.coordinates}
          icon={createCityLabel(
            getCurrentCityName(city, currentYear),
            selectedCity?.id === city.id,
            status
          )}
          eventHandlers={{ click: () => handleSelectCity(city) }}
        />
      )}
    </React.Fragment>
  ));
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
    mapLayerKey: 'arcgis',
    showLabels: true
  });

  const [menuState, setMenuState] = useState({
    ageMenuAnchorEl: null,
    labelMenuAnchorEl: null,
    layerMenuAnchorEl: null
  });

  const [mapState, setMapState] = useState({
    map: null,
    mapBounds: null
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
  }, [uiState.selectedCity?.id]);

  // OPTIMIZED: Visible cities calculation
  const visibleCities = useMemo(() => {
    if (!mapState.mapBounds) return dataState.currentDisplayData;
    
    const padBounds = mapState.mapBounds.pad(0.2);
    
    const filterAndEnhance = (cities) => 
      cities
        .filter(c => c.coordinates && padBounds.contains(L.latLng(c.coordinates)))
        .map(city => {
          const iconSize = city.PeriodIconSize?.find(p => 
            uiState.currentYear >= p.start && uiState.currentYear <= p.end
          )?.iconSize || 5;
          return { ...city, iconSize };
        });
    
    return {
      active: filterAndEnhance(dataState.currentDisplayData.active),
      ended: filterAndEnhance(dataState.currentDisplayData.ended)
    };
  }, [dataState.currentDisplayData, mapState.mapBounds, uiState.currentYear]);

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
  }, [onYearChange]);

  const handleBoundsChange = useCallback((bounds) => {
    setMapState(prev => ({ ...prev, mapBounds: bounds }));
  }, []);

  const handleMapReady = useCallback((map) => {
    setMapState(prev => ({ ...prev, map }));
  }, []);

  // OPTIMIZED: Direct menu handlers (fixed double currying)
  const handleAgeMenuOpen = useCallback((event) => {
    setMenuState(prev => ({ ...prev, ageMenuAnchorEl: event.currentTarget }));
  }, []);

  const handleLabelMenuOpen = useCallback((event) => {
    setMenuState(prev => ({ ...prev, labelMenuAnchorEl: event.currentTarget }));
  }, []);

  const handleLayerMenuOpen = useCallback((event) => {
    setMenuState(prev => ({ ...prev, layerMenuAnchorEl: event.currentTarget }));
  }, []);

  const handleAgeMenuClose = useCallback(() => {
    setMenuState(prev => ({ ...prev, ageMenuAnchorEl: null }));
  }, []);

  const handleLabelMenuClose = useCallback(() => {
    setMenuState(prev => ({ ...prev, labelMenuAnchorEl: null }));
  }, []);

  const handleLayerMenuClose = useCallback(() => {
    setMenuState(prev => ({ ...prev, layerMenuAnchorEl: null }));
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setUiState(prev => ({ ...prev, [filterType]: value }));
  }, []);

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
          severity="error" 
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
          {dataState.error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', width: '100%', position: 'relative' }}>
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

      <MapContainer
        center={[36, 31]}
        zoom={6}
        minZoom={5}
        maxZoom={MAP_LAYERS[uiState.mapLayerKey].maxZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        whenCreated={handleMapReady}
      >
        <TileLayer
          key={uiState.mapLayerKey}
          url={MAP_LAYERS[uiState.mapLayerKey].url}
          attribution={MAP_LAYERS[uiState.mapLayerKey].attribution}
          maxZoom={MAP_LAYERS[uiState.mapLayerKey].maxZoom}
        />

        <BoundsTracker onBoundsChange={handleBoundsChange} />

        {/* OPTIMIZED: Memoized city markers */}
        <CityMarkers
          visibleCities={visibleCities}
          selectedCity={uiState.selectedCity}
          handleSelectCity={handleSelectCity}
          labelFilter={uiState.labelFilter}
          showLabels={uiState.showLabels}
          currentYear={uiState.currentYear}
        />
      </MapContainer>

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

// EXTRACTED COMPONENT - City markers rendering
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

  return (
    <>
      {/* Active Cities */}
      {renderCityMarkers(
        visibleCities.active,
        getCityIcon,
        labelFilter,
        visibleKeys.active,
        selectedCity,
        handleSelectCity,
        showLabels,
        'active',
        currentYear
      )}

      {/* Ended Cities */}
      {renderCityMarkers(
        visibleCities.ended,
        () => endedCityIcon,
        labelFilter,
        visibleKeys.ended,
        selectedCity,
        handleSelectCity,
        showLabels,
        'ended',
        currentYear
      )}
    </>
  );
});

export default React.memo(MapComponent);