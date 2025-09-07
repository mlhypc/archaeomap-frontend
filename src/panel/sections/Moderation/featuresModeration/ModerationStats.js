// archaeomap-frontend/src/panel/sections/Moderation/features/ModerationStats.js

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    Alert,
    LinearProgress,
    useTheme,
    useMediaQuery,
    Stack,
    Chip,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Tooltip
} from '@mui/material';

// Icons
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import ApprovedIcon from '@mui/icons-material/CheckCircle';
import RejectedIcon from '@mui/icons-material/Cancel';
import TotalIcon from '@mui/icons-material/LocationCity';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';

import { COLORS } from '../../../../shared/config/generalUtils';
import { cachedCitiesApi as citiesApi } from '../../../../shared/services/cityApi';
import useUserRole from '../../../../shared/hooks/useUserRole';

function StatCard({ title, value, subtitle, icon, color, progress }) {
    return (
        <Card sx={{ height: '100%', border: `1px solid ${COLORS.border}` }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 1 }}>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 0.5 }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                {subtitle}
                            </Typography>
                        )}
                        {progress !== undefined && (
                            <Box sx={{ mt: 2 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: color,
                                            borderRadius: 3
                                        }
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: COLORS.texts.muted, mt: 0.5, display: 'block' }}>
                                    {progress.toFixed(1)}%
                                </Typography>
                            </Box>
                        )}
                    </Box>
                    <Box sx={{ ml: 2, color, opacity: 0.7 }}>
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}

