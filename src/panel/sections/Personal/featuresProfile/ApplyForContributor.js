// archaeomap-frontend/src/panel/sections/Personal/featuresProfile/ApplyForContributor.js

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  Box,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';

const INTEREST_AREAS = [
  'Ancient Cities',
  'Medieval Period',
  'Archaeological Sites',
  'Roman Empire',
  'Byzantine Empire',
  'Islamic Architecture',
  'European History',
  'Asian Civilizations',
  'African Heritage',
  'Maritime History'
];

const TIME_COMMITMENTS = [
  { value: '1-2', label: '1-2 hours/week' },
  { value: '3-5', label: '3-5 hours/week' },
  { value: '6-10', label: '6-10 hours/week' },
  { value: '10+', label: '10+ hours/week' }
];

const CONTRIBUTION_TYPES = [
  'Research & Documentation',
  'Data Entry & Verification',
  'Translation Services',
  'Academic Review',
  'Source Verification'
];

function ApplyForContributor({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    motivation: '',
    interestAreas: [],
    academicBackground: '',
    previousExperience: '',
    languages: '',
    timeCommitment: '',
    contributionTypes: [],
    portfolioLinks: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
  };

  const handleCheckboxChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (!formData.motivation.trim()) {
        throw new Error('Please provide your motivation');
      }
      if (formData.motivation.trim().length < 50) {
        throw new Error('Motivation must be at least 50 characters');
      }
      if (formData.interestAreas.length === 0) {
        throw new Error('Please select at least one area of interest');
      }
      if (!formData.timeCommitment) {
        throw new Error('Please select your time commitment');
      }

      // API call to submit application
      const applicationData = {
        motivation: formData.motivation.trim(),
        interest_areas: formData.interestAreas,
        academic_background: formData.academicBackground.trim(),
        previous_experience: formData.previousExperience.trim(),
        languages: formData.languages.trim(),
        time_commitment: formData.timeCommitment,
        contribution_types: formData.contributionTypes,
        portfolio_links: formData.portfolioLinks.trim()
      };

      const token = localStorage.getItem('archaeomap_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/role-applications/contributor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      console.log('Application submitted successfully:', result);
      
      if (onSuccess) {
        onSuccess('Your contributor application has been submitted successfully!');
      }
      
      onClose();
      
    } catch (err) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      motivation: '',
      interestAreas: [],
      academicBackground: '',
      previousExperience: '',
      languages: '',
      timeCommitment: '',
      contributionTypes: [],
      portfolioLinks: ''
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableRestoreFocus
      disableEnforceFocus={false}
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid', 
        borderColor: 'divider',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">
            🔼 Apply for Contributor Role
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Join our community of contributors and help expand the archaeological knowledge base
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Motivation */}
        <TextField
          label="Why do you want to become a contributor? *"
          multiline
          rows={4}
          fullWidth
          value={formData.motivation}
          onChange={(e) => handleInputChange('motivation', e.target.value)}
          placeholder="Share your passion for archaeology, history, or heritage preservation..."
          inputProps={{ maxLength: 1000 }}
          helperText={`${formData.motivation.length}/1000 characters (minimum 50)`}
          error={formData.motivation.length > 0 && formData.motivation.length < 50}
          sx={{ mb: 3 }}
        />

        {/* Areas of Interest */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            Areas of Interest *
          </FormLabel>
          <FormGroup>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1
            }}>
              {INTEREST_AREAS.map((area) => (
                <FormControlLabel
                  key={area}
                  control={
                    <Checkbox
                      checked={formData.interestAreas.includes(area)}
                      onChange={(e) => handleCheckboxChange('interestAreas', area, e.target.checked)}
                      size="small"
                    />
                  }
                  label={area}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                />
              ))}
            </Box>
          </FormGroup>
        </FormControl>

        {/* Academic Background */}
        <TextField
          label="Academic Background (Optional)"
          multiline
          rows={2}
          fullWidth
          value={formData.academicBackground}
          onChange={(e) => handleInputChange('academicBackground', e.target.value)}
          placeholder="Relevant education, degrees, or certifications..."
          sx={{ mb: 3 }}
        />

        {/* Previous Experience */}
        <TextField
          label="Previous Experience (Optional)"
          multiline
          rows={2}
          fullWidth
          value={formData.previousExperience}
          onChange={(e) => handleInputChange('previousExperience', e.target.value)}
          placeholder="Experience with similar projects, research, or contributions..."
          sx={{ mb: 3 }}
        />

        {/* Languages */}
        <TextField
          label="Languages Spoken"
          fullWidth
          value={formData.languages}
          onChange={(e) => handleInputChange('languages', e.target.value)}
          placeholder="e.g., English, Turkish, Arabic, Latin..."
          helperText="Helpful for international archaeological sites and sources"
          sx={{ mb: 3 }}
        />

        {/* Time Commitment */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Time Commitment *</InputLabel>
          <Select
            value={formData.timeCommitment}
            label="Time Commitment *"
            onChange={(e) => handleInputChange('timeCommitment', e.target.value)}
          >
            {TIME_COMMITMENTS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Contribution Types */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            Preferred Contribution Types
          </FormLabel>
          <FormGroup>
            {CONTRIBUTION_TYPES.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={formData.contributionTypes.includes(type)}
                    onChange={(e) => handleCheckboxChange('contributionTypes', type, e.target.checked)}
                    size="small"
                  />
                }
                label={type}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
              />
            ))}
          </FormGroup>
        </FormControl>

        {/* Portfolio Links */}
        <TextField
          label="Portfolio/References (Optional)"
          multiline
          rows={2}
          fullWidth
          value={formData.portfolioLinks}
          onChange={(e) => handleInputChange('portfolioLinks', e.target.value)}
          placeholder="Links to your work, publications, or relevant profiles..."
          sx={{ mb: 2 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || formData.motivation.trim().length < 50 || formData.interestAreas.length === 0 || !formData.timeCommitment}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ApplyForContributor;