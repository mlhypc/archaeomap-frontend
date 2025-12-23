// archaeomap-frontend/src/panel/sections/Personal/featuresInteractions/CityLists.js

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    CircularProgress,
    Alert,
    Tooltip,
    Menu,
    MenuItem,
    Divider,
    Grid,
    Avatar,
    Switch,
    FormControlLabel,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    ListItemSecondaryAction,
    Skeleton,
    Badge,
    Fab
} from '@mui/material';
import {
    List as ListIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Public as PublicIcon,
    Lock as PrivateIcon,
    MoreVert as MoreIcon,
    Visibility as ViewIcon,
    LocationCity as CityIcon,
    Close as CloseIcon,
    BookmarkAdd as BookmarkAddIcon
} from '@mui/icons-material';
import { COLORS } from '../../../../shared/config/generalUtils';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import CitySearchAutocomplete from '../../../../shared/components/ui/CitySearchAutocomplete';

// Constants
const SUCCESS_MESSAGE_DURATION = 3000;

function CityLists() {
    const { user, token } = useAuth();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    // Create/Edit Dialog
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: false
    });
    const [formSubmitting, setFormSubmitting] = useState(false);
    
    // Add Cities Dialog
    const [addCitiesOpen, setAddCitiesOpen] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [selectedCities, setSelectedCities] = useState([]);
    
    // Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuCollection, setMenuCollection] = useState(null);
    
    // Detail View
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailCollection, setDetailCollection] = useState(null);

    useEffect(() => {
        if (user && token) {
            fetchCollections();
        } else {
            setCollections([]);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, token]);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!token) {
                setCollections([]);
                return;
            }
            
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/collections`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch collections');
            }
            
            setCollections(result.collections);
            
        } catch (err) {
            console.error('Failed to fetch collections:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Search is now handled by CitySearchAutocomplete component

    const handleCreateCollection = () => {
        setEditingCollection(null);
        setFormData({ name: '', description: '', isPublic: false });
        setDialogOpen(true);
    };

    const handleEditCollection = (collection) => {
        setEditingCollection(collection);
        setFormData({
            name: collection.name,
            description: collection.description || '',
            isPublic: collection.is_public
        });
        setDialogOpen(true);
        handleMenuClose();
    };

    const handleSubmitCollection = async () => {
        if (!formData.name.trim()) return;

        try {
            setFormSubmitting(true);
            setError(null);

            const url = editingCollection
                ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/collections/${editingCollection.id}`
                : `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/collections`;
            
            const method = editingCollection ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    isPublic: formData.isPublic
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to save collection');
            }

            setSuccess(editingCollection ? 'Collection updated successfully!' : 'Collection created successfully!');
            setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_DURATION);
            
            await fetchCollections();
            setDialogOpen(false);

        } catch (err) {
            console.error('Submit collection error:', err);
            setError(err.message);
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDeleteCollection = async (collection) => {
        if (!window.confirm(`Are you sure you want to delete "${collection.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/collections/${collection.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to delete collection');
            }

            setSuccess('Collection deleted successfully!');
            setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_DURATION);
            
            await fetchCollections();

        } catch (err) {
            console.error('Delete collection error:', err);
            setError(err.message);
        }
        
        handleMenuClose();
    };

    const handleAddCities = (collection) => {
        setSelectedCollection(collection);
        setSelectedCities([]);
        setAddCitiesOpen(true);
        handleMenuClose();
    };

    const handleAddSelectedCities = async () => {
        if (selectedCities.length === 0 || !selectedCollection) return;

        try {
            setFormSubmitting(true);
            
            // Use Promise.allSettled for better error handling and performance
            const addPromises = selectedCities.map(city => 
                fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/collections/${selectedCollection.id}/cities`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ cityId: city.id })
                }).then(response => ({ city, response }))
            );

            const results = await Promise.allSettled(addPromises);
            const successful = results.filter(result => 
                result.status === 'fulfilled' && result.value.response.ok
            ).length;
            const failed = results.length - successful;
            
            if (successful > 0) {
                setSuccess(`Added ${successful} cities to collection!`);
                setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_DURATION);
            }
            
            if (failed > 0) {
                setError(`Failed to add ${failed} cities`);
            }
            
            await fetchCollections();
            setAddCitiesOpen(false);
            
        } catch (err) {
            console.error('Add cities error:', err);
            setError('Failed to add cities to collection');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleRemoveCity = async (collection, city) => {
        if (!window.confirm(`Remove "${city.generic_city_name || city.name}" from this collection?`)) {
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/collections/${collection.id}/cities/${city.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || 'Failed to remove city');
            }

            setSuccess(`${city.generic_city_name || city.name} removed from collection`);
            setTimeout(() => setSuccess(null), SUCCESS_MESSAGE_DURATION);
            
            await fetchCollections();
            
            // If detail view is open, refresh it
            if (detailCollection && detailCollection.id === collection.id) {
                const updatedCollection = collections.find(c => c.id === collection.id);
                setDetailCollection(updatedCollection);
            }

        } catch (err) {
            console.error('Remove city error:', err);
            setError(err.message);
        }
    };

    const handleViewCollection = async (collection) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/user-interactions/collections/${collection.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setDetailCollection(result.collection);
                setDetailOpen(true);
            } else {
                setError(result.error || 'Failed to load collection details');
            }
        } catch (err) {
            console.error('View collection error:', err);
            setError(err.message);
        }
        
        handleMenuClose();
    };

    const handleMenuClick = (event, collection) => {
        setAnchorEl(event.currentTarget);
        setMenuCollection(collection);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuCollection(null);
    };

    if (loading && collections.length === 0) {
        return (
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: COLORS.primary }}>
                        My City Collections
                    </Typography>
                    <Skeleton variant="rectangular" width={120} height={36} />
                </Box>
                
                <Grid container spacing={2}>
                    {[1, 2, 3].map((i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                    {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
                </Typography>
                
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateCollection}
                    sx={{ 
                        backgroundColor: COLORS.primary,
                        '&:hover': { backgroundColor: COLORS.secondary }
                    }}
                >
                    New Collection
                </Button>
            </Box>

            {/* Messages */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            {/* Collections Grid */}
            {collections.length === 0 && !loading ? (
                <Card sx={{ textAlign: 'center', py: 6, border: `2px dashed ${COLORS.border}` }}>
                    <CardContent>
                        <ListIcon sx={{ fontSize: 60, color: COLORS.texts.muted, mb: 2 }} />
                        <Typography variant="h6" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
                            No collections yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: COLORS.texts.muted, mb: 3 }}>
                            Create your first collection to organize cities by theme, period, or region
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleCreateCollection}
                            sx={{ 
                                backgroundColor: COLORS.primary,
                                '&:hover': { backgroundColor: COLORS.secondary }
                            }}
                        >
                            Create Collection
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {collections.map((collection) => (
                        <Grid item xs={12} sm={6} lg={4} key={collection.id}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                border: `1px solid ${COLORS.border}`,
                                '&:hover': {
                                    borderColor: COLORS.primary,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 4px 20px ${COLORS.primary}20`
                                },
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }}>
                                <CardContent 
                                    sx={{ flexGrow: 1, p: 3 }}
                                    onClick={() => handleViewCollection(collection)}
                                >
                                    {/* Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" sx={{ 
                                                color: COLORS.texts.primary, 
                                                mb: 0.5,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {collection.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {collection.is_public ? (
                                                    <Chip 
                                                        icon={<PublicIcon />} 
                                                        label="Public" 
                                                        size="small" 
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                ) : (
                                                    <Chip 
                                                        icon={<PrivateIcon />} 
                                                        label="Private" 
                                                        size="small" 
                                                        color="default"
                                                        variant="outlined"
                                                    />
                                                )}
                                                <Badge badgeContent={collection.city_count} color="primary">
                                                    <CityIcon sx={{ color: COLORS.texts.muted, fontSize: 20 }} />
                                                </Badge>
                                            </Box>
                                        </Box>
                                        
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMenuClick(e, collection);
                                            }}
                                            sx={{ color: COLORS.texts.secondary }}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    </Box>

                                    {/* Description */}
                                    {collection.description && (
                                        <Typography variant="body2" sx={{ 
                                            color: COLORS.texts.secondary, 
                                            mb: 2,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {collection.description}
                                        </Typography>
                                    )}

                                    {/* City Preview */}
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                        {collection.cities && collection.cities.length > 0 ? (
                                            <>
                                                {collection.cities.slice(0, 3).map((city, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={city.generic_city_name || city.name}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: COLORS.primary + '15',
                                                            color: COLORS.texts.primary,
                                                            fontSize: '0.75rem',
                                                            maxWidth: 120
                                                        }}
                                                    />
                                                ))}
                                                {collection.cities.length > 3 && (
                                                    <Chip
                                                        label={`+${collection.cities.length - 3}`}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: COLORS.texts.muted + '20',
                                                            color: COLORS.texts.muted,
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <Typography variant="body2" sx={{ 
                                                color: COLORS.texts.muted, 
                                                fontStyle: 'italic' 
                                            }}>
                                                No cities added yet
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Footer */}
                                    <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                                        Updated {new Date(collection.updated_at).toLocaleDateString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Context Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleViewCollection(menuCollection)}>
                    <ViewIcon sx={{ mr: 1, fontSize: 18 }} />
                    View Details
                </MenuItem>
                <MenuItem onClick={() => handleAddCities(menuCollection)}>
                    <BookmarkAddIcon sx={{ mr: 1, fontSize: 18 }} />
                    Add Cities
                </MenuItem>
                <MenuItem onClick={() => handleEditCollection(menuCollection)}>
                    <EditIcon sx={{ mr: 1, fontSize: 18 }} />
                    Edit
                </MenuItem>
                <Divider />
                <MenuItem 
                    onClick={() => handleDeleteCollection(menuCollection)}
                    sx={{ color: COLORS.error }}
                >
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
                    Delete
                </MenuItem>
            </Menu>

            {/* Create/Edit Collection Dialog */}
            <Dialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)}
                maxWidth="sm" 
                fullWidth
                sx={{ zIndex: 1400 }}
            >
                <DialogTitle sx={{ color: COLORS.primary }}>
                    {editingCollection ? 'Edit Collection' : 'Create New Collection'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Collection Name"
                        fullWidth
                        margin="normal"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Ancient Roman Cities, Medieval Trade Routes..."
                        inputProps={{ maxLength: 100 }}
                        helperText={`${formData.name.length}/100 characters`}
                    />
                    
                    <TextField
                        label="Description (Optional)"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your collection..."
                        inputProps={{ maxLength: 500 }}
                        helperText={`${formData.description.length}/500 characters`}
                    />
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            />
                        }
                        label="Make this collection public"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitCollection}
                        variant="contained"
                        disabled={!formData.name.trim() || formSubmitting}
                        startIcon={formSubmitting && <CircularProgress size={16} />}
                    >
                        {formSubmitting ? 'Saving...' : editingCollection ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Cities Dialog */}
            <Dialog 
                open={addCitiesOpen} 
                onClose={() => setAddCitiesOpen(false)}
                maxWidth="md" 
                fullWidth
                sx={{ zIndex: 1400 }}
            >
                <DialogTitle>
                    Add Cities to "{selectedCollection?.name}"
                </DialogTitle>
                <DialogContent>
                    <CitySearchAutocomplete
                        multiple={true}
                        value={selectedCities}
                        onChange={(event, newValue) => setSelectedCities(newValue)}
                        label="Search cities..."
                        placeholder="Start typing to search cities..."
                        sx={{ mt: 2 }}
                    />
                    
                    <Typography variant="body2" sx={{ mt: 2, color: COLORS.texts.secondary }}>
                        {selectedCities.length} cities selected
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddCitiesOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleAddSelectedCities}
                        variant="contained"
                        disabled={selectedCities.length === 0 || formSubmitting}
                        startIcon={formSubmitting && <CircularProgress size={16} />}
                    >
                        {formSubmitting ? 'Adding...' : `Add ${selectedCities.length} Cities`}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Collection Detail Dialog */}
            <Dialog 
                open={detailOpen} 
                onClose={() => setDetailOpen(false)}
                maxWidth="md" 
                fullWidth
                sx={{ zIndex: 1400 }}
            >
                {detailCollection && (
                    <>
                        <DialogTitle sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Typography variant="h6" sx={{ color: COLORS.primary }}>
                                        {detailCollection.name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        {detailCollection.is_public ? (
                                            <Chip icon={<PublicIcon />} label="Public" size="small" color="success" />
                                        ) : (
                                            <Chip icon={<PrivateIcon />} label="Private" size="small" />
                                        )}
                                        <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                            {detailCollection.cities?.length || 0} cities
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton onClick={() => setDetailOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            {detailCollection.description && (
                                <Typography variant="body2" sx={{ color: COLORS.texts.secondary, mt: 2 }}>
                                    {detailCollection.description}
                                </Typography>
                            )}
                        </DialogTitle>
                        <DialogContent>
                            {detailCollection.cities && detailCollection.cities.length > 0 ? (
                                <List>
                                    {detailCollection.cities.map((city) => (
                                        <ListItem key={city.id} divider>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: COLORS.primary }}>
                                                    <CityIcon />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={city.generic_city_name || city.name}
                                                secondary={`${city.founded ? `Founded: ${city.founded}` : 'Unknown period'} • ${city.country || city.region}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <Tooltip title="Remove from collection">
                                                    <IconButton
                                                        edge="end"
                                                        onClick={() => handleRemoveCity(detailCollection, city)}
                                                        sx={{ color: COLORS.error }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <CityIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 2 }} />
                                    <Typography variant="body1" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
                                        No cities in this collection yet
                                    </Typography>
                                    <Button
                                        variant="outlined"
                                        startIcon={<AddIcon />}
                                        onClick={() => {
                                            setDetailOpen(false);
                                            handleAddCities(detailCollection);
                                        }}
                                    >
                                        Add Cities
                                    </Button>
                                </Box>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    setDetailOpen(false);
                                    handleAddCities(detailCollection);
                                }}
                            >
                                Add Cities
                            </Button>
                            <Button
                                startIcon={<EditIcon />}
                                onClick={() => {
                                    setDetailOpen(false);
                                    handleEditCollection(detailCollection);
                                }}
                            >
                                Edit Collection
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Floating Action Button for mobile */}
            <Fab
                color="primary"
                aria-label="add collection"
                onClick={handleCreateCollection}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', md: 'none' },
                    backgroundColor: COLORS.primary,
                    '&:hover': { backgroundColor: COLORS.secondary }
                }}
            >
                <AddIcon />
            </Fab>
        </Box>
    );
}

export default CityLists;