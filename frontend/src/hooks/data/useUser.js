/**
 *  hooks/data/useUser.js
 * useUser Hook
 * Fetch and manage user profile data
 */

import { useState, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useUser = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.USER.GET_PROFILE,
        {
          useCache: true,
          cacheKey: CACHE_KEYS.USER_PROFILE,
          cacheDuration: 10 * 60 * 1000
        }
      );

      setProfile(response.data);
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
        API_CONFIG.ENDPOINTS.USER.GET_STATS,
        { useCache: true, cacheKey: CACHE_KEYS.USER_PROFILE }
      );

      setStats(response.data);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  }, []);

  const fetchAchievements = useCallback(async () => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.USER.GET_ACHIEVEMENTS,
        { useCache: true, cacheKey: CACHE_KEYS.USER_PROFILE }
      );

      setAchievements(response.data || []);
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(
        API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE,
        profileData,
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.USER_PROFILE);
      await fetchProfile();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [fetchProfile]);

  return {
    profile,
    stats,
    achievements,
    loading,
    error,
    fetchProfile,
    fetchStats,
    fetchAchievements,
    updateProfile
  };
};

export default useUser;
