/**
 * hooks/data/useNutrition.js
 * useNutrition Hook
 * Fetch and manage nutrition/meal data
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useNutrition = (date) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = date ? `?date=${date}` : '';
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.NUTRITION.GET_MEALS}${query}`,
        {
          useCache: true,
          cacheKey: `${CACHE_KEYS.NUTRITION}_${date}`,
          cacheDuration: 5 * 60 * 1000
        }
      );

      setMeals(response.data || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, [date]);

  const searchFood = useCallback(async (query) => {
    try {
      setError(null);

      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.NUTRITION.SEARCH_FOOD}?q=${query}`,
        { useCache: false }
      );

      setSearchResults(response.data || []);
      return response.data;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const createMeal = useCallback(async (mealData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.NUTRITION.CREATE_MEAL,
        mealData,
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.NUTRITION}_${date}`);
      await fetchMeals();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [date, fetchMeals]);

  const deleteMeal = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(
        API_CONFIG.ENDPOINTS.NUTRITION.DELETE_MEAL.replace(':id', id),
        { useCache: false }
      );

      apiClient.clearCache(`${CACHE_KEYS.NUTRITION}_${date}`);
      await fetchMeals();

    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [date, fetchMeals]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return {
    meals,
    searchResults,
    loading,
    error,
    fetchMeals,
    searchFood,
    createMeal,
    deleteMeal
  };
};

export default useNutrition;
