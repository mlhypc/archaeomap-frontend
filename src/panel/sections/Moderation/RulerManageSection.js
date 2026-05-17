// archaeomap-frontend\src\panel\sections\Moderation\RulerManageSection.js
//
// Thin container matching CityManageSection: holds modal open/close state
// and a refreshKey to force-remount RulerList after any write.

import React, { useState } from 'react';
import { Box } from '@mui/material';

import { COLORS } from '../../../shared/config/generalUtils';
import RulerList from './featuresRuler/RulerList';
import RulerCreationModal from './featuresRuler/RulerCreationModal';
import RulerEditModal from './featuresRuler/RulerEditModal';

function RulerManageSection() {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedRulerId, setSelectedRulerId] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

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
        // payload may be { deleted: true, rulerId } for deletion, or the
        // updated ruler object for save. Either way force a list refresh.
        if (payload?.deleted) {
            setRefreshKey(prev => prev + 1);
        }
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: COLORS.background
        }}>
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
        </Box>
    );
}

export default RulerManageSection;
