import React, { useRef, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { COLORS } from '../../../../shared/config/generalUtils';

function ProfilePictureSettings() {
  const { user, uploadProfilePicture, deleteProfilePicture } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    const result = await uploadProfilePicture(file);
    setLoading(false);

    if (!result.success) setError(result.error);
    e.target.value = '';
  };

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    const result = await deleteProfilePicture();
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: COLORS.texts.primary, fontFamily: 'Georgia, serif', mb: 2 }}>
        Profile Picture
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={user?.profileImageUrl || undefined}
            sx={{ width: 80, height: 80, bgcolor: COLORS.primary, fontSize: '2rem' }}
          >
            {!user?.profileImageUrl && (user?.username?.[0]?.toUpperCase() || '?')}
          </Avatar>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            size="small"
            sx={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              bgcolor: COLORS.primary,
              color: '#fff',
              width: 28,
              height: 28,
              '&:hover': { bgcolor: COLORS.secondary }
            }}
          >
            {loading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <PhotoCameraIcon sx={{ fontSize: 14 }} />}
          </IconButton>
        </Box>

        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            sx={{ borderColor: COLORS.primary, color: COLORS.primary, mr: 1, mb: 1 }}
          >
            Upload Photo
          </Button>
          {user?.profileImageUrl && (
            <Button
              variant="text"
              size="small"
              onClick={handleDelete}
              disabled={loading}
              startIcon={<DeleteOutlineIcon />}
              sx={{ color: 'error.main', mb: 1 }}
            >
              Remove
            </Button>
          )}
          <Typography variant="caption" display="block" sx={{ color: COLORS.texts.muted }}>
            JPEG, PNG or WebP — max 2MB
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </Paper>
  );
}

export default ProfilePictureSettings;
