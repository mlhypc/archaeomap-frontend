// archaeomap-frontend/src/home/sections/Sidebar/features/CityAddCollectionButton.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CollectionsIcon from '@mui/icons-material/Collections';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import CheckIcon from '@mui/icons-material/Check';
import { COLORS } from '../../../../shared/config/generalUtils';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { collectionsApi } from '../../../../shared/services/userInteractionsApi';

function CityAddCollectionButton({ cityId }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [collections, setCollections] = useState([]);
  const [cityCollections, setCityCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const { isAuthenticated } = useAuth();

  const isOpen = Boolean(anchorEl);

  // Load collections when popover opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isAuthenticated, cityId]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      setError('');

      const [collectionsResult, cityCollectionsResult] = await Promise.all([
        collectionsApi.getUserCollections(),
        collectionsApi.getCityCollections(cityId)
      ]);

      if (collectionsResult.success) {
        const userCollections = (collectionsResult.data.collections || [])
          .filter(collection => collection && collection.id)
          .map(collection => ({
            id: collection.id,
            name: collection.name || 'Unnamed Collection',
            description: collection.description || '',
            citiesCount: collection.city_count || 0
          }));
        setCollections(userCollections);
      } else {
        if (collectionsResult.needsAuth) {
          setLoginPromptOpen(true);
          return;
        }
        setError(collectionsResult.error);
        return;
      }

      if (cityCollectionsResult.success) {
        const cityCollectionIds = (cityCollectionsResult.data.collections || [])
          .filter(c => c && c.id)
          .map(c => c.id);
        setCityCollections(cityCollectionIds);
      } else {
        // If we can't get city collections, assume empty (not critical error)
        setCityCollections([]);
      }

    } catch (err) {
      console.error('Failed to fetch collections:', err);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event) => {
    if (!isAuthenticated) {
      setLoginPromptOpen(true);
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleCollection = async (collectionId, isCurrentlyInCollection) => {
    try {
      setActionLoading(true);
      setError('');

      // Validate collection ID
      if (!collectionId) {
        console.error('Invalid collectionId:', collectionId);
        setError('Invalid collection');
        setActionLoading(false);
        return;
      }

      const result = await collectionsApi.toggleCityInCollection(collectionId, cityId);
      
      if (result.success) {
        if (result.data.action === 'removed') {
          setCityCollections(prev => prev.filter(id => id !== collectionId));
          setSuccess('City removed from collection');
        } else {
          setCityCollections(prev => [...prev, collectionId]);
          setSuccess('City added to collection');
        }

        // Update collections count
        setCollections(prev => prev.map(collection => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              citiesCount: result.data.likesCount || collection.citiesCount || 0
            };
          }
          return collection;
        }));
      } else {
        if (result.needsAuth) {
          setLoginPromptOpen(true);
        } else {
          setError(result.error || 'Failed to update collection');
        }
      }

    } catch (err) {
      console.error('Failed to toggle collection:', err);
      setError('Failed to update collection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      setActionLoading(true);
      setError('');

      // First create the collection
      const createResult = await collectionsApi.createCollection({
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim() || undefined,
        isPublic: false
      });

      if (!createResult.success) {
        if (createResult.needsAuth) {
          setLoginPromptOpen(true);
        } else {
          setError(createResult.error || 'Failed to create collection');
        }
        return;
      }

      const newCollection = {
        id: createResult.data.collection.id,
        name: createResult.data.collection.name,
        description: createResult.data.collection.description,
        citiesCount: 0
      };

      // Validate collection ID
      if (!newCollection.id) {
        console.error('Invalid collection response:', createResult.data);
        setError('Failed to create collection - invalid response');
        return;
      }

      // Then add the city to the new collection
      const addResult = await collectionsApi.addCityToCollection(newCollection.id, cityId);

      if (addResult.success) {
        // Update collections list
        setCollections(prev => [{ ...newCollection, citiesCount: 1 }, ...prev]);
        setCityCollections(prev => [...prev, newCollection.id]);
        setSuccess(`Collection "${newCollectionName}" created and city added`);
      } else {
        // Collection was created but city wasn't added - still show collection
        setCollections(prev => [newCollection, ...prev]);
        setError('Collection created but failed to add city');
      }
      
      setCreateDialogOpen(false);
      setNewCollectionName('');
      setNewCollectionDescription('');

    } catch (err) {
      console.error('Failed to create collection:', err);
      setError('Failed to create collection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleCloseSuccess = () => {
    setSuccess('');
  };

  const handleCloseLoginPrompt = () => {
    setLoginPromptOpen(false);
  };

  const cityInCollectionsCount = cityCollections.length;

  return (
    <>
      {/* Add to Collection Button */}
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '16px',
          backgroundColor: cityInCollectionsCount > 0 
            ? `${COLORS.secondary}15` 
            : 'transparent',
          border: `1px solid ${cityInCollectionsCount > 0 ? COLORS.secondary : COLORS.border}`,
          transition: 'all 0.2s ease',
          width: 'fit-content',
          '&:hover': {
            backgroundColor: cityInCollectionsCount > 0 
              ? `${COLORS.secondary}25` 
              : `${COLORS.secondary}10`,
            borderColor: COLORS.secondary,
            transform: 'scale(1.02)'
          }
        }}
      >
        <CollectionsIcon sx={{ 
          fontSize: '1rem', 
          color: cityInCollectionsCount > 0 ? COLORS.secondary : COLORS.texts.secondary,
          transition: 'all 0.2s ease'
        }} />
        
        <Typography sx={{
          fontSize: '0.8rem',
          fontWeight: 500,
          color: cityInCollectionsCount > 0 ? COLORS.secondary : COLORS.texts.secondary,
          transition: 'all 0.2s ease'
        }}>
          Collections
        </Typography>
        
        {cityInCollectionsCount > 0 && (
          <Chip
            label={cityInCollectionsCount}
            size="small"
            sx={{
              height: '16px',
              fontSize: '0.7rem',
              backgroundColor: COLORS.secondary,
              color: 'white',
              '& .MuiChip-label': {
                px: 0.5
              }
            }}
          />
        )}
      </Box>

      {/* Collections Popover */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              maxHeight: 400,
              mt: 0.5,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }
          }
        }}
        disableRestoreFocus
        disableEnforceFocus
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${COLORS.border}` }}>
          <Typography sx={{ 
            fontWeight: 600, 
            color: COLORS.texts.primary,
            fontSize: '0.95rem'
          }}>
            Add to Collection
          </Typography>
          <Typography sx={{ 
            fontSize: '0.8rem', 
            color: COLORS.texts.secondary,
            mt: 0.5
          }}>
            Organize this city in your collections
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={24} sx={{ color: COLORS.secondary }} />
            <Typography sx={{ mt: 1, fontSize: '0.8rem', color: COLORS.texts.secondary }}>
              Loading collections...
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {collections.filter(c => c.id).map((collection, index) => {
              const isInCollection = cityCollections.includes(collection.id);

              return (
                <ListItem key={collection.id || `collection-${index}`} disablePadding>
                  <ListItemButton
                    onClick={() => handleToggleCollection(collection.id, isInCollection)}
                    disabled={actionLoading}
                    sx={{
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: `${COLORS.secondary}10`
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {isInCollection ? (
                        <CheckIcon sx={{ color: COLORS.secondary, fontSize: '1.2rem' }} />
                      ) : (
                        <AddIcon sx={{ color: COLORS.texts.muted, fontSize: '1.2rem' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={collection.name}
                      secondary={`${collection.citiesCount || 0} cities`}
                      primaryTypographyProps={{
                        sx: {
                          fontSize: '0.9rem',
                          fontWeight: isInCollection ? 600 : 400,
                          color: isInCollection ? COLORS.secondary : COLORS.texts.primary
                        }
                      }}
                      secondaryTypographyProps={{
                        sx: { fontSize: '0.75rem' }
                      }}
                    />
                    {actionLoading && (
                      <CircularProgress size={16} sx={{ color: COLORS.secondary, ml: 1 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
            
            <Divider />
            
            {/* Create New Collection */}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  setCreateDialogOpen(true);
                  handleClose();
                }}
                sx={{
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: `${COLORS.primary}10`
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CreateNewFolderIcon sx={{ color: COLORS.primary, fontSize: '1.2rem' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Create New Collection"
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: COLORS.primary
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        )}
      </Popover>

      {/* Create Collection Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{
          color: COLORS.primary,
          fontFamily: 'Georgia, serif',
          fontSize: '1.3rem'
        }}>
          Create New Collection
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Collection Name"
            fullWidth
            variant="outlined"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description (optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={newCollectionDescription}
            onChange={(e) => setNewCollectionDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            sx={{ color: COLORS.texts.muted }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateCollection}
            disabled={!newCollectionName.trim() || actionLoading}
            variant="contained"
            sx={{
              backgroundColor: COLORS.primary,
              '&:hover': { backgroundColor: COLORS.primary }
            }}
          >
            {actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Create & Add City'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Login Prompt Snackbar */}
      <Snackbar
        open={loginPromptOpen}
        autoHideDuration={6000}
        onClose={handleCloseLoginPrompt}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseLoginPrompt} 
          severity="info" 
          sx={{ 
            width: '100%',
            bgcolor: COLORS.background,
            border: `1px solid ${COLORS.secondary}`,
            '& .MuiAlert-icon': {
              color: COLORS.secondary
            }
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.texts.primary }}>
            Please log in to create and manage collections!
          </Typography>
        </Alert>
      </Snackbar>

      {/* Success Message Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSuccess} 
          severity="success" 
          sx={{ 
            width: '100%',
            bgcolor: COLORS.background,
            border: `1px solid ${COLORS.success}`,
            '& .MuiAlert-icon': {
              color: COLORS.success
            }
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.texts.primary }}>
            {success}
          </Typography>
        </Alert>
      </Snackbar>

      {/* Error Message Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ 
            width: '100%',
            bgcolor: COLORS.background,
            border: `1px solid ${COLORS.error}`,
            '& .MuiAlert-icon': {
              color: COLORS.error
            }
          }}
        >
          <Typography sx={{ fontSize: '0.9rem', color: COLORS.texts.primary }}>
            {error}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}

export default CityAddCollectionButton;