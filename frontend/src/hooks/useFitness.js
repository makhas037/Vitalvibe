/**
 * FILE: web-app/src/hooks/useFitness.js
 * Custom hook for fitness data
 */

import { useState, useEffect, useCallback } from 'react';
import { workoutService } from '../services';

export const useFitness = (userId) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await workoutService.getByUserId(userId);
      setWorkouts(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return { workouts, loading, error, refetch: fetchWorkouts };
};

export default useFitness;
