// archaeomap-frontend\src\panel\sections\Moderation\featuresRuler\RulerList.js
//
// Mirrors CityList.js layout: header with Add button, filter bar (search,
// status, year-range), table with hover rows, pagination. Rows are
// clickable to open the edit modal in the parent container.

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
    Button,
    Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddIcon from '@mui/icons-material/Add';
import { useTheme } from '@mui/material/styles';

import { COLORS, formatYear } from '../../../../shared/config/generalUtils';
import { rulerService } from '../../../../shared/services/rulerApi';

const PER_PAGE = 25;

function RulerList({ onCreateRuler, onEditRuler }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [rulers, setRulers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        per_page: PER_PAGE
    });

    const [filters, setFilters] = useState({
        searchTerm: '',
        selectedStatus: 'all'
    });

    const formatPeriod = (start, end) => {
        const s = start === null || start === undefined || start === '' ? '—' : formatYear(start);
        const e = end === null || end === undefined || end === '' ? 'Present' : formatYear(end);
        return `${s} – ${e}`;
    };

    const getStatusChip = (ruler) => {
        switch (ruler.data_status) {
            case 'active':
                return <Chip label="Active" size="small" sx={{ backgroundColor: '#4caf50', color: 'white' }} />;
            case 'passive':
                return <Chip label="Passive" size="small" sx={{ backgroundColor: '#ff9800', color: 'white' }} />;
            case 'draft':
                return <Chip label="Draft" size="small" sx={{ backgroundColor: COLORS.texts.muted, color: 'white' }} />;
            default:
                return <Chip label="Unknown" size="small" sx={{ backgroundColor: '#757575', color: 'white' }} />;
        }
    };

    // Fetch from server with current filters. Server-side search + status,
    // but pagination is client-side because the API returns up to `limit`
    // rows in one shot — same trade-off rulers tab makes elsewhere.
    const fetchRulers = useCallback(async (page, currentFilters) => {
        setLoading(true);
        setError(null);

        try {
            const result = await rulerService.list({
                search: currentFilters.searchTerm.trim() || undefined,
                status: currentFilters.selectedStatus,
                limit: 500,
                offset: 0
            });

            if (result.success) {
                const all = result.data.rulers || [];
                const totalCount = all.length;
                const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
                const safePage = Math.min(page, totalPages);
                const start = (safePage - 1) * PER_PAGE;
                const pageRows = all.slice(start, start + PER_PAGE);

                setRulers(pageRows);
                setPagination({
                    current_page: safePage,
                    total_pages: totalPages,
                    total_count: totalCount,
                    per_page: PER_PAGE
                });
            } else {
                setError(result.error || 'Failed to fetch rulers');
                setRulers([]);
                setPagination({ current_page: 1, total_pages: 0, total_count: 0, per_page: PER_PAGE });
            }
        } catch (err) {
            setError('Network error occurred');
            setRulers([]);
            console.error('Ruler list fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRulers(1, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const t = setTimeout(() => fetchRulers(1, filters), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handlePageChange = (_, newPage) => fetchRulers(newPage, filters);

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
                <Typography variant="sectionTitle" sx={{
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    marginBottom: 0
                }}>
                    Ruler List
                </Typography>

                <Button
                    variant="contained"
                    size={isMobile ? 'small' : 'medium'}
                    startIcon={<AddIcon />}
                    onClick={onCreateRuler}
                    sx={{
                        backgroundColor: COLORS.primary,
                        color: 'white',
                        '&:hover': { backgroundColor: '#5d3a2a' },
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'medium'
                    }}
                >
                    {isMobile ? 'Add' : 'Add Ruler'}
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
                    spacing={2}
                    alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                >
                    <TextField
                        label="Search rulers"
                        placeholder="Name, slug, or alias…"
                        value={filters.searchTerm}
                        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                        size="small"
                        fullWidth
                        sx={{ flex: { sm: 1 }, minWidth: { xs: '100%', sm: '200px' } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: COLORS.texts.muted }} />
                                </InputAdornment>
                            )
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '140px' } }}>
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

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Table */}
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
                        <Typography variant="muted" sx={{ mt: 2 }}>Loading rulers...</Typography>
                    </Box>
                ) : rulers.length === 0 ? (
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
                        <AccountBalanceIcon sx={{ fontSize: 60, mb: 2, color: COLORS.texts.muted }} />
                        <Typography variant="h6">No rulers found</Typography>
                        <Typography variant="muted">Try adjusting your search or filter criteria</Typography>
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
                                        minWidth: { xs: '160px', sm: '200px' }
                                    }}>
                                        Ruler
                                    </TableCell>
                                    {!isSmallMobile && (
                                        <TableCell sx={{
                                            backgroundColor: COLORS.background,
                                            fontWeight: 'bold',
                                            minWidth: '80px'
                                        }}>
                                            Color
                                        </TableCell>
                                    )}
                                    {!isSmallMobile && (
                                        <TableCell sx={{
                                            backgroundColor: COLORS.background,
                                            fontWeight: 'bold',
                                            minWidth: '90px'
                                        }}>
                                            Aliases
                                        </TableCell>
                                    )}
                                    {!isMobile && (
                                        <TableCell sx={{
                                            backgroundColor: COLORS.background,
                                            fontWeight: 'bold',
                                            minWidth: '180px'
                                        }}>
                                            Period
                                        </TableCell>
                                    )}
                                    <TableCell sx={{
                                        backgroundColor: COLORS.background,
                                        fontWeight: 'bold',
                                        minWidth: '80px'
                                    }}>
                                        Status
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rulers.map((ruler) => (
                                    <TableRow
                                        key={ruler.id}
                                        onClick={() => onEditRuler && onEditRuler(ruler.id)}
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
                                                <Box sx={{
                                                    width: 14,
                                                    height: 14,
                                                    borderRadius: '3px',
                                                    backgroundColor: ruler.color || COLORS.texts.muted,
                                                    border: '1px solid rgba(0,0,0,0.15)',
                                                    mr: 1.25,
                                                    flexShrink: 0
                                                }} />
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontWeight: 'medium',
                                                            color: COLORS.texts.primary,
                                                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {ruler.generic_name}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: COLORS.texts.muted,
                                                            fontFamily: 'monospace',
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        {ruler.slug}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>

                                        {!isSmallMobile && (
                                            <TableCell>
                                                {ruler.color ? (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontFamily: 'monospace',
                                                            color: COLORS.texts.secondary,
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        {ruler.color}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>—</Typography>
                                                )}
                                            </TableCell>
                                        )}

                                        {!isSmallMobile && (
                                            <TableCell>
                                                <Tooltip title={ruler.aliases?.join(' | ') || ''}>
                                                    <Chip
                                                        size="small"
                                                        label={ruler.aliases?.length || 0}
                                                        sx={{
                                                            backgroundColor: 'rgba(119, 73, 54, 0.1)',
                                                            color: COLORS.primary,
                                                            fontWeight: 'medium',
                                                            minWidth: '34px'
                                                        }}
                                                    />
                                                </Tooltip>
                                            </TableCell>
                                        )}

                                        {!isMobile && (
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: COLORS.texts.secondary,
                                                        fontSize: '0.75rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {formatPeriod(ruler.start_year, ruler.end_year)}
                                                </Typography>
                                            </TableCell>
                                        )}

                                        <TableCell>
                                            {getStatusChip(ruler)}
                                        </TableCell>
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
                                    '&:hover': { backgroundColor: '#5d3a2a' }
                                },
                                '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.1)' }
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

export default RulerList;
