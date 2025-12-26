// archaeomap-frontend/src/panel/sections/Moderation/featuresCity/HistoricalDataEditor.js
// INTERACTIVE HISTORICAL DATA EDITOR WITH ACCORDION UI

import React, { useState } from 'react';
import {
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Button,
    TextField,
    IconButton,
    Grid,
    Chip,
    Alert,
    Paper,
    InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import LandscapeIcon from '@mui/icons-material/Landscape';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import InfoIcon from '@mui/icons-material/Info';

import { COLORS } from '../../../../shared/config/generalUtils';

// ============================================================================
// CONTROL HISTORY SECTION
// ============================================================================

const ControlHistorySection = React.memo(({ data, onChange }) => {
    const [expanded, setExpanded] = useState(true);

    const addPeriod = () => {
        onChange([
            ...data,
            {
                ruler: '',
                historical_city_name: '',
                startYear: '',
                endYear: '',
                description: ''
            }
        ]);
    };

    const updatePeriod = (index, field, value) => {
        const updated = [...data];
        updated[index][field] = value;
        onChange(updated);
    };

    const deletePeriod = (index) => {
        onChange(data.filter((_, i) => i !== index));
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{
                mb: 2,
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(119, 73, 54, 0.08)'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    backgroundColor: 'rgba(119, 73, 54, 0.05)',
                    '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.08)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <HistoryIcon sx={{ color: COLORS.primary }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Control History
                    </Typography>
                    <Chip
                        label={`${data.length} periods`}
                        size="small"
                        sx={{ ml: 'auto', mr: 2 }}
                    />
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                {data.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No control periods added. Click "Add Period" to start.
                    </Alert>
                ) : (
                    <Box sx={{ mb: 2 }}>
                        {data.map((period, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    p: { xs: 1.5, md: 2 },
                                    pt: { xs: 0.5, md: 1 },
                                    mb: 1.5,
                                    backgroundColor: 'rgba(248, 245, 238, 0.5)',
                                    border: `1px solid ${COLORS.border}`
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography variant="body2" sx={{ color: COLORS.texts.secondary, fontWeight: 600 }}>
                                        Period #{index + 1}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => deletePeriod(index)}
                                        sx={{ color: '#d32f2f' }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                                    <Grid item xs={12} md={7}>
                                        <TextField
                                            label="Ruler / Empire"
                                            value={period.ruler || ''}
                                            onChange={(e) => updatePeriod(index, 'ruler', e.target.value)}
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., Roman Empire, Julius Caesar"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PersonIcon fontSize="small" sx={{ color: COLORS.primary }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={6} md={2.5}>
                                        <TextField
                                            label="Start Year"
                                            value={period.startYear || ''}
                                            onChange={(e) => updatePeriod(index, 'startYear', e.target.value)}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            placeholder="-753"
                                        />
                                    </Grid>

                                    <Grid item xs={6} md={2.5}>
                                        <TextField
                                            label="End Year"
                                            value={period.endYear || ''}
                                            onChange={(e) => updatePeriod(index, 'endYear', e.target.value)}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            placeholder="476"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            label="Historical City Name (Optional)"
                                            value={period.historical_city_name || ''}
                                            onChange={(e) => updatePeriod(index, 'historical_city_name', e.target.value)}
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., Roma, Constantinopolis"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LocationCityIcon fontSize="small" sx={{ color: COLORS.primary }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Description outside Grid for full width */}
                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        label="Description (Optional)"
                                        value={period.description || ''}
                                        onChange={(e) => updatePeriod(index, 'description', e.target.value)}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        maxRows={20}
                                        placeholder="Additional notes about this period..."
                                    />
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addPeriod}
                    sx={{
                        borderColor: COLORS.primary,
                        color: COLORS.primary,
                        '&:hover': {
                            borderColor: '#5d3a2a',
                            backgroundColor: 'rgba(119, 73, 54, 0.05)'
                        }
                    }}
                >
                    Add Control Period
                </Button>
            </AccordionDetails>
        </Accordion>
    );
});

// ============================================================================
// POPULATION HISTORY SECTION
// ============================================================================

const PopulationHistorySection = React.memo(({ data, onChange }) => {
    const [expanded, setExpanded] = useState(false);

    const addRecord = () => {
        onChange([
            ...data,
            {
                year: '',
                count: '',
                source: ''
            }
        ]);
    };

    const updateRecord = (index, field, value) => {
        const updated = [...data];
        updated[index][field] = value;
        onChange(updated);
    };

    const deleteRecord = (index) => {
        onChange(data.filter((_, i) => i !== index));
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{
                mb: 2,
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(119, 73, 54, 0.08)'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    backgroundColor: 'rgba(119, 73, 54, 0.05)',
                    '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.08)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <PeopleIcon sx={{ color: COLORS.primary }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Population History
                    </Typography>
                    <Chip
                        label={`${data.length} records`}
                        size="small"
                        sx={{ ml: 'auto', mr: 2 }}
                    />
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                {data.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No population records. Click "Add Record" to start.
                    </Alert>
                ) : (
                    <Box sx={{ mb: 2 }}>
                        {data.map((record, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    p: { xs: 1.5, md: 2 },
                                    pt: { xs: 0.5, md: 1 },
                                    mb: 1.5,
                                    backgroundColor: 'rgba(248, 245, 238, 0.5)',
                                    border: `1px solid ${COLORS.border}`
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography variant="body2" sx={{ color: COLORS.texts.secondary, fontWeight: 600 }}>
                                        Record #{index + 1}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => deleteRecord(index)}
                                        sx={{ color: '#d32f2f' }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            label="Year"
                                            value={record.year || ''}
                                            onChange={(e) => updateRecord(index, 'year', e.target.value)}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            placeholder="1500"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarTodayIcon fontSize="small" sx={{ color: COLORS.primary }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={6} md={3}>
                                        <TextField
                                            label="Population"
                                            value={record.count || ''}
                                            onChange={(e) => updateRecord(index, 'count', e.target.value)}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            placeholder="50000"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PeopleIcon fontSize="small" sx={{ color: COLORS.primary }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Source (Optional)"
                                            value={record.source || ''}
                                            onChange={(e) => updateRecord(index, 'source', e.target.value)}
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., Census data, historical estimate..."
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Box>
                )}

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addRecord}
                    sx={{
                        borderColor: COLORS.primary,
                        color: COLORS.primary,
                        '&:hover': {
                            borderColor: '#5d3a2a',
                            backgroundColor: 'rgba(119, 73, 54, 0.05)'
                        }
                    }}
                >
                    Add Population Record
                </Button>
            </AccordionDetails>
        </Accordion>
    );
});

// ============================================================================
// LANDMARKS SECTION
// ============================================================================

const LandmarksSection = React.memo(({ data, onChange }) => {
    const [expanded, setExpanded] = useState(false);

    const addLandmark = () => {
        onChange([
            ...data,
            {
                landmark_name: '',
                constructionDate: '',
                purpose: '',
                significance: '',
                description: ''
            }
        ]);
    };

    const updateLandmark = (index, field, value) => {
        const updated = [...data];
        updated[index][field] = value;
        onChange(updated);
    };

    const deleteLandmark = (index) => {
        onChange(data.filter((_, i) => i !== index));
    };

    return (
        <Accordion
            expanded={expanded}
            onChange={() => setExpanded(!expanded)}
            sx={{
                mb: 2,
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(119, 73, 54, 0.08)'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                    backgroundColor: 'rgba(119, 73, 54, 0.05)',
                    '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.08)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <LandscapeIcon sx={{ color: COLORS.primary }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Landmarks & Monuments
                    </Typography>
                    <Chip
                        label={`${data.length} landmarks`}
                        size="small"
                        sx={{ ml: 'auto', mr: 2 }}
                    />
                </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 2, pb: 2 }}>
                {data.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        No landmarks added. Click "Add Landmark" to start.
                    </Alert>
                ) : (
                    <Box sx={{ mb: 2 }}>
                        {data.map((landmark, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    p: { xs: 1.5, md: 2 },
                                    pt: { xs: 0.5, md: 1 },
                                    mb: 1.5,
                                    backgroundColor: 'rgba(248, 245, 238, 0.5)',
                                    border: `1px solid ${COLORS.border}`
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Typography variant="body2" sx={{ color: COLORS.texts.secondary, fontWeight: 600 }}>
                                        Landmark #{index + 1}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => deleteLandmark(index)}
                                        sx={{ color: '#d32f2f' }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>

                                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                                    <Grid item xs={12} md={9}>
                                        <TextField
                                            label="Landmark Name"
                                            value={landmark.landmark_name || ''}
                                            onChange={(e) => updateLandmark(index, 'landmark_name', e.target.value)}
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., Colosseum, Parthenon"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LandscapeIcon fontSize="small" sx={{ color: COLORS.primary }} />
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            label="Year Built"
                                            value={landmark.constructionDate || ''}
                                            onChange={(e) => updateLandmark(index, 'constructionDate', e.target.value)}
                                            fullWidth
                                            size="small"
                                            type="number"
                                            placeholder="80"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Purpose"
                                            value={landmark.purpose || ''}
                                            onChange={(e) => updateLandmark(index, 'purpose', e.target.value)}
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., Amphitheater, Temple"
                                        />
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            label="Significance (Optional)"
                                            value={landmark.significance || ''}
                                            onChange={(e) => updateLandmark(index, 'significance', e.target.value)}
                                            fullWidth
                                            size="small"
                                            placeholder="e.g., UNESCO World Heritage"
                                        />
                                    </Grid>
                                </Grid>

                                {/* Description outside Grid for full width */}
                                <Box sx={{ mt: 2 }}>
                                    <TextField
                                        label="Description (Optional)"
                                        value={landmark.description || ''}
                                        onChange={(e) => updateLandmark(index, 'description', e.target.value)}
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        maxRows={20}
                                        placeholder="Additional details about the landmark..."
                                    />
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addLandmark}
                    sx={{
                        borderColor: COLORS.primary,
                        color: COLORS.primary,
                        '&:hover': {
                            borderColor: '#5d3a2a',
                            backgroundColor: 'rgba(119, 73, 54, 0.05)'
                        }
                    }}
                >
                    Add Landmark
                </Button>
            </AccordionDetails>
        </Accordion>
    );
});

// ============================================================================
// MAIN HISTORICAL DATA EDITOR
// ============================================================================

const HistoricalDataEditor = ({
    controlHistory = [],
    onControlHistoryChange,
    populationHistory = [],
    onPopulationHistoryChange,
    landmarksHistory = [],
    onLandmarksHistoryChange,
    disabled = false
}) => {
    if (disabled) {
        return (
            <Alert severity="info" icon={<InfoIcon />}>
                Historical data editing is disabled. Please complete basic information first.
            </Alert>
        );
    }

    return (
        <Box>
            <ControlHistorySection
                data={controlHistory}
                onChange={onControlHistoryChange}
            />

            <PopulationHistorySection
                data={populationHistory}
                onChange={onPopulationHistoryChange}
            />

            <LandmarksSection
                data={landmarksHistory}
                onChange={onLandmarksHistoryChange}
            />
        </Box>
    );
};

export default HistoricalDataEditor;
