// archaeomap-frontend/src/home/sections/Sidebar/features/CitySearch.js
//
// City search for the home page header. Searches the bulk timeline data the map already loaded
// (cachedCitiesApi, same cache key, no extra request) so it is instant and also matches every
// historical name a city carried (Constantinople, Byzantion -> Istanbul). Picking a city goes to
// its URL; HomePage resolves the URL, the map pans to it and the slider jumps to its founding.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Autocomplete, Box, InputAdornment, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { cachedCitiesApi } from '../../../../shared/services/cityApi';
import { COLORS, cityUrl, formatYear, slugify } from '../../../../shared/config/generalUtils';

const MAX_RESULTS = 8;
const norm = (s) => slugify(s).replace(/-/g, ' ');

// bare: no border or background (inside the map search box, whose own icon replaces the field's)
function CitySearch({ sx = {}, autoFocus = false, focusDelay = 350, onPick, bare = false }) {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // Focus after a delay when asked: inside a Drawer, autoFocus loses to the Drawer focusing its own paper
  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => inputRef.current?.focus(), focusDelay);
    return () => clearTimeout(t);
  }, [autoFocus, focusDelay]);

  useEffect(() => {
    let cancelled = false;
    cachedCitiesApi.getBulkTimelineData().then((result) => {
      if (cancelled || !result.success) return;
      setCities((result.data.cities || []).map((city) => {
        const aliases = [...new Set((city.PeriodCityName || []).map(p => p.CityName))]
          .filter(n => n && n !== city.name);
        return {
          ...city,
          key: norm(city.name),
          aliasKeys: aliases.map(a => ({ name: a, key: norm(a) }))
        };
      }));
    });
    return () => { cancelled = true; };
  }, []);

  // Ranking: name starts with the query, then name contains it, then a historical name matches
  const options = useMemo(() => {
    const q = norm(input);
    if (q.length < 2) return [];
    const ranked = [];
    for (const city of cities) {
      let rank = -1;
      let matchedAlias = null;
      if (city.key.startsWith(q)) rank = 0;
      else if (city.key.includes(q)) rank = 1;
      else {
        const alias = city.aliasKeys.find(a => a.key.includes(q));
        if (alias) { rank = 2; matchedAlias = alias.name; }
      }
      if (rank >= 0) ranked.push({ city, rank, matchedAlias });
    }
    ranked.sort((a, b) => a.rank - b.rank || a.city.name.localeCompare(b.city.name));
    return ranked.slice(0, MAX_RESULTS).map(r => ({ ...r.city, matchedAlias: r.matchedAlias }));
  }, [cities, input]);

  return (
    <Autocomplete
      options={options}
      value={null}
      inputValue={input}
      onInputChange={(e, value, reason) => { if (reason !== 'reset') setInput(value); }}
      onChange={(e, city) => {
        if (!city) return;
        setInput('');
        navigate(cityUrl(city));
        if (onPick) onPick(city);
      }}
      filterOptions={(o) => o}
      getOptionLabel={(city) => city.name || ''}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText={norm(input).length < 2 ? 'Type at least 2 letters' : 'No city found'}
      openOnFocus={false}
      clearOnBlur={false}
      blurOnSelect
      size="small"
      fullWidth
      renderOption={(props, city) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={city.id} {...rest} sx={{ display: 'block !important' }}>
            <Typography sx={{ fontSize: '0.85rem', color: COLORS.texts.primary, fontWeight: 500 }}>
              {city.name}
              {city.matchedAlias && (
                <Typography component="span" sx={{ fontSize: '0.75rem', color: COLORS.primary, fontStyle: 'italic', ml: 0.75 }}>
                  ({city.matchedAlias})
                </Typography>
              )}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: COLORS.texts.muted }}>
              {city.country} · {formatYear(city.founded)}
            </Typography>
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search cities, also by old names"
          inputRef={inputRef}
          InputProps={{
            ...params.InputProps,
            startAdornment: bare ? null : (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: '1.1rem', color: COLORS.texts.muted }} />
              </InputAdornment>
            )
          }}
          inputProps={{ ...params.inputProps, 'aria-label': 'Search cities' }}
        />
      )}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: bare ? 'transparent' : 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.85rem',
          '& fieldset': bare ? { border: 'none' } : { borderColor: COLORS.border },
          '&:hover fieldset': { borderColor: COLORS.secondary },
          '&.Mui-focused fieldset': { borderColor: COLORS.primary }
        },
        ...sx
      }}
      slotProps={{ popper: { sx: { zIndex: 1500 } } }}
    />
  );
}

export default CitySearch;
