// archaeomap-frontend/src/shared/services/cityApi.js - COMPLETE CONSOLIDATED VERSION

import { authService } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========================================================================
// HELPER FUNCTIONS
// ========================================================================

// Helper function to make authenticated requests
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
    
    // Handle token expiration
    if (response.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('archaeomap_refresh_token');
      if (refreshToken) {
        const refreshResult = await authService.refreshToken(refreshToken);
        if (refreshResult.success) {
          // Retry the request with new token
          const newToken = refreshResult.tokens.accessToken;
          config.headers.Authorization = `Bearer ${newToken}`;
          return await fetch(`${API_BASE_URL}${url}`, config);
        }
      }
      
      // Refresh failed, redirect to login
      localStorage.removeItem('archaeomap_token');
      localStorage.removeItem('archaeomap_refresh_token');
      window.location.href = '/panel';
      return { ok: false, status: 401 };
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Parse response helper
const parseResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data: data.data || data,
        message: data.message
      };
    } else {
      return {
        success: false,
        error: data.error || 'Request failed',
        details: data.details,
        code: data.code
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse response',
      details: error.message
    };
  }
};

// ========================================================================
// ENHANCED CACHE MANAGEMENT
// ========================================================================

class EnhancedDataCache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutes TTL by default
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;

    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  size() {
    return this.cache.size;
  }
}

// Create specialized cache instances
const timelineCache = new EnhancedDataCache(50, 600000); // 10 minutes for timeline data
const cityDetailsCache = new EnhancedDataCache(200, 1800000); // 30 minutes for city details
const metadataCache = new EnhancedDataCache(1, 3600000); // 1 hour for metadata
const generalCache = new EnhancedDataCache(100, 300000); // 5 minutes for general data

// ========================================================================
// MAIN CITIES API OBJECT
// ========================================================================

