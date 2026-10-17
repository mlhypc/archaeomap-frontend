// archaeomap-frontend/src/home/sections/Map/features/MapSearch.js
//
// City search as the leftmost button of the map's top-right control group (mapControls.js). Clicking
// it widens it into the search field; the group is anchored to the right, so it grows to the left.
// It folds back after a pick, on Escape, or on a click elsewhere. Open/closed is the group's state:
// on phones the other buttons fold away while the field is open, so it can take the group's full width.

import React, { useState } from 'react';
import { Box, IconButton, Tooltip, ClickAwayListener, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { COLORS } from '../../../../shared/config/generalUtils';
import CitySearch from '../../Sidebar/features/CitySearch';

export const SEARCH_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
export const SEARCH_DURATION = 220; // ms

function MapSearch({ open, onOpen, onClose, onPick, expandedWidth = 300 }) {
  const [session, setSession] = useState(0); // new key per opening: the field starts empty every time

  const openSearch = () => {
    if (open) return;
    setSession(n => n + 1);
    onOpen();
  };

  return (
    <ClickAwayListener onClickAway={() => { if (open) onClose(); }}>
      <Box
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          width: open ? expandedWidth : 40,
          transition: `width ${SEARCH_DURATION}ms ${SEARCH_EASE}`,
          flexShrink: 0
        }}
      >
        <Tooltip title={open ? '' : 'Search cities'} placement="bottom" arrow>
          <IconButton
            variant="control"
            onClick={openSearch}
            aria-label="Search cities"
            sx={{ color: COLORS.primary, flexShrink: 0 }}
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <Fade in={open} timeout={{ enter: SEARCH_DURATION, exit: 100 }} unmountOnExit>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
            <CitySearch
              key={session}
              autoFocus
              focusDelay={SEARCH_DURATION}
              bare
              onPick={(city) => { onClose(); if (onPick) onPick(city); }}
              sx={{ flex: 1 }}
            />
            <IconButton size="small" onClick={onClose} aria-label="Close search" sx={{ color: COLORS.texts.secondary }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Fade>
      </Box>
    </ClickAwayListener>
  );
}

export default MapSearch;
