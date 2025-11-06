/**
 * FILE: web-app/src/hooks/useMood.js
 * Custom hook for mood tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { moodService } from '../services';

export const useMood = (userId) => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMoods = useCallback(async () => {
    try {
      setLoading(true);
      const response = await moodService.getByUserId(userId);
      setMoods(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  return { moods, loading, error, refetch: fetchMoods };
};

export default useMood;
