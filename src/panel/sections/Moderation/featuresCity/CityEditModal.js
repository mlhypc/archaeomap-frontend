// archaeomap-frontend\src\components\panel\DataManagement\CityEditModal.js

import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
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
    Paper,
    Tabs,
    Tab
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import EditIcon from '@mui/icons-material/Edit';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import InfoIcon from '@mui/icons-material/Info';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

import { COLORS } from '../../../../shared/config/generalUtils';
import { cachedCitiesApi as citiesApi } from '../../../../shared/services/cityApi';
import useUserRole from '../../../../shared/hooks/useUserRole';
import HistoricalDataEditor from './HistoricalDataEditor';
import { COUNTRIES } from '../../../../data/country_list';

const CityEditModal = ({ open, onClose, cityId, onCityUpdated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAdmin } = useUserRole(); // Get admin status

    // State management
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Tab state
    const [activeTab, setActiveTab] = useState(0);
    const jsonInputRef = useRef(null);

    // Image state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageCredit, setImageCredit] = useState('');
    const [imageCreditLink, setImageCreditLink] = useState('');

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

    // Historical data states
    const [controlHistory, setControlHistory] = useState([]);
    const [populationHistory, setPopulationHistory] = useState([]);
    const [landmarksHistory, setLandmarksHistory] = useState([]);

    // Load city data when modal opens
    useEffect(() => {
        if (open && cityId) {
            loadCityData();
        } else if (!open) {
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                        ruler: c.ruler || '',
                        historical_city_name: c.historical_city_name || '',
                        startYear: c.startYear || '',
                        endYear: c.endYear || '',
                        description: c.description || ''
                    })) || [],
                    population_history_json: result.data.populationHistory?.map(p => ({
                        year: p.year || '',
                        count: p.count || '',
                        source: p.source || ''
                    })) || [],
                    landmarks_history_json: result.data.landmarksHistory?.map(l => ({
                        landmark_name: l.landmark_name || '',
                        constructionDate: l.constructionDate || '',
                        purpose: l.purpose || '',
                        significance: l.significance || '',
                        description: l.description || ''
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

                // Set historical data states for HistoricalDataEditor
                setControlHistory(completeData.control_history_json || []);
                setPopulationHistory(completeData.population_history_json || []);
                setLandmarksHistory(completeData.landmarks_history_json || []);

                // Set image data
                if (result.data.image_url) {
                    // Check if it's a full URL (B2) or relative path (local)
                    if (result.data.image_url.startsWith('http')) {
                        // B2 full URL - use directly
                        setImagePreview(result.data.image_url);
                    } else {
                        // Local path - prepend base URL
                        const baseUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace('/api', '');
                        setImagePreview(`${baseUrl}${result.data.image_url}`);
                    }
                }
                setImageCredit(result.data.image_credit || '');
                setImageCreditLink(result.data.image_credit_link || '');
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

        // Reset historical data states
        setControlHistory([]);
        setPopulationHistory([]);
        setLandmarksHistory([]);

        // Reset image states
        setImageFile(null);
        setImagePreview(null);
        setImageCredit('');
        setImageCreditLink('');
        setActiveTab(0);
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

    // Load city data from a JSON file into the form
    const handleJsonImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            setError('Please select a .json file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);

                // Validate required fields
                const problems = [];
                if (!json.generic_city_name || typeof json.generic_city_name !== 'string')
                    problems.push('generic_city_name missing or not a string');
                if (!json.country || typeof json.country !== 'string')
                    problems.push('country missing or not a string');
                if (json.founded === undefined || typeof json.founded !== 'number')
                    problems.push('founded missing or not a number');
                if (!Array.isArray(json.coordinates) || json.coordinates.length < 2)
                    problems.push('coordinates must be an array [lat, lon]');
                else {
                    const [lat, lon] = json.coordinates;
                    if (typeof lat !== 'number' || lat < -90 || lat > 90)
                        problems.push('coordinates[0] (latitude) must be a number between -90 and 90');
                    if (typeof lon !== 'number' || lon < -180 || lon > 180)
                        problems.push('coordinates[1] (longitude) must be a number between -180 and 180');
                }
                if (json.end_date !== undefined && json.end_date !== null && typeof json.end_date !== 'number')
                    problems.push('end_date must be a number or null');
                if (json.city_tier !== undefined && (typeof json.city_tier !== 'number' || json.city_tier < 1 || json.city_tier > 10))
                    problems.push('city_tier must be a number between 1 and 10');
                if (json.controlHistory !== undefined && !Array.isArray(json.controlHistory))
                    problems.push('controlHistory must be an array');
                if (json.populationHistory !== undefined && !Array.isArray(json.populationHistory))
                    problems.push('populationHistory must be an array');
                if (json.landmarksHistory !== undefined && !Array.isArray(json.landmarksHistory))
                    problems.push('landmarksHistory must be an array');

                if (problems.length > 0) {
                    setError(`JSON validation failed:\n• ${problems.join('\n• ')}`);
                    return;
                }

                setFormData(prev => ({
                    ...prev,
                    generic_city_name: json.generic_city_name,
                    country: json.country,
                    founded: json.founded.toString(),
                    end_date: json.end_date != null ? json.end_date.toString() : '',
                    latitude: json.coordinates[0].toString(),
                    longitude: json.coordinates[1].toString(),
                    description: json.description || prev.description,
                    city_tier: json.city_tier ?? prev.city_tier
                }));

                if (Array.isArray(json.controlHistory)) setControlHistory(json.controlHistory);
                if (Array.isArray(json.populationHistory)) setPopulationHistory(json.populationHistory);
                if (Array.isArray(json.landmarksHistory)) setLandmarksHistory(json.landmarksHistory);

                setSuccess(`JSON loaded: "${json.generic_city_name}" — review changes and click Save`);
                setError(null);
            } catch {
                setError('Invalid JSON file — could not parse');
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be re-selected
        event.target.value = '';
    };

    // Handle image file selection
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setError(null);
        }
    };

    // Remove image
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
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

    // Save handler for Historical Info tab (city data + historical data)
    const handleSaveHistoricalInfo = async () => {
        if (!validateForm() || !completeCityData) {
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Convert historical data to ensure numbers
            const sanitizedControlHistory = controlHistory.map(c => ({
                ruler: c.ruler,
                historical_city_name: c.historical_city_name,
                startYear: parseInt(c.startYear) || 0,
                endYear: c.endYear ? parseInt(c.endYear) : null,
                description: c.description || ''
            }));

            const sanitizedPopulationHistory = populationHistory.map(p => ({
                year: parseInt(p.year) || 0,
                count: parseInt(p.count) || 0,
                source: p.source || ''
            }));

            const sanitizedLandmarksHistory = landmarksHistory.map(l => ({
                landmark_name: l.landmark_name,
                constructionDate: parseInt(l.constructionDate) || 0,
                purpose: l.purpose || '',
                significance: l.significance || '',
                description: l.description || ''
            }));

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
                // Send sanitized historical data
                controlHistory: sanitizedControlHistory,
                populationHistory: sanitizedPopulationHistory,
                landmarksHistory: sanitizedLandmarksHistory
            };

            console.log('🔍 Frontend sending updateData:', updateData);
            console.log('🔍 City ID:', cityId);

            const result = await citiesApi.updateCity(cityId, updateData);

            if (result.success) {
                setSuccess('City information updated successfully!');
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

    // Save handler for Photos tab (only image and credits)
    const handleSavePhoto = async () => {
        if (!cityId) {
            setError('City ID is missing');
            return;
        }

        // Check if there's something to save
        if (!imageFile && !imageCredit && !imageCreditLink) {
            setError('No changes to save');
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Minimal data for image-only update
            // Backend will detect this as image-only and skip full validation
            const updateData = {
                image_credit: imageCredit || '',
                image_credit_link: imageCreditLink || ''
            };

            console.log('📸 Updating photo for City ID:', cityId);
            console.log('📸 Image file:', imageFile);
            console.log('📸 Image credit:', imageCredit);
            console.log('📸 Image credit link:', imageCreditLink);

            let result;
            if (imageFile) {
                // If there's a new image file, use updateCityWithImage
                result = await citiesApi.updateCityWithImage(cityId, updateData, imageFile);
            } else {
                // If only updating credits, use regular update
                result = await citiesApi.updateCity(cityId, updateData);
            }

            if (result.success) {
                setSuccess('Photo updated successfully!');

                // Clear the image file state after successful upload
                setImageFile(null);

                // Notify parent component
                if (onCityUpdated) {
                    onCityUpdated(result.data.city);
                }

                // Reload city data to get the new image URL
                await loadCityData();

            } else {
                console.log('🔍 API Error Response:', result);
                setError(result.error || 'Failed to update photo');
            }
        } catch (err) {
            console.log('🔍 Network Error:', err);
            setError('Network error occurred');
            console.error('Photo update error:', err);
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
            transitionDuration={150}
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
                            <>
                                <Typography variant="h6" sx={{ color: COLORS.texts.muted, fontWeight: 300, mx: 0.5 }}>
                                    -
                                </Typography>
                                <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 600 }}>
                                    {formData.generic_city_name}
                                </Typography>
                            </>
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

            <DialogContent sx={{ padding: 0 }}>
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
                    <>
                        {/* Tabs */}
                        <Box sx={{ borderBottom: 1, borderColor: COLORS.border, backgroundColor: COLORS.background }}>
                            <Tabs
                                value={activeTab}
                                onChange={(e, newValue) => setActiveTab(newValue)}
                                sx={{
                                    '& .MuiTab-root': {
                                        color: COLORS.texts.secondary,
                                        '&.Mui-selected': {
                                            color: COLORS.primary
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: COLORS.primary
                                    }
                                }}
                            >
                                <Tab icon={<InfoIcon />} label="Historical Info" iconPosition="start" />
                                <Tab icon={<PhotoCameraIcon />} label="Photos" iconPosition="start" />
                            </Tabs>
                        </Box>

                        <Box sx={{ padding: { xs: 2, md: 4 } }}>
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

                        {/* Tab 0: Basic Info */}
                        {activeTab === 0 && (
                        <>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Row 1: City Name - City Tier */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 66%' } }}>
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
                                </Box>

                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
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
                                </Box>
                            </Box>

                            {/* Row 2: Country - Status */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                                    <FormControl fullWidth required error={!!validationErrors.country}>
                                        <InputLabel>Country</InputLabel>
                                        <Select
                                            value={formData.country}
                                            onChange={(e) => handleInputChange('country', e.target.value)}
                                            label="Country"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <PublicIcon sx={{ color: COLORS.primary }} />
                                                </InputAdornment>
                                            }
                                        >
                                            {COUNTRIES.map((country) => (
                                                <MenuItem key={country} value={country}>
                                                    {country}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {validationErrors.country && (
                                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                                                {validationErrors.country}
                                            </Typography>
                                        )}
                                    </FormControl>
                                </Box>

                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
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
                                </Box>
                            </Box>

                            {/* Row 3: Foundation Year - End Year */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
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
                                </Box>

                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
                                    <TextField
                                        label="End Year (Optional)"
                                        value={formData.end_date}
                                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                                        fullWidth
                                        type="number"
                                        error={!!validationErrors.end_date}
                                        helperText={validationErrors.end_date || "Leave empty if city still exists"}
                                    />
                                </Box>
                            </Box>

                            {/* Row 4: Latitude - Longitude */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
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
                                </Box>

                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 50%' } }}>
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
                                </Box>
                            </Box>

                            {/* Row 5: Description */}
                            <Box>
                                <TextField
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={20}
                                    placeholder="Enter a brief description of the city..."
                                    helperText="Optional field for additional city information"
                                />
                            </Box>
                        </Box>

                        {/* Historical Data Editor */}
                        {completeCityData && (
                            <Box sx={{ mt: 4 }}>
                                <Typography variant="h6" sx={{ color: COLORS.texts.primary, mb: 2 }}>
                                    Historical Data
                                </Typography>

                                <Alert severity="info" sx={{ mb: 3 }}>
                                    Edit historical data below. Changes will be saved when you click "Save Changes".
                                </Alert>

                                <HistoricalDataEditor
                                    controlHistory={controlHistory}
                                    onControlHistoryChange={setControlHistory}
                                    populationHistory={populationHistory}
                                    onPopulationHistoryChange={setPopulationHistory}
                                    landmarksHistory={landmarksHistory}
                                    onLandmarksHistoryChange={setLandmarksHistory}
                                />
                            </Box>
                        )}
                        </>
                        )}

                        {/* Tab 1: Photos */}
                        {activeTab === 1 && (
                            <Box sx={{ pt: 2 }}>
                                <Typography variant="h6" sx={{ color: COLORS.texts.primary, mb: 3 }}>
                                    City Image
                                </Typography>

                                {/* Current Image Preview */}
                                {imagePreview && (
                                    <Paper
                                        elevation={2}
                                        sx={{
                                            p: 2,
                                            mb: 3,
                                            borderRadius: '8px',
                                            backgroundColor: COLORS.background
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ color: COLORS.texts.secondary, mb: 2 }}>
                                            Current Image
                                        </Typography>
                                        <Box
                                            component="img"
                                            src={imagePreview}
                                            alt="City preview"
                                            sx={{
                                                width: '100%',
                                                maxHeight: '300px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                mb: 2
                                            }}
                                        />
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            size="small"
                                            onClick={handleRemoveImage}
                                            startIcon={<DeleteIcon />}
                                        >
                                            Remove Image
                                        </Button>
                                    </Paper>
                                )}

                                {/* Upload New Image */}
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 3,
                                        mb: 3,
                                        borderRadius: '8px',
                                        border: `2px dashed ${COLORS.border}`
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ color: COLORS.texts.primary, mb: 2 }}>
                                        Upload New Image
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        component="label"
                                        startIcon={<PhotoCameraIcon />}
                                        sx={{
                                            backgroundColor: COLORS.primary,
                                            '&:hover': { backgroundColor: '#5d3a2a' }
                                        }}
                                    >
                                        Choose Image
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </Button>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: COLORS.texts.muted }}>
                                        Supported: JPG, PNG, WebP (Max 5MB)
                                    </Typography>
                                </Paper>

                                {/* Image Credit Fields */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
                                    <TextField
                                        label="Image Credit (Photographer Name)"
                                        value={imageCredit}
                                        onChange={(e) => setImageCredit(e.target.value)}
                                        fullWidth
                                        placeholder="e.g., John Doe"
                                        helperText="Optional: Credit the photographer"
                                    />
                                    <TextField
                                        label="Credit Link (URL)"
                                        value={imageCreditLink}
                                        onChange={(e) => setImageCreditLink(e.target.value)}
                                        fullWidth
                                        placeholder="e.g., https://unsplash.com/@johndoe"
                                        helperText="Optional: Link to photographer's profile"
                                    />
                                </Box>
                            </Box>
                        )}
                        </Box>
                    </>
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
                {/* Hidden JSON file input */}
                <input
                    ref={jsonInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleJsonImport}
                />

                {/* Left side - Delete + Import/Export JSON buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {activeTab === 0 && !loading && (
                        <>
                            <Button
                                onClick={() => citiesApi.exportCity(cityId, formData.generic_city_name)}
                                disabled={saving || deleting}
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                sx={{
                                    borderColor: COLORS.primary,
                                    color: COLORS.primary,
                                    '&:hover': { backgroundColor: `${COLORS.primary}10` }
                                }}
                            >
                                JSON
                            </Button>
                            <Button
                                onClick={() => jsonInputRef.current?.click()}
                                disabled={saving || deleting}
                                variant="outlined"
                                startIcon={<UploadFileIcon />}
                                sx={{
                                    borderColor: COLORS.secondary,
                                    color: COLORS.secondary,
                                    '&:hover': { backgroundColor: `${COLORS.secondary}10` }
                                }}
                            >
                                Load JSON
                            </Button>
                        </>
                    )}
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
                </Box> {/* end left side box */}

                {/* Right side - Cancel and Save buttons (tab-specific) */}
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

                    {/* Historical Info Tab - Save Button */}
                    {activeTab === 0 && (
                        <Button
                            onClick={handleSaveHistoricalInfo}
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
                            {saving ? 'Saving...' : 'Save City Info'}
                        </Button>
                    )}

                    {/* Photos Tab - Save Button */}
                    {activeTab === 1 && (
                        <Button
                            onClick={handleSavePhoto}
                            disabled={loading || saving || deleting || (!imageFile && !imageCredit && !imageCreditLink)}
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
                            {saving ? 'Uploading...' : 'Save Photo'}
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default CityEditModal;