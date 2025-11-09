//hooks/ui/useNotification.js


import { useCallback, useState } from 'react';
import { NOTIFICATION_DURATION } from '../../config/constants';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const show = useCallback((message, type = 'info', duration = NOTIFICATION_DURATION.MEDIUM) => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), duration);
  }, []);

  const success = useCallback((message) => show(message, 'success', NOTIFICATION_DURATION.SHORT), [show]);
  const error = useCallback((message) => show(message, 'error', NOTIFICATION_DURATION.LONG), [show]);
  const warning = useCallback((message) => show(message, 'warning', NOTIFICATION_DURATION.MEDIUM), [show]);
  const info = useCallback((message) => show(message, 'info', NOTIFICATION_DURATION.MEDIUM), [show]);

  const clear = useCallback(() => setNotification(null), []);

  return { notification, show, success, error, warning, info, clear };
};

export default useNotification;
