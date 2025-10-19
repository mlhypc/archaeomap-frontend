// archaeomap-frontend\src\panel\sections\DataManagement\CityManageSection.js

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

import { COLORS } from '../../../shared/config/generalUtils';
import CityListSection from './featuresCity/CityList';
import CityCreationModal from './featuresCity/CityCreationModal';
import CityEditModal from './featuresCity/CityEditModal';

function CityManageSection() {
    // Modal states for city management
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedCityId, setSelectedCityId] = useState(null);
    
    // Key to force refresh CityListSection
    const [refreshKey, setRefreshKey] = useState(0);

    // Handle city creation
    const handleCreateCity = () => {
        setCreateModalOpen(true);
    };

    const handleCityCreated = (newCity) => {
        console.log('New city created in main container:', newCity);
        setCreateModalOpen(false);
        // Force refresh the list
        setRefreshKey(prev => prev + 1);
    };

    // Handle city editing
    const handleEditCity = (cityId) => {
        setSelectedCityId(cityId);
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
        setSelectedCityId(null);
        // Force refresh the list
        setRefreshKey(prev => prev + 1);
    };

    const handleCityUpdated = (updatedCity) => {
        console.log('City updated in main container:', updatedCity);

        // If city was deleted, force refresh the list
        if (updatedCity?.deleted) {
            setRefreshKey(prev => prev + 1);
        }
        // List will refresh when modal closes
    };

    return (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: COLORS.background 
        }}>
            {/* Main City List Section - key prop forces refresh */}
            <CityListSection
                key={refreshKey}
                onCreateCity={handleCreateCity}
                onEditCity={handleEditCity}
            />

            {/* City Creation Modal */}
            <CityCreationModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onCityCreated={handleCityCreated}
            />

            {/* City Edit Modal */}
            <CityEditModal
                open={editModalOpen}
                onClose={handleEditModalClose}
                cityId={selectedCityId}
                onCityUpdated={handleCityUpdated}
            />
        </Box>
    );
}

export default CityManageSection;