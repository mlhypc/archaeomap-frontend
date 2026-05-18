// archaeomap-frontend\src\panel\sections\Moderation\featuresRuler\RulerEditModal.js
//
// Mirrors CityEditModal: loads ruler by id, lets a moderator edit every
// field, supports JSON export/import, and exposes a delete action for
// admins. Single-tab (Edit) — rulers don't have photos / sources.

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
    IconButton,
    Stack,
    Switch,
    FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaletteIcon from '@mui/icons-material/Palette';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { COLORS } from '../../../../shared/config/generalUtils';
import { rulerService } from '../../../../shared/services/rulerApi';
import useUserRole from '../../../../shared/hooks/useUserRole';

const STATUS_OPTIONS = ['active', 'passive', 'draft'];

const RulerEditModal = ({ open, onClose, rulerId, onRulerUpdated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAdmin } = useUserRole();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const jsonInputRef = useRef(null);

    const [formData, setFormData] = useState({
        generic_name: '',
        slug: '',
        aliases: [''],
        color: '',
        color_override: false,
        start_year: '',
        end_year: '',
        description: '',
        data_status: 'active'
    });
    const [originalData, setOriginalData] = useState(null);
    const [currentRuler, setCurrentRuler] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (open && rulerId) {
            loadRuler();
        } else if (!open) {
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, rulerId]);

    const loadRuler = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await rulerService.getById(rulerId);
            if (res.success) {
                const r = res.data.ruler;
                const form = {
                    generic_name: r.generic_name || '',
                    slug: r.slug || '',
                    aliases: (r.aliases && r.aliases.length) ? r.aliases : [''],
                    color: r.color || '',
                    color_override: r.color_override === true,
                    start_year: r.start_year ?? '',
                    end_year: r.end_year ?? '',
                    description: r.description || '',
                    data_status: r.data_status || 'active'
                };
                setFormData(form);
                setOriginalData(form);
                setCurrentRuler(r);
            } else {
                setError(res.error || 'Failed to load ruler');
            }
        } catch (err) {
            console.error('Ruler load error:', err);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            generic_name: '',
            slug: '',
            aliases: [''],
            color: '',
            start_year: '',
            end_year: '',
            description: '',
            data_status: 'active'
        });
        setOriginalData(null);
        setCurrentRuler(null);
        setValidationErrors({});
        setError(null);
        setSuccess(null);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: '' }));
        }
        if (success) setSuccess(null);
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

    const handleJsonImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.json')) {
            setError('Please select a .json file');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                const problems = [];
                if (!json.generic_name || typeof json.generic_name !== 'string')
                    problems.push('generic_name missing or not a string');
                if (json.slug !== undefined && (typeof json.slug !== 'string' || !/^[a-z0-9-]+$/.test(json.slug)))
                    problems.push('slug must be lowercase letters/digits/hyphens');
                if (json.aliases !== undefined && !Array.isArray(json.aliases))
                    problems.push('aliases must be an array');
                if (json.start_year !== undefined && json.start_year !== null && typeof json.start_year !== 'number')
                    problems.push('start_year must be a number or null');
                if (json.end_year !== undefined && json.end_year !== null && typeof json.end_year !== 'number')
                    problems.push('end_year must be a number or null');

                if (problems.length) {
                    setError(`JSON validation failed:\n• ${problems.join('\n• ')}`);
                    return;
                }

                setFormData(prev => ({
                    ...prev,
                    generic_name: json.generic_name,
                    slug: json.slug || prev.slug,
                    aliases: Array.isArray(json.aliases) && json.aliases.length ? json.aliases : prev.aliases,
                    color: json.color !== undefined ? (json.color || '') : prev.color,
                    color_override: json.color_override !== undefined ? (json.color_override === true) : prev.color_override,
                    start_year: json.start_year != null ? String(json.start_year) : prev.start_year,
                    end_year: json.end_year != null ? String(json.end_year) : prev.end_year,
                    description: json.description !== undefined ? (json.description || '') : prev.description,
                    data_status: json.data_status || prev.data_status
                }));

                setSuccess(`JSON loaded: "${json.generic_name}" — review changes and click Save`);
                setError(null);
            } catch {
                setError('Invalid JSON file — could not parse');
            }
        };
        reader.readAsText(file);
        event.target.value = '';
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

    const hasUnsavedChanges = () => {
        if (!originalData) return false;
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        const payload = {
            generic_name: formData.generic_name.trim(),
            slug: formData.slug.trim(),
            aliases: formData.aliases.map(a => a.trim()).filter(Boolean),
            color: formData.color.trim() || null,
            color_override: formData.color_override === true,
            start_year: formData.start_year === '' ? null : Number(formData.start_year),
            end_year: formData.end_year === '' ? null : Number(formData.end_year),
            description: formData.description.trim() || null,
            data_status: formData.data_status
        };

        try {
            const res = await rulerService.update(rulerId, payload);
            if (res.success) {
                setSuccess('Ruler updated successfully!');
                setOriginalData(formData);
                setCurrentRuler(res.data.ruler);
                if (onRulerUpdated) onRulerUpdated(res.data.ruler);
                setTimeout(() => onClose(), 1200);
            } else {
                setError(res.error || (res.errors && res.errors[0]?.msg) || 'Failed to update ruler');
            }
        } catch (err) {
            console.error('Ruler update error:', err);
            setError('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!rulerId || !formData.generic_name) return;

        const confirmed = window.confirm(
            `⚠️ WARNING: You are about to permanently delete "${formData.generic_name}".\n\n` +
            `Cities that reference this ruler via controlHistory.ruler strings will remain ` +
            `unchanged (loose coupling — strings, not foreign keys).\n\n` +
            `This action CANNOT be undone.\n\nAre you absolutely sure?`
        );
        if (!confirmed) return;

        setDeleting(true);
        setError(null);

        try {
            const res = await rulerService.remove(rulerId);
            if (res.success) {
                alert(`✅ Ruler "${formData.generic_name}" has been permanently deleted.`);
                if (onRulerUpdated) onRulerUpdated({ deleted: true, rulerId });
                onClose();
            } else {
                setError(res.error || 'Failed to delete ruler');
            }
        } catch (err) {
            setError('Failed to delete ruler: ' + err.message);
            console.error('Ruler deletion error:', err);
        } finally {
            setDeleting(false);
        }
    };

    const getStatusChip = (status) => {
        const map = {
            active: { bg: '#4caf50', color: 'white' },
            passive: { bg: '#ff9800', color: 'white' },
            draft: { bg: COLORS.texts.muted, color: 'white' }
        };
        const c = map[status] || { bg: '#757575', color: 'white' };
        return (
            <Chip
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                size="small"
                sx={{ backgroundColor: c.bg, color: c.color }}
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
                            Edit Ruler
                        </Typography>
                        {formData.generic_name && (
                            <>
                                <Typography variant="h6" sx={{ color: COLORS.texts.muted, fontWeight: 300, mx: 0.5 }}>
                                    -
                                </Typography>
                                <Typography variant="h6" sx={{ color: COLORS.primary, fontWeight: 600 }}>
                                    {formData.generic_name}
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

                {currentRuler && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                            {(currentRuler.aliases || []).length} alias{(currentRuler.aliases || []).length === 1 ? '' : 'es'} resolving controlHistory entries
                        </Typography>
                    </Box>
                )}
            </DialogTitle>

            <DialogContent sx={{ padding: { xs: 2, md: 4 }, backgroundColor: COLORS.sectionBackground }}>
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
                            Loading ruler...
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {error && (
                            <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-line' }} onClose={() => setError(null)}>
                                {error}
                            </Alert>
                        )}
                        {success && (
                            <Alert severity="success" sx={{ mb: 3 }}>
                                {success}
                            </Alert>
                        )}

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Row 1: Name - Slug */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 60%' } }}>
                                    <TextField
                                        label="Ruler Name"
                                        value={formData.generic_name}
                                        onChange={(e) => handleInputChange('generic_name', e.target.value)}
                                        fullWidth
                                        required
                                        error={!!validationErrors.generic_name}
                                        helperText={validationErrors.generic_name}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LabelIcon sx={{ color: COLORS.primary }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 40%' } }}>
                                    <TextField
                                        label="Slug"
                                        value={formData.slug}
                                        onChange={(e) => handleInputChange('slug', e.target.value)}
                                        fullWidth
                                        required
                                        error={!!validationErrors.slug}
                                        helperText={validationErrors.slug || 'URL key — lowercase, digits, hyphens'}
                                    />
                                </Box>
                            </Box>

                            {/* Row 2: Start - End - Status */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
                                    <TextField
                                        label="Start Year"
                                        value={formData.start_year}
                                        onChange={(e) => handleInputChange('start_year', e.target.value)}
                                        fullWidth
                                        type="number"
                                        error={!!validationErrors.start_year}
                                        helperText={validationErrors.start_year || 'Negative for BC'}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarTodayIcon sx={{ color: COLORS.primary }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
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
                                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 33%' } }}>
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
                                            {STATUS_OPTIONS.map(s => (
                                                <MenuItem key={s} value={s}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {getStatusChip(s)} {s.charAt(0).toUpperCase() + s.slice(1)}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            </Box>

                            {/* Row 3: Color + override toggle */}
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'flex-start' }}>
                                <Box sx={{ flex: '1 1 auto', width: '100%' }}>
                                    <TextField
                                        label="Color"
                                        value={formData.color}
                                        onChange={(e) => handleInputChange('color', e.target.value)}
                                        fullWidth
                                        disabled={!formData.color_override}
                                        placeholder="#b43232 or rgba(180,50,50,0.7)"
                                        helperText={formData.color_override
                                            ? 'Hex or rgba for map label coloring (locked: algorithm will not change)'
                                            : 'Algorithm-managed — toggle Override to set manually'}
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
                                <Box sx={{ flex: '0 0 auto', pt: { sm: 0.5 } }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={formData.color_override}
                                                onChange={(e) => handleInputChange('color_override', e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Override"
                                        sx={{ m: 0, color: COLORS.texts.primary }}
                                    />
                                </Box>
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
                                                placeholder={idx === 0 ? 'Canonical name' : 'Variant'}
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
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    maxRows={20}
                                    placeholder="Enter a brief description of this ruler / polity..."
                                />
                            </Box>
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
                <input
                    ref={jsonInputRef}
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={handleJsonImport}
                />

                {/* Left side: JSON Export / Load + Delete */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {!loading && currentRuler && (
                        <>
                            <Button
                                onClick={() => rulerService.exportRuler(currentRuler)}
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
                                }
                            }}
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </Box>

                {/* Right side: Cancel / Save */}
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
                        disabled={loading || saving || deleting || !hasUnsavedChanges()}
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

export default RulerEditModal;
