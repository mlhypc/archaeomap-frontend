// archaeomap-frontend/src/panel/sections/Moderation/ModerationSection.js

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Badge,
    Alert,
    CircularProgress,
    useTheme,
    useMediaQuery
} from '@mui/material';

import { COLORS } from '../../../shared/config/generalUtils';
import useUserRole from '../../../shared/hooks/useUserRole';
import { cachedCitiesApi as citiesApi } from '../../../shared/services/cityApi';

// Import moderation components
import PendingCitiesList from './featuresModeration/PendingCitiesList';
import ModerationStats from './featuresModeration/ModerationStats';
import CityReviewModal from './featuresModeration/CityReviewModal';

function ModerationSection() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isAdmin, canModerate } = useUserRole();
    
    // State management
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pendingCount, setPendingCount] = useState(0);
    
    // Review modal
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedCityId, setSelectedCityId] = useState(null);
    
    // Refresh trigger - KALDIRILIYOR
    // const [refreshKey, setRefreshKey] = useState(0);

    // Check permissions
    useEffect(() => {
        if (!canModerate) {
            setError('You do not have permission to access the moderation panel.');
            setLoading(false);
            return;
        }
        
        // Load initial data
        loadModerationData();
    }, [canModerate]); // refreshKey dependency'si KALDIRILDI

    const loadModerationData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Get pending cities count for badge
            const pendingResult = await citiesApi.getPendingCities({ limit: 1 });
            
            if (pendingResult.success) {
                setPendingCount(pendingResult.data.pagination?.total_count || 0);
            } else {
                console.error('Failed to load pending count:', pendingResult.error);
            }
            
        } catch (err) {
            console.error('Moderation data load error:', err);
            setError('Failed to load moderation data');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleCityReview = (cityId) => {
        setSelectedCityId(cityId);
        setReviewModalOpen(true);
    };

    const handleReviewComplete = (action, cityName) => {
        setReviewModalOpen(false);
        setSelectedCityId(null);
        
        // Refresh data - ARTIK refreshKey kullanmıyor
        // setRefreshKey(prev => prev + 1); // KALDIRILDI
        
        // Badge count'u manuel olarak güncelle
        if (action === 'approved' || action === 'rejected') {
            setPendingCount(prev => Math.max(0, prev - 1));
        }
        
        // Show success message based on action
        const actionText = action === 'approved' ? 'approved' : 'rejected';
        console.log(`City "${cityName}" has been ${actionText}`);
    };

    const handleCloseReviewModal = () => {
        setReviewModalOpen(false);
        setSelectedCityId(null);
    };

    // Data update handler - DÜZELTME: Gereksiz API çağrısını kaldır
    const handleDataUpdate = () => {
        // ESKI: loadModerationData(); // Bu sonsuz döngüye sebep oluyordu
        // YENİ: Sadece UI'da manual refresh yap, otomatik yenileme yok
        console.log('Data update notification received - manual refresh needed');
    };

    // Permission check
    if (!canModerate) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Access Denied: You need moderator or admin privileges to access this section.
                </Alert>
            </Box>
        );
    }

    if (loading) {
        return (
            <Box sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3
            }}>
                <CircularProgress sx={{ color: COLORS.primary, mb: 2 }} />
                <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                    Loading moderation panel...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{
                p: { xs: 2, md: 3 },
                borderBottom: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.background
            }}>
                <Typography 
                    variant="sectionTitle" 
                    sx={{
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        mb: 1
                    }}
                >
                    Moderation Panel
                </Typography>
                
                <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 2 }}>
                    Review and manage city submissions
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant={isMobile ? "fullWidth" : "standard"}
                    sx={{
                        '& .MuiTab-root': {
                            color: COLORS.texts.secondary,
                            '&.Mui-selected': {
                                color: COLORS.primary
                            }
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: COLORS.primary
                        }
                    }}
                >
                    <Tab
                        label={
                            <Badge 
                                badgeContent={pendingCount} 
                                color="warning"
                                max={99}
                                sx={{
                                    '& .MuiBadge-badge': {
                                        right: -8,
                                        top: -4,
                                        fontSize: '0.75rem'
                                    }
                                }}
                            >
                                <Box sx={{ px: 1 }}>
                                    {isMobile ? 'Pending' : 'Pending Cities'}
                                </Box>
                            </Badge>
                        }
                    />
                    <Tab 
                        label={isMobile ? 'Stats' : 'Statistics'} 
                    />
                    {isAdmin && (
                        <Tab 
                            label={isMobile ? 'Tools' : 'Admin Tools'} 
                        />
                    )}
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                {/* Pending Cities Tab */}
                {activeTab === 0 && (
                    <PendingCitiesList
                        onCityReview={handleCityReview}
                        onDataUpdate={handleDataUpdate}
                    />
                )}

                {/* Statistics Tab */}
                {activeTab === 1 && (
                    <ModerationStats
                        pendingCount={pendingCount}
                    />
                )}

                {/* Admin Tools Tab */}
                {activeTab === 2 && isAdmin && (
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h6" sx={{ color: COLORS.primary, mb: 2 }}>
                            Admin Tools
                        </Typography>
                        <Alert severity="info">
                            Advanced admin tools will be available in future updates.
                        </Alert>
                    </Box>
                )}
            </Box>

            {/* City Review Modal */}
            <CityReviewModal
                open={reviewModalOpen}
                onClose={handleCloseReviewModal}
                cityId={selectedCityId}
                onReviewComplete={handleReviewComplete}
            />
        </Box>
    );
}

export default ModerationSection;