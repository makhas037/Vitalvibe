// hooks/ui/useLoading.js

import { useState, useCallback } from 'react';

export const useLoading = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  const toggleLoading = useCallback(() => setLoading(prev => !prev), []);

  const withLoading = useCallback(async (fn) => {
    startLoading();
    try {
      return await fn();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return { loading, startLoading, stopLoading, toggleLoading, withLoading };
};

export default useLoading;
