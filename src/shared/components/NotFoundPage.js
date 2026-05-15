// Full-page 404 used for unknown frontend routes.
//
// Emits <meta name="robots" content="noindex"> so Google treats this
// as a soft 404 and removes the URL from the index instead of ranking
// the blank fallback. Same component is reused for the invalid-slug
// state inside HomePage via the SeoNoIndex export below.

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { COLORS } from '../config/generalUtils';

const SITE_NAME = 'ArchaeoMap';

export function SeoNoIndex({ title = `Page not found — ${SITE_NAME}` }) {
  return (
    <>
      <title>{title}</title>
      <meta name="robots" content="noindex, follow" />
      <meta name="description" content="The requested page could not be found." />
    </>
  );
}

function NotFoundPage() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        px: 3
      }}
    >
      <SeoNoIndex />
      <Typography
        variant="h1"
        sx={{
          fontFamily: 'Georgia, serif',
          color: COLORS.primary,
          fontSize: { xs: '4rem', md: '6rem' },
          mb: 1
        }}
      >
        404
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontFamily: 'Georgia, serif',
          color: COLORS.texts.primary,
          mb: 2,
          textAlign: 'center'
        }}
      >
        This page has been lost to history.
      </Typography>
      <Typography
        sx={{
          color: COLORS.texts.muted,
          mb: 4,
          textAlign: 'center',
          maxWidth: 420
        }}
      >
        The URL you followed does not match any city or page on ArchaeoMap.
      </Typography>
      <Button
        component={RouterLink}
        to="/"
        variant="outlined"
        sx={{
          color: COLORS.primary,
          borderColor: COLORS.primary,
          fontFamily: 'Georgia, serif',
          '&:hover': {
            borderColor: COLORS.primary,
            backgroundColor: `${COLORS.primary}10`
          }
        }}
      >
        Return to the map
      </Button>
    </Box>
  );
}

export default NotFoundPage;
