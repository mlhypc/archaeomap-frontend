// frontend/src/home/sections/Map/features/CesiumGlobe.js
// 3D Globe implementation using Cesium

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Viewer } from 'resium';
import {
  Cartesian2,
  Cartesian3,
  Color,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
  CustomDataSource,
  LabelStyle,
  VerticalOrigin,
  HorizontalOrigin
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import './cesium-custom.css';
import { getCurrentCityName } from '../../../../shared/config/generalUtils';

// CESIUM_BASE_URL is defined in craco.config.js

const CesiumGlobe = ({
  cities = [],
  selectedCity,
  onCityClick,
  onCameraChange,
  currentYear,
  showLabels = true,
  labelFilter = 'show_active_only',
  cameraPosition = { lat: 36, lng: 31, zoom: 6 }
}) => {
  const viewerRef = useRef(null);
  const cityEntityMapRef = useRef(new Map()); // Track city ID -> City data mapping
  const dataSourceRef = useRef(null); // Custom DataSource for entities
  const handlerRef = useRef(null); // Store event handler
  const [viewerReady, setViewerReady] = useState(false); // Track viewer ready state
  const isInitialMount = useRef(true); // Track first camera position set

  // Callback when Viewer is loaded and ready
  const handleViewerReady = useCallback((viewer) => {
    viewerRef.current = viewer;
    const scene = viewer.scene;
    const camera = viewer.camera;

    // IMMEDIATELY set camera to 2D position (no initial animation)
    // Adjusted formula: compensate for 2 zoom levels difference
    const height = Math.max(10000, 150000000 / Math.pow(2, cameraPosition.zoom));
    camera.setView({
      destination: Cartesian3.fromDegrees(
        cameraPosition.lng,
        cameraPosition.lat,
        height
      ),
      orientation: {
        heading: 0,
        pitch: -1.5708, // -90 degrees (looking straight down)
        roll: 0
      }
    });

    // Create custom data source for city entities
    const dataSource = new CustomDataSource('cities');
    viewer.dataSources.add(dataSource);
    dataSourceRef.current = dataSource;

    // Lock camera pitch to look straight down at globe
    scene.screenSpaceCameraController.enableTilt = false;

    // Allow rotation and zoom
    scene.screenSpaceCameraController.enableRotate = true;
    scene.screenSpaceCameraController.enableZoom = true;

    // Set zoom limits (min/max distance from globe surface)
    scene.screenSpaceCameraController.minimumZoomDistance = 2000; // Min: 2km
    scene.screenSpaceCameraController.maximumZoomDistance = 20000000; // Max: 20,000km

    // Track camera movements and sync to 2D map
    const handleCameraMove = () => {
      if (!onCameraChange) return;

      const cartographic = camera.positionCartographic;
      const lat = (cartographic.latitude * 180) / Math.PI;
      const lng = (cartographic.longitude * 180) / Math.PI;
      const height = cartographic.height;

      // Convert Cesium height to Leaflet zoom
      // Adjusted formula: compensate for 1 zoom levels difference
      const zoom = Math.max(0, Math.min(18, Math.log2(150000000 / height) ));

      onCameraChange({ lat, lng, zoom });
    };

    // Listen to camera move end events
    scene.camera.moveEnd.addEventListener(handleCameraMove);

    // Setup click handler for city entities
    const handler = new ScreenSpaceEventHandler(scene.canvas);

    handler.setInputAction((click) => {
      const pickedObject = scene.pick(click.position);

      if (defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;

        // Get city data from our map using entity id
        const cityData = cityEntityMapRef.current.get(entity.id);

        if (cityData && onCityClick) {
          onCityClick(cityData);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    handlerRef.current = handler;
    setViewerReady(true);
  }, [onCameraChange, onCityClick, cameraPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        handlerRef.current.destroy();
      }
      if (viewerRef.current && dataSourceRef.current) {
        viewerRef.current.dataSources.remove(dataSourceRef.current);
      }
    };
  }, []);

  // Convert lat/lng to Cartesian3 coordinates
  const getCityPosition = useCallback((city) => {
    if (!city.coordinates || city.coordinates.length !== 2) return null;
    const [lat, lng] = city.coordinates;
    // Convert to numbers in case they're strings
    const numLat = typeof lat === 'number' ? lat : parseFloat(lat);
    const numLng = typeof lng === 'number' ? lng : parseFloat(lng);

    if (isNaN(numLat) || isNaN(numLng)) return null;

    return Cartesian3.fromDegrees(numLng, numLat, 0);
  }, []);

  // Get city color based on status and selection
  const getCityColor = useCallback((city, isSelected) => {
    if (isSelected) {
      return Color.GOLD; // Selected city
    }

    // Check if city has ended
    const hasEnded = city.endDate && city.endDate < currentYear;
    if (hasEnded) {
      return Color.DARKGRAY; // Ended city
    }

    return Color.fromCssColorString('#774936'); // Active city (primary color)
  }, [currentYear]);

  // Get city size from PeriodIconSize based on current year (same logic as 2D map)
  const getCitySize = useCallback((city) => {
    if (!city.PeriodIconSize) return 5; // Default size

    const iconSizeData = city.PeriodIconSize.find(p =>
      currentYear >= p.start && currentYear <= p.end
    );

    return iconSizeData?.iconSize || 5;
  }, [currentYear]);

  // Check if a city should show label based on filter
  const shouldShowLabel = useCallback((city, hasEnded) => {
    if (!showLabels) return false;

    switch (labelFilter) {
      case 'show_all':
        return true;
      case 'show_active_only':
        return !hasEnded;
      case 'show_ended_only':
        return hasEnded;
      default:
        return true;
    }
  }, [showLabels, labelFilter]);

  // Update entities when cities, currentYear, selectedCity, or filters change
  // This mimics how 2D Leaflet markers work
  useEffect(() => {
    if (!dataSourceRef.current) return;

    const dataSource = dataSourceRef.current;
    const entities = dataSource.entities;

    // Clear existing entities (like 2D map clearing markers)
    entities.removeAll();
    cityEntityMapRef.current.clear();

    // Add new entities for current state (like 2D map adding markers)
    cities.forEach((city) => {
      const position = getCityPosition(city);
      if (!position) return;

      const isSelected = selectedCity?.id === city.id;
      const hasEnded = city.endDate && city.endDate < currentYear;
      const color = getCityColor(city, isSelected);
      const iconSize = getCitySize(city);
      const displayLabel = shouldShowLabel(city, hasEnded);
      const labelText = getCurrentCityName(city, currentYear);

      const entityId = `city-${city.id}`;

      // Label colors matching 2D map styles
      let labelTextColor;
      let labelBackgroundColor;

      if (isSelected) {
        // Selected: dark gray text on gold background
        labelTextColor = Color.fromCssColorString('rgb(62, 62, 60)');
        labelBackgroundColor = Color.fromCssColorString('#daa520');
      } else if (hasEnded) {
        // Ended: dark red text on white background
        labelTextColor = Color.fromCssColorString('#a72626');
        labelBackgroundColor = Color.fromCssColorString('rgba(255, 255, 255, 0.8)');
      } else {
        // Active: dark brown-gray text on white background
        labelTextColor = Color.fromCssColorString('rgba(67, 52, 34, 0.8)');
        labelBackgroundColor = Color.fromCssColorString('rgba(255, 255, 255, 0.8)');
      }

      // Create entity
      entities.add({
        id: entityId,
        name: city.generic_city_name || city.name,
        position: position,
        point: {
          pixelSize: isSelected ? iconSize + 4 : iconSize,
          color: color,
          outlineColor: Color.WHITE,
          outlineWidth: isSelected ? 2 : 1,
        },
        label: displayLabel ? {
          text: ` ${labelText} `, // Add space padding for visual effect
          font: isSelected ? 'bold 13px Georgia, serif' : '12px Georgia, serif',
          fillColor: labelTextColor,
          style: LabelStyle.FILL, // No outline, just fill
          verticalOrigin: VerticalOrigin.BOTTOM,
          horizontalOrigin: HorizontalOrigin.CENTER,
          pixelOffset: new Cartesian2(0, -15), // Higher above point
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          showBackground: true,
          backgroundColor: labelBackgroundColor,
          backgroundPadding: new Cartesian2(8, 6), // More padding for rounded effect
          show: true
        } : undefined
      });

      // Store city data for click handling
      cityEntityMapRef.current.set(entityId, city);
    });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cities, // Full cities array to detect any changes
    selectedCity?.id, // Only trigger when selected city ID changes
    currentYear,
    showLabels,
    labelFilter
  ]);

  // Camera position sync with 2D map (only for manual movements in 3D)
  useEffect(() => {
    if (!viewerRef.current || !viewerReady || isInitialMount.current) return;

    const viewer = viewerRef.current;
    const camera = viewer.camera;

    // Convert Leaflet zoom to Cesium height
    // Adjusted formula: compensate for 2 zoom levels difference
    const height = Math.max(10000, 150000000 / Math.pow(2, cameraPosition.zoom));

    // Instant update for timeline/filter changes
    camera.setView({
      destination: Cartesian3.fromDegrees(
        cameraPosition.lng,
        cameraPosition.lat,
        height
      ),
      orientation: {
        heading: camera.heading,
        pitch: camera.pitch,
        roll: camera.roll
      }
    });
  }, [cameraPosition, viewerReady]);

  // Mark as no longer initial mount after first render
  useEffect(() => {
    if (viewerReady) {
      isInitialMount.current = false;
    }
  }, [viewerReady]);

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      pointerEvents: 'auto'
    }}>
      <Viewer
        ref={(ref) => {
          if (ref && ref.cesiumElement && !viewerReady) {
            handleViewerReady(ref.cesiumElement);
          }
        }}
        timeline={false}
        animation={false}
        baseLayerPicker={false}
        geocoder={false}
        homeButton={false}
        infoBox={false}
        sceneModePicker={false}
        selectionIndicator={false}
        navigationHelpButton={false}
        navigationInstructionsInitiallyVisible={false}
        scene3DOnly={true}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {/* Entities are managed via dataSourceRef, not JSX */}
      </Viewer>
    </div>
  );
};

export default React.memo(CesiumGlobe);
