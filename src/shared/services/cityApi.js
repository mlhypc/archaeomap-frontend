// src/services/api.js

import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('archaeomap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - handled by AuthContext
      localStorage.removeItem('archaeomap_token');
      localStorage.removeItem('archaeomap_refresh_token');
    }
    return Promise.reject(error);
  }
);

// Cities API service
export const citiesApi = {
  // Get timeline data for a specific year
  async getTimeline(year, options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.bounds) {
        params.append('bounds', options.bounds.join(','));
      }

      if (options.ageFilter && options.ageFilter !== 'all_ages') {
        params.append('ageFilter', options.ageFilter);
      }

      const queryString = params.toString();
      const url = `/cities/timeline/${year}${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Timeline API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch timeline data'
      };
    }
  },

  // Tüm timeline verisini tek seferde çek
  async getBulkTimelineData() {
    try {
      const response = await api.get('/cities/timeline/bulk');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Bulk timeline API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch bulk timeline data'
      };
    }
  },

  // Get detailed city information
  async getCityDetails(cityId) {
    try {
      const response = await api.get(`/cities/${cityId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('City details API error:', error);
      return {
        success: false,
        error: error.response?.status === 404
          ? 'City not found'
          : error.response?.data?.error || 'Failed to fetch city details'
      };
    }
  },

  // Get system metadata
  async getMetadata() {
    try {
      const response = await api.get('/cities/metadata');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Metadata API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch system metadata'
      };
    }
  },

  // Get cities list with filtering
  async getCitiesList(options = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const url = `/cities${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Cities list API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch cities list'
      };
    }
  },

  // Update basic city information
  async updateCity(cityId, cityData) {
    try {
      const response = await api.put(`/cities/${cityId}`, cityData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('City update API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update city'
      };
    }
  }
};

// Cache management for frequently accessed data
class DataCache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutes TTL
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
}

// Create cache instances
export const timelineCache = new DataCache(50, 600000); // 10 minutes for timeline data
export const cityDetailsCache = new DataCache(200, 1800000); // 30 minutes for city details
export const metadataCache = new DataCache(1, 3600000); // 1 hour for metadata

// Enhanced cities API with caching
export const cachedCitiesApi = {
  async getTimeline(year, options = {}) {
    const cacheKey = `timeline_${year}_${JSON.stringify(options)}`;

    const cached = timelineCache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await citiesApi.getTimeline(year, options);
    if (result.success) {
      timelineCache.set(cacheKey, result.data);
    }

    return result;
  },

  async getCityDetails(cityId) {
    const cacheKey = `city_${cityId}`;

    const cached = cityDetailsCache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await citiesApi.getCityDetails(cityId);
    if (result.success) {
      cityDetailsCache.set(cacheKey, result.data);
    }

    return result;
  },

  async getMetadata() {
    const cacheKey = 'metadata';

    const cached = metadataCache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await citiesApi.getMetadata();
    if (result.success) {
      metadataCache.set(cacheKey, result.data);
    }

    return result;
  },

  async getBulkTimelineData() {
    const cacheKey = 'bulk_timeline_data';

    const cached = timelineCache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await citiesApi.getBulkTimelineData();
    if (result.success) {
      // Bulk data'yı 30 dakika cache'le
      timelineCache.set(cacheKey, result.data);
    }

    return result;
  },

  async updateCity(cityId, cityData) {
    // Update işleminde cache'leri temizle
    cityDetailsCache.delete(`city_${cityId}`);
    timelineCache.clear(); // Timeline data etkilenebilir
    
    const result = await citiesApi.updateCity(cityId, cityData);
    return result;
  },
  
  // Create new city
  async createCity(cityData) {
    try {
      const response = await api.post('/city-creation/create', cityData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('City creation API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create city'
      };
    }
  },

  // Validate city name
  async validateCityName(cityName, country = null) {
    try {
      const params = country ? `?country=${encodeURIComponent(country)}` : '';
      const response = await api.get(`/city-creation/validate/${encodeURIComponent(cityName)}${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('City name validation API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to validate city name'
      };
    }
  },

  // Upload sources ZIP file
  async uploadCitySources(cityId, zipFile) {
    try {
      const formData = new FormData();
      formData.append('sourcesZip', zipFile);
      
      const response = await api.post(`/city-creation/${cityId}/sources`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 1 minute timeout for file upload
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Sources upload API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to upload sources'
      };
    }
  },

  // Get city sources info
  async getCitySources(cityId) {
    try {
      const response = await api.get(`/city-creation/${cityId}/sources`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get city sources API error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get city sources'
      };
    }
  },

  // Clear all caches
  clearCache() {
    timelineCache.clear();
    cityDetailsCache.clear();
    metadataCache.clear();
  }
};

export default api;