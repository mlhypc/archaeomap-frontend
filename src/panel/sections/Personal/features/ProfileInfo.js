// archaeomap-frontend/src/panel/sections/Personal/features/ProfileInfo.js

import React from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Avatar,
  Grid 
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuth } from '../../../../shared/contexts/AuthContext';
import { COLORS } from '../../../../shared/config/generalUtils';

function ProfileInfo() {
  const { user } = useAuth();

  return (
    <Box>
      {/* Ana Profil Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{ 
            width: { xs: 64, md: 80 }, 
            height: { xs: 64, md: 80 }, 
            mr: 3,
            bgcolor: COLORS.primary,
            fontSize: { xs: '1.5rem', md: '2rem' },
            fontFamily: 'Georgia, serif'
          }}
        >
          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ 
            color: COLORS.texts.primary, 
            mb: 0.5,
            fontFamily: 'Georgia, serif',
            fontWeight: 'normal',
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="h6" sx={{ 
            color: COLORS.texts.secondary, 
            mb: 1,
            fontWeight: 500,
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}>
            @{user?.username}
          </Typography>
          <Typography variant="body1" sx={{ color: COLORS.texts.muted }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Profil Detayları */}
      <Box>
        <Typography variant="h6" sx={{ 
          color: COLORS.primary,
          mb: 2,
          fontFamily: 'Georgia, serif'
        }}>
          Profile Information
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <ProfileField
              icon={<PersonIcon sx={{ color: COLORS.texts.muted, mr: 1, fontSize: '1.2rem' }} />}
              label="Full Name"
              value={`${user?.firstName} ${user?.lastName}`}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <ProfileField
              icon={<CalendarTodayIcon sx={{ color: COLORS.texts.muted, mr: 1, fontSize: '1.2rem' }} />}
              label="Member Since"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <ProfileField
              icon={<PersonIcon sx={{ color: COLORS.texts.muted, mr: 1, fontSize: '1.2rem' }} />}
              label="Username"
              value={user?.username}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <ProfileField
              icon={<PersonIcon sx={{ color: COLORS.texts.muted, mr: 1, fontSize: '1.2rem' }} />}
              label="Email Address"
              value={user?.email}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      {icon}
      <Box>
        <Typography variant="body2" sx={{ 
          color: COLORS.texts.muted, 
          fontSize: '0.8rem',
          mb: 0.25
        }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: COLORS.texts.primary }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export default ProfileInfo;