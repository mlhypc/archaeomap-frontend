//frontend\src\config\mapUtils.js

import React from 'react';
import L from 'leaflet';
import HistoryIcon from '@mui/icons-material/History';
import { COLORS } from '../../../../shared/config/generalUtils';

// === Historical Age Filter Config ===
export const HISTORICAL_AGES = {
  ALL_AGES: 'all_ages',
  NEOLITHIC_AGE: 'neolithic_age',
  BRONZE_AGE: 'bronze_age',
  IRON_AGE: 'iron_age',
  CLASSICAL: 'classical',
  MEDIEVAL: 'medieval',
  EARLY_MODERN: 'early_modern',
  MODERN: 'modern'
};

export const HISTORICAL_AGE_CONFIG = {
  [HISTORICAL_AGES.ALL_AGES]: {
    tooltip: "Cities from all historical periods",
    color: "#1565c0",
    icon: <HistoryIcon />,
    range: () => true
  },
  [HISTORICAL_AGES.NEOLITHIC_AGE]: {
    tooltip: "Neolithic Age cities (Old–3300 BCE)",
    color: "#8a8179",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear <= -3300
  },
  [HISTORICAL_AGES.BRONZE_AGE]: {
    tooltip: "Bronze Age cities (3300–1200 BCE)",
    color: "#cd7f32",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear >= -3300 && foundedYear <= -1200
  },
  [HISTORICAL_AGES.IRON_AGE]: {
    tooltip: "Iron Age cities (1200–500 BCE)",
    color: "#a19d94",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > -1200 && foundedYear <= -500
  },
  [HISTORICAL_AGES.CLASSICAL]: {
    tooltip: "Classical Antiquity cities (500 BCE–500 CE)",
    color: "#f5c542",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > -500 && foundedYear <= 500
  },
  [HISTORICAL_AGES.MEDIEVAL]: {
    tooltip: "Medieval cities (500–1500 CE)",
    color: "#8b4513",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > 500 && foundedYear <= 1500
  },
  [HISTORICAL_AGES.EARLY_MODERN]: {
    tooltip: "Early Modern cities (1500–1800 CE)",
    color: "#4b0082",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > 1500 && foundedYear <= 1800
  },
  [HISTORICAL_AGES.MODERN]: {
    tooltip: "Modern cities (1800 CE–present)",
    color: "#2e7d32",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > 1800
  }
};

// === Label Visibility Config ===
export const LABEL_VISIBILITY = {
  SHOW_ALL: {
    key: 'show_all',
    label: 'Show all labels',
    tooltip: 'Display labels for both active and ended cities',
    color: '#1976d2'
  },
  SHOW_ACTIVE_ONLY: {
    key: 'show_active_only',
    label: 'Only active city labels',
    tooltip: 'Only show labels for cities that are currently active',
    color: '#daa520'
  },
  SHOW_ENDED_ONLY: {
    key: 'show_ended_only',
    label: 'Only ended city labels',
    tooltip: 'Only show labels for cities that no longer exist',
    color: '#c62828'
  }
};
export const LABEL_VISIBILITY_LOOKUP = Object.values(LABEL_VISIBILITY).reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

// === City Marker Icons ===
export const getCityIcon = (city, isSelected = false) => {
  const size = city.iconSize || 5;
  const color = isSelected ? '#daa520' : COLORS.primary;

  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color}; 
      width: ${size}px; 
      height: ${size}px; 
      border-radius: 50%; 
      border: 1px solid rgba(255,255,255,0.5); 
      box-shadow: 0 0 0 1px white;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

export const endedCityIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color:#a72626; width: 6px; height: 6px; border-radius: 50%; border: 1px solid white;"></div>`,
  iconSize: [5, 5],
  iconAnchor: [2.5, 2.5]
});

// === City Label Icons ===
export const createCityLabel = (cityName, isSelected = false, status = 'active') => {
  const className = `city-label${isSelected ? ' selected' : ''}${status === 'ended' ? ' ended' : ''}`;
  return L.divIcon({
    className: 'leaflet-label-wrapper',
    html: `<div class="${className}">${cityName}</div>`,
    iconSize: undefined,
    iconAnchor: [0, 0]
  });
};