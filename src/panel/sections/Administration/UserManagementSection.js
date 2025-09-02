// archaeomap-frontend\src\components\panel\Administration\UserManagementSection.js

import React, { useState, useEffect } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Avatar
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GroupIcon from '@mui/icons-material/Group';
import { format } from 'date-fns';

import { COLORS } from '../../../shared/config/generalUtils';
import { authService } from '../../../shared/services/authApi';
import { useAuth } from '../../../shared/contexts/AuthContext';

function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, newRole: null });
  
  const { user: currentUser } = useAuth();

  const roleColors = {
    standard: { bg: 'rgba(25, 118, 210, 0.1)', color: '#1976d2' },
    contributor: { bg: 'rgba(237, 108, 2, 0.1)', color: '#ed6c02' },
    moderator: { bg: 'rgba(156, 39, 176, 0.1)', color: '#9c27b0' },
    admin: { bg: 'rgba(211, 47, 47, 0.1)', color: '#d32f2f' }
  };

  const roleIcons = {
    standard: PersonIcon,
    contributor: GroupIcon,
    moderator: ManageAccountsIcon,
    admin: AdminPanelSettingsIcon
  };

  const roleLabels = {
    standard: 'User',
    contributor: 'Contributor',
    moderator: 'Moderator',
    admin: 'Administrator'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.getAllUsers();
      
      if (result.success) {
        setUsers(result.users);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChangeRequest = (user, newRole) => {
    setConfirmDialog({
      open: true,
      user,
      newRole
    });
  };

  const handleRoleChangeConfirm = async () => {
    const { user, newRole } = confirmDialog;
    setUpdateLoading(user.id);
    setError(null);
    setSuccess(null);

    try {
      const result = await authService.updateUserRole(user.id, newRole);
      
      if (result.success) {
        setSuccess(`Successfully updated ${user.username}'s role to ${roleLabels[newRole]}`);
        
        // Update users list
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === user.id ? { ...u, role: newRole } : u
          )
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to update user role');
    } finally {
      setUpdateLoading(null);
      setConfirmDialog({ open: false, user: null, newRole: null });
    }
  };

  const getRoleIcon = (role) => {
    const Icon = roleIcons[role] || PersonIcon;
    return <Icon sx={{ fontSize: 16 }} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  const getActiveStatus = (user) => {
    if (user.isActive) {
      return <Chip label="Active" color="success" size="small" />;
    }
    return <Chip label="Inactive" color="error" size="small" />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress size={40} sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Georgia, serif', 
            color: COLORS.primary,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AdminPanelSettingsIcon sx={{ fontSize: 32 }} />
          User Management
        </Typography>
        
        <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
          Total Users: {users.length}
        </Typography>
      </Box>

      {/* Messages */}
      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError(null)} 
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)} 
          sx={{ mb: 2 }}
        >
          {success}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: '8px' }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'rgba(248, 245, 238, 0.5)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', color: COLORS.texts.primary }}>
                User
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: COLORS.texts.primary }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: COLORS.texts.primary }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: COLORS.texts.primary }}>
                Status
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: COLORS.texts.primary }}>
                Last Login
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: COLORS.texts.primary }}>
                Created
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', color: COLORS.texts.primary }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id} 
                hover
                sx={{ 
                  '&:hover': { backgroundColor: 'rgba(248, 245, 238, 0.3)' },
                  backgroundColor: user.id === currentUser?.id ? 'rgba(119, 73, 54, 0.05)' : 'transparent'
                }}
              >
                {/* User Info */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      src={user.profileImageUrl}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        backgroundColor: COLORS.primary
                      }}
                    >
                      {user.firstName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', color: COLORS.texts.primary }}>
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                        {user.id === currentUser?.id && (
                          <Chip 
                            label="You" 
                            size="small" 
                            sx={{ ml: 1, fontSize: '0.65rem', height: '18px' }}
                          />
                        )}
                      </Typography>
                      <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                    {user.email}
                  </Typography>
                  {user.emailVerified && (
                    <Typography variant="caption" sx={{ color: COLORS.texts.muted }}>
                      ✓ Verified
                    </Typography>
                  )}
                </TableCell>

                {/* Role */}
                <TableCell>
                  <Chip
                    icon={getRoleIcon(user.role)}
                    label={roleLabels[user.role] || user.role}
                    size="small"
                    sx={{
                      backgroundColor: roleColors[user.role]?.bg || roleColors.standard.bg,
                      color: roleColors[user.role]?.color || roleColors.standard.color,
                      fontWeight: 'medium'
                    }}
                  />
                </TableCell>

                {/* Status */}
                <TableCell>
                  {getActiveStatus(user)}
                </TableCell>

                {/* Last Login */}
                <TableCell>
                  <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                    {formatDate(user.lastLoginAt)}
                  </Typography>
                </TableCell>

                {/* Created Date */}
                <TableCell>
                  <Typography variant="body2" sx={{ color: COLORS.texts.secondary }}>
                    {formatDate(user.createdAt)}
                  </Typography>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  {user.id !== currentUser?.id && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChangeRequest(user, e.target.value)}
                        disabled={updateLoading === user.id}
                        sx={{ 
                          '& .MuiSelect-select': { 
                            py: 0.5, 
                            fontSize: '0.875rem' 
                          }
                        }}
                      >
                        <MenuItem value="standard">User</MenuItem>
                        <MenuItem value="contributor">Contributor</MenuItem>
                        <MenuItem value="moderator">Moderator</MenuItem>
                        <MenuItem value="admin">Administrator</MenuItem>
                      </Select>
                      {updateLoading === user.id && (
                        <CircularProgress 
                          size={16} 
                          sx={{ 
                            position: 'absolute', 
                            right: 8, 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: COLORS.primary
                          }} 
                        />
                      )}
                    </FormControl>
                  )}
                  {user.id === currentUser?.id && (
                    <Typography variant="caption" sx={{ color: COLORS.texts.muted, fontStyle: 'italic' }}>
                      (Current User)
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Empty State */}
      {users.length === 0 && !loading && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          border: `2px dashed ${COLORS.border}`,
          borderRadius: '8px',
          mt: 2
        }}>
          <PersonIcon sx={{ fontSize: 60, color: COLORS.texts.muted, mb: 2 }} />
          <Typography variant="h6" sx={{ color: COLORS.texts.secondary, mb: 1 }}>
            No Users Found
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
            There are no users in the system.
          </Typography>
        </Box>
      )}

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog.open} 
        onClose={() => setConfirmDialog({ open: false, user: null, newRole: null })}
        PaperProps={{
          sx: { borderRadius: '8px' }
        }}
      >
        <DialogTitle sx={{ color: COLORS.primary }}>
          Confirm Role Change
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to change <strong>{confirmDialog.user?.username}</strong>'s role from{' '}
            <strong>{roleLabels[confirmDialog.user?.role]}</strong> to <strong>{roleLabels[confirmDialog.newRole]}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.texts.muted }}>
            This action will immediately update the user's permissions and access levels.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setConfirmDialog({ open: false, user: null, newRole: null })}
            sx={{ color: COLORS.texts.secondary }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRoleChangeConfirm}
            variant="contained"
            sx={{
              backgroundColor: COLORS.primary,
              '&:hover': { backgroundColor: COLORS.secondary }
            }}
          >
            Confirm Change
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagementSection;