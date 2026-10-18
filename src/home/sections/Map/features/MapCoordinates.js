// archaeomap-frontend/src/home/sections/Map/features/MapCoordinates.js
//
// Right-click (long press on touch) on the 2D map shows the clicked point's coordinates in a small popup,
// in the archive's order "lat, lng" with 4 decimals, plus a button that copies them. Leaflet fires
// `contextmenu` for a long press itself (natively on Android, through its TapHold handler on iOS Safari)
// and cancels the browser's own menu because the map listens to the event; outside the map, and inside the
// popup, the native menu stays. The popup closes on Escape, on any other map or marker click, and when the
// point leaves the visible map. City markers keep their click behaviour: they have no contextmenu handler,
// so a right-click on one reports the point under the cursor.

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Popup, useMapEvents } from 'react-leaflet';
import { Box, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { COLORS } from '../../../../shared/config/generalUtils';

const COPIED_MS = 1500;

const fixed4 = (v) => (Math.abs(v) < 0.00005 ? 0 : v).toFixed(4); // no "-0.0000"
export const formatLatLng = (latlng) => `${fixed4(latlng.lat)}, ${fixed4(latlng.lng)}`;

// navigator.clipboard needs a secure context; the textarea fallback covers plain http (LAN dev)
const copyText = async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // permission denied or not focused; try the fallback
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
};

function CoordinateContent({ text, popupRef }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  // The content is portalled in after Leaflet has measured the empty popup; measure again
  useLayoutEffect(() => {
    popupRef.current?.update();
  }, [popupRef, text]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = async () => {
    if (!(await copyText(text))) return;
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box
        component="span"
        className="selectable"
        sx={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: '0.8rem',
          color: COLORS.texts.primary,
          whiteSpace: 'nowrap',
          pl: 0.5
        }}
      >
        {text}
      </Box>
      <Tooltip title={copied ? 'Copied' : 'Copy coordinates'} placement="top" arrow>
        <IconButton
          size="small"
          onClick={handleCopy}
          aria-label={copied ? 'Coordinates copied' : 'Copy coordinates'}
          sx={{ color: copied ? COLORS.secondary : COLORS.primary, p: 0.5 }}
        >
          {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Tooltip>
      <Box component="span" role="status" sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {copied ? 'Coordinates copied' : ''}
      </Box>
    </Box>
  );
}

function MapCoordinates() {
  const [point, setPoint] = useState(null); // L.LatLng of the last right-click, null = closed
  const popupRef = useRef(null);

  const close = useCallback(() => setPoint(null), []);

  const map = useMapEvents({
    contextmenu(e) {
      const next = e.latlng.wrap();
      // Same spot to 4 decimals: keep the open popup instead of reopening it
      setPoint(prev => (prev && formatLatLng(prev) === formatLatLng(next) ? prev : next));
    },
    moveend() {
      setPoint(prev => (prev && !map.getBounds().contains(prev) ? null : prev));
    }
  });

  // Escape closes it wherever focus is (Leaflet's own Escape needs the map container focused)
  useEffect(() => {
    if (!point) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [point, close]);

  if (!point) return null;
  const text = formatLatLng(point);

  return (
    <Popup
      key={text}
      ref={popupRef}
      position={point}
      className="coord-popup"
      closeButton={false}
      autoPanPadding={[16, 16]}
      eventHandlers={{
        // Leaflet closed it (map or marker click); a newer point has its own popup, keep that one
        remove: () => setPoint(prev => (prev === point ? null : prev))
      }}
    >
      <CoordinateContent text={text} popupRef={popupRef} />
    </Popup>
  );
}

export default MapCoordinates;
