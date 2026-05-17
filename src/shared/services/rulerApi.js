// archaeomap-frontend/src/shared/services/rulerApi.js
//
// Frontend API wrapper for the Ruler entity. Mirrors the cityApi pattern:
// fetch-based, auto-refresh tokens on 401, parse-response helper.

import { authService } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ---- Internal helpers (same shape as cityApi) ----

const makeRequest = async (url, options = {}) => {
  try {
    const token = localStorage.getItem('archaeomap_token');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('archaeomap_refresh_token');
      if (refreshToken) {
        const refreshResult = await authService.refreshToken(refreshToken);
        if (refreshResult.success) {
          const newToken = refreshResult.tokens.accessToken;
          config.headers.Authorization = `Bearer ${newToken}`;
          return await fetch(`${API_BASE_URL}${url}`, config);
        }
      }
      localStorage.removeItem('archaeomap_token');
      localStorage.removeItem('archaeomap_refresh_token');
      window.location.href = '/panel';
      return { ok: false, status: 401 };
    }

    return response;
  } catch (error) {
    console.error('Ruler API request error:', error);
    throw error;
  }
};

const parseResponse = async (response) => {
  try {
    const data = await response.json();
    if (response.ok) {
      return { success: true, data, message: data.message };
    }
    return {
      success: false,
      error: data.error || 'Request failed',
      errors: data.errors,
      details: data.details
    };
  } catch (error) {
    return { success: false, error: 'Failed to parse response', details: error.message };
  }
};

// ---- Public surface ----

export const rulerService = {
  // List with optional search/pagination
  async list({ search, limit, offset } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (limit !== undefined) params.set('limit', String(limit));
    if (offset !== undefined) params.set('offset', String(offset));
    const qs = params.toString();
    const res = await makeRequest(`/rulerData${qs ? `?${qs}` : ''}`);
    return parseResponse(res);
  },

  // Single by Mongo _id
  async getById(id) {
    const res = await makeRequest(`/rulerData/${id}`);
    return parseResponse(res);
  },

  // Single by slug
  async getBySlug(slug) {
    const res = await makeRequest(`/rulerData/by-slug/${encodeURIComponent(slug)}`);
    return parseResponse(res);
  },

  // Resolve a free-form controlHistory.ruler string against the aliases index.
  // Returns { success: true, data: { ruler: {…} | null } }.
  async resolve(rulerString) {
    const res = await makeRequest(`/rulerData/resolve?q=${encodeURIComponent(rulerString)}`);
    return parseResponse(res);
  },

  async create(payload) {
    const res = await makeRequest('/rulerData', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  async update(id, payload) {
    const res = await makeRequest(`/rulerData/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return parseResponse(res);
  },

  async remove(id) {
    const res = await makeRequest(`/rulerData/${id}`, { method: 'DELETE' });
    return parseResponse(res);
  }
};

export default rulerService;
