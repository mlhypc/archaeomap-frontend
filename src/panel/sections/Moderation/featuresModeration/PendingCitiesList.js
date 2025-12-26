// archaeomap-frontend/src/panel/sections/Moderation/features/PendingCitiesList.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
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
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    useMediaQuery,
    Stack,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    CardActions,
    Avatar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import ReviewsIcon from '@mui/icons-material/Reviews';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';

import { COLORS } from '../../../../shared/config/generalUtils';
import { cachedCitiesApi as citiesApi } from '../../../../shared/services/cityApi';

function PendingCitiesList({ onCityReview, onDataUpdate }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

    // Filters - Ayrı state'ler olarak tanımla
    const [searchTerm, setSearchTerm] = useState('');
    const [submitterId, setSubmitterId] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending'); // New status filter

    // Use ref to prevent infinite loops
    const onDataUpdateRef = useRef(onDataUpdate);
    useEffect(() => {
        onDataUpdateRef.current = onDataUpdate;
    }, [onDataUpdate]);

    // Format date helper
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format time ago helper
    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Recently';
        }
    };

    // Get status chip props based on approval_status and data_status
    const getStatusChipProps = (city) => {
        const { approval_status, data_status } = city;
        
        if (approval_status === 'pending' && data_status === 'draft') {
            return {
                label: 'Pending Review',
                color: 'warning',
                icon: <HistoryIcon />
            };
        } else if (approval_status === 'approved' && data_status === 'passive') {
            return {
                label: 'Awaiting Admin',
                color: 'info',
                icon: <CheckCircleIcon />
            };
        } else if (approval_status === 'approved' && data_status === 'active') {
            return {
                label: 'Active',
                color: 'success',
                icon: <CheckCircleIcon />
            };
        } else if (approval_status === 'rejected') {
            return {
                label: 'Rejected',
                color: 'error',
                icon: <CancelIcon />
            };
        } else {
            // Fallback
            return {
                label: approval_status || 'Unknown',
                color: 'default',
                icon: <HistoryIcon />
            };
        }
    };

    // Fetch pending cities - DÜZELTILDI
    const fetchPendingCities = useCallback(async (page = 1, customSearchTerm = '', customSubmitterId = '') => {
        setLoading(true);
        setError(null);

        try {
            const options = {
                page,
                limit: 20
            };

            // Parametreleri kullan, state'ten değil
            if (customSubmitterId) {
                options.submitterId = parseInt(customSubmitterId);
            }

            const result = await citiesApi.getModerationCities(statusFilter, options);

            if (result.success) {
                setCities(result.data.cities || []);
                setPagination(result.data.pagination || {
                    current_page: 1,
                    total_pages: 0,
                    total_count: 0,
                    per_page: 20
                });
                
                // DÜZELTME: onDataUpdate'i hiç çağırma, döngüyü kır
                // Parent zaten count'u kendi API'si ile alıyor
                // if (onDataUpdateRef.current) {
                //     onDataUpdateRef.current();
                // }
            } else {
                setError(result.error || 'Failed to fetch pending cities');
                setCities([]);
            }
        } catch (err) {
            setError('Network error occurred');
            setCities([]);
            console.error('Pending cities fetch error:', err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Boş dependency array artık güvenli

    // İlk yükleme ve status filter değişikliği
    useEffect(() => {
        fetchPendingCities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    // Debounced search için ayrı useEffect'ler - DÜZELTILDI
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchPendingCities(1, searchTerm, submitterId);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, submitterId, fetchPendingCities]);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
    };

    const handleSubmitterChange = (value) => {
        setSubmitterId(value);
    };

    const handlePageChange = (event, newPage) => {
        fetchPendingCities(newPage, searchTerm, submitterId);
    };

    const handleCityReview = (cityId) => {
        if (onCityReview) {
            onCityReview(cityId);
        }
    };

    // Get unique submitters for filter
    const uniqueSubmitters = React.useMemo(() => {
        const submitters = cities.map(city => city.submitter).filter(Boolean);
        const unique = submitters.reduce((acc, submitter) => {
            if (!acc.find(s => s.id === submitter.id)) {
                acc.push(submitter);
            }
            return acc;
        }, []);
        return unique.sort((a, b) => a.username.localeCompare(b.username));
    }, [cities]);

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Filters */}
            <Box sx={{
                mb: 3,
                p: { xs: 1.5, md: 2 },
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
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ flex: { sm: 1 } }}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ color: COLORS.texts.muted, mr: 1 }} />
                        }}
                    />

                    {/* Status Filter */}
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '180px' } }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="pending">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <HistoryIcon fontSize="small" />
                                    <span>Pending Review</span>
                                </Stack>
                            </MenuItem>
                            <MenuItem value="awaiting-admin">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CheckCircleIcon fontSize="small" color="warning" />
                                    <span>Awaiting Admin</span>
                                </Stack>
                            </MenuItem>
                            <MenuItem value="approved">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CheckCircleIcon fontSize="small" color="success" />
                                    <span>Approved</span>
                                </Stack>
                            </MenuItem>
                            <MenuItem value="rejected">
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CancelIcon fontSize="small" color="error" />
                                    <span>Rejected</span>
                                </Stack>
                            </MenuItem>
                        </Select>
                    </FormControl>

                    {/* Submitter Filter */}
                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '200px' } }}>
                        <InputLabel>Filter by Submitter</InputLabel>
                        <Select
                            value={submitterId}
                            onChange={(e) => handleSubmitterChange(e.target.value)}
                            label="Filter by Submitter"
                        >
                            <MenuItem value="">All Submitters</MenuItem>
                            {uniqueSubmitters.map((submitter, index) => (
                                <MenuItem key={submitter.id || `submitter-${index}`} value={submitter.id}>
                                    {submitter.name || submitter.username}
                                </MenuItem>
                            ))}
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

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                        flex: 1
                    }}>
                        <CircularProgress sx={{ color: COLORS.primary, mb: 2 }} />
                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                            Loading pending cities...
                        </Typography>
                    </Box>
                ) : cities.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        padding: '3rem 1rem',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircleIcon sx={{ fontSize: 60, mb: 2, color: COLORS.texts.muted }} />
                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, mb: 1 }}>
                            No {statusFilter === 'pending' ? 'Pending Cities' : 
                                 statusFilter === 'awaiting-admin' ? 'Cities Awaiting Admin' :
                                 statusFilter === 'approved' ? 'Approved Cities' :
                                 statusFilter === 'rejected' ? 'Rejected Cities' : 'Cities'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                            {searchTerm || submitterId 
                                ? 'No cities match your current filters'
                                : 'All submissions have been reviewed'
                            }
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        {isMobile ? (
                            <Box sx={{ flex: 1, overflow: 'auto' }}>
                                <Stack spacing={2}>
                                    {cities.map((city, index) => (
                                        <Card key={city.id || `city-card-${index}`} sx={{ border: `1px solid ${COLORS.border}` }}>
                                            <CardContent sx={{ pb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                                    <Avatar sx={{ backgroundColor: COLORS.primary }}>
                                                        <LocationOnIcon />
                                                    </Avatar>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, mb: 0.5 }}>
                                                            {city.name}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                            {city.country}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        {...getStatusChipProps(city)}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Stack spacing={1}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <PersonIcon sx={{ fontSize: 16, color: COLORS.texts.muted }} />
                                                        <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                            {city.submitter.name}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 16, color: COLORS.texts.muted }} />
                                                        <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                            {formatTimeAgo(city.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                                                        Founded: {city.founded} • 
                                                        Historical data: {(city.controlPeriodsCount || 0) + (city.populationRecordsCount || 0) + (city.landmarksCount || 0)} items
                                                    </Typography>
                                                </Stack>
                                            </CardContent>
                                            <CardActions sx={{ pt: 0 }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<ReviewsIcon />}
                                                    onClick={() => handleCityReview(city.id)}
                                                    sx={{
                                                        backgroundColor: COLORS.primary,
                                                        '&:hover': { backgroundColor: '#5d3a2a' }
                                                    }}
                                                >
                                                    Review
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            /* Desktop Table View */
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
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ backgroundColor: COLORS.background, fontWeight: 'bold' }}>
                                                City
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: COLORS.background, fontWeight: 'bold' }}>
                                                Submitter
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: COLORS.background, fontWeight: 'bold' }}>
                                                Submitted
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: COLORS.background, fontWeight: 'bold' }}>
                                                Data
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: COLORS.background, fontWeight: 'bold' }}>
                                                Status
                                            </TableCell>
                                            <TableCell sx={{ backgroundColor: COLORS.background, fontWeight: 'bold' }}>
                                                Actions
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cities.map((city, index) => (
                                            <TableRow
                                                key={city.id || `city-${index}`}
                                                sx={{
                                                    '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.02)' }
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <LocationOnIcon sx={{ color: COLORS.primary, fontSize: '1.2rem' }} />
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: COLORS.texts.primary }}>
                                                                {city.name}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                                                                {city.country} • Founded {city.founded}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', backgroundColor: COLORS.primary }}>
                                                            {(() => {
                                                                const firstName = city.submitter?.id?.firstName;
                                                                const username = city.submitter?.username;
                                                                return (firstName?.charAt(0) || username?.charAt(0) || '?').toUpperCase();
                                                            })()}
                                                        </Avatar>
                                                        <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                            {(() => {
                                                                const firstName = city.submitter?.id?.firstName;
                                                                const lastName = city.submitter?.id?.lastName;
                                                                const username = city.submitter?.username;
                                                                if (firstName && lastName) return `${firstName} ${lastName}`;
                                                                if (firstName) return firstName;
                                                                return username || 'Unknown';
                                                            })()}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                        {formatTimeAgo(city.createdAt)}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: COLORS.texts.muted, display: 'block' }}>
                                                        {formatDate(city.createdAt)}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                        {(city.controlPeriodsCount || 0) > 0 && (
                                                            <Chip
                                                                label={`${city.controlPeriodsCount} periods`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {(city.populationRecordsCount || 0) > 0 && (
                                                            <Chip
                                                                label={`${city.populationRecordsCount} pop`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {(city.landmarksCount || 0) > 0 && (
                                                            <Chip
                                                                label={`${city.landmarksCount} landmarks`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {((city.controlPeriodsCount || 0) + (city.populationRecordsCount || 0) + (city.landmarksCount || 0)) === 0 && (
                                                            <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                                                                Basic info only
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        {...getStatusChipProps(city)}
                                                        size="small"
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Tooltip title="Review City" arrow>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleCityReview(city.id)}
                                                            sx={{
                                                                color: COLORS.primary,
                                                                '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.1)' }
                                                            }}
                                                        >
                                                            <ReviewsIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}

                        {/* Pagination */}
                        {pagination.total_pages > 1 && (
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
                                                '&:hover': { backgroundColor: '#5d3a2a' }
                                            },
                                            '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.1)' }
                                        }
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: COLORS.texts.muted, textAlign: 'center' }}>
                                    Showing {((pagination.current_page - 1) * pagination.per_page) + 1}-
                                    {Math.min(pagination.current_page * pagination.per_page, pagination.total_count)} of {pagination.total_count}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
}

export default PendingCitiesList;