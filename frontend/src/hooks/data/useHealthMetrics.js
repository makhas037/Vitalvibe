/**
 * hooks/data/useHealthMetrics.js
 * useHealthMetrics Hook
 * Fetch and manage health metrics data
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useHealthMetrics = (days = 7) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.HEALTH.GET_METRICS}?days=${days}`,
        {
          useCache: true,
          cacheKey: `${CACHE_KEYS.HEALTH_METRICS}_${days}`,
          cacheDuration: 5 * 60 * 1000
        }
      );

      setData(response.data || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [days]);

  const createMetric = useCallback(async (metricData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.HEALTH.CREATE_METRIC,
        metricData,
        { useCache: false }
      );

      // Invalidate cache
      apiClient.clearCache(`${CACHE_KEYS.HEALTH_METRICS}_${days}`);

      // Refetch
      await fetchMetrics();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [days, fetchMetrics]);

  const updateMetric = useCallback(async (id, metricData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.HEALTH.UPDATE_METRIC.replace(':id', id),
        metricData,
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.HEALTH_METRICS}_${days}`);
      await fetchMetrics();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [days, fetchMetrics]);

  const deleteMetric = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(
        API_CONFIG.ENDPOINTS.HEALTH.DELETE_METRIC.replace(':id', id),
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.HEALTH_METRICS}_${days}`);
      await fetchMetrics();
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [days, fetchMetrics]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    data,
    loading,
    error,
    fetchMetrics,
    createMetric,
    updateMetric,
    deleteMetric
  };
};

export default useHealthMetrics;
