// archaeomap-frontend/src/panel/sections/Moderation/features/CityReviewModal.js

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Alert,
    useMediaQuery,
    Chip,
    Card,
    CardContent,
    CardHeader,
    Avatar,
    Stack,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PublicIcon from '@mui/icons-material/Public';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import LandmarkIcon from '@mui/icons-material/AccountBalance';
import SourceIcon from '@mui/icons-material/Source';

import { COLORS } from '../../../../shared/config/generalUtils';
import { cachedCitiesApi as citiesApi } from '../../../../shared/services/cityApi';

function TabPanel({ children, value, index, ...other }) {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`review-tabpanel-${index}`}
            aria-labelledby={`review-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 2 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const CityReviewModal = ({ open, onClose, cityId, onReviewComplete }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State management
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [cityData, setCityData] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    // Review form
    const [reviewComments, setReviewComments] = useState('');
    const [reviewAction, setReviewAction] = useState(null); // 'approve' or 'reject'

    // Load city data when modal opens
    useEffect(() => {
        if (open && cityId) {
            loadCityData();
        } else if (!open) {
            resetModal();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, cityId]);

    const resetModal = () => {
        setCityData(null);
        setReviewComments('');
        setReviewAction(null);
        setActiveTab(0);
        setError(null);
    };

    const loadCityData = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await citiesApi.getCityForReview(cityId);

            if (result.success) {
                setCityData(result.data.city);
            } else {
                setError(result.error || 'Failed to load city data');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('City review data load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleReview = async (action) => {
        if (!cityData) return;

        setProcessing(true);
        setError(null);
        setReviewAction(action);

        try {
            let result;
            if (action === 'approve') {
                result = await citiesApi.approveCity(cityId, reviewComments || null);
            } else {
                if (!reviewComments.trim()) {
                    setError('Rejection reason is required');
                    setProcessing(false);
                    return;
                }
                result = await citiesApi.rejectCity(cityId, reviewComments);
            }

            if (result.success) {
                if (onReviewComplete) {
                    onReviewComplete(action, cityData.name);
                }
                onClose();
            } else {
                setError(result.error || `Failed to ${action} city`);
            }
        } catch (err) {
            setError(`Network error during ${action}`);
            console.error(`City ${action} error:`, err);
        } finally {
            setProcessing(false);
            setReviewAction(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    if (!open) return null;

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
                        <LocationOnIcon sx={{ color: COLORS.primary }} />
                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, fontWeight: 'bold' }}>
                            Review City Submission
                        </Typography>
                        {cityData && (
                            <Chip
                                label="Pending Review"
                                size="small"
                                color="warning"
                                icon={<HistoryIcon />}
                            />
                        )}
                    </Box>
                    <Button
                        onClick={onClose}
                        size="small"
                        disabled={processing}
                        sx={{ minWidth: 'auto', color: COLORS.texts.muted }}
                    >
                        <CloseIcon />
                    </Button>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ padding: { xs: 2, md: 3 } }}>
                {loading ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3rem'
                    }}>
                        <CircularProgress sx={{ color: COLORS.primary, mb: 2 }} />
                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                            Loading city details...
                        </Typography>
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                ) : cityData ? (
                    <Box>
                        {/* City Overview Card */}
                        <Card sx={{ mb: 3, border: `1px solid ${COLORS.border}` }}>
                            <CardHeader
                                avatar={
                                    <Avatar sx={{ backgroundColor: COLORS.primary }}>
                                        <LocationOnIcon />
                                    </Avatar>
                                }
                                title={
                                    <Typography variant="h5" sx={{ color: COLORS.texts.primary }}>
                                        {cityData.name}
                                    </Typography>
                                }
                                subheader={
                                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <PublicIcon sx={{ fontSize: 16, color: COLORS.texts.muted }} />
                                            <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                {cityData.country}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 16, color: COLORS.texts.muted }} />
                                            <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                Founded {cityData.founded}
                                                {cityData.endDate && ` - ${cityData.endDate}`}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                }
                            />
                            <CardContent sx={{ pt: 0 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 0.5 }}>
                                            <strong>Coordinates:</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                            {cityData.coordinates[0]}, {cityData.coordinates[1]}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 0.5 }}>
                                            <strong>City Tier:</strong>
                                        </Typography>
                                        <Typography variant="body2">
                                            Tier {cityData.city_tier}
                                        </Typography>
                                    </Grid>
                                    {cityData.description && (
                                        <Grid item xs={12}>
                                            <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 0.5 }}>
                                                <strong>Description:</strong>
                                            </Typography>
                                            <Typography variant="body2">
                                                {cityData.description}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Submitter Information */}
                        <Card sx={{ mb: 3, border: `1px solid ${COLORS.border}` }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ backgroundColor: COLORS.primary }}>
                                        {cityData.submitter.name.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: COLORS.texts.primary }}>
                                            Submitted by {cityData.submitter.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                            @{cityData.submitter.username} • {formatDate(cityData.createdAt)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Detailed Information Tabs */}
                        <Box sx={{ mb: 3 }}>
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                variant={isMobile ? "fullWidth" : "standard"}
                                sx={{
                                    '& .MuiTab-root': {
                                        color: COLORS.texts.secondary,
                                        '&.Mui-selected': { color: COLORS.primary }
                                    },
                                    '& .MuiTabs-indicator': { backgroundColor: COLORS.primary }
                                }}
                            >
                                <Tab
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <HistoryIcon />
                                            Control History ({cityData.controlHistory?.length || 0})
                                        </Box>
                                    }
                                />
                                <Tab
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <PeopleIcon />
                                            Population ({cityData.populationHistory?.length || 0})
                                        </Box>
                                    }
                                />
                                <Tab
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LandmarkIcon />
                                            Landmarks ({cityData.landmarksHistory?.length || 0})
                                        </Box>
                                    }
                                />
                                <Tab
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <SourceIcon />
                                            Sources
                                        </Box>
                                    }
                                />
                            </Tabs>

                            {/* Control History Tab */}
                            <TabPanel value={activeTab} index={0}>
                                {cityData.controlHistory?.length > 0 ? (
                                    <List>
                                        {cityData.controlHistory.map((period, index) => (
                                            <ListItem key={index} divider>
                                                <ListItemIcon>
                                                    <HistoryIcon sx={{ color: COLORS.primary }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${period.ruler} (${period.startYear} - ${period.endYear || 'Present'})`}
                                                    secondary={
                                                        <Box>
                                                            {period.historical_city_name && (
                                                                <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                                    Historical name: {period.historical_city_name}
                                                                </Typography>
                                                            )}
                                                            {period.description && (
                                                                <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                                                    {period.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <HistoryIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                            No control history data provided
                                        </Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Population History Tab */}
                            <TabPanel value={activeTab} index={1}>
                                {cityData.populationHistory?.length > 0 ? (
                                    <List>
                                        {cityData.populationHistory.map((record, index) => (
                                            <ListItem key={index} divider>
                                                <ListItemIcon>
                                                    <PeopleIcon sx={{ color: COLORS.primary }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${record.year}: ${record.count?.toLocaleString()} people`}
                                                    secondary={record.source && `Source: ${record.source}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <PeopleIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                            No population data provided
                                        </Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Landmarks Tab */}
                            <TabPanel value={activeTab} index={2}>
                                {cityData.landmarksHistory?.length > 0 ? (
                                    <List>
                                        {cityData.landmarksHistory.map((landmark, index) => (
                                            <ListItem key={index} divider>
                                                <ListItemIcon>
                                                    <LandmarkIcon sx={{ color: COLORS.primary }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${landmark.landmark_name} (${landmark.constructionDate})`}
                                                    secondary={
                                                        <Box>
                                                            {landmark.purpose && (
                                                                <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                                    Purpose: {landmark.purpose}
                                                                </Typography>
                                                            )}
                                                            {landmark.significance && (
                                                                <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                                                    Significance: {landmark.significance}
                                                                </Typography>
                                                            )}
                                                            {landmark.description && (
                                                                <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                                                    {landmark.description}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <LandmarkIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                            No landmarks data provided
                                        </Typography>
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Sources Tab */}
                            <TabPanel value={activeTab} index={3}>
                                {cityData.sourcesInfo?.hasSourceFiles ? (
                                    <Box>
                                        <Typography variant="h6" sx={{ color: COLORS.primary, mb: 2 }}>
                                            Uploaded Sources
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2 }}>
                                            Total files: {cityData.sourcesInfo.totalFiles}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 2, color: COLORS.texts.muted }}>
                                            Last upload: {formatDate(cityData.sourcesInfo.lastUpload)}
                                        </Typography>
                                        {cityData.sourcesInfo.files?.slice(0, 10).map((file, index) => (
                                            <Typography key={index} variant="body2" sx={{ ml: 2, color: COLORS.texts.secondary }}>
                                                • {file.filename} ({(file.size / 1024).toFixed(1)} KB)
                                            </Typography>
                                        ))}
                                        {cityData.sourcesInfo.files?.length > 10 && (
                                            <Typography variant="body2" sx={{ ml: 2, color: COLORS.texts.muted }}>
                                                ... and {cityData.sourcesInfo.files.length - 10} more files
                                            </Typography>
                                        )}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <SourceIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 1 }} />
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                            No source files uploaded
                                        </Typography>
                                    </Box>
                                )}
                            </TabPanel>
                        </Box>

                        {/* Review Comments */}
                        <Card sx={{ border: `1px solid ${COLORS.border}` }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ color: COLORS.primary, mb: 2 }}>
                                    Review Comments
                                </Typography>
                                <TextField
                                    label="Comments (optional for approval, required for rejection)"
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    placeholder="Enter your review comments..."
                                    disabled={processing}
                                />
                            </CardContent>
                        </Card>
                    </Box>
                ) : null}
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
                    onClick={onClose}
                    disabled={processing}
                    sx={{ color: COLORS.texts.secondary }}
                >
                    Cancel
                </Button>

                <Button
                    onClick={() => handleReview('reject')}
                    disabled={processing || !cityData}
                    variant="outlined"
                    color="error"
                    startIcon={processing && reviewAction === 'reject' ? <CircularProgress size={16} /> : <CancelIcon />}
                    sx={{
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        '&:hover': {
                            borderColor: '#b71c1c',
                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                        }
                    }}
                >
                    {processing && reviewAction === 'reject' ? 'Rejecting...' : 'Reject'}
                </Button>

                <Button
                    onClick={() => handleReview('approve')}
                    disabled={processing || !cityData}
                    variant="contained"
                    startIcon={processing && reviewAction === 'approve' ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                    sx={{
                        backgroundColor: '#4caf50',
                        '&:hover': { backgroundColor: '#388e3c' }
                    }}
                >
                    {processing && reviewAction === 'approve' ? 'Approving...' : 'Approve'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CityReviewModal;