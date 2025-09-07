// shared/components/ui/CitySearchAutocomplete.js
import React from 'react';
import {
    Autocomplete,
    TextField,
    CircularProgress,
    Avatar,
    Box,
    Typography,
    Alert
} from '@mui/material';
import { LocationCity as CityIcon } from '@mui/icons-material';
import { COLORS } from '../../config/generalUtils';
import { useCitySearch } from '../../hooks/useCitySearch';

const CitySearchAutocomplete = ({
    multiple = false,
    value = null,
    onChange,
    label = "Search cities...",
    placeholder = "Start typing to search cities...",
    disabled = false,
    sx = {}
}) => {
    const { availableCities, loading, error, searchCities, clearSearch } = useCitySearch();

    const handleInputChange = (event, newInputValue) => {
        if (!newInputValue) {
            clearSearch();
            return;
        }
        searchCities(newInputValue);
    };

    const handleChange = (event, newValue) => {
        if (onChange) {
            onChange(event, newValue);
        }
    };

    const getOptionLabel = (city) => {
        if (!city) return '';
        return `${city.generic_city_name || city.name} (${city.founded ? `Founded: ${city.founded}` : 'Unknown period'}, ${city.country || city.region})`;
    };

    const renderOption = (props, city) => {
        const { key, ...otherProps } = props;
        return (
            <Box component="li" key={key} {...otherProps}>
                <Avatar sx={{ bgcolor: COLORS.primary, mr: 2, width: 32, height: 32 }}>
                    <CityIcon fontSize="small" />
                </Avatar>
                <Box>
                    <Typography variant="body2">
                        {city.generic_city_name || city.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {city.founded ? `Founded: ${city.founded}` : 'Unknown period'} • {city.country || city.region}
                    </Typography>
                </Box>
            </Box>
        );
    };

    const renderInput = (params) => (
        <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            disabled={disabled}
            error={!!error}
            helperText={error}
            InputProps={{
                ...params.InputProps,
                endAdornment: (
                    <>
                        {loading && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                    </>
                ),
            }}
        />
    );

    return (
        <Box>
            <Autocomplete
                multiple={multiple}
                options={availableCities}
                getOptionLabel={getOptionLabel}
                loading={loading}
                disabled={disabled}
                value={value}
                onInputChange={handleInputChange}
                onChange={handleChange}
                renderInput={renderInput}
                renderOption={renderOption}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterOptions={(options) => options} // Disable client-side filtering since we filter on server
                componentsProps={{
                    popper: {
                        sx: {
                            zIndex: 1500, // Higher than modal z-index (1400)
                        },
                    },
                }}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: COLORS.border,
                        },
                        '&:hover fieldset': {
                            borderColor: COLORS.primary,
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: COLORS.primary,
                        },
                    },
                    ...sx
                }}
            />
            
            {error && !loading && (
                <Alert severity="error" sx={{ mt: 1 }}>
                    {error}
                </Alert>
            )}
        </Box>
    );
};

export default CitySearchAutocomplete;