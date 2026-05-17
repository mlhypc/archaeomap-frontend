// archaeomap-frontend/src/panel/sections/Moderation/RulerManageSection.js
//
// Moderator-facing CRUD for the Ruler entity. List with search, add/edit
// dialog form (9-field schema), and confirm-delete dialog. Keeps the
// MUI-table pattern of UserManagementSection and CityList for visual
// consistency. Self-contained — no separate sub-components.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  MenuItem,
  InputAdornment,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';

import { panelStyles, panelTypography } from '../../../shared/theme/panelStyles';
import { rulerService } from '../../../shared/services/rulerApi';
import useUserRole from '../../../shared/hooks/useUserRole';

const STATUS_OPTIONS = ['active', 'passive', 'draft'];

const EMPTY_FORM = {
  generic_name: '',
  slug: '',
  aliases: [''],        // edited as one input per line in UI
  color: '',
  start_year: '',
  end_year: '',
  description: '',
  data_status: 'active'
};

// Slugify helper — same shape as backend slug regex (lowercase + dash).
function slugify(input) {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatYear(y) {
  if (y === null || y === undefined || y === '') return '—';
  const n = Number(y);
  if (Number.isNaN(n)) return String(y);
  return n < 0 ? `${-n} BCE` : `${n} CE`;
}

function RulerManageSection() {
  const { isAdmin } = useUserRole();

  const [rulers, setRulers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);   // null = create mode
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─────────── Fetch ───────────
  const fetchRulers = useCallback(async (q) => {
    setLoading(true);
    setError(null);
    try {
      const res = await rulerService.list({ search: q, limit: 500 });
      if (res.success) {
        setRulers(res.data.rulers || []);
      } else {
        setError(res.error || 'Failed to fetch rulers');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRulers(''); }, [fetchRulers]);

  // ─────────── Form helpers ───────────
  const openCreate = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (ruler) => {
    setEditingId(ruler.id);
    setFormData({
      generic_name: ruler.generic_name || '',
      slug: ruler.slug || '',
      aliases: (ruler.aliases && ruler.aliases.length) ? ruler.aliases : [''],
      color: ruler.color || '',
      start_year: ruler.start_year ?? '',
      end_year: ruler.end_year ?? '',
      description: ruler.description || '',
      data_status: ruler.data_status || 'active'
    });
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
  };

  const updateField = (key, value) => setFormData((p) => ({ ...p, [key]: value }));

  const setAliasAt = (idx, value) => {
    setFormData((p) => {
      const next = [...p.aliases];
      next[idx] = value;
      return { ...p, aliases: next };
    });
  };
  const addAliasRow = () => setFormData((p) => ({ ...p, aliases: [...p.aliases, ''] }));
  const removeAliasRow = (idx) => setFormData((p) => ({
    ...p,
    aliases: p.aliases.length === 1 ? [''] : p.aliases.filter((_, i) => i !== idx)
  }));

  // Auto-generate slug from generic_name when slug is empty (create mode only).
  const handleNameChange = (value) => {
    setFormData((p) => {
      const nextSlug = editingId == null && !p.slug ? slugify(value) : p.slug;
      // Mirror name into first alias if alias list is empty / first row empty
      const firstAlias = p.aliases[0]?.trim() ? p.aliases[0] : value;
      const nextAliases = [firstAlias, ...p.aliases.slice(1)];
      return { ...p, generic_name: value, slug: nextSlug, aliases: nextAliases };
    });
  };

  // ─────────── Submit ───────────
  const submitForm = async () => {
    setFormError(null);

    const cleanedAliases = formData.aliases.map((s) => s.trim()).filter(Boolean);
    if (!formData.generic_name.trim()) return setFormError('Name is required');
    if (!formData.slug.trim()) return setFormError('Slug is required');
    if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      return setFormError('Slug must be lowercase letters, digits, hyphens only');
    }
    if (cleanedAliases.length === 0) return setFormError('At least one alias is required');

    const payload = {
      generic_name: formData.generic_name.trim(),
      slug: formData.slug.trim(),
      aliases: cleanedAliases,
      color: formData.color.trim() || null,
      start_year: formData.start_year === '' ? null : Number(formData.start_year),
      end_year: formData.end_year === '' ? null : Number(formData.end_year),
      description: formData.description.trim() || null,
      data_status: formData.data_status || 'active'
    };

    if (
      payload.start_year !== null && Number.isNaN(payload.start_year) ||
      payload.end_year !== null && Number.isNaN(payload.end_year)
    ) {
      return setFormError('Years must be integers (negative for BCE)');
    }
    if (payload.start_year !== null && payload.end_year !== null && payload.end_year < payload.start_year) {
      return setFormError('End year must be ≥ start year');
    }

    setSubmitting(true);
    try {
      const res = editingId
        ? await rulerService.update(editingId, payload)
        : await rulerService.create(payload);
      if (res.success) {
        setSuccess(editingId ? 'Ruler updated' : 'Ruler created');
        setFormOpen(false);
        await fetchRulers(search);
      } else {
        setFormError(res.error || (res.errors && res.errors[0]?.msg) || 'Save failed');
      }
    } catch (err) {
      setFormError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────── Delete ───────────
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await rulerService.remove(deleteTarget.id);
      if (res.success) {
        setSuccess('Ruler deleted');
        setDeleteTarget(null);
        await fetchRulers(search);
      } else {
        setError(res.error || 'Delete failed');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────── Render ───────────
  return (
    <Box sx={panelStyles.sectionContainer}>
      <Typography sx={panelTypography.sectionTitle}>Rulers</Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>{success}</Alert>
      )}

      {/* Toolbar */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by name, slug, alias…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') fetchRulers(search); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <Button variant="outlined" onClick={() => fetchRulers(search)}>Search</Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Ruler
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Aliases</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!loading && rulers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  No rulers found.
                </TableCell>
              </TableRow>
            )}
            {!loading && rulers.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.generic_name}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.slug}</TableCell>
                <TableCell>
                  <Tooltip title={r.aliases?.join(' | ') || ''}>
                    <Chip size="small" label={`${r.aliases?.length || 0} alias${(r.aliases?.length || 0) === 1 ? '' : 'es'}`} />
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {r.color ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{
                        width: 18, height: 18, borderRadius: '4px',
                        backgroundColor: r.color, border: '1px solid rgba(0,0,0,0.15)'
                      }} />
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{r.color}</Typography>
                    </Stack>
                  ) : <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {formatYear(r.start_year)} – {formatYear(r.end_year)}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={r.data_status} variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(r)} aria-label="Edit ruler">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {isAdmin && (
                    <IconButton size="small" onClick={() => setDeleteTarget(r)} aria-label="Delete ruler" color="error">
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Ruler' : 'Add Ruler'}</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="Generic name"
              fullWidth required
              value={formData.generic_name}
              onChange={(e) => handleNameChange(e.target.value)}
              helperText="Canonical display name, e.g. Roman Empire"
            />
            <TextField
              label="Slug"
              fullWidth required
              value={formData.slug}
              onChange={(e) => updateField('slug', e.target.value)}
              helperText="URL key — lowercase, digits, hyphens"
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Aliases (exact-match strings used to resolve controlHistory.ruler)
              </Typography>
              <Stack spacing={1}>
                {formData.aliases.map((alias, idx) => (
                  <Stack direction="row" spacing={1} key={idx} alignItems="center">
                    <TextField
                      fullWidth size="small"
                      value={alias}
                      onChange={(e) => setAliasAt(idx, e.target.value)}
                      placeholder={idx === 0 ? 'Roman Empire' : 'Imperium Romanum'}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeAliasRow(idx)}
                      aria-label="Remove alias"
                      disabled={formData.aliases.length === 1 && !alias}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
                <Button startIcon={<AddIcon />} size="small" onClick={addAliasRow} sx={{ alignSelf: 'flex-start' }}>
                  Add alias
                </Button>
              </Stack>
            </Box>
            <TextField
              label="Color"
              fullWidth
              value={formData.color}
              onChange={(e) => updateField('color', e.target.value)}
              placeholder="#b43232 or rgba(180,50,50,0.7)"
              InputProps={{
                endAdornment: formData.color ? (
                  <InputAdornment position="end">
                    <Box sx={{
                      width: 22, height: 22, borderRadius: '4px',
                      backgroundColor: formData.color, border: '1px solid rgba(0,0,0,0.2)'
                    }} />
                  </InputAdornment>
                ) : null
              }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Start year"
                fullWidth
                type="number"
                value={formData.start_year}
                onChange={(e) => updateField('start_year', e.target.value)}
                helperText="Negative for BCE"
              />
              <TextField
                label="End year"
                fullWidth
                type="number"
                value={formData.end_year}
                onChange={(e) => updateField('end_year', e.target.value)}
                helperText="Leave blank if ongoing"
              />
            </Stack>
            <TextField
              label="Description"
              fullWidth multiline minRows={3}
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
            <TextField
              label="Status"
              select fullWidth
              value={formData.data_status}
              onChange={(e) => updateField('data_status', e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={submitting}>Cancel</Button>
          <Button variant="contained" onClick={submitForm} disabled={submitting}>
            {submitting ? 'Saving…' : (editingId ? 'Save changes' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => !submitting && setDeleteTarget(null)}>
        <DialogTitle>Delete ruler?</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete <strong>{deleteTarget?.generic_name}</strong>? This removes the entry
            from the rulers collection. Cities that reference this ruler via controlHistory.ruler
            string remain unchanged (loose coupling).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={submitting}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={submitting}>
            {submitting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RulerManageSection;
