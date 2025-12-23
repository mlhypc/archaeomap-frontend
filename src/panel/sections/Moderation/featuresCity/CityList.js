// archaeomap-frontend\src\panel\sections\DataManagement\features\CityListSection.js

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Pagination,
    Alert,
    CircularProgress,
    Chip,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useMediaQuery,
    Stack,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

import { COLORS } from '../../../../shared/config/generalUtils';
import { citiesApi } from '../../../../shared/services/cityApi';

function CityListSection({ onCreateCity, onEditCity }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State management
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        per_page: 20
    });

    // Filters
    const [filters, setFilters] = useState({
        searchTerm: '',
        selectedCountry: '',
        selectedStatus: 'all'
    });
    const [availableCountries, setAvailableCountries] = useState([]);

    const formatDate = (val) => {
        if (!val) return '-';
        const d = new Date(val);
        return d.toLocaleString(undefined, {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    // Status chip
    const getStatusChip = (city) => {
        switch (city.status) {
            case 'active':
                return (
                    <Chip
                        label="Active"
                        size="small"
                        sx={{ backgroundColor: '#4caf50', color: 'white' }}
                    />
                );
            case 'passive':
                return (
                    <Chip
                        label="Passive"
                        size="small"
                        sx={{ backgroundColor: '#ff9800', color: 'white' }}
                    />
                );
            case 'draft':
                return (
                    <Chip
                        label="Draft"
                        size="small"
                        sx={{ backgroundColor: COLORS.texts.muted, color: 'white' }}
                    />
                );
            default:
                return (
                    <Chip
                        label="Unknown"
                        size="small"
                        sx={{ backgroundColor: '#757575', color: 'white' }}
                    />
                );
        }
    };

    // Optimized fetch cities data
    const fetchCities = useCallback(async (page = 1, newFilters = filters) => {
        setLoading(true);
        setError(null);

        try {
            const options = {
                page,
                limit: pagination.per_page,
                search: newFilters.searchTerm.trim() || undefined,
                country: newFilters.selectedCountry || undefined,
                status: newFilters.selectedStatus
            };

            const result = await citiesApi.getCitiesList(options);

            if (result.success) {
                setCities(result.data.cities || []);
                setPagination(prev => result.data.pagination || prev);

                if (page === 1 && !newFilters.selectedCountry && availableCountries.length === 0) {
                    const countries = [...new Set((result.data.cities || []).map(city => city.country))];
                    setAvailableCountries(countries.sort());
                }
            } else {
                setError(result.error || 'Failed to fetch cities');
                setCities([]);
                setPagination({
                    current_page: 1,
                    total_pages: 0,
                    total_count: 0,
                    per_page: 20
                });
            }
        } catch (err) {
            setError('Network error occurred');
            setCities([]);
            console.error('City list fetch error:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.per_page, availableCountries.length]);

    useEffect(() => {
        fetchCities(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCities(1, filters);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [filters, fetchCities]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handlePageChange = (event, newPage) => {
        fetchCities(newPage, filters);
    };

    // Handler functions for parent component
    const handleCityClick = (cityId) => {
        if (onEditCity) {
            onEditCity(cityId);
        }
    };

    const handleCreateCity = () => {
        if (onCreateCity) {
            onCreateCity();
        }
    };

    // Note: Component will remount when refreshKey changes in parent

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: { xs: 2, md: 3 },
                paddingBottom: { xs: 1, md: 1.5 },
                borderBottom: `1px solid ${COLORS.border}`
            }}>
                {/* Left side - Title only */}
                <Typography variant="sectionTitle" sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    marginBottom: 0
                }}>
                    City List
                </Typography>

                {/* Right side - Add City Button */}
                <Button
                    variant="contained"
                    size={isMobile ? 'small' : 'medium'}
                    startIcon={<AddIcon />}
                    onClick={handleCreateCity}
                    sx={{
                        backgroundColor: COLORS.primary,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: '#5d3a2a'
                        },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'medium'
                    }}
                >
                    {isMobile ? 'Add' : 'Add City'}
                </Button>
            </Box>

            {/* Filters */}
            <Box sx={{
                marginBottom: { xs: 2, md: 3 },
                padding: { xs: 1.5, md: 2 },
                backgroundColor: 'rgba(248, 245, 238, 0.5)',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`
            }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2, sm: 2 }}
                    alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                >
                    <TextField
                        label="Search cities"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        size="small"
                        fullWidth
                        sx={{
                            flex: { sm: 1 },
                            minWidth: { xs: '100%', sm: '200px' }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.texts.muted }} />
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl
                        size="small"
                        sx={{ minWidth: { xs: '100%', sm: '140px' } }}
                    >
                        <InputLabel>Country</InputLabel>
                        <Select
                            value={filters.selectedCountry}
                            onChange={(e) => handleFilterChange('selectedCountry', e.target.value)}
                            label="Country"
                        >
                            <MenuItem value="">All Countries</MenuItem>
                            {availableCountries.map(country => (
                                <MenuItem key={country} value={country}>{country}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl
                        size="small"
                        sx={{ minWidth: { xs: '100%', sm: '120px' } }}
                    >
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filters.selectedStatus}
                            onChange={(e) => handleFilterChange('selectedStatus', e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="passive">Passive</MenuItem>
                            <MenuItem value="draft">Draft</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Cities Table */}
            <Box sx={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                minHeight: '400px'
            }}>
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                        color: COLORS.texts.secondary,
                        flex: 1
                    }}>
                        <CircularProgress sx={{ color: COLORS.primary }} />
                        <Typography variant="muted" sx={{ mt: 2 }}>
                            Loading cities...
                        </Typography>
                    </Box>
                ) : cities.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        padding: '3rem 1rem',
                        color: COLORS.texts.muted,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <PublicIcon sx={{ fontSize: 60, mb: 2, color: COLORS.texts.muted }} />
                        <Typography variant="h6">No cities found</Typography>
                        <Typography variant="muted">
                            Try adjusting your search or filter criteria
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer
                        component={Paper}
                        sx={{
                            flex: 1,
                            boxShadow: 'none',
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: '8px',
                            overflow: 'auto'
                        }}
                    >
                        <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{
                                        backgroundColor: COLORS.background,
                                        fontWeight: 'bold',
                                        minWidth: { xs: '140px', sm: '180px' }
                                    }}>
                                        City Name
                                    </TableCell>
                                    {!isSmallMobile && (
                                        <TableCell sx={{
                                            backgroundColor: COLORS.background,
                                            fontWeight: 'bold',
                                            minWidth: '100px'
                                        }}>
                                            Country
                                        </TableCell>
                                    )}
                                    <TableCell sx={{
                                        backgroundColor: COLORS.background,
                                        fontWeight: 'bold',
                                        minWidth: '80px'
                                    }}>
                                        Status
                                    </TableCell>
                                    {!isMobile && (
                                        <TableCell sx={{
                                            backgroundColor: COLORS.background,
                                            fontWeight: 'bold',
                                            minWidth: '130px'
                                        }}>
                                            Created At
                                        </TableCell>
                                    )}
                                    {!isMobile && (
                                        <TableCell sx={{
                                            backgroundColor: COLORS.background,
                                            fontWeight: 'bold',
                                            minWidth: '130px'
                                        }}>
                                            Updated At
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {cities.map((city) => (
                                    <TableRow
                                        key={city.id}
                                        onClick={() => handleCityClick(city.id)}
                                        sx={{
                                            cursor: 'pointer',
                                            '&:hover': {
                                                backgroundColor: 'rgba(119, 73, 54, 0.08)',
                                                transition: 'background-color 0.2s'
                                            }
                                        }}
                                    >
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <LocationOnIcon sx={{
                                                    color: COLORS.primary,
                                                    mr: 1,
                                                    fontSize: { xs: '1rem', md: '1.2rem' }
                                                }} />
                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 'medium',
                                                            color: COLORS.texts.primary,
                                                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                                                        }}
                                                    >
                                                        {city.name}
                                                    </Typography>
                                                    {isSmallMobile && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: COLORS.texts.muted,
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            {city.country}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {!isSmallMobile && (
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: COLORS.texts.secondary,
                                                        fontSize: { xs: '0.75rem', md: '0.875rem' }
                                                    }}
                                                >
                                                    {city.country}
                                                </Typography>
                                            </TableCell>
                                        )}

                                        <TableCell>
                                            {getStatusChip(city)}
                                        </TableCell>

                                        {!isMobile && (
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: COLORS.texts.secondary,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {formatDate(city.createdAt)}
                                                </Typography>
                                            </TableCell>
                                        )}

                                        {!isMobile && (
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: COLORS.texts.secondary,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {formatDate(city.updatedAt)}
                                                </Typography>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Pagination */}
            {!loading && pagination.total_pages > 1 && (
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 2 },
                    mt: 3,
                    pt: 2,
                    borderTop: `1px solid ${COLORS.border}`
                }}>
                    <Pagination
                        count={pagination.total_pages}
                        page={pagination.current_page}
                        onChange={handlePageChange}
                        color="primary"
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                color: COLORS.texts.secondary,
                                '&.Mui-selected': {
                                    backgroundColor: COLORS.primary,
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#5d3a2a'
                                    }
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(119, 73, 54, 0.1)'
                                }
                            }
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            color: COLORS.texts.muted,
                            fontSize: '0.75rem',
                            textAlign: 'center'
                        }}
                    >
                        Showing {((pagination.current_page - 1) * pagination.per_page) + 1}-
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of {pagination.total_count}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

export default CityListSection;