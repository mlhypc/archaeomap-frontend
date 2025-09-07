// archaeomap-frontend/src/panel/sections/Moderation/featuresModeration/PendingApplicationsSection.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  HowToVote as VoteIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Language as LanguageIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { panelStyles, panelTypography } from '../../../../shared/theme/panelStyles';
import useUserRole from '../../../../shared/hooks/useUserRole';
import { useAuth } from '../../../../shared/contexts/AuthContext';

function PendingApplicationsSection() {
  const { isAdmin } = useUserRole();
  const { user, token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [voteData, setVoteData] = useState({ vote: 'approve', reason: '' });
  const [submittingVote, setSubmittingVote] = useState(false);
  const [closingVoting, setClosingVoting] = useState(null);

  // Fetch pending applications
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!token) {
        setApplications([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/role-applications/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid token. Please refresh the page and log in again.');
        }
        throw new Error(result.error || `Failed to fetch applications (${response.status})`);
      }

      setApplications(result.applications);
      setError(null);
    } catch (err) {
      console.error('Fetch applications error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit vote
  const handleSubmitVote = async () => {
    if (!selectedApplication) return;

    try {
      setSubmittingVote(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/role-applications/${selectedApplication.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vote: voteData.vote,
          voteReason: voteData.reason.trim() || null
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit vote');
      }

      // Refresh applications to show updated vote counts
      await fetchApplications();
      
      // Close modal and reset
      setVoteModalOpen(false);
      setSelectedApplication(null);
      setVoteData({ vote: 'approve', reason: '' });

    } catch (err) {
      console.error('Submit vote error:', err);
      setError(err.message);
    } finally {
      setSubmittingVote(false);
    }
  };

  // Close voting manually (admin only)
  const handleCloseVoting = async (application) => {
    if (!window.confirm(`Are you sure you want to close voting for ${application.user.firstName} ${application.user.lastName}'s application?\n\nCurrent status: ${application.approval_percentage}% approval (${application.approval_votes}/${application.total_votes} votes)`)) {
      return;
    }

    try {
      setClosingVoting(application.id);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/role-applications/${application.id}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to close voting');
      }

      // Show result
      alert(`Voting closed successfully!\n\nResult: ${result.application.status.toUpperCase()}\nFinal votes: ${result.application.final_votes}\nApproval: ${result.application.approval_percentage}%${result.application.user_promoted ? '\n\n✅ User has been promoted!' : ''}`);

      // Refresh applications
      await fetchApplications();

    } catch (err) {
      console.error('Close voting error:', err);
      setError(err.message);
    } finally {
      setClosingVoting(null);
    }
  };

  // Format time remaining
  const formatTimeRemaining = (timeRemaining) => {
    if (timeRemaining.expired) {
      return { text: 'Expired', color: 'error' };
    }
    
    const { hours, minutes } = timeRemaining;
    if (hours > 0) {
      return { 
        text: `${hours}h ${minutes}m remaining`, 
        color: hours > 2 ? 'success' : 'warning' 
      };
    } else {
      return { 
        text: `${minutes}m remaining`, 
        color: minutes > 30 ? 'warning' : 'error' 
      };
    }
  };

  // Open vote modal
  const openVoteModal = (application) => {
    setSelectedApplication(application);
    
    // Pre-fill with existing vote if user already voted
    if (application.user_vote) {
      setVoteData({
        vote: application.user_vote.vote,
        reason: application.user_vote.vote_reason || ''
      });
    } else {
      setVoteData({ vote: 'approve', reason: '' });
    }
    
    setVoteModalOpen(true);
  };

  useEffect(() => {
    // Only fetch applications if user has moderator+ role
    if (user && token && (user.role === 'moderator' || user.role === 'admin')) {
      fetchApplications();
      
      // Auto-refresh every 2 minutes
      const interval = setInterval(fetchApplications, 2 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setApplications([]);
      setLoading(false);
    }
  }, [user, token]);

  if (loading && applications.length === 0) {
    return (
      <Box sx={panelStyles.sectionContainer}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={panelStyles.sectionContainer}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography sx={panelTypography.sectionTitle}>
           Pending Applications
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Badge badgeContent={applications.length} color="primary">
            <VoteIcon />
          </Badge>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchApplications} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 && !loading && (
        <Alert severity="info">
          No pending applications at the moment. New contributor applications will appear here for voting.
        </Alert>
      )}

      <Grid container spacing={3}>
        {applications.map((application) => {
          const timeRemaining = formatTimeRemaining(application.time_remaining);
          const approvalRate = application.total_votes > 0 ? application.approval_percentage : 0;
          const userVoted = !!application.user_vote;
          
          return (
            <Grid item xs={12} key={application.id}>
              <Card sx={{ 
                border: userVoted ? '2px solid' : '1px solid',
                borderColor: userVoted ? 'primary.main' : 'divider'
              }}>
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                         Contributor Application
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Chip 
                          icon={<PersonIcon />}
                          label={`${application.user.firstName} ${application.user.lastName} (@${application.user.username})`}
                          variant="outlined"
                        />
                        <Chip 
                          icon={<TimeIcon />}
                          label={timeRemaining.text}
                          color={timeRemaining.color}
                          variant="filled"
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant={userVoted ? "outlined" : "contained"}
                        startIcon={<VoteIcon />}
                        onClick={() => openVoteModal(application)}
                        color={userVoted ? "inherit" : "primary"}
                        disabled={application.time_remaining.expired}
                      >
                        {userVoted ? 'Update Vote' : 'Vote'}
                      </Button>
                      
                      {isAdmin && !application.time_remaining.expired && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCloseVoting(application)}
                          disabled={closingVoting === application.id}
                          startIcon={closingVoting === application.id ? <CircularProgress size={16} /> : <RejectIcon />}
                        >
                          {closingVoting === application.id ? 'Closing...' : 'Close Voting'}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {/* Voting Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Approval Rate
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {approvalRate}% ({application.approval_votes}/{application.total_votes} votes)
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={approvalRate} 
                      color={approvalRate >= 50 ? "success" : "error"}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* User's Vote Status */}
                  {userVoted && (
                    <Alert 
                      severity={application.user_vote.vote === 'approve' ? "success" : "error"}
                      sx={{ mb: 2 }}
                    >
                      You voted to <strong>{application.user_vote.vote}</strong> this application
                      {application.user_vote.vote_reason && (
                        <>: "{application.user_vote.vote_reason}"</>
                      )}
                    </Alert>
                  )}

                  {/* Application Details */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                         Motivation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {application.motivation}
                      </Typography>
                      
                      <Typography variant="subtitle2" gutterBottom>
                         Interest Areas
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {application.interest_areas.map((area, index) => (
                          <Chip key={index} label={area} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box>
                      <List dense>
                        <ListItem>
                          <ListItemIcon><ScheduleIcon fontSize="small" /></ListItemIcon>
                          <ListItemText 
                            primary="Time Commitment" 
                            secondary={`${application.time_commitment} hours/week`}
                          />
                        </ListItem>
                        
                        {application.languages && (
                          <ListItem>
                            <ListItemIcon><LanguageIcon fontSize="small" /></ListItemIcon>
                            <ListItemText 
                              primary="Languages" 
                              secondary={application.languages}
                            />
                          </ListItem>
                        )}
                        
                        {application.academic_background && (
                          <ListItem>
                            <ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon>
                            <ListItemText 
                              primary="Academic Background" 
                              secondary={application.academic_background}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  </Box>

                  {/* Recent Votes */}
                  {application.votes.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Recent Votes
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {application.votes.slice(-5).map((vote, index) => (
                          <Chip
                            key={index}
                            icon={vote.vote === 'approve' ? <ApproveIcon /> : <RejectIcon />}
                            label={`${vote.voter.username}: ${vote.vote}`}
                            color={vote.vote === 'approve' ? 'success' : 'error'}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Vote Modal */}
      <Dialog 
        open={voteModalOpen} 
        onClose={() => setVoteModalOpen(false)}
        maxWidth="sm"
        fullWidth
        disableRestoreFocus
        disableEnforceFocus={false}
      >
        <DialogTitle>
          Vote on Application
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Voting on {selectedApplication.user.firstName} {selectedApplication.user.lastName}'s contributor application
              </Typography>
              
              <FormControl component="fieldset" sx={{ mt: 2, mb: 3 }}>
                <FormLabel component="legend">Your Vote</FormLabel>
                <RadioGroup
                  value={voteData.vote}
                  onChange={(e) => setVoteData({ ...voteData, vote: e.target.value })}
                >
                  <FormControlLabel 
                    value="approve" 
                    control={<Radio />} 
                    label="✅ Approve - This applicant should become a contributor"
                  />
                  <FormControlLabel 
                    value="reject" 
                    control={<Radio />} 
                    label="❌ Reject - This applicant is not ready yet"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                label="Reason (Optional)"
                multiline
                rows={3}
                fullWidth
                value={voteData.reason}
                onChange={(e) => setVoteData({ ...voteData, reason: e.target.value })}
                placeholder="Explain your decision (visible to other moderators)..."
                inputProps={{ maxLength: 500 }}
                helperText={`${voteData.reason.length}/500 characters`}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoteModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitVote}
            variant="contained"
            disabled={submittingVote}
            startIcon={submittingVote && <CircularProgress size={16} />}
          >
            {submittingVote ? 'Submitting...' : 'Submit Vote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PendingApplicationsSection;