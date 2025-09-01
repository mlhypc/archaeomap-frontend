// src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PanelPage from './pages/PanelPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/panel/*" element={<PanelPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;