/**
 * hooks/data/useMood.js
 * useMood Hook
 * Fetch and manage mood data
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useMood = (days = 30) => {
  const [moods, setMoods] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.MOOD.GET_MOODS}?days=${days}`,
        {
          useCache: true,
          cacheKey: `${CACHE_KEYS.MOODS}_${days}`,
          cacheDuration: 5 * 60 * 1000
        }
      );

      setMoods(response.data || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [days]);

  const fetchTriggers = useCallback(async () => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.MOOD.GET_TRIGGERS,
        { useCache: true, cacheKey: CACHE_KEYS.MOODS }
      );

      setTriggers(response.data || []);
    } catch (err) {
      console.error('Error fetching triggers:', err);
    }
  }, []);

  const createMood = useCallback(async (moodData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.MOOD.CREATE_MOOD,
        moodData,
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.MOODS}_${days}`);
      await fetchMoods();
      await fetchTriggers();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [days, fetchMoods, fetchTriggers]);

  const deleteMood = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(
        API_CONFIG.ENDPOINTS.MOOD.DELETE_MOOD.replace(':id', id),
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.MOODS}_${days}`);
      await fetchMoods();

    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [days, fetchMoods]);

  useEffect(() => {
    fetchMoods();
    fetchTriggers();
  }, [fetchMoods, fetchTriggers]);

  return {
    moods,
    triggers,
    loading,
    error,
    fetchMoods,
    fetchTriggers,
    createMood,
    deleteMood
  };
};

export default useMood;