const citiesApi = {
  // ========================================================================
  // TIMELINE AND MAP DATA METHODS
  // ========================================================================

  // Get timeline data for a specific year
  getTimeline: async (year, options = {}) => {
    try {
      const params = new URLSearchParams();

      if (options.bounds) {
        params.append('bounds', options.bounds.join(','));
      }

      if (options.ageFilter && options.ageFilter !== 'all_ages') {
        params.append('ageFilter', options.ageFilter);
      }

      const queryString = params.toString();
      const url = `/cityData/timeline/${year}${queryString ? `?${queryString}` : ''}`;

      const response = await makeRequest(url);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch timeline data' };
    }
  },

  // Get bulk timeline data
  getBulkTimelineData: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (options.bounds) {
        params.append('bounds', options.bounds.join(','));
      }
      if (options.ageFilter && options.ageFilter !== 'all_ages') {
        params.append('ageFilter', options.ageFilter);
      }

      const queryString = params.toString();
      const url = `/cityData/timeline/bulk${queryString ? `?${queryString}` : ''}`;

      const response = await makeRequest(url);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch bulk timeline data' };
    }
  },

  // Get system metadata
  getMetadata: async () => {
    try {
      const response = await makeRequest('/cityData/metadata');
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch system metadata' };
    }
  },

  // Get timeline range
  getTimelineRange: async () => {
    try {
      const response = await makeRequest('/cityData/timeline/range');
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch timeline range' };
    }
  },

  // Get cities for specific time period
  getCitiesForTimePeriod: async (year, options = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('year', year);
      
      if (options.bounds) params.append('bounds', options.bounds.join(','));
      if (options.limit) params.append('limit', options.limit);
      if (options.includeInactive) params.append('includeInactive', options.includeInactive);
      if (options.ageFilter && options.ageFilter !== 'all_ages') {
        params.append('ageFilter', options.ageFilter);
      }

      const queryString = params.toString();
      const url = `/cityData/timeline/period?${queryString}`;

      const response = await makeRequest(url);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch cities for time period' };
    }
  },

  // ========================================================================
  // CITY DATA METHODS
  // ========================================================================

  // Get cities list with filters
  getCitiesList: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.search) params.append('search', options.search);
      if (options.country) params.append('country', options.country);
      if (options.status) params.append('status', options.status);

      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && 
            !['page', 'limit', 'search', 'country', 'status'].includes(key)) {
          params.append(key, value);
        }
      });

      const response = await makeRequest(`/cityData?${params.toString()}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch cities' };
    }
  },

  // Get city details
  getCityDetails: async (cityId) => {
    try {
      const response = await makeRequest(`/cityData/${cityId}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch city details' };
    }
  },

  // Update city (now with access control)
  updateCity: async (cityId, cityData) => {
    try {
      const response = await makeRequest(`/city-creation/${cityId}`, {
        method: 'PUT',
        body: JSON.stringify(cityData)
      });
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to update city' };
    }
  },

  // Update city with image upload (multipart/form-data)
  updateCityWithImage: async (cityId, cityData, imageFile) => {
    try {
      const formData = new FormData();

      // Add image file if provided
      if (imageFile) {
        formData.append('cityImage', imageFile);
      }

      // Add all other fields as JSON strings or direct values
      Object.keys(cityData).forEach(key => {
        if (Array.isArray(cityData[key]) || typeof cityData[key] === 'object') {
          formData.append(key, JSON.stringify(cityData[key]));
        } else if (cityData[key] !== null && cityData[key] !== undefined) {
          formData.append(key, cityData[key]);
        }
      });

      const token = localStorage.getItem('archaeomap_token');
      const response = await fetch(`${API_BASE_URL}/city-creation/${cityId}`, {
        method: 'PUT',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
          // Don't set Content-Type, browser will set it with boundary
        },
        body: formData
      });

      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to update city with image' };
    }
  },

  // ========================================================================
  // CITY CREATION AND VALIDATION
  // ========================================================================

  // Validate city name
  validateCityName: async (cityName, country = null) => {
    try {
      const params = country ? `?country=${encodeURIComponent(country)}` : '';
      const response = await makeRequest(`/city-creation/validate/${encodeURIComponent(cityName)}${params}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to validate city name' };
    }
  },

  // Unified city creation (replaces separate submit/create methods)
  // Contributors: creates pending+draft, Admins: creates approved+passive
  createCity: async (cityData) => {
    try {
      const response = await makeRequest('/city-creation/create', {
        method: 'POST',
        body: JSON.stringify(cityData)
      });
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to create city' };
    }
  },

  // Legacy method - kept for backward compatibility
  submitCityForApproval: async (cityData) => {
    return citiesApi.createCity(cityData);
  },

  // Export city as downloadable JSON file
  exportCity: async (cityId, cityName, country) => {
    try {
      const token = localStorage.getItem('archaeomap_token');
      const response = await fetch(`${API_BASE_URL}/cityData/${cityId}/export`, {
        headers: { ...(token && { Authorization: `Bearer ${token}` }) }
      });

      if (!response.ok) return { success: false, error: 'Export failed' };

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (s) => (s || '').replace(/[^a-zA-Z0-9]/g, '_');
      a.download = `${safeName(country)}_${safeName(cityName)}_${cityId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to export city data' };
    }
  },

  // Import/update city from JSON data (moderator+)
  importCity: async (cityId, jsonData) => {
    try {
      const response = await makeRequest(`/cityData/${cityId}/import`, {
        method: 'PUT',
        body: JSON.stringify(jsonData)
      });
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to import city data' };
    }
  },

  // Delete city (Admin only)
  deleteCity: async (cityId) => {
    try {
      const response = await makeRequest(`/city-creation/${cityId}`, {
        method: 'DELETE'
      });
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to delete city' };
    }
  },

  // ========================================================================
  // SOURCES MANAGEMENT
  // ========================================================================

  // Upload city sources
  uploadCitySources: async (cityId, zipFile) => {
    try {
      const formData = new FormData();
      formData.append('sourcesZip', zipFile);

      const token = localStorage.getItem('archaeomap_token');
      const response = await fetch(`${API_BASE_URL}/city-creation/${cityId}/sources`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: formData
      });

      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to upload sources' };
    }
  },

  // Get city sources info
  getCitySources: async (cityId) => {
    try {
      const response = await makeRequest(`/city-creation/${cityId}/sources`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to get sources info' };
    }
  },

  // ========================================================================
  // MODERATION API METHODS
  // ========================================================================

  // Get cities for moderation (supports new 3-stage workflow)
  getModerationCities: async (status = 'pending', options = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('status', status); // pending, awaiting-admin, approved, rejected
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.submitterId) params.append('submitterId', options.submitterId);

      const response = await makeRequest(`/moderation/cities?${params.toString()}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: `Failed to fetch ${status} cities` };
    }
  },

  // Legacy method - kept for backward compatibility
  getPendingCities: async (options = {}) => {
    return citiesApi.getModerationCities('pending', options);
  },

  // Get city details for moderation review
  getCityForReview: async (cityId) => {
    try {
      const response = await makeRequest(`/moderation/cities/${cityId}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch city for review' };
    }
  },

  // Review city (unified approve/reject for moderators)
  reviewCity: async (cityId, action, comments = null) => {
    try {
      const response = await makeRequest(`/city-creation/${cityId}/review`, {
        method: 'PUT',
        body: JSON.stringify({ action, comments })
      });
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: `Failed to ${action} city` };
    }
  },

  // Legacy methods - kept for backward compatibility
  approveCity: async (cityId, comments = null) => {
    return citiesApi.reviewCity(cityId, 'approve', comments);
  },

  rejectCity: async (cityId, comments) => {
    return citiesApi.reviewCity(cityId, 'reject', comments);
  },

  // NEW: Admin activate city (final step)
  activateCity: async (cityId) => {
    try {
      const response = await makeRequest(`/city-creation/${cityId}/activate`, {
        method: 'PUT'
      });
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to activate city' };
    }
  },

  // Get moderation statistics
  getModerationStats: async (includeUserStats = false) => {
    try {
      const params = includeUserStats ? '?includeUserStats=true' : '';
      const response = await makeRequest(`/moderation/dashboard${params}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch moderation stats' };
    }
  },

  // Get user's own submissions (Contributors)
  getMySubmissions: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);

      const response = await makeRequest(`/moderation/my-submissions?${params.toString()}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to fetch your submissions' };
    }
  },

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  // Get cities by approval status
  getCitiesByStatus: async (status, options = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('status', status);
      
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      if (options.search) params.append('search', options.search);

      const response = await makeRequest(`/cityData?${params.toString()}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: `Failed to fetch ${status} cities` };
    }
  },

  // Search cities with advanced filters
  searchCities: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });

      const response = await makeRequest(`/cityData?${params.toString()}`);
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: 'Failed to search cities' };
    }
  },

  // Get workflow overview (for admins/moderators)
  getWorkflowOverview: async () => {
    try {
      const [pendingResult, statsResult] = await Promise.all([
        citiesApi.getPendingCities({ limit: 5 }),
        citiesApi.getModerationStats(true)
      ]);

      return {
        success: true,
        data: {
          pendingCities: pendingResult.success ? pendingResult.data.cities : [],
          stats: statsResult.success ? statsResult.data : null
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch workflow overview' };
    }
  },

  // Batch operations (Admin only)
  batchOperation: async (operation, cityIds, data = {}) => {
    try {
      const response = await makeRequest('/moderation/batch', {
        method: 'POST',
        body: JSON.stringify({
          operation,
          cityIds,
          ...data
        })
      });
      return await parseResponse(response);
    } catch (error) {
      return { success: false, error: `Failed to perform ${operation} operation` };
    }
  }
};

// ========================================================================
// ENHANCED CACHED API CLASS
// ========================================================================

class CachedCitiesApi {
  constructor() {
    this.timelineCache = timelineCache;
    this.cityDetailsCache = cityDetailsCache;
    this.metadataCache = metadataCache;
    this.generalCache = generalCache;
  }

  getCacheKey(method, params) {
    return `${method}_${JSON.stringify(params)}`;
  }

  async getCachedResult(cache, key, apiCall) {
    const cached = cache.get(key);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await apiCall();
    if (result.success) {
      cache.set(key, result.data);
    }

    return result;
  }

  // ========================================================================
  // TIMELINE METHODS WITH SPECIALIZED CACHING
  // ========================================================================

  async getTimeline(year, options = {}) {
    const cacheKey = `timeline_${year}_${JSON.stringify(options)}`;
    return await this.getCachedResult(
      this.timelineCache,
      cacheKey,
      () => citiesApi.getTimeline(year, options)
    );
  }

  async getBulkTimelineData(options = {}) {
    const cacheKey = `bulk_timeline_${JSON.stringify(options)}`;
    return await this.getCachedResult(
      this.timelineCache,
      cacheKey,
      () => citiesApi.getBulkTimelineData(options)
    );
  }

  async getCitiesForTimePeriod(year, options = {}) {
    const cacheKey = `period_${year}_${JSON.stringify(options)}`;
    return await this.getCachedResult(
      this.timelineCache,
      cacheKey,
      () => citiesApi.getCitiesForTimePeriod(year, options)
    );
  }

  async getTimelineRange() {
    const cacheKey = 'timeline_range';
    return await this.getCachedResult(
      this.metadataCache,
      cacheKey,
      () => citiesApi.getTimelineRange()
    );
  }

  // ========================================================================
  // CITY DATA METHODS WITH CACHING
  // ========================================================================

  async getCitiesList(options = {}) {
    const cacheKey = this.getCacheKey('getCitiesList', options);
    return await this.getCachedResult(
      this.generalCache,
      cacheKey,
      () => citiesApi.getCitiesList(options)
    );
  }

  async getCityDetails(cityId) {
    const cacheKey = `city_${cityId}`;
    return await this.getCachedResult(
      this.cityDetailsCache,
      cacheKey,
      () => citiesApi.getCityDetails(cityId)
    );
  }

  async getMetadata() {
    const cacheKey = 'metadata';
    return await this.getCachedResult(
      this.metadataCache,
      cacheKey,
      () => citiesApi.getMetadata()
    );
  }

  async getModerationStats(includeUserStats = false) {
    const cacheKey = `moderation_stats_${includeUserStats}`;
    return await this.getCachedResult(
      this.generalCache,
      cacheKey,
      () => citiesApi.getModerationStats(includeUserStats)
    );
  }

  // ========================================================================
  // CACHE-INVALIDATING METHODS (Clear relevant caches on updates)
  // ========================================================================

  async submitCityForApproval(cityData) {
    this.clearCitiesCaches();
    return await citiesApi.submitCityForApproval(cityData);
  }

  async createCity(cityData) {
    this.clearCitiesCaches();
    return await citiesApi.createCity(cityData);
  }

  async updateCity(cityId, cityData) {
    this.cityDetailsCache.delete(`city_${cityId}`);
    this.clearCitiesCaches();
    this.timelineCache.clear(); // Timeline data might be affected
    return await citiesApi.updateCity(cityId, cityData);
  }

  async updateCityWithImage(cityId, cityData, imageFile) {
    this.cityDetailsCache.delete(`city_${cityId}`);
    this.clearCitiesCaches();
    this.timelineCache.clear(); // Timeline data might be affected
    return await citiesApi.updateCityWithImage(cityId, cityData, imageFile);
  }

  async reviewCity(cityId, action, comments) {
    this.clearAllCaches();
    return await citiesApi.reviewCity(cityId, action, comments);
  }

  async approveCity(cityId, comments) {
    this.clearAllCaches();
    return await citiesApi.approveCity(cityId, comments);
  }

  async rejectCity(cityId, comments) {
    this.clearAllCaches();
    return await citiesApi.rejectCity(cityId, comments);
  }

  async activateCity(cityId) {
    this.clearAllCaches();
    return await citiesApi.activateCity(cityId);
  }

  async deleteCity(cityId) {
    this.clearAllCaches();
    return await citiesApi.deleteCity(cityId);
  }

  async importCity(cityId, jsonData) {
    this.cityDetailsCache.delete(`city_${cityId}`);
    this.clearCitiesCaches();
    this.timelineCache.clear();
    return await citiesApi.importCity(cityId, jsonData);
  }

  exportCity = citiesApi.exportCity;

  // ========================================================================
  // CACHE MANAGEMENT METHODS
  // ========================================================================

  clearCitiesCaches() {
    this.generalCache.clear();
    this.timelineCache.clear();
  }

  clearAllCaches() {
    this.timelineCache.clear();
    this.cityDetailsCache.clear();
    this.metadataCache.clear();
    this.generalCache.clear();
  }

  clearTimelineCache() {
    this.timelineCache.clear();
  }

  clearCityDetailsCache(cityId = null) {
    if (cityId) {
      this.cityDetailsCache.delete(`city_${cityId}`);
    } else {
      this.cityDetailsCache.clear();
    }
  }

  // ========================================================================
  // FORWARDED METHODS (Non-cached or rarely used)
  // ========================================================================

  validateCityName = citiesApi.validateCityName;
  uploadCitySources = citiesApi.uploadCitySources;
  getCitySources = citiesApi.getCitySources;
  getModerationCities = citiesApi.getModerationCities;
  getPendingCities = citiesApi.getPendingCities;
  getCityForReview = citiesApi.getCityForReview;
  getMySubmissions = citiesApi.getMySubmissions;
  getCitiesByStatus = citiesApi.getCitiesByStatus;
  searchCities = citiesApi.searchCities;
  getWorkflowOverview = citiesApi.getWorkflowOverview;
  batchOperation = citiesApi.batchOperation;

  // Timeline methods (direct forwards for non-cached access)
  getTimelineDirect = citiesApi.getTimeline;
  getBulkTimelineDataDirect = citiesApi.getBulkTimelineData;
  getCitiesForTimePeriodDirect = citiesApi.getCitiesForTimePeriod;
  getTimelineRangeDirect = citiesApi.getTimelineRange;
  getMetadataDirect = citiesApi.getMetadata;
}

// ========================================================================
// CREATE INSTANCES AND EXPORTS
// ========================================================================

// Create the enhanced cached instance
const cachedCitiesApi = new CachedCitiesApi();

// Export cache instances for external access if needed
export { timelineCache, cityDetailsCache, metadataCache, generalCache };

// Main exports
export { citiesApi, cachedCitiesApi };
export default citiesApi;