function ModerationStats({ pendingCount }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { isModerator, isAdmin } = useUserRole();

    // State management
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [userStats, setUserStats] = useState(null);

    // Load statistics
    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        
        setError(null);

        try {
            const result = await citiesApi.getModerationStats(true);

            if (result.success) {
                setStats(result.data.workflow);
                setUserStats(result.data.userStats);
            } else {
                setError(result.error || 'Failed to load statistics');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Stats load error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        loadStats(true);
    };

    const getApprovalRate = () => {
        if (!stats || stats.total === 0) return 0;
        return (stats.approved / stats.total) * 100;
    };

    const getPendingRate = () => {
        if (!stats || stats.total === 0) return 0;
        return (stats.pending / stats.total) * 100;
    };

    const getRejectionRate = () => {
        if (!stats || stats.total === 0) return 0;
        return (stats.rejected / stats.total) * 100;
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4
            }}>
                <CircularProgress sx={{ color: COLORS.primary, mb: 2 }} />
                <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                    Loading statistics...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon sx={{ color: COLORS.primary }} />
                    <Typography variant="h6" sx={{ color: COLORS.texts.primary }}>
                        Moderation Statistics
                    </Typography>
                </Box>
                <Tooltip title="Refresh Statistics">
                    <IconButton
                        onClick={handleRefresh}
                        disabled={refreshing}
                        size="small"
                        sx={{
                            color: COLORS.primary,
                            '&:hover': { backgroundColor: 'rgba(119, 73, 54, 0.1)' }
                        }}
                    >
                        <RefreshIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {refreshing && (
                <LinearProgress sx={{ mb: 3, backgroundColor: 'rgba(119, 73, 54, 0.1)' }} />
            )}

            {stats && (
                <Box>
                    {/* Overview Cards */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Total Cities"
                                value={stats.total}
                                subtitle="All submissions"
                                icon={<TotalIcon sx={{ fontSize: 40 }} />}
                                color={COLORS.primary}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Pending Review"
                                value={stats.pending}
                                subtitle={stats.pendingRatio}
                                icon={<PendingIcon sx={{ fontSize: 40 }} />}
                                color="#ff9800"
                                progress={getPendingRate()}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Approved"
                                value={stats.approved}
                                subtitle={stats.approvalRatio}
                                icon={<ApprovedIcon sx={{ fontSize: 40 }} />}
                                color="#4caf50"
                                progress={getApprovalRate()}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatCard
                                title="Rejected"
                                value={stats.rejected}
                                subtitle={`${getRejectionRate().toFixed(1)}%`}
                                icon={<RejectedIcon sx={{ fontSize: 40 }} />}
                                color="#f44336"
                                progress={getRejectionRate()}
                            />
                        </Grid>
                    </Grid>

                    {/* Detailed Information */}
                    <Grid container spacing={3}>
                        {/* Workflow Overview */}
                        <Grid item xs={12} md={8}>
                            <Card sx={{ height: '100%', border: `1px solid ${COLORS.border}` }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <TimelineIcon sx={{ color: COLORS.primary }} />
                                        <Typography variant="h6" sx={{ color: COLORS.texts.primary }}>
                                            Workflow Overview
                                        </Typography>
                                    </Box>

                                    <Stack spacing={2}>
                                        {/* Current Status */}
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(248, 245, 238, 0.5)' }}>
                                            <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 1 }}>
                                                Current Status
                                            </Typography>
                                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                                <Chip
                                                    icon={<PendingIcon />}
                                                    label={`${stats.pending} Pending`}
                                                    color="warning"
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    icon={<ApprovedIcon />}
                                                    label={`${stats.approved} Approved`}
                                                    sx={{ 
                                                        color: '#4caf50', 
                                                        borderColor: '#4caf50',
                                                        '& .MuiChip-icon': { color: '#4caf50' }
                                                    }}
                                                    variant="outlined"
                                                />
                                                <Chip
                                                    icon={<RejectedIcon />}
                                                    label={`${stats.rejected} Rejected`}
                                                    sx={{ 
                                                        color: '#f44336', 
                                                        borderColor: '#f44336',
                                                        '& .MuiChip-icon': { color: '#f44336' }
                                                    }}
                                                    variant="outlined"
                                                />
                                            </Stack>
                                        </Paper>

                                        {/* Performance Metrics */}
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(248, 245, 238, 0.5)' }}>
                                            <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 2 }}>
                                                Performance Metrics
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                                        Approval Rate
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ color: '#4caf50' }}>
                                                        {getApprovalRate().toFixed(1)}%
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                                        Pending Rate
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ color: '#ff9800' }}>
                                                        {getPendingRate().toFixed(1)}%
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Paper>

                                        {/* System Health */}
                                        <Paper sx={{ p: 2, backgroundColor: 'rgba(248, 245, 238, 0.5)' }}>
                                            <Typography variant="subtitle2" sx={{ color: COLORS.primary, mb: 2 }}>
                                                System Health
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {stats.pending === 0 ? (
                                                    <>
                                                        <ApprovedIcon sx={{ color: '#4caf50' }} />
                                                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                                            All submissions reviewed - System up to date
                                                        </Typography>
                                                    </>
                                                ) : stats.pending <= 5 ? (
                                                    <>
                                                        <TrendingUpIcon sx={{ color: '#4caf50' }} />
                                                        <Typography variant="body2" sx={{ color: '#4caf50' }}>
                                                            Good - Low pending count
                                                        </Typography>
                                                    </>
                                                ) : stats.pending <= 20 ? (
                                                    <>
                                                        <PendingIcon sx={{ color: '#ff9800' }} />
                                                        <Typography variant="body2" sx={{ color: '#ff9800' }}>
                                                            Moderate - Some pending reviews
                                                        </Typography>
                                                    </>
                                                ) : (
                                                    <>
                                                        <RejectedIcon sx={{ color: '#f44336' }} />
                                                        <Typography variant="body2" sx={{ color: '#f44336' }}>
                                                            High - Many pending reviews need attention
                                                        </Typography>
                                                    </>
                                                )}
                                            </Box>
                                        </Paper>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Personal Stats (if available) */}
                        {userStats && (
                            <Grid item xs={12} md={4}>
                                <Card sx={{ height: '100%', border: `1px solid ${COLORS.border}` }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                            <PersonIcon sx={{ color: COLORS.primary }} />
                                            <Typography variant="h6" sx={{ color: COLORS.texts.primary }}>
                                                Your Activity
                                            </Typography>
                                        </Box>

                                        <List>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <ApprovedIcon sx={{ color: '#4caf50' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Total Reviews"
                                                    secondary="All time"
                                                />
                                                <ListItemSecondaryAction>
                                                    <Typography variant="h6" sx={{ color: COLORS.primary }}>
                                                        {userStats.totalReviews}
                                                    </Typography>
                                                </ListItemSecondaryAction>
                                            </ListItem>

                                            <ListItem>
                                                <ListItemIcon>
                                                    <TrendingUpIcon sx={{ color: '#ff9800' }} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Recent Reviews"
                                                    secondary="Last 7 days"
                                                />
                                                <ListItemSecondaryAction>
                                                    <Typography variant="h6" sx={{ color: COLORS.primary }}>
                                                        {userStats.recentReviews}
                                                    </Typography>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        </List>

                                        {userStats.totalReviews > 0 && (
                                            <Paper sx={{ p: 2, mt: 2, backgroundColor: 'rgba(119, 73, 54, 0.05)' }}>
                                                <Typography variant="body2" sx={{ color: COLORS.texts.muted, textAlign: 'center' }}>
                                                    {userStats.totalReviews > 10 
                                                        ? 'Experienced moderator' 
                                                        : userStats.totalReviews > 5 
                                                            ? 'Active moderator' 
                                                            : 'New moderator'
                                                    }
                                                </Typography>
                                            </Paper>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

export default ModerationStats;