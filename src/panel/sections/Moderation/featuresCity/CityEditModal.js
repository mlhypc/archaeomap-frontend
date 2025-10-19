// archaeomap-frontend\src\components\panel\DataManagement\CityEditModal.js

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Chip,
    useMediaQuery,
    InputAdornment,
    Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import { COLORS } from '../../../../shared/config/generalUtils';
import { cachedCitiesApi as citiesApi } from '../../../../shared/services/cityApi';
import useUserRole from '../../../../shared/hooks/useUserRole';

const CityEditModal = ({ open, onClose, cityId, onCityUpdated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAdmin } = useUserRole(); // Get imperator status

    // State management
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form data - Basic fields only for UI
    const [formData, setFormData] = useState({
        generic_city_name: '',
        country: '',
        founded: '',
        end_date: '',
        latitude: '',
        longitude: '',
        description: '',
        city_tier: 1,
        data_status: 'active'
    });

    // Complete city data including JSON fields
    const [completeCityData, setCompleteCityData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    // Load city data when modal opens
    useEffect(() => {
        if (open && cityId) {
            loadCityData();
        } else if (!open) {
            resetForm();
        }
    }, [open, cityId]);

    const loadCityData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await citiesApi.getCityDetails(cityId);

            // DEBUG: Let's see what we're getting from backend
            console.log('🔍 Backend response:', result.data);

            if (result.success) {
                // Basic form data for UI
                const formData = {
                    generic_city_name: result.data.name || '',
                    country: result.data.country || '',
                    founded: result.data.founded?.toString() || '',
                    end_date: result.data.endDate?.toString() || '',
                    latitude: result.data.coordinates?.[0]?.toString() || '',
                    longitude: result.data.coordinates?.[1]?.toString() || '',
                    description: result.data.description || '',
                    city_tier: result.data.city_tier || 1,
                    data_status: result.data.data_status || 'active'
                };

                // DEBUG: Check what JSON data we have
                console.log('🔍 Control History:', result.data.controlHistory);
                console.log('🔍 Population History:', result.data.populationHistory);
                console.log('🔍 Landmarks History:', result.data.landmarksHistory);

                // Complete city data including JSON fields (preserve everything)
                const completeData = {
                    ...formData,
                    control_history_json: result.data.controlHistory?.map(c => ({
                        ruler: c.ruler,
                        historical_city_name: c.historical_city_name,
                        startYear: c.startYear,
                        endYear: c.endYear,
                        description: c.description
                    })) || [],
                    population_history_json: result.data.populationHistory?.map(p => ({
                        year: p.year,
                        count: p.count,
                        source: p.source
                    })) || [],
                    landmarks_history_json: result.data.landmarksHistory?.map(l => ({
                        landmark_name: l.landmark_name,
                        constructionDate: l.constructionDate,
                        purpose: l.purpose,
                        significance: l.significance,
                        description: l.description
                    })) || []
                };

                // DEBUG: Check final complete data
                console.log('🔍 Complete data:', completeData);
                console.log('🔍 Control history JSON length:', completeData.control_history_json.length);
                console.log('🔍 Population history JSON length:', completeData.population_history_json.length);
                console.log('🔍 Landmarks history JSON length:', completeData.landmarks_history_json.length);

                setFormData(formData);
                setCompleteCityData(completeData);
                setOriginalData(formData);
            } else {
                setError(result.error || 'Failed to load city data');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('City data load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            generic_city_name: '',
            country: '',
            founded: '',
            end_date: '',
            latitude: '',
            longitude: '',
            description: '',
            city_tier: 1,
            data_status: 'active'
        });
        setCompleteCityData(null);
        setOriginalData(null);
        setValidationErrors({});
        setError(null);
        setSuccess(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error when user starts typing
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        // Clear success message
        if (success) {
            setSuccess(null);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.generic_city_name.trim()) {
            errors.generic_city_name = 'City name is required';
        }

        if (!formData.country.trim()) {
            errors.country = 'Country is required';
        }

        if (!formData.founded) {
            errors.founded = 'Foundation year is required';
        } else if (isNaN(formData.founded)) {
            errors.founded = 'Foundation year must be a number';
        }

        if (formData.end_date && isNaN(formData.end_date)) {
            errors.end_date = 'End year must be a number';
        }

        if (!formData.latitude) {
            errors.latitude = 'Latitude is required';
        } else if (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90) {
            errors.latitude = 'Latitude must be between -90 and 90';
        }

        if (!formData.longitude) {
            errors.longitude = 'Longitude is required';
        } else if (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180) {
            errors.longitude = 'Longitude must be between -180 and 180';
        }

        if (formData.founded && formData.end_date && parseInt(formData.founded) >= parseInt(formData.end_date)) {
            errors.end_date = 'End year must be after foundation year';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm() || !completeCityData) {
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Prepare data for API - merge form changes with complete data
            const updateData = {
                generic_city_name: formData.generic_city_name.trim(),
                country: formData.country.trim(),
                founded: parseInt(formData.founded),
                end_date: formData.end_date ? parseInt(formData.end_date) : new Date().getFullYear(),
                description: formData.description.trim() || null,
                city_tier: parseInt(formData.city_tier),
                data_status: formData.data_status,
                coordinates: [
                    parseFloat(formData.latitude),
                    parseFloat(formData.longitude)
                ],
                // Send historical data in the format backend expects
                controlHistory: completeCityData.control_history_json || [],
                populationHistory: completeCityData.population_history_json || [],
                landmarksHistory: completeCityData.landmarks_history_json || []
            };

            console.log('🔍 Frontend sending updateData:', updateData);
            console.log('🔍 City ID:', cityId);

            const result = await citiesApi.updateCity(cityId, updateData);

            if (result.success) {
                setSuccess('City updated successfully!');
                setOriginalData(formData);

                // Notify parent component
                if (onCityUpdated) {
                    onCityUpdated(result.data.city);
                }

                // Auto close modal after delay
                setTimeout(() => {
                    onClose();
                }, 1500);

            } else {
                console.log('🔍 API Error Response:', result);
                setError(result.error || 'Failed to update city');
            }
        } catch (err) {
            console.log('🔍 Network Error:', err);
            setError('Network error occurred');
            console.error('City update error:', err);
        } finally {
            setSaving(false);
        }
    };

    const hasUnsavedChanges = () => {
        if (!originalData) return false;
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const handleDelete = async () => {
        if (!cityId || !formData.generic_city_name) return;

        const confirmed = window.confirm(
            `⚠️ WARNING: You are about to permanently delete "${formData.generic_city_name}".\n\n` +
            `This will remove:\n` +
            `• City data and coordinates\n` +
            `• ${completeCityData?.control_history_json?.length || 0} control periods\n` +
            `• ${completeCityData?.population_history_json?.length || 0} population records\n` +
            `• ${completeCityData?.landmarks_history_json?.length || 0} landmarks\n\n` +
            `This action CANNOT be undone.\n\n` +
            `Are you absolutely sure?`
        );

        if (!confirmed) return;

        setDeleting(true);
        setError(null);

        try {
            const result = await citiesApi.deleteCity(cityId);

            if (result.success) {
                alert(`✅ City "${formData.generic_city_name}" has been permanently deleted.`);

                // Notify parent component
                if (onCityUpdated) {
                    onCityUpdated({ deleted: true, cityId });
                }

                // Close modal
                onClose();
            } else {
                setError(result.error || 'Failed to delete city');
            }
        } catch (err) {
            setError('Failed to delete city: ' + err.message);
            console.error('City deletion error:', err);
        } finally {
            setDeleting(false);
        }
    };

    const getStatusChip = (status) => {
        const statusColors = {
            active: { bg: '#4caf50', color: 'white' },
            passive: { bg: '#ff9800', color: 'white' },
            draft: { bg: COLORS.texts.muted, color: 'white' }
        };

        const colors = statusColors[status] || { bg: '#757575', color: 'white' };

        return (
            <Chip
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                size="small"
                sx={{ backgroundColor: colors.bg, color: colors.color }}
            />
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : '12px',
                    maxHeight: isMobile ? '100vh' : '90vh'
                }
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: COLORS.background,
                    borderBottom: `1px solid ${COLORS.border}`,
                    padding: { xs: 2, md: 3 }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EditIcon sx={{ color: COLORS.primary }} />
                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, fontWeight: 'bold' }}>
                            Edit City
                        </Typography>
                        {formData.generic_city_name && (
                            <Typography variant="body2" sx={{ color: COLORS.texts.secondary, ml: 1 }}>
                                - {formData.generic_city_name}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        onClick={onClose}
                        size="small"
                        sx={{ minWidth: 'auto', color: COLORS.texts.muted }}
                    >
                        <CloseIcon />
                    </Button>
                </Box>

                {/* Show data preservation status */}
                {completeCityData && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                            Preserving: {completeCityData.control_history_json?.length || 0} control periods,
                            {' '}{completeCityData.population_history_json?.length || 0} population records,
                            {' '}{completeCityData.landmarks_history_json?.length || 0} landmarks
                        </Typography>
                    </Box>
                )}
            </DialogTitle>

            <DialogContent sx={{ padding: { xs: 2, md: 3 } }}>
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem',
                        color: COLORS.texts.secondary
                    }}>
                        <CircularProgress sx={{ color: COLORS.primary, mb: 2 }} />
                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                            Loading complete city data...
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ pt: 2 }}>
                        {/* Alerts */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                {success}
                            </Alert>
                        )}

                        {/* Basic Form - Same as before */}
                        <Grid container spacing={3}>
                            {/* City Name & Tier */}
                            <Grid item xs={12} md={8}>
                                <TextField
                                    label="City Name"
                                    value={formData.generic_city_name}
                                    onChange={(e) => handleInputChange('generic_city_name', e.target.value)}
                                    fullWidth
                                    required
                                    error={!!validationErrors.generic_city_name}
                                    helperText={validationErrors.generic_city_name}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOnIcon sx={{ color: COLORS.primary }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>City Tier</InputLabel>
                                    <Select
                                        value={formData.city_tier}
                                        onChange={(e) => handleInputChange('city_tier', e.target.value)}
                                        label="City Tier"
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <MenuItem key={i + 1} value={i + 1}>
                                                Tier {i + 1}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Country & Status */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Country"
                                    value={formData.country}
                                    onChange={(e) => handleInputChange('country', e.target.value)}
                                    fullWidth
                                    required
                                    error={!!validationErrors.country}
                                    helperText={validationErrors.country}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PublicIcon sx={{ color: COLORS.primary }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.data_status}
                                        onChange={(e) => handleInputChange('data_status', e.target.value)}
                                        label="Status"
                                        renderValue={(value) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                {getStatusChip(value)}
                                            </Box>
                                        )}
                                    >
                                        <MenuItem value="active">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getStatusChip('active')} Active
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="passive">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getStatusChip('passive')} Passive
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="draft">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {getStatusChip('draft')} Draft
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Foundation & End Year */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Foundation Year"
                                    value={formData.founded}
                                    onChange={(e) => handleInputChange('founded', e.target.value)}
                                    fullWidth
                                    required
                                    type="number"
                                    error={!!validationErrors.founded}
                                    helperText={validationErrors.founded || "Use negative numbers for BC (e.g., -753 for 753 BC)"}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarTodayIcon sx={{ color: COLORS.primary }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="End Year (Optional)"
                                    value={formData.end_date}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                    fullWidth
                                    type="number"
                                    error={!!validationErrors.end_date}
                                    helperText={validationErrors.end_date || "Leave empty if city still exists"}
                                />
                            </Grid>

                            {/* Coordinates */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Latitude"
                                    value={formData.latitude}
                                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                                    fullWidth
                                    required
                                    type="number"
                                    inputProps={{ step: "any" }}
                                    error={!!validationErrors.latitude}
                                    helperText={validationErrors.latitude || "Range: -90 to 90"}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Longitude"
                                    value={formData.longitude}
                                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                                    fullWidth
                                    required
                                    type="number"
                                    inputProps={{ step: "any" }}
                                    error={!!validationErrors.longitude}
                                    helperText={validationErrors.longitude || "Range: -180 to 180"}
                                />
                            </Grid>

                            {/* Description */}
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={4}
                                    placeholder="Enter a brief description of the city..."
                                    helperText="Optional field for additional city information"
                                />
                            </Grid>
                        </Grid>

                        {/* JSON Data Preview */}
                        {completeCityData && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" sx={{ color: COLORS.texts.primary, mb: 2 }}>
                                    Historical Data (Read-Only Preview)
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(119, 73, 54, 0.05)' }}>
                                            <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1 }}>
                                                Control History ({completeCityData.control_history_json?.length || 0} periods)
                                            </Typography>
                                            {completeCityData.control_history_json?.slice(0, 3).map((period, i) => (
                                                <Typography key={i} variant="caption" sx={{ display: 'block', color: COLORS.texts.secondary }}>
                                                    {period.startYear}-{period.endYear || 'Present'}: {period.ruler}
                                                </Typography>
                                            ))}
                                            {completeCityData.control_history_json?.length > 3 && (
                                                <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                                                    +{completeCityData.control_history_json.length - 3} more...
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(119, 73, 54, 0.05)' }}>
                                            <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1 }}>
                                                Population ({completeCityData.population_history_json?.length || 0} records)
                                            </Typography>
                                            {completeCityData.population_history_json?.slice(0, 3).map((record, i) => (
                                                <Typography key={i} variant="caption" sx={{ display: 'block', color: COLORS.texts.secondary }}>
                                                    {record.year}: {record.count?.toLocaleString()} people
                                                </Typography>
                                            ))}
                                            {completeCityData.population_history_json?.length > 3 && (
                                                <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                                                    +{completeCityData.population_history_json.length - 3} more...
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={4}>
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(119, 73, 54, 0.05)' }}>
                                            <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1 }}>
                                                Landmarks ({completeCityData.landmarks_history_json?.length || 0} items)
                                            </Typography>
                                            {completeCityData.landmarks_history_json?.slice(0, 3).map((landmark, i) => (
                                                <Typography key={i} variant="caption" sx={{ display: 'block', color: COLORS.texts.secondary }}>
                                                    {landmark.constructionDate}: {landmark.landmark_name}
                                                </Typography>
                                            ))}
                                            {completeCityData.landmarks_history_json?.length > 3 && (
                                                <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                                                    +{completeCityData.landmarks_history_json.length - 3} more...
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Historical data is preserved when saving. For now, this is a read-only preview.
                                    Advanced editing will be available in future updates.
                                </Alert>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    padding: { xs: 2, md: 3 },
                    backgroundColor: COLORS.background,
                    borderTop: `1px solid ${COLORS.border}`,
                    justifyContent: 'space-between',
                    gap: 1
                }}
            >
                {/* Left side - Delete button (Imperator only) */}
                <Box>
                    {isAdmin && !loading && (
                        <Button
                            onClick={handleDelete}
                            disabled={saving || deleting}
                            variant="outlined"
                            color="error"
                            startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                            sx={{
                                borderColor: 'error.main',
                                color: 'error.main',
                                '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                    borderColor: 'error.dark'
                                },
                                '&:disabled': {
                                    borderColor: 'rgba(0, 0, 0, 0.12)',
                                    color: 'rgba(0, 0, 0, 0.26)'
                                }
                            }}
                        >
                            {deleting ? 'Deleting...' : 'Delete City'}
                        </Button>
                    )}
                </Box>

                {/* Right side - Cancel and Save buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        onClick={onClose}
                        disabled={saving || deleting}
                        sx={{
                            color: COLORS.texts.secondary,
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.05)' }
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={loading || saving || deleting || !hasUnsavedChanges() || !completeCityData}
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        sx={{
                            backgroundColor: COLORS.primary,
                            '&:hover': { backgroundColor: '#5d3a2a' },
                            '&:disabled': {
                                backgroundColor: COLORS.texts.muted,
                                color: 'white'
                            }
                        }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default CityEditModal;