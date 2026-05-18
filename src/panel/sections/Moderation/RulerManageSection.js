// archaeomap-frontend\src\panel\sections\Moderation\RulerManageSection.js
//
// Thin container matching CityManageSection: holds modal open/close state
// and a refreshKey to force-remount RulerList after any write. Also
// exposes an admin-only "Recompute colors" trigger that re-runs the LAB
// distribution algorithm and refreshes the list.

import React, { useState } from 'react';
import { Box, Button, Snackbar, Alert, CircularProgress, Tooltip } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

import { COLORS } from '../../../shared/config/generalUtils';
import RulerList from './featuresRuler/RulerList';
import RulerCreationModal from './featuresRuler/RulerCreationModal';
import RulerEditModal from './featuresRuler/RulerEditModal';
import { rulerService } from '../../../shared/services/rulerApi';
import useUserRole from '../../../shared/hooks/useUserRole';

function RulerManageSection() {
    const { isAdmin } = useUserRole();
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedRulerId, setSelectedRulerId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [recomputing, setRecomputing] = useState(false);
    const [toast, setToast] = useState(null); // { severity, message }

    const handleCreateRuler = () => setCreateModalOpen(true);

    const handleRulerCreated = () => {
        setCreateModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    const handleEditRuler = (rulerId) => {
        setSelectedRulerId(rulerId);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setSelectedRulerId(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleRulerUpdated = (payload) => {
        if (payload?.deleted) {
            setRefreshKey(prev => prev + 1);
        }
    };

    const handleRecompute = async () => {
        setRecomputing(true);
        try {
            const res = await rulerService.recomputeColors();
            if (res.success) {
                const r = res.data.result;
                setToast({
                    severity: 'success',
                    message: `Updated ${r.rulers_updated} ruler color${r.rulers_updated === 1 ? '' : 's'} ` +
                             `in ${r.elapsed_ms}ms (shortfall ${r.shortfall.toFixed(1)}).`
                });
                setRefreshKey(prev => prev + 1);
            } else {
                setToast({ severity: 'error', message: res.error || 'Recompute failed' });
            }
        } catch (err) {
            setToast({ severity: 'error', message: 'Network error: ' + err.message });
        } finally {
            setRecomputing(false);
        }
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: COLORS.background
        }}>
            {isAdmin && (
                <Box sx={{
                    px: { xs: 2, md: 3 },
                    pt: { xs: 2, md: 3 },
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <Tooltip title="Re-run the 3D LAB algorithm and write new colors to every override=false ruler.">
                        <span>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={recomputing ? <CircularProgress size={14} /> : <AutoFixHighIcon />}
                                onClick={handleRecompute}
                                disabled={recomputing}
                                sx={{
                                    borderColor: COLORS.primary,
                                    color: COLORS.primary,
                                    textTransform: 'none',
                                    '&:hover': { backgroundColor: `${COLORS.primary}10` }
                                }}
                            >
                                {recomputing ? 'Recomputing…' : 'Recompute colors'}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            )}

            <RulerList
                key={refreshKey}
                onCreateRuler={handleCreateRuler}
                onEditRuler={handleEditRuler}
            />

            <RulerCreationModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onRulerCreated={handleRulerCreated}
            />

            <RulerEditModal
                open={editModalOpen}
                onClose={handleEditModalClose}
                rulerId={selectedRulerId}
                onRulerUpdated={handleRulerUpdated}
            />

            <Snackbar
                open={!!toast}
                autoHideDuration={5000}
                onClose={() => setToast(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {toast && (
                    <Alert
                        onClose={() => setToast(null)}
                        severity={toast.severity}
                        sx={{ width: '100%' }}
                    >
                        {toast.message}
                    </Alert>
                )}
            </Snackbar>
        </Box>
    );
}

export default RulerManageSection;
