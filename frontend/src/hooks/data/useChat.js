/**
 * hooks/data/useChat.js
 * useChat Hook
 * Fetch and manage chat sessions and messages
 */

import { useState, useCallback } from 'react';
import apiClient from '../../api/clients/apiClient';
import { CACHE_KEYS, API_CONFIG } from '../../config/constants';
import ErrorHandler from '../../utils/errors/errorHandler';

export const useChat = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.CHAT.GET_SESSIONS,
        {
          useCache: true,
          cacheKey: CACHE_KEYS.CHAT,
          cacheDuration: 5 * 60 * 1000
        }
      );

      setSessions(response.data || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.CHAT.GET_SESSION.replace(':id', sessionId),
        { useCache: false }
      );

      setCurrentSession(response.data);
      setMessages(response.data?.messages || []);
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = useCallback(async (title) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CHAT.CREATE_SESSION,
        { title },
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.CHAT);
      await fetchSessions();

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [fetchSessions]);

  const logMessage = useCallback(async (sessionId, userMessage, aiMessage) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CHAT.LOG_MESSAGE,
        {
          sessionId,
          userMessage,
          aiMessage
        },
        { useCache: false }
      );

      return response;
    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const deleteSession = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.delete(
        API_CONFIG.ENDPOINTS.CHAT.DELETE_SESSION.replace(':id', sessionId),
        { useCache: false }
      );

      apiClient.clearCache(CACHE_KEYS.CHAT);
      await fetchSessions();

    } catch (err) {
      const errorObj = ErrorHandler.handleAPIError(err);
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [fetchSessions]);

  return {
    sessions,
    currentSession,
    messages,
    loading,
    error,
    fetchSessions,
    getSession,
    createSession,
    logMessage,
    deleteSession
  };
};

export default useChat;
