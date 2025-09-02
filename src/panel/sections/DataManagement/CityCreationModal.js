// src/panel/sections/DataManagement/CityCreationModal.js

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
    useMediaQuery,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Tooltip,
    Chip,
    Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { COLORS } from '../../../shared/config/generalUtils';
import { cachedCitiesApi as citiesApi } from '../../../shared/services/cityApi';

const CityCreationModal = ({ open, onClose, onCityCreated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [validatingName, setValidatingName] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        generic_city_name: '',
        country: '',
        founded: '',
        endDate: '',
        coordinates: ['', ''], // [lat, lng]
        description: '',
        city_tier: 1,
        data_status: 'draft'
    });

    // Historical data
    const [controlHistory, setControlHistory] = useState([]);
    const [populationHistory, setPopulationHistory] = useState([]);
    const [landmarksHistory, setLandmarksHistory] = useState([]);

    // File upload
    const [sourcesFile, setSourcesFile] = useState(null);
    const [createdCityId, setCreatedCityId] = useState(null);

    // Validation
    const [validationErrors, setValidationErrors] = useState({});
    const [nameAvailable, setNameAvailable] = useState(null);

    // Steps
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Basic Info', 'Historical Data', 'Sources & Save'];

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setFormData({
            generic_city_name: '',
            country: '',
            founded: '',
            endDate: '',
            coordinates: ['', ''],
            description: '',
            city_tier: 1,
            data_status: 'draft'
        });
        setControlHistory([]);
        setPopulationHistory([]);
        setLandmarksHistory([]);
        setSourcesFile(null);
        setCreatedCityId(null);
        setValidationErrors({});
        setNameAvailable(null);
        setActiveStep(0);
        setError(null);
        setSuccess(null);
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear validation error
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        // Validate city name
        if (field === 'generic_city_name' && value.trim().length >= 2) {
            validateCityName(value.trim());
        }
    };

    // Handle coordinates
    const handleCoordinateChange = (index, value) => {
        const newCoords = [...formData.coordinates];
        newCoords[index] = value;
        handleInputChange('coordinates', newCoords);
    };

    // Validate city name
    const validateCityName = async (cityName) => {
        if (!cityName.trim() || cityName.length < 2) return;

        setValidatingName(true);
        try {
            const result = await citiesApi.validateCityName(cityName, formData.country || null);
            if (result.success) {
                setNameAvailable(result.data.available);
            }
        } catch (error) {
            console.error('Name validation error:', error);
        } finally {
            setValidatingName(false);
        }
    };

    // Form validation
    const validateForm = () => {
        const errors = {};

        if (!formData.generic_city_name.trim()) {
            errors.generic_city_name = 'City name is required';
        } else if (nameAvailable === false) {
            errors.generic_city_name = 'City name already exists';
        }

        if (!formData.country.trim()) {
            errors.country = 'Country is required';
        }

        if (!formData.founded) {
            errors.founded = 'Foundation year is required';
        } else if (isNaN(formData.founded)) {
            errors.founded = 'Foundation year must be a number';
        }

        if (formData.endDate && parseInt(formData.endDate) <= parseInt(formData.founded)) {
            errors.endDate = 'End year must be greater than foundation year';
        }

        if (!formData.coordinates[0]) {
            errors.latitude = 'Latitude is required';
        } else if (isNaN(formData.coordinates[0]) || formData.coordinates[0] < -90 || formData.coordinates[0] > 90) {
            errors.latitude = 'Latitude must be between -90 and 90';
        }

        if (!formData.coordinates[1]) {
            errors.longitude = 'Longitude is required';
        } else if (isNaN(formData.coordinates[1]) || formData.coordinates[1] < -180 || formData.coordinates[1] > 180) {
            errors.longitude = 'Longitude must be between -180 and 180';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Add historical data helpers
    const addControlPeriod = () => {
        setControlHistory([...controlHistory, {
            ruler: '',
            historical_city_name: '',
            startYear: '',
            endYear: '',
            description: ''
        }]);
    };

    const addPopulationRecord = () => {
        setPopulationHistory([...populationHistory, {
            year: '',
            count: '',
            source: ''
        }]);
    };

    const addLandmark = () => {
        setLandmarksHistory([...landmarksHistory, {
            landmark_name: '',
            constructionDate: '',
            purpose: '',
            significance: '',
            description: ''
        }]);
    };

    const updateHistoricalData = (type, index, field, value) => {
        switch (type) {
            case 'control':
                const newControl = [...controlHistory];
                newControl[index][field] = value;
                setControlHistory(newControl);
                break;
            case 'population':
                const newPopulation = [...populationHistory];
                newPopulation[index][field] = value;
                setPopulationHistory(newPopulation);
                break;
            case 'landmark':
                const newLandmarks = [...landmarksHistory];
                newLandmarks[index][field] = value;
                setLandmarksHistory(newLandmarks);
                break;
        }
    };

    const removeHistoricalData = (type, index) => {
        switch (type) {
            case 'control':
                setControlHistory(controlHistory.filter((_, i) => i !== index));
                break;
            case 'population':
                setPopulationHistory(populationHistory.filter((_, i) => i !== index));
                break;
            case 'landmark':
                setLandmarksHistory(landmarksHistory.filter((_, i) => i !== index));
                break;
        }
    };

    // File upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            setSourcesFile(file);
        } else {
            setError('Please select a valid ZIP file');
        }
    };

    // Main save function
    const handleSave = async () => {
        if (!validateForm()) {
            setActiveStep(0);
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Prepare city data
            const cityData = {
                generic_city_name: formData.generic_city_name.trim(),
                country: formData.country.trim(),
                founded: parseInt(formData.founded),
                endDate: formData.endDate ? parseInt(formData.endDate) : null,
                coordinates: [parseFloat(formData.coordinates[0]), parseFloat(formData.coordinates[1])],
                description: formData.description.trim() || null,
                city_tier: parseInt(formData.city_tier),
                data_status: formData.data_status,
                controlHistory: controlHistory.filter(c => c.ruler.trim()),
                populationHistory: populationHistory.filter(p => p.year && p.count),
                landmarksHistory: landmarksHistory.filter(l => l.landmark_name.trim())
            };

            // Create city
            const result = await citiesApi.createCity(cityData);

            if (result.success) {
                const newCityId = result.data.city.id;
                setCreatedCityId(newCityId);
                setSuccess(`City "${result.data.city.name}" created successfully!`);

                // Upload sources if provided
                if (sourcesFile) {
                    try {
                        const uploadResult = await citiesApi.uploadCitySources(newCityId, sourcesFile);
                        if (uploadResult.success) {
                            setSuccess(prev => prev + ` Sources uploaded: ${uploadResult.data.result.extractedFiles} files.`);
                        }
                    } catch (uploadError) {
                        console.error('Source upload error:', uploadError);
                    }
                }

                // Notify parent
                if (onCityCreated) {
                    onCityCreated({
                        id: newCityId,
                        name: result.data.city.name,
                        country: result.data.city.country
                    });
                }

                // Auto close after delay
                setTimeout(() => {
                    onClose();
                }, 2000);

            } else {
                setError(result.error || 'Failed to create city');
            }

        } catch (error) {
            console.error('City creation error:', error);
            setError('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
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
                        <AddIcon sx={{ color: COLORS.primary }} />
                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, fontWeight: 'bold' }}>
                            Create New City
                        </Typography>
                        {createdCityId && (
                            <Chip
                                label={`ID: ${createdCityId}`}
                                size="small"
                                color="success"
                                icon={<CheckCircleIcon />}
                            />
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
            </DialogTitle>

            <DialogContent sx={{ padding: { xs: 2, md: 3 } }}>
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

                {/* Progress Stepper */}
                <Box sx={{ mb: 3 }}>
                    <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Step Content */}
                <Box sx={{ minHeight: '400px' }}>
                    {/* Step 0: Basic Information */}
                    {activeStep === 0 && (
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
                                    helperText={
                                        validationErrors.generic_city_name ||
                                        (validatingName ? 'Checking availability...' :
                                            nameAvailable === false ? 'Name already exists' :
                                                nameAvailable === true ? 'Name is available' : '')
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOnIcon sx={{ color: COLORS.primary }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: validatingName ? (
                                            <InputAdornment position="end">
                                                <CircularProgress size={16} />
                                            </InputAdornment>
                                        ) : null
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
                                    >
                                        <MenuItem value="draft">Draft</MenuItem>
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
                                    value={formData.endDate}
                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                    fullWidth
                                    type="number"
                                    helperText="Must be greater than foundation year (leave empty if still exists)"
                                />
                            </Grid>

                            {/* Coordinates */}
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Latitude"
                                    value={formData.coordinates[0]}
                                    onChange={(e) => handleCoordinateChange(0, e.target.value)}
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
                                    value={formData.coordinates[1]}
                                    onChange={(e) => handleCoordinateChange(1, e.target.value)}
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
                                    rows={3}
                                    placeholder="Enter a brief description of the city..."
                                    helperText="Optional field for additional city information"
                                />
                            </Grid>
                        </Grid>
                    )}

                    {/* Step 1: Historical Data (Simplified) */}
                    {activeStep === 1 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                                Historical Data
                            </Typography>

                            <Alert severity="info" sx={{ mb: 2 }}>
                                Detailed historical data will be added after careful moderator examination.
                            </Alert>

                            <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                • Control History: {controlHistory.length} periods<br />
                                • Population History: {populationHistory.length} records<br />
                                • Landmarks: {landmarksHistory.length} landmarks
                            </Typography>
                        </Box>
                    )}

                    {/* Step 2: Sources & Save */}
                    {activeStep === 2 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                                Sources Upload (Optional)
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <input
                                    type="file"
                                    accept=".zip"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    id="sources-upload"
                                />
                                <label htmlFor="sources-upload">
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        startIcon={<UploadIcon />}
                                        sx={{
                                            borderColor: COLORS.primary,
                                            color: COLORS.primary,
                                            '&:hover': { borderColor: '#5d3a2a' }
                                        }}
                                    >
                                        Select ZIP File
                                    </Button>
                                </label>

                                {sourcesFile && (
                                    <Typography variant="body2" sx={{ mt: 1, color: COLORS.texts.secondary }}>
                                        Selected: {sourcesFile.name} ({(sourcesFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h6" sx={{ mb: 2 }}>Review</Typography>
                            <Box sx={{ p: 2, backgroundColor: 'rgba(119, 73, 54, 0.05)', borderRadius: 2 }}>
                                <Typography><strong>City:</strong> {formData.generic_city_name}</Typography>
                                <Typography><strong>Country:</strong> {formData.country}</Typography>
                                <Typography><strong>Founded:</strong> {formData.founded}</Typography>
                                <Typography><strong>Coordinates:</strong> [{formData.coordinates[0]}, {formData.coordinates[1]}]</Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    padding: { xs: 2, md: 3 },
                    backgroundColor: COLORS.background,
                    borderTop: `1px solid ${COLORS.border}`,
                    gap: 1
                }}
            >
                <Button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0 || saving}
                    sx={{ color: COLORS.texts.secondary }}
                >
                    Back
                </Button>

                <Button
                    onClick={onClose}
                    disabled={saving}
                    sx={{ color: COLORS.texts.secondary }}
                >
                    Cancel
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                        sx={{
                            backgroundColor: COLORS.primary,
                            '&:hover': { backgroundColor: '#5d3a2a' }
                        }}
                    >
                        {saving ? 'Creating...' : 'Create City'}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setActiveStep(activeStep + 1)}
                        variant="contained"
                        sx={{
                            backgroundColor: COLORS.primary,
                            '&:hover': { backgroundColor: '#5d3a2a' }
                        }}
                    >
                        Next
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default CityCreationModal;