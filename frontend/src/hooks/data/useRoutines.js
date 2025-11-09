/**
 *  hooks/data/useRoutines.js
 * useRoutines Hook
 * Fetch and manage routines data
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useRoutines = () => {
  const [routines, setRoutines] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.ROUTINE.GET_ROUTINES,
        {
          useCache: true,
          cacheKey: CACHE_KEYS.ROUTINES,
          cacheDuration: 5 * 60 * 1000
        }
      );

      setRoutines(response.data || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.ROUTINE.GET_STATS,
        { useCache: true, cacheKey: CACHE_KEYS.ROUTINES }
      );

      setStats(response.data || {});
    } catch (err) {
      console.error('Error fetching routine stats:', err);
    }
  }, []);

  const createRoutine = useCallback(async (routineData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.ROUTINE.CREATE_ROUTINE,
        routineData,
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.ROUTINES);
      await fetchRoutines();
      await fetchStats();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [fetchRoutines, fetchStats]);

  const updateRoutine = useCallback(async (id, routineData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.ROUTINE.UPDATE_ROUTINE.replace(':id', id),
        routineData,
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.ROUTINES);
      await fetchRoutines();
      await fetchStats();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [fetchRoutines, fetchStats]);

  const deleteRoutine = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(
        API_CONFIG.ENDPOINTS.ROUTINE.DELETE_ROUTINE.replace(':id', id),
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.ROUTINES);
      await fetchRoutines();
      await fetchStats();

    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [fetchRoutines, fetchStats]);

  useEffect(() => {
    fetchRoutines();
    fetchStats();
  }, [fetchRoutines, fetchStats]);

  return {
    routines,
    stats,
    loading,
    error,
    fetchRoutines,
    fetchStats,
    createRoutine,
    updateRoutine,
    deleteRoutine
  };
};

export default useRoutines;
