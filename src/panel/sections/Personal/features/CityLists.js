// archaeomap-frontend/src/panel/sections/Personal/features/CityLists.js

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
    Chip
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { COLORS } from '../../../../shared/config/generalUtils';

function CityLists() {
    const [lists, setLists] = useState([]);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newListName, setNewListName] = useState('');

    useEffect(() => {
        fetchUserLists();
    }, []);

    const fetchUserLists = async () => {
        // TODO: API call to fetch user's city lists
        // Mock data for now
        setLists([
            {
                id: 1,
                name: 'Ancient Capitals',
                cities: ['Rome', 'Constantinople', 'Alexandria'],
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'Trade Cities',
                cities: ['Venice', 'Genoa', 'Amalfi'],
                createdAt: '2024-02-10'
            }
        ]);
    };

    const handleCreateList = async () => {
        if (!newListName.trim()) return;

        try {
            // TODO: API call to create new list
            const newList = {
                id: Date.now(),
                name: newListName,
                cities: [],
                createdAt: new Date().toISOString().split('T')[0]
            };

            setLists(prev => [...prev, newList]);
            setNewListName('');
            setCreateDialogOpen(false);
        } catch (err) {
            console.error('Failed to create list:', err);
        }
    };

    const handleDeleteList = async (listId) => {
        try {
            // TODO: API call to delete list
            setLists(prev => prev.filter(list => list.id !== listId));
        } catch (err) {
            console.error('Failed to delete list:', err);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: COLORS.primary }}>
                    My City Lists ({lists.length})
                </Typography>
                <Button
                    variant="archaeoSecondary"
                    startIcon={<AddIcon />}
                    size="small"
                    onClick={() => setCreateDialogOpen(true)}
                >
                    New List
                </Button>
            </Box>

            {lists.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                    <ListIcon sx={{ fontSize: 48, color: COLORS.texts.muted, mb: 2 }} />
                    <Typography variant="body1" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
                        No city lists yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                        Create lists to organize your favorite cities by theme, period, or region!
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {lists.map((list) => (
                        <Card key={list.id} elevation={0} sx={{
                            border: `1px solid ${COLORS.border}`,
                            '&:hover': {
                                borderColor: COLORS.primary,
                                transform: 'translateY(-1px)',
                                transition: 'all 0.2s ease'
                            }
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" sx={{ color: COLORS.texts.primary, mb: 0.5 }}>
                                            {list.name}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
                                            Created {new Date(list.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <IconButton size="small" sx={{ color: COLORS.texts.secondary, mr: 0.5 }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteList(list.id)}
                                            sx={{ color: COLORS.error }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                    {list.cities.length === 0 ? (
                                        <Typography variant="body2" sx={{ color: COLORS.texts.muted, fontStyle: 'italic' }}>
                                            No cities added yet
                                        </Typography>
                                    ) : (
                                        <>
                                            {list.cities.slice(0, 3).map((city, index) => (
                                                <Chip
                                                    key={index}
                                                    label={city}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: COLORS.primary + '15',
                                                        color: COLORS.texts.primary,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            ))}
                                            {list.cities.length > 3 && (
                                                <Chip
                                                    label={`+${list.cities.length - 3} more`}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: COLORS.texts.muted + '20',
                                                        color: COLORS.texts.muted,
                                                        fontSize: '0.75rem'
                                                    }}
                                                />
                                            )}
                                        </>
                                    )}
                                </Box>

                                <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                                    {list.cities.length} {list.cities.length === 1 ? 'city' : 'cities'}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Create List Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: COLORS.primary, fontFamily: 'Georgia, serif' }}>
                    Create New City List
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="List Name"
                        fullWidth
                        variant="outlined"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="e.g., Roman Cities, Medieval Capitals..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: COLORS.texts.secondary }}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateList} variant="archaeo" disabled={!newListName.trim()}>
                        Create List
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default CityLists;