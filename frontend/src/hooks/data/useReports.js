/**
 * hooks/data/useReports.js
 * useReports Hook
 * Fetch and manage health reports
 */

import { useState, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useReports = () => {
  const [report, setReport] = useState(null);
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = useCallback(async (timeRange = 'week') => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.REPORTS.GENERATE}?timeRange=${timeRange}`,
        { useCache: false }
      );

      setReport(response.data);
      return response.data;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSavedReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.REPORTS.GET_SAVED,
        {
          useCache: true,
          cacheKey: CACHE_KEYS.REPORTS,
          cacheDuration: 5 * 60 * 1000
        }
      );

      setSavedReports(response.data || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveReport = useCallback(async (reportData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.REPORTS.SAVE_REPORT,
        reportData,
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.REPORTS);
      await getSavedReports();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [getSavedReports]);

  const deleteReport = useCallback(async (reportId) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(
        API_CONFIG.ENDPOINTS.REPORTS.DELETE_REPORT.replace(':id', reportId),
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.REPORTS);
      await getSavedReports();

    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [getSavedReports]);

  return {
    report,
    savedReports,
    loading,
    error,
    generateReport,
    getSavedReports,
    saveReport,
    deleteReport
  };
};

export default useReports;
