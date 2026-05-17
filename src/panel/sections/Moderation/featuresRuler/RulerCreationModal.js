// archaeomap-frontend\src\panel\sections\Moderation\featuresRuler\RulerCreationModal.js
//
// Mirrors CityCreationModal styling on a simpler payload: rulers are a flat
// 9-field schema with no historical sub-collections, so a single-page form
// is enough. JSON quick-fill is retained for parity (paste/upload a ruler
// JSON file to populate the form).

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
    Card,
    Chip,
    IconButton,
    Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LabelIcon from '@mui/icons-material/Label';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaletteIcon from '@mui/icons-material/Palette';
import UploadIcon from '@mui/icons-material/Upload';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';

import { COLORS } from '../../../../shared/config/generalUtils';
import { rulerService } from '../../../../shared/services/rulerApi';

const STATUS_OPTIONS = ['active', 'passive', 'draft'];

const EXAMPLE_JSON = {
    generic_name: 'Roman Empire',
    slug: 'roman-empire',
    aliases: ['Roman Empire', 'Imperium Romanum'],
    color: '#b43232',
    start_year: -27,
    end_year: 476,
    description: 'The Roman Empire was the post-Republican phase of ancient Rome…',
    data_status: 'active'
};

function slugify(input) {
    return (input || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

const EMPTY_FORM = {
    generic_name: '',
    slug: '',
    aliases: [''],
    color: '',
    start_year: '',
    end_year: '',
    description: '',
    data_status: 'active'
};

const RulerCreationModal = ({ open, onClose, onRulerCreated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [jsonFile, setJsonFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (!open) resetForm();
    }, [open]);

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setJsonFile(null);
        setValidationErrors({});
        setError(null);
        setSuccess(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            // Auto-slug from name when slug is still empty
            if (field === 'generic_name' && !prev.slug) {
                next.slug = slugify(value);
            }
            // Keep first alias in sync with name if first alias is empty
            if (field === 'generic_name' && (!prev.aliases[0] || prev.aliases[0].trim() === '')) {
                next.aliases = [value, ...prev.aliases.slice(1)];
            }
            return next;
        });

        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const setAliasAt = (idx, value) => {
        setFormData(prev => {
            const next = [...prev.aliases];
            next[idx] = value;
            return { ...prev, aliases: next };
        });
    };
    const addAliasRow = () => setFormData(prev => ({ ...prev, aliases: [...prev.aliases, ''] }));
    const removeAliasRow = (idx) => setFormData(prev => ({
        ...prev,
        aliases: prev.aliases.length === 1 ? [''] : prev.aliases.filter((_, i) => i !== idx)
    }));

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
                const json = JSON.parse(e.target.result);
                setFormData(prev => ({
                    ...prev,
                    generic_name: json.generic_name || '',
                    slug: json.slug || (json.generic_name ? slugify(json.generic_name) : ''),
                    aliases: Array.isArray(json.aliases) && json.aliases.length ? json.aliases : [json.generic_name || ''],
                    color: json.color || '',
                    start_year: json.start_year ?? '',
                    end_year: json.end_year ?? '',
                    description: json.description || '',
                    data_status: json.data_status || 'active'
                }));
                setJsonFile(file);
                setSuccess(`JSON file "${file.name}" loaded successfully!`);
                setError(null);
            } catch (err) {
                setError('Invalid JSON format. Please check your file.');
                setJsonFile(null);
            }
        };
        reader.onerror = () => {
            setError('Failed to read JSON file');
            setJsonFile(null);
        };
        reader.readAsText(file);
        event.target.value = '';
    };

    const handleDownloadExample = () => {
        const blob = new Blob([JSON.stringify(EXAMPLE_JSON, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ruler_example.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.generic_name.trim()) errors.generic_name = 'Name is required';
        if (!formData.slug.trim()) errors.slug = 'Slug is required';
        else if (!/^[a-z0-9-]+$/.test(formData.slug)) errors.slug = 'Lowercase letters, digits, hyphens only';

        const cleanedAliases = formData.aliases.map(a => a.trim()).filter(Boolean);
        if (cleanedAliases.length === 0) errors.aliases = 'At least one alias is required';

        if (formData.start_year !== '' && Number.isNaN(Number(formData.start_year))) {
            errors.start_year = 'Must be an integer';
        }
        if (formData.end_year !== '' && Number.isNaN(Number(formData.end_year))) {
            errors.end_year = 'Must be an integer';
        }
        if (formData.start_year !== '' && formData.end_year !== '' &&
            Number(formData.end_year) < Number(formData.start_year)) {
            errors.end_year = 'End year must be ≥ start year';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        const payload = {
            generic_name: formData.generic_name.trim(),
            slug: formData.slug.trim(),
            aliases: formData.aliases.map(a => a.trim()).filter(Boolean),
            color: formData.color.trim() || null,
            start_year: formData.start_year === '' ? null : Number(formData.start_year),
            end_year: formData.end_year === '' ? null : Number(formData.end_year),
            description: formData.description.trim() || null,
            data_status: formData.data_status
        };

        try {
            const result = await rulerService.create(payload);
            if (result.success) {
                const created = result.data.ruler;
                setSuccess(`Ruler "${created.generic_name}" created!`);
                if (onRulerCreated) onRulerCreated(created);
                setTimeout(() => onClose(), 1200);
            } else {
                setError(result.error || (result.errors && result.errors[0]?.msg) || 'Failed to create ruler');
            }
        } catch (err) {
            console.error('Ruler creation error:', err);
            setError('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
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
                        <AddIcon sx={{ color: COLORS.primary }} />
                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, fontWeight: 'bold' }}>
                            Add New Ruler
                        </Typography>
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

            <DialogContent sx={{
                padding: { xs: 2, sm: 2.5, md: 3 },
                overflow: 'auto',
                backgroundColor: COLORS.sectionBackground
            }}>
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

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5, md: 3 }, width: '100%' }}>
                    {/* JSON Quick Fill */}
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
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                                        fontSize: { xs: '0.75rem', sm: '0.8rem' }
                                    }}
                                >
                                    Download
                                </Button>
                                <input
                                    type="file"
                                    accept=".json"
                                    onChange={handleJsonUpload}
                                    style={{ display: 'none' }}
                                    id="ruler-json-upload"
                                />
                                <label htmlFor="ruler-json-upload">
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        size="small"
                                        startIcon={<UploadIcon />}
                                        sx={{
                                            borderColor: '#1976d2',
                                            color: '#1976d2',
                                            '&:hover': { borderColor: '#1565c0', backgroundColor: 'rgba(25, 118, 210, 0.1)' },
                                            fontSize: { xs: '0.75rem', sm: '0.8rem' }
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
                            Download the example template, modify it with your ruler data, then upload to auto-fill all fields
                        </Typography>
                    </Card>

                    {/* Row 1: Name - Slug */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 60%' } }}>
                            <TextField
                                label="Ruler Name"
                                value={formData.generic_name}
                                onChange={(e) => handleInputChange('generic_name', e.target.value)}
                                fullWidth
                                required
                                error={!!validationErrors.generic_name}
                                helperText={validationErrors.generic_name || 'Canonical display name, e.g. Roman Empire'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LabelIcon sx={{ color: COLORS.primary }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 40%' } }}>
                            <TextField
                                label="Slug"
                                value={formData.slug}
                                onChange={(e) => handleInputChange('slug', e.target.value)}
                                fullWidth
                                required
                                error={!!validationErrors.slug}
                                helperText={validationErrors.slug || 'URL key — auto-generated from name'}
                            />
                        </Box>
                    </Box>

                    {/* Row 2: Start year - End year - Status */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
                            <TextField
                                label="Start Year"
                                value={formData.start_year}
                                onChange={(e) => handleInputChange('start_year', e.target.value)}
                                fullWidth
                                type="number"
                                error={!!validationErrors.start_year}
                                helperText={validationErrors.start_year || 'Negative for BC (e.g., -27)'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarTodayIcon sx={{ color: COLORS.primary }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
                            <TextField
                                label="End Year"
                                value={formData.end_year}
                                onChange={(e) => handleInputChange('end_year', e.target.value)}
                                fullWidth
                                type="number"
                                error={!!validationErrors.end_year}
                                helperText={validationErrors.end_year || 'Leave empty if ongoing'}
                            />
                        </Box>
                        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.data_status}
                                    onChange={(e) => handleInputChange('data_status', e.target.value)}
                                    label="Status"
                                >
                                    {STATUS_OPTIONS.map(s => (
                                        <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Row 3: Color */}
                    <Box>
                        <TextField
                            label="Color"
                            value={formData.color}
                            onChange={(e) => handleInputChange('color', e.target.value)}
                            fullWidth
                            placeholder="#b43232 or rgba(180,50,50,0.7)"
                            helperText="Hex or rgba for map label coloring"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PaletteIcon sx={{ color: COLORS.primary }} />
                                    </InputAdornment>
                                ),
                                endAdornment: formData.color ? (
                                    <InputAdornment position="end">
                                        <Box sx={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: '4px',
                                            backgroundColor: formData.color,
                                            border: '1px solid rgba(0,0,0,0.2)'
                                        }} />
                                    </InputAdornment>
                                ) : null
                            }}
                        />
                    </Box>

                    {/* Row 4: Aliases */}
                    <Box>
                        <Typography variant="subtitle2" sx={{
                            mb: 1,
                            color: COLORS.texts.primary,
                            fontWeight: 'bold'
                        }}>
                            Aliases {validationErrors.aliases && (
                                <Typography component="span" variant="caption" color="error" sx={{ ml: 1 }}>
                                    {validationErrors.aliases}
                                </Typography>
                            )}
                        </Typography>
                        <Typography variant="caption" sx={{ color: COLORS.texts.muted, display: 'block', mb: 1.5 }}>
                            Exact-match strings used to resolve controlHistory.ruler. Include the canonical name plus any variant spellings.
                        </Typography>
                        <Stack spacing={1}>
                            {formData.aliases.map((alias, idx) => (
                                <Stack direction="row" spacing={1} key={idx} alignItems="center">
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={alias}
                                        onChange={(e) => setAliasAt(idx, e.target.value)}
                                        placeholder={idx === 0 ? 'Roman Empire' : 'Imperium Romanum'}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => removeAliasRow(idx)}
                                        disabled={formData.aliases.length === 1 && !alias}
                                        sx={{ color: COLORS.texts.muted }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                size="small"
                                onClick={addAliasRow}
                                sx={{
                                    alignSelf: 'flex-start',
                                    color: COLORS.primary,
                                    textTransform: 'none'
                                }}
                            >
                                Add alias
                            </Button>
                        </Stack>
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
                            placeholder="Enter a brief description of this ruler / polity..."
                        />
                    </Box>
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
                    onClick={onClose}
                    disabled={saving}
                    sx={{
                        color: COLORS.texts.secondary,
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: '100px' }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={saving}
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                    sx={{
                        backgroundColor: COLORS.primary,
                        '&:hover': { backgroundColor: '#5d3a2a' },
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: '150px' }
                    }}
                >
                    {saving ? 'Creating...' : 'Create Ruler'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RulerCreationModal;
