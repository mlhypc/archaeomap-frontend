// archaeomap-frontend/src/home/sections/Map/features/MapLegend.js
//
// Small key for the marker styles of cityCertainty.js, top left of the map under the account button
// (under the logo on phones). Each row shows only while at least one visible city is drawn that way, and
// the box is absent when neither row applies, which is the case for all of today's data.

import React from 'react';
import { Paper, Box } from '@mui/material';
import { COLORS } from '../../../../shared/config/generalUtils';

const SWATCH = 10;
const C = SWATCH / 2;

// Same drawing as the map markers (mapUtils certaintyMarkerHtml), one size up so the style reads
const HollowSwatch = () => (
  <svg width={SWATCH} height={SWATCH} viewBox={`0 0 ${SWATCH} ${SWATCH}`} aria-hidden="true">
    <circle cx={C} cy={C} r={C - 1} fill="none" stroke={COLORS.primary} strokeWidth="2" />
  </svg>
);

const DashedSwatch = () => (
  <svg width={SWATCH} height={SWATCH} viewBox={`0 0 ${SWATCH} ${SWATCH}`} aria-hidden="true">
    <circle cx={C} cy={C} r={C - 2} fill={COLORS.primary} />
    <circle cx={C} cy={C} r={C - 1} fill="none" stroke="white" strokeWidth="2" />
    <circle cx={C} cy={C} r={C - 1} fill="none" stroke={COLORS.primary} strokeWidth="2" pathLength="12" strokeDasharray="1 1" />
  </svg>
);

const Row = ({ swatch, text }) => (
  <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <Box sx={{ width: SWATCH, display: 'flex', flexShrink: 0 }}>{swatch}</Box>
    <span>{text}</span>
  </Box>
);

function MapLegend({ hollow, dashed }) {
  if (!hollow && !dashed) return null;

  return (
    <Paper
      variant="control"
      component="ul"
      aria-label="Marker legend"
      sx={{
        position: 'absolute',
        zIndex: 9,
        top: { xs: 56, md: 72 },
        left: 12,
        m: 0,
        px: 1.25,
        py: 0.75,
        listStyle: 'none',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        fontSize: '0.72rem',
        color: COLORS.texts.primary,
        maxWidth: 'calc(100% - 24px)',
        pointerEvents: 'none'
      }}
    >
      {hollow && <Row swatch={<HollowSwatch />} text="Hollow marker: survey only, no excavation" />}
      {dashed && <Row swatch={<DashedSwatch />} text="Dashed outline: identification uncertain" />}
    </Paper>
  );
}

export default MapLegend;
