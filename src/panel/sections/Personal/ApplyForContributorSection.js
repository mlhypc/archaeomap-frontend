// archaeomap-frontend/src/panel/sections/Personal/ApplyForContributorSection.js

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Chip,
  CircularProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SchoolIcon from '@mui/icons-material/School';
import LanguageIcon from '@mui/icons-material/Language';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PendingIcon from '@mui/icons-material/Pending';

import { panelStyles, panelTypography } from '../../../shared/theme/panelStyles';
import { useAuth } from '../../../shared/contexts/AuthContext';
import ApplyForContributor from './featuresProfile/ApplyForContributor';

function ApplyForContributorSection() {
  const { user, token } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const handleApplicationSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
    // Refresh applications after successful submission
    fetchMyApplications();
  };

  const fetchMyApplications = async () => {
    try {
      setLoadingApplications(true);
      
      if (!token) {
        setMyApplications([]);
        setLoadingApplications(false);
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/role-applications/my-applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (response.ok) {
        setMyApplications(result.applications);
      } else {
        console.error('Fetch applications failed:', response.status, result);
        if (response.status === 401) {
          console.warn('Token invalid - user may need to re-login');
        }
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (!timeRemaining) return null;
    
    if (timeRemaining.expired) {
      return { text: 'Voting Closed', color: 'error' };
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status, isVotingOpen) => {
    if (status === 'pending' && isVotingOpen) return <HowToVoteIcon />;
    if (status === 'pending') return <PendingIcon />;
    if (status === 'approved') return <CheckCircleIcon />;
    return <AccessTimeIcon />;
  };

  useEffect(() => {
    if (user && token) {
      fetchMyApplications();
      
      // Auto-refresh every 2 minutes for active applications
      const interval = setInterval(fetchMyApplications, 2 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setMyApplications([]);
      setLoadingApplications(false);
    }
  }, [user, token]);

  return (
    <Box sx={panelStyles.sectionContainer}>
      <Typography sx={panelTypography.sectionTitle}>
        Apply for Contributor Role
      </Typography>
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* My Applications Status */}
      {loadingApplications ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : myApplications.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HowToVoteIcon color="primary" />
            My Applications
          </Typography>
          
          {myApplications.map((application) => {
            const timeRemaining = formatTimeRemaining(application.time_remaining);
            const approvalRate = application.total_votes > 0 ? application.approval_percentage : 0;
            
            return (
              <Card key={application.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Contributor Application
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={getStatusIcon(application.status, application.is_voting_open)}
                          label={application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          color={getStatusColor(application.status)}
                          variant="filled"
                        />
                        {timeRemaining && (
                          <Chip
                            icon={<AccessTimeIcon />}
                            label={timeRemaining.text}
                            color={timeRemaining.color}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary">
                      Applied: {new Date(application.applied_at).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {application.status === 'pending' && application.is_voting_open && (
                    <>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Voting Progress
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {approvalRate}% approval ({application.approval_votes}/{application.total_votes} votes)
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={approvalRate} 
                          color={approvalRate >= 50 ? "success" : "error"}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      
                      <Alert 
                        severity="info"
                        sx={{ mb: 2 }}
                      >
                        Voting in progress... Need 50%+ approval (currently {approvalRate}%)
                      </Alert>
                    </>
                  )}

                  {application.status === 'approved' && (
                    <Alert severity="success">
                      🎉 Congratulations! Your application was approved with {approvalRate}% approval rate. 
                      You have been promoted to Contributor!
                    </Alert>
                  )}

                  {application.status === 'rejected' && (
                    <Alert severity="error">
                      ❌ Your application was not approved this time ({approvalRate}% approval rate). 
                      You can apply again in the future.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Main Content */}
        <Box sx={{ flex: 2 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  Become a Contributor
                </Typography>
              </Box>
              
              <Typography variant="body1" color="text.secondary" paragraph>
                Join our community of archaeological researchers and enthusiasts! As a contributor, 
                you'll be able to submit new cities and archaeological sites to expand our global database.
              </Typography>

              <Typography variant="body1" color="text.secondary" paragraph>
                Contributors play a vital role in preserving and sharing historical knowledge. 
                Your submissions will be reviewed by our moderation team before being published.
              </Typography>

              <Button
                variant="contained"
                size="large"
                startIcon={<TrendingUpIcon />}
                onClick={() => setModalOpen(true)}
                disabled={myApplications.some(app => app.status === 'pending')}
                sx={{ mt: 2 }}
              >
                {myApplications.some(app => app.status === 'pending') ? 'Application Pending' : 'Start Application'}
              </Button>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contributor Benefits
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Submit New Cities"
                    secondary="Add historical cities and archaeological sites to our database"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Track Your Contributions"
                    secondary="Monitor the status of your submissions and see their impact"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Collaborate with Experts"
                    secondary="Work with archaeologists and historians from around the world"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Educational Resources"
                    secondary="Access to contributor guides and archaeological resources"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Requirements Sidebar */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Time Commitment"
                    secondary="1+ hours per week"
                  />
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Interest in History"
                    secondary="Passion for archaeology or historical research"
                  />
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon color="primary" fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Communication"
                    secondary="Good written communication skills"
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 3, p: 2, backgroundColor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="body2" color="primary.contrastText" align="center">
                  <strong>No prior experience required!</strong>
                  <br />
                  We'll provide training and support.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Application Modal */}
      <ApplyForContributor
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleApplicationSuccess}
      />
    </Box>
  );
}

export default ApplyForContributorSection;