// src/App.js - Fixed import for theme

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import Theme from './shared/theme/styles';

import HomePage from './home/pages/HomePage';
import PanelPage from './panel/pages/PanelPage';
import ResetPasswordPage from './panel/pages/ResetPasswordPage';
import OAuthCallback from './panel/sections/Personal/featuresProfile/OAuthCallback';

function App() {
  return (
    <Theme>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cities/:countrySlug/:citySlug" element={<HomePage />} />
            <Route path="/panel" element={<PanelPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
          </Routes>
        </Router>
      </AuthProvider>
    </Theme>
  );
}

export default App;