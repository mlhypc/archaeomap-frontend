// archaeomap-frontend/src/shared/services/userInteractionsApi.js

import axios from 'axios';

// API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const userInteractionsApi = axios.create({
  baseURL: `${API_BASE_URL}/user-interactions`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token to headers
userInteractionsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('archaeomap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
userInteractionsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - auth context will handle this
      localStorage.removeItem('archaeomap_token');
      localStorage.removeItem('archaeomap_refresh_token');
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// CITY LIKE/UNLIKE API FUNCTIONS
// ============================================================================

export const likeApi = {
  /**
   * Toggle like/unlike for a city
   * @param {number} cityId - The city ID to like/unlike
   * @returns {Promise<Object>} Response with success, liked status, and likes count
   */
  async toggleCityLike(cityId) {
    try {
      const response = await userInteractionsApi.post(`/cityData/${cityId}/like`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Toggle city like error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to like cities',
          needsAuth: true
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: 'City not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to like/unlike city'
      };
    }
  },

  /**
   * Get like status for a specific city
   * @param {number} cityId - The city ID to check
   * @returns {Promise<Object>} Response with liked status and total likes count
   */
  async getCityLikeStatus(cityId) {
    try {
      const response = await userInteractionsApi.get(`/cityData/${cityId}/like-status`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get city like status error:', error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'City not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get like status'
      };
    }
  },

  /**
   * Get user's liked cities with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @param {string} sortBy - Sort order: 'recent', 'alphabetical', 'oldest' (default: 'recent')
   * @returns {Promise<Object>} Response with liked cities and pagination info
   */
  async getUserLikedCities(page = 1, limit = 20, sortBy = 'recent') {
    try {
      const response = await userInteractionsApi.get('/liked-cities', {
        params: { page, limit, sortBy }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get user liked cities error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to view your liked cities',
          needsAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get liked cities'
      };
    }
  },

  /**
   * Get user interaction statistics
   * @returns {Promise<Object>} Response with user stats (total likes, dates, etc.)
   */
  async getUserStats() {
    try {
      const response = await userInteractionsApi.get('/stats');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to view statistics',
          needsAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user statistics'
      };
    }
  }
};

// ============================================================================
// CITY COLLECTIONS API FUNCTIONS
// ============================================================================

export const collectionsApi = {
  /**
   * Get user's collections
   * @returns {Promise<Object>} Response with collections list
   */
  async getUserCollections() {
    try {
      const response = await userInteractionsApi.get('/collections');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get user collections error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to view collections',
          needsAuth: true
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get collections'
      };
    }
  },

  /**
   * Create a new collection
   * @param {Object} collectionData - Collection data (name, description, isPublic)
   * @returns {Promise<Object>} Response with created collection
   */
  async createCollection(collectionData) {
    try {
      const response = await userInteractionsApi.post('/collections', collectionData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Create collection error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to create collections',
          needsAuth: true
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.details?.[0]?.msg || 'Invalid collection data'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create collection'
      };
    }
  },

  /**
   * Get specific collection by ID
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Response with collection data
   */
  async getCollection(collectionId) {
    try {
      const response = await userInteractionsApi.get(`/collections/${collectionId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get collection error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentication required',
          needsAuth: true
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          error: 'Access denied'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Collection not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get collection'
      };
    }
  },

  /**
   * Update collection
   * @param {number} collectionId - Collection ID
   * @param {Object} updateData - Updated collection data
   * @returns {Promise<Object>} Response with updated collection
   */
  async updateCollection(collectionId, updateData) {
    try {
      const response = await userInteractionsApi.put(`/collections/${collectionId}`, updateData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Update collection error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to update collections',
          needsAuth: true
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You can only edit your own collections'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Collection not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update collection'
      };
    }
  },

  /**
   * Delete collection
   * @param {number} collectionId - Collection ID
   * @returns {Promise<Object>} Response confirming deletion
   */
  async deleteCollection(collectionId) {
    try {
      const response = await userInteractionsApi.delete(`/collections/${collectionId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Delete collection error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to delete collections',
          needsAuth: true
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You can only delete your own collections'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Collection not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete collection'
      };
    }
  },

  /**
   * Add city to collection
   * @param {number} collectionId - Collection ID
   * @param {number} cityId - City ID
   * @param {string} notes - Optional notes about the city
   * @returns {Promise<Object>} Response confirming city addition
   */
  async addCityToCollection(collectionId, cityId, notes = '') {
    try {
      const response = await userInteractionsApi.post(`/collections/${collectionId}/cities`, {
        cityId,
        notes
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Add city to collection error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to add cities to collections',
          needsAuth: true
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You can only add cities to your own collections'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: error.response?.data?.error || 'Collection or city not found'
        };
      } else if (error.response?.status === 409) {
        return {
          success: false,
          error: 'City is already in this collection'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add city to collection'
      };
    }
  },

  /**
   * Remove city from collection
   * @param {number} collectionId - Collection ID
   * @param {number} cityId - City ID
   * @returns {Promise<Object>} Response confirming city removal
   */
  async removeCityFromCollection(collectionId, cityId) {
    try {
      const response = await userInteractionsApi.delete(`/collections/${collectionId}/cities/${cityId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Remove city from collection error:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'You must be logged in to remove cities from collections',
          needsAuth: true
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          error: 'You can only remove cities from your own collections'
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Collection or city not found'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove city from collection'
      };
    }
  },

  /**
   * Toggle city in collection (add if not present, remove if present)
   * @param {number} collectionId - Collection ID
   * @param {number} cityId - City ID
   * @returns {Promise<Object>} Response with action taken
   */
  async toggleCityInCollection(collectionId, cityId) {
    try {
      // First check if city is in collection by getting collection data
      const collectionResult = await this.getCollection(collectionId);
      if (!collectionResult.success) {
        return collectionResult;
      }

      const collection = collectionResult.data.collection;
      const cityInCollection = collection.cities?.some(
        city => (city.id || city._id?.toString()) === cityId.toString()
      ) || false;

      if (cityInCollection) {
        // Remove city from collection
        const result = await this.removeCityFromCollection(collectionId, cityId);
        if (result.success) {
          return {
            success: true,
            data: {
              action: 'removed',
              message: result.data.message,
              liked: false,
              likesCount: collection.city_count - 1
            }
          };
        }
        return result;
      } else {
        // Add city to collection
        const result = await this.addCityToCollection(collectionId, cityId);
        if (result.success) {
          return {
            success: true,
            data: {
              action: 'added',
              message: result.data.message,
              liked: true,
              likesCount: collection.city_count + 1
            }
          };
        }
        return result;
      }
    } catch (error) {
      console.error('Toggle city in collection error:', error);
      return {
        success: false,
        error: 'Failed to toggle city in collection'
      };
    }
  },

  /**
   * Get cities that belong to a collection for a specific city
   * @param {number} cityId - City ID to check
   * @returns {Promise<Object>} Response with collections that contain this city
   */
  async getCityCollections(cityId) {
    try {
      const collectionsResult = await this.getUserCollections();
      if (!collectionsResult.success) {
        return collectionsResult;
      }

      const cityCollections = collectionsResult.data.collections
        .filter(collection => collection.cityIds?.includes(cityId.toString()))
        .map(collection => ({
          id: collection.id || collection._id?.toString(),
          name: collection.name,
          description: collection.description,
          citiesCount: collection.city_count
        }));

      return {
        success: true,
        data: {
          collections: cityCollections
        }
      };
    } catch (error) {
      console.error('Get city collections error:', error);
      return {
        success: false,
        error: 'Failed to get city collections'
      };
    }
  },

  /**
   * Get public featured collections
   * @returns {Promise<Object>} Response with public collections
   */
  async getPublicCollections() {
    try {
      const response = await userInteractionsApi.get('/collections/public/featured');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get public collections error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get public collections'
      };
    }
  }
};

// ============================================================================
// PUBLIC CITY DATA API FUNCTIONS
// ============================================================================

export const popularityApi = {
  /**
   * Get most popular cities (public endpoint)
   * @param {number} limit - Number of cities to return (default: 10)
   * @param {string} timeframe - Time period: 'all', 'year', 'month', 'week' (default: 'all')
   * @returns {Promise<Object>} Response with popular cities list
   */
  async getPopularCities(limit = 10, timeframe = 'all') {
    try {
      const response = await userInteractionsApi.get('/popular-cities', {
        params: { limit, timeframe }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get popular cities error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get popular cities'
      };
    }
  }
};

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

class UserInteractionsCache {
  constructor(maxSize = 50, ttl = 300000) { // 5 minutes TTL
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

  invalidateUser() {
    // Clear all user-specific cache entries
    Array.from(this.cache.keys()).forEach(key => {
      if (key.startsWith('user_') || key.startsWith('liked_cities_')) {
        this.cache.delete(key);
      }
    });
  }
}

// Create cache instance
export const userInteractionsCache = new UserInteractionsCache();

// ============================================================================
// CACHED API FUNCTIONS
// ============================================================================

export const cachedLikeApi = {
  async toggleCityLike(cityId) {
    // Clear related cache entries since like status changed
    userInteractionsCache.clear();
    
    const result = await likeApi.toggleCityLike(cityId);
    return result;
  },

  async getCityLikeStatus(cityId) {
    const cacheKey = `like_status_${cityId}`;
    
    const cached = userInteractionsCache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await likeApi.getCityLikeStatus(cityId);
    if (result.success) {
      userInteractionsCache.set(cacheKey, result.data);
    }

    return result;
  },

  async getUserLikedCities(page = 1, limit = 20, sortBy = 'recent') {
    const cacheKey = `liked_cities_${page}_${limit}_${sortBy}`;
    
    const cached = userInteractionsCache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await likeApi.getUserLikedCities(page, limit, sortBy);
    if (result.success) {
      userInteractionsCache.set(cacheKey, result.data);
    }

    return result;
  },

  async getUserStats() {
    const cacheKey = 'user_stats';
    
    const cached = userInteractionsCache.get(cacheKey);
    if (cached) {
      return { success: true, data: cached };
    }

    const result = await likeApi.getUserStats();
    if (result.success) {
      userInteractionsCache.set(cacheKey, result.data);
    }

    return result;
  }
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

const userInteractionsExports = {
  likeApi,
  collectionsApi,
  popularityApi,
  cachedLikeApi,
  userInteractionsCache
};

export default userInteractionsExports;