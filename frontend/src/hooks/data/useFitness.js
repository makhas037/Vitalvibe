/**
 *  hooks/data/useFitness.js
 * useFitness Hook
 * Fetch and manage fitness/workout data
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useFitness = (days = 7) => {
  const [workouts, setWorkouts] = useState([]);
  const [personalRecords, setPersonalRecords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.FITNESS.GET_WORKOUTS}?days=${days}`,
        {
          useCache: true,
          cacheKey: `${CACHE_KEYS.WORKOUTS}_${days}`,
          cacheDuration: 5 * 60 * 1000
        }
      );

      setWorkouts(response.data || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [days]);

  const fetchPersonalRecords = useCallback(async () => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.FITNESS.GET_PERSONAL_RECORDS,
        { useCache: true, cacheKey: CACHE_KEYS.WORKOUTS }
      );

      setPersonalRecords(response.data || {});
    } catch (err) {
      console.error('Error fetching personal records:', err);
    }
  }, []);

  const createWorkout = useCallback(async (workoutData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.FITNESS.CREATE_WORKOUT,
        workoutData,
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.WORKOUTS}_${days}`);
      await fetchWorkouts();
      await fetchPersonalRecords();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [days, fetchWorkouts, fetchPersonalRecords]);

  const deleteWorkout = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(
        API_CONFIG.ENDPOINTS.FITNESS.DELETE_WORKOUT.replace(':id', id),
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.WORKOUTS}_${days}`);
      await fetchWorkouts();

    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [days, fetchWorkouts]);

  useEffect(() => {
    fetchWorkouts();
    fetchPersonalRecords();
  }, [fetchWorkouts, fetchPersonalRecords]);

  return {
    workouts,
    personalRecords,
    loading,
    error,
    fetchWorkouts,
    fetchPersonalRecords,
    createWorkout,
    deleteWorkout
  };
};

export default useFitness;
