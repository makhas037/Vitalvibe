// File: /src/hooks/useHealthAPI.js

import { useState, useEffect, useCallback } from 'react';
import { healthAPIManager } from '../api/HealthAPIManager';

/**
 * Custom hook for managing health API connections and data
 */
export const useHealthAPI = () => {
  const [connectedProviders, setConnectedProviders] = useState([]);
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize all providers
    healthAPIManager.initProvider('fitbit', {
      onDataUpdate: (data) => setHealthData(prev => ({ ...prev, fitbit: data })),
      onError: (err) => setError(err)
    });

    healthAPIManager.initProvider('googleFit', {
      onDataUpdate: (data) => setHealthData(prev => ({ ...prev, googleFit: data })),
      onError: (err) => setError(err)
    });

    // Setup manager callbacks
    healthAPIManager.onProviderChange = (status) => {
      setConnectedProviders(healthAPIManager.getConnectedProviders());
    };

    healthAPIManager.onError = (err) => {
      console.error('API Error:', err);
      setError(err);
    };
  }, []);

  const connectProvider = useCallback(async (providerName) => {
    setLoading(true);
    try {
      await healthAPIManager.connect(providerName);
      setConnectedProviders(healthAPIManager.getConnectedProviders());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnectProvider = useCallback(async (providerName) => {
    try {
      await healthAPIManager.disconnect(providerName);
      setConnectedProviders(healthAPIManager.getConnectedProviders());
    } catch (err) {
      setError(err);
    }
  }, []);

  const fetchData = useCallback(async (providerName, timeRange = 'today') => {
    setLoading(true);
    try {
      const data = await healthAPIManager.getData(providerName, timeRange);
      setHealthData(prev => ({ ...prev, [providerName]: data }));
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAggregatedData = useCallback(async (timeRange = 'today') => {
    setLoading(true);
    try {
      const data = await healthAPIManager.getAggregatedData(timeRange);
      setHealthData(data.data);
      setError(null);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    connectedProviders,
    healthData,
    loading,
    error,
    connectProvider,
    disconnectProvider,
    fetchData,
    fetchAggregatedData,
    getAllStatus: () => healthAPIManager.getAllStatus()
  };
};

export default useHealthAPI;
