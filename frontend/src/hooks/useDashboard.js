import { useState, useEffect, useCallback } from 'react';
import { healthMetricsService, moodService } from '../services';

export const useDashboard = () => {
  const userId = 'demo-user';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [metrics, moods] = await Promise.all([
        healthMetricsService.getRecent(userId, 7).catch(() => ({ data: [] })),
        moodService.getByUserId(userId).catch(() => ({ data: [] }))
      ]);
      setData({ healthMetrics: metrics.data || [], moods: moods.data || [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { data, loading, error, refetch: fetchDashboardData };
};

export default useDashboard;