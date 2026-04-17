// shared/hooks/useCitySearch.js
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Constants
const SEARCH_DEBOUNCE_MS = 300;
const CITIES_SEARCH_MIN_LENGTH = 2;

export const useCitySearch = () => {
    const { token } = useAuth();
    const [availableCities, setAvailableCities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const debounceRef = useRef(null);

    const searchCities = useCallback(async (query) => {
        if (!query || query.length < CITIES_SEARCH_MIN_LENGTH) {
            setAvailableCities([]);
            setError(null);
            return;
        }

        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        setLoading(true);
        setError(null);

        // Set new timeout for debouncing
        debounceRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/cityData/search?q=${encodeURIComponent(query)}`, 
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
                
                if (response.ok) {
                    const result = await response.json();
                    
                    // Map API data to expected format
                    const mappedCities = (result.cities || []).map(city => ({
                        ...city,
                        generic_city_name: city.generic_city_name || city.name // Fallback to 'name' if generic_city_name is missing
                    }));
                    
                    setAvailableCities(mappedCities);
                } else {
                    console.error('City search failed:', response.status);
                    setAvailableCities([]);
                    setError('Search failed. Please try again.');
                }
            } catch (err) {
                console.error('City search error:', err);
                setAvailableCities([]);
                setError('Search failed. Please check your connection.');
            } finally {
                setLoading(false);
            }
        }, SEARCH_DEBOUNCE_MS);
    }, [token]);

    const clearSearch = useCallback(() => {
        setAvailableCities([]);
        setError(null);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        setLoading(false);
    }, []);

    // Cleanup timeout on unmount
    const cleanup = useCallback(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    }, []);

    return {
        availableCities,
        loading,
        error,
        searchCities,
        clearSearch,
        cleanup
    };
};