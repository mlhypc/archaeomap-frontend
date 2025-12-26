// src/panel/sections/DataManagement/CityCreationModal.js - UPDATED FOR APPROVAL WORKFLOW

import React, { useState, useEffect } from 'react';
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
    useMediaQuery,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PublicIcon from '@mui/icons-material/Public';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';

import { COLORS } from '../../../../shared/config/generalUtils';
import { cachedCitiesApi as citiesApi } from '../../../../shared/services/cityApi';
import useUserRole from '../../../../shared/hooks/useUserRole';
import HistoricalDataEditor from './HistoricalDataEditor';
import { COUNTRIES } from '../../../../data/country_list';
import exampleCityJson from '../../../../data/city_example.json';

const CityCreationModal = ({ open, onClose, onCityCreated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAdmin } = useUserRole();

    // State management
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
    const [jsonFile, setJsonFile] = useState(null);

    // Admin options
    const [bypassApproval, setBypassApproval] = useState(false);

    // Validation
    const [validationErrors, setValidationErrors] = useState({});
    const [nameAvailable, setNameAvailable] = useState(null);

    // Steps
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Basic Info', 'Historical Data', 'Sources & Submit'];

    // Submission result
    const [submissionResult, setSubmissionResult] = useState(null);

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
        setValidationErrors({});
        setNameAvailable(null);
        setActiveStep(0);
        setError(null);
        setSuccess(null);
        setSubmissionResult(null);
        setBypassApproval(false);
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

    // File upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file && file.name.toLowerCase().endsWith('.zip')) {
            setSourcesFile(file);
        } else {
            setError('Please select a valid ZIP file');
        }
    };

    // JSON file upload and parsing
    const handleJsonUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.json')) {
            setError('Please select a valid JSON file');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);

                // Populate basic fields
                if (jsonData.generic_city_name) {
                    setFormData(prev => ({
                        ...prev,
                        generic_city_name: jsonData.generic_city_name || '',
                        country: jsonData.country || '',
                        founded: jsonData.founded || '',
                        endDate: jsonData.endDate || jsonData.end_date || '',
                        coordinates: jsonData.coordinates || ['', ''],
                        description: jsonData.description || '',
                        city_tier: jsonData.city_tier || 1,
                        data_status: jsonData.data_status || 'draft'
                    }));
                }

                // Populate historical data
                if (jsonData.controlHistory) {
                    setControlHistory(jsonData.controlHistory);
                }

                if (jsonData.populationHistory) {
                    setPopulationHistory(jsonData.populationHistory);
                }

                if (jsonData.landmarksHistory) {
                    setLandmarksHistory(jsonData.landmarksHistory);
                }

                setJsonFile(file);
                setSuccess(`JSON file "${file.name}" loaded successfully!`);
                setError(null);

            } catch (error) {
                console.error('JSON parsing error:', error);
                setError('Invalid JSON format. Please check your file.');
                setJsonFile(null);
            }
        };

        reader.onerror = () => {
            setError('Failed to read JSON file');
            setJsonFile(null);
        };

        reader.readAsText(file);
    };

    // Download example JSON
    const handleDownloadExample = () => {
        const dataStr = JSON.stringify(exampleCityJson, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'city_example.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Main submit function
    const handleSubmit = async () => {
        if (!validateForm()) {
            setActiveStep(0);
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            // Sanitize and convert historical data to ensure numbers
            const sanitizedControlHistory = controlHistory
                .filter(c => c.ruler && c.ruler.trim())
                .map(c => ({
                    ruler: c.ruler,
                    historical_city_name: c.historical_city_name || '',
                    startYear: parseInt(c.startYear) || 0,
                    endYear: c.endYear ? parseInt(c.endYear) : null,
                    description: c.description || ''
                }));

            const sanitizedPopulationHistory = populationHistory
                .filter(p => p.year && p.count)
                .map(p => ({
                    year: parseInt(p.year) || 0,
                    count: parseInt(p.count) || 0,
                    source: p.source || ''
                }));

            const sanitizedLandmarksHistory = landmarksHistory
                .filter(l => l.landmark_name && l.landmark_name.trim())
                .map(l => ({
                    landmark_name: l.landmark_name,
                    constructionDate: parseInt(l.constructionDate) || 0,
                    purpose: l.purpose || '',
                    significance: l.significance || '',
                    description: l.description || ''
                }));

            // Prepare city data
            const cityData = {
                generic_city_name: formData.generic_city_name.trim(),
                country: formData.country.trim(),
                founded: parseInt(formData.founded),
                end_date: formData.endDate ? parseInt(formData.endDate) : null,
                coordinates: [parseFloat(formData.coordinates[0]), parseFloat(formData.coordinates[1])],
                description: formData.description.trim() || null,
                city_tier: parseInt(formData.city_tier),
                data_status: formData.data_status,
                controlHistory: sanitizedControlHistory,
                populationHistory: sanitizedPopulationHistory,
                landmarksHistory: sanitizedLandmarksHistory,
                // Admin bypass option
                bypassApproval: isAdmin && bypassApproval
            };

            // Choose API endpoint based on user role and bypass option
            let result;
            if (isAdmin && bypassApproval) {
                // Direct creation for admin
                result = await citiesApi.createCity(cityData);
            } else {
                // Submit for approval (contributors and admins choosing normal flow)
                result = await citiesApi.submitCityForApproval(cityData);
            }

            if (result.success) {
                console.log('🔍 API Response:', result.data);
                
                const newCityId = result.data.id || result.data.city?.id;
                const cityName = result.data.name || result.data.city?.name || result.data.generic_city_name;
                const approvalStatus = result.data.approval_status || result.data.city?.approval_status;

                setSubmissionResult({
                    cityId: newCityId,
                    cityName: cityName,
                    isAutoApproved: result.data.isAutoApproved || bypassApproval,
                    approvalStatus: approvalStatus
                });

                const successMessage = result.data.isAutoApproved || bypassApproval
                    ? `City "${cityName}" created and approved!`
                    : `City "${cityName}" submitted for review!`;

                setSuccess(successMessage);

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
                        name: cityName,
                        country: result.data.country || formData.country,
                        approvalStatus: approvalStatus
                    });
                }

                // Auto close after delay
                setTimeout(() => {
                    onClose();
                }, 3000);

            } else {
                setError(result.error || 'Failed to submit city');
            }

        } catch (error) {
            console.error('City submission error:', error);
            setError('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    // Get submit button text and icon
    const getSubmitButtonProps = () => {
        if (saving) {
            return {
                text: isAdmin && bypassApproval ? 'Creating...' : 'Submitting...',
                icon: <CircularProgress size={16} />
            };
        }

        if (isAdmin && bypassApproval) {
            return {
                text: 'Create City',
                icon: <SaveIcon />
            };
        }

        return {
            text: 'Submit for Review',
            icon: <SendIcon />
        };
    };

    const submitButtonProps = getSubmitButtonProps();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            fullScreen={isMobile}
            transitionDuration={50}
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
                        <SendIcon sx={{ color: COLORS.primary }} />
                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, fontWeight: 'bold' }}>
                            {isAdmin ? 'Create New City' : 'Submit New City'}
                        </Typography>
                        {submissionResult && (
                            <Chip
                                label={submissionResult.isAutoApproved ? 'Approved' : 'Pending Review'}
                                size="small"
                                color={submissionResult.isAutoApproved ? 'success' : 'warning'}
                                icon={submissionResult.isAutoApproved ? <CheckCircleIcon /> : <HourglassEmptyIcon />}
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

                {/* Admin Options */}
                {isAdmin && (
                    <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.1)', borderRadius: 1 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={bypassApproval}
                                    onChange={(e) => setBypassApproval(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AdminPanelSettingsIcon sx={{ fontSize: 16 }} />
                                    <Typography variant="body2">
                                        Skip approval process (Admin Override)
                                    </Typography>
                                </Box>
                            }
                        />
                    </Box>
                )}
            </DialogTitle>

            <DialogContent sx={{
                padding: { xs: 2, sm: 2.5, md: 3 },
                overflow: 'auto',
                backgroundColor: COLORS.sectionBackground
            }}>
                {/* Alerts */}
                {error && (
                    <Alert severity="error" sx={{ mb: { xs: 2, md: 3 } }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: { xs: 2, md: 3 } }}>
                        {success}
                    </Alert>
                )}

                {/* Progress Stepper */}
                <Box sx={{ mt: { xs: 1, md: 2 }, mb: { xs: 2, md: 3 } }}>
                    <Stepper activeStep={activeStep} orientation={isMobile ? 'vertical' : 'horizontal'}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                {/* Step Content */}
                <Box sx={{ minHeight: { xs: '300px', md: '400px' }, width: '100%' }}>
                    {/* Step 0: Basic Information */}
                    {activeStep === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5, md: 3 }, width: '100%' }}>
                            {/* JSON Upload Section - Full Width */}
                            <Card sx={{
                                p: { xs: 1.5, sm: 2 },
                                backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                border: '1px dashed #1976d2'
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: { xs: 1.5, sm: 2 },
                                    flexDirection: { xs: 'column', sm: 'row' }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                                        <DescriptionIcon sx={{ color: '#1976d2', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                                        <Typography variant="subtitle2" sx={{
                                            fontWeight: 'bold',
                                            color: '#1976d2',
                                            fontSize: { xs: '0.9rem', sm: '1rem' }
                                        }}>
                                            Quick Fill with JSON
                                        </Typography>
                                    </Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: { xs: 1, sm: 1.5 },
                                        flexWrap: 'wrap',
                                        width: { xs: '100%', sm: 'auto' },
                                        justifyContent: { xs: 'space-between', sm: 'flex-end' }
                                    }}>
                                        <Button
                                            variant="text"
                                            size="small"
                                            startIcon={<DownloadIcon />}
                                            onClick={handleDownloadExample}
                                            sx={{
                                                color: '#1976d2',
                                                textTransform: 'none',
                                                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                                minWidth: 'auto',
                                                padding: { xs: '4px 8px', sm: '6px 16px' }
                                            }}
                                        >
                                            Download
                                        </Button>
                                        <input
                                            type="file"
                                            accept=".json"
                                            onChange={handleJsonUpload}
                                            style={{ display: 'none' }}
                                            id="json-upload"
                                        />
                                        <label htmlFor="json-upload">
                                            <Button
                                                component="span"
                                                variant="outlined"
                                                size="small"
                                                startIcon={<UploadIcon />}
                                                sx={{
                                                    borderColor: '#1976d2',
                                                    color: '#1976d2',
                                                    '&:hover': { borderColor: '#1565c0', backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                                                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                                                    minWidth: 'auto',
                                                    padding: { xs: '4px 8px', sm: '6px 16px' }
                                                }}
                                            >
                                                Upload
                                            </Button>
                                        </label>
                                        {jsonFile && (
                                            <Chip
                                                label={jsonFile.name}
                                                size="small"
                                                color="primary"
                                                onDelete={() => setJsonFile(null)}
                                                sx={{
                                                    maxWidth: { xs: '150px', sm: '200px' },
                                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                                <Typography variant="caption" sx={{
                                    color: COLORS.texts.muted,
                                    mt: { xs: 1, sm: 1.5 },
                                    display: 'block',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    lineHeight: 1.4
                                }}>
                                    Download the example template, modify it with your city data, then upload to auto-fill all fields
                                </Typography>
                            </Card>

                            {/* Row 1: City Name - City Tier */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: { xs: 2, md: 2 }
                            }}>
                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 66%' } }}>
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
                                </Box>

                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
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
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: { xs: 2, md: 2 }
                            }}>
                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
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

                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={formData.data_status}
                                            onChange={(e) => handleInputChange('data_status', e.target.value)}
                                            label="Status"
                                        >
                                            <MenuItem value="draft">Draft</MenuItem>
                                            {isAdmin && <MenuItem value="active">Active</MenuItem>}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* Row 3: Foundation Year - End Year */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: { xs: 2, md: 2 }
                            }}>
                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
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

                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
                                    <TextField
                                        label="End Year (Optional)"
                                        value={formData.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        fullWidth
                                        type="number"
                                        helperText="Leave empty if city still exists"
                                    />
                                </Box>
                            </Box>

                            {/* Row 4: Latitude - Longitude */}
                            <Box sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', md: 'row' },
                                gap: { xs: 2, md: 2 }
                            }}>
                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
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
                                </Box>

                                <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' } }}>
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
                                </Box>
                            </Box>

                            {/* Row 5: Description */}
                            <Box>
                                <TextField
                                    label="Description (Optional)"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={5}
                                    maxRows={20}
                                    placeholder="Enter a brief description of the city..."
                                />
                            </Box>
                        </Box>
                    )}

                    {/* Step 1: Historical Data (Interactive) */}
                    {activeStep === 1 && (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                                Historical Data
                            </Typography>

                            <Alert severity="info" sx={{ mb: 2 }}>
                                {bypassApproval
                                    ? "As an admin with approval bypass, you can add detailed historical data now or after creation."
                                    : "You can add detailed historical data here. All data will be synced to the database after moderator approval."
                                }
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

                    {/* Step 2: Sources & Submit */}
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

                            <Typography variant="h6" sx={{ mb: 2 }}>Review & Submit</Typography>
                            
                            {/* Submission Type Info */}
                            <Card sx={{ mb: 2, backgroundColor: bypassApproval ? 'rgba(25, 118, 210, 0.05)' : 'rgba(255, 152, 0, 0.05)' }}>
                                <CardContent sx={{ py: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {bypassApproval ? <AdminPanelSettingsIcon color="primary" /> : <HourglassEmptyIcon color="warning" />}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                            {bypassApproval ? 'Direct Creation (Admin)' : 'Approval Workflow'}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                        {bypassApproval 
                                            ? 'This city will be created and immediately available on the map.'
                                            : 'This city will be submitted for moderator review before becoming visible on the map.'
                                        }
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Box sx={{ p: 2, backgroundColor: 'rgba(119, 73, 54, 0.05)', borderRadius: 2 }}>
                                <Typography><strong>City:</strong> {formData.generic_city_name}</Typography>
                                <Typography><strong>Country:</strong> {formData.country}</Typography>
                                <Typography><strong>Founded:</strong> {formData.founded}</Typography>
                                <Typography><strong>Coordinates:</strong> [{formData.coordinates[0]}, {formData.coordinates[1]}]</Typography>
                                {sourcesFile && (
                                    <Typography><strong>Sources:</strong> {sourcesFile.name}</Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    padding: { xs: 2, sm: 2.5, md: 3 },
                    backgroundColor: COLORS.background,
                    borderTop: `1px solid ${COLORS.border}`,
                    justifyContent: 'flex-end',
                    gap: { xs: 1, md: 1.5 },
                    flexDirection: { xs: 'column-reverse', sm: 'row' }
                }}
            >
                <Button
                    onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                    disabled={activeStep === 0 || saving}
                    sx={{
                        color: COLORS.texts.secondary,
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: '100px' }
                    }}
                >
                    Back
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        variant="contained"
                        startIcon={submitButtonProps.icon}
                        sx={{
                            backgroundColor: bypassApproval ? '#1976d2' : COLORS.primary,
                            '&:hover': {
                                backgroundColor: bypassApproval ? '#1565c0' : '#5d3a2a'
                            },
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: { sm: '150px' }
                        }}
                    >
                        {submitButtonProps.text}
                    </Button>
                ) : (
                    <Button
                        onClick={() => setActiveStep(activeStep + 1)}
                        variant="contained"
                        sx={{
                            backgroundColor: COLORS.primary,
                            '&:hover': { backgroundColor: '#5d3a2a' },
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: { sm: '100px' }
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