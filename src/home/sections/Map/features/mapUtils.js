//frontend\src\config\mapUtils.js

import React from 'react';
import L from 'leaflet';
import HistoryIcon from '@mui/icons-material/History';
import { COLORS } from '../../../../shared/config/generalUtils';
import { isHollowCity, isDashedCity } from './cityCertainty';

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
    tooltip: "Neolithic Age cities (Old-3300 BCE)",
    color: "#8a8179",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear <= -3300
  },
  [HISTORICAL_AGES.BRONZE_AGE]: {
    tooltip: "Bronze Age cities (3300-1200 BCE)",
    color: "#cd7f32",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear >= -3300 && foundedYear <= -1200
  },
  [HISTORICAL_AGES.IRON_AGE]: {
    tooltip: "Iron Age cities (1200-500 BCE)",
    color: "#a19d94",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > -1200 && foundedYear <= -500
  },
  [HISTORICAL_AGES.CLASSICAL]: {
    tooltip: "Classical Antiquity cities (500 BCE-500 CE)",
    color: "#f5c542",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > -500 && foundedYear <= 500
  },
  [HISTORICAL_AGES.MEDIEVAL]: {
    tooltip: "Medieval cities (500-1500 CE)",
    color: "#8b4513",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > 500 && foundedYear <= 1500
  },
  [HISTORICAL_AGES.EARLY_MODERN]: {
    tooltip: "Early Modern cities (1500-1800 CE)",
    color: "#4b0082",
    icon: <HistoryIcon />,
    range: (foundedYear) => foundedYear > 1500 && foundedYear <= 1800
  },
  [HISTORICAL_AGES.MODERN]: {
    tooltip: "Modern cities (1800 CE-present)",
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
// rulerColor (optional) replaces the default brown fill ONLY when the
// city is active and unselected. Selected always wins (gold). Ended
// cities are drawn from the static `endedCityIcon` singleton below and
// are unaffected by ruler color.
//
// Hollow (survey / unexamined) and dashed (identification uncertain) markers, rule in cityCertainty.js.
// Drawn as SVG, same anchor and click box as the plain dot. Hollow: transparent inside, 2px ring in the
// marker colour, drawn 2px wider than the plain dot so the hole still reads at 5px (manager decision). Dashed: the 2px edge alternates marker colour and white (6 dashes at any
// size, via pathLength). Cities without the fields never reach this and keep the plain div.
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/]+\))$/i;
const DASH = ' pathLength="12" stroke-dasharray="1 1"';

// g: d = drawn diameter, margin = offset of that box against the icon box, halo = outer 1px white ring,
// ringR = centre of the 2px hollow ring, coreR = filled disc, bandR / bandW = dashed edge of a filled dot
const certaintyMarkerHtml = (color, hollow, dashed, g) => {
  const c = g.d / 2;
  const circle = (r, attrs) => `<circle cx="${c}" cy="${c}" r="${r}" ${attrs}/>`;
  let body = g.halo ? circle(c - 0.5, 'fill="none" stroke="white" stroke-width="1"') : '';
  if (hollow) {
    if (dashed) body += circle(g.ringR, 'fill="none" stroke="white" stroke-width="2"');
    body += circle(g.ringR, `fill="none" stroke="${color}" stroke-width="2"${dashed ? DASH : ''}`);
  } else {
    body += circle(g.coreR, `fill="${color}"`);
    body += circle(g.bandR, `fill="none" stroke="white" stroke-width="${g.bandW}"`);
    body += circle(g.bandR, `fill="none" stroke="${color}" stroke-width="${g.bandW}"${DASH}`);
  }
  return `<svg width="${g.d}" height="${g.d}" viewBox="0 0 ${g.d} ${g.d}" `
    + `style="display:block;margin:${g.margin}px;overflow:visible" aria-hidden="true">${body}</svg>`;
};

// Active dot: `size` box (fill + 1px light border) plus the 1px white box-shadow ring, so size + 2 drawn.
// Hollow: size + 4 drawn (ring over size / 2 +-1, white ring outside it, hole size - 2), still centred.
const activeGeometry = (size, hollow) => (hollow
  ? { d: size + 4, margin: -2, halo: true, ringR: size / 2 }
  : { d: size + 2, margin: -1, halo: true, coreR: size / 2 - 1, bandR: size / 2, bandW: 2 });

export const getCityIcon = (city, isSelected = false, rulerColor = null) => {
  const size = city.iconSize || 5;
  const color = isSelected
    ? '#daa520'
    : (rulerColor || COLORS.primary);

  const hollow = isHollowCity(city);
  const dashed = isDashedCity(city);
  if (hollow || dashed) {
    return L.divIcon({
      className: 'custom-div-icon',
      html: certaintyMarkerHtml(SAFE_COLOR.test(color) ? color : COLORS.primary, hollow, dashed, activeGeometry(size, hollow)),
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

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

// Ended dot is 6px (4px red + 1px white border), centred 0.5px off the 5px icon box. Hollow: 8px drawn
// (2px wider, same centre), red ring over radius 1-3 with the white ring outside, 2px hole. Filled +
// dashed: the dashed edge replaces the white border.
const ENDED_GEOMETRY = { d: 6, margin: 0, halo: false, coreR: 2, bandR: 2.5, bandW: 1 };
const ENDED_HOLLOW_GEOMETRY = { d: 8, margin: -1, halo: true, ringR: 2 };
const endedVariantIcons = new Map(); // 'h' | 'd' | 'hd' -> L.divIcon, built once each

export const getEndedCityIcon = (city) => {
  const hollow = isHollowCity(city);
  const dashed = isDashedCity(city);
  if (!hollow && !dashed) return endedCityIcon;
  const key = `${hollow ? 'h' : ''}${dashed ? 'd' : ''}`;
  if (!endedVariantIcons.has(key)) {
    endedVariantIcons.set(key, L.divIcon({
      className: 'custom-div-icon',
      html: certaintyMarkerHtml('#a72626', hollow, dashed, hollow ? ENDED_HOLLOW_GEOMETRY : ENDED_GEOMETRY),
      iconSize: [5, 5],
      iconAnchor: [2.5, 2.5]
    }));
  }
  return endedVariantIcons.get(key);
};

// === City Label Icons ===
// The text is wrapped in a `<span class="city-label-text">` so the
// OptimizedCityMarker effect can crossfade old → new text spans on
// change (old one becomes .outgoing, new one mounts at opacity 0 → 1).
// labelColor (optional) becomes the --ruler-color CSS var, paining a
// colored ring around the pill without touching text / background.
const escapeHtml = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const createCityLabel = (cityName, isSelected = false, status = 'active', labelColor = null) => {
  const className = `city-label${isSelected ? ' selected' : ''}${status === 'ended' ? ' ended' : ''}${labelColor ? ' has-ruler' : ''}`;
  // labelColor API'den gelir; yalnız hex renk kabul et (style enjeksiyonu olmasın)
  const safeColor = labelColor && /^#[0-9a-fA-F]{3,8}$/.test(labelColor) ? labelColor : null;
  const styleAttr = safeColor ? ` style="--ruler-color:${safeColor}"` : '';
  return L.divIcon({
    className: 'leaflet-label-wrapper',
    // Şehir adı katkıcı girdisi; innerHTML'e ham gidince stored XSS (token çalma) mümkündü.
    html: `<div class="${className}"${styleAttr}><span class="city-label-text">${escapeHtml(cityName)}</span></div>`,
    iconSize: undefined,
    iconAnchor: [0, 0]
  });
};