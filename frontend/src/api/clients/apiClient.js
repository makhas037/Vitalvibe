/**
 * API Client
 * Higher-level API client with retry logic and caching
 */

import httpClient from './httpClient';
import { API_RETRY_CONFIG, CACHE_KEYS } from '../../config/constants';
import cacheService from '../../utils/cache/cacheService';

class APIClient {
  constructor() {
    this.retryConfig = API_RETRY_CONFIG;
  }

  /**
   * Make API request with retry and cache support
   */
  async request(
    method,
    url,
    data = null,
    options = {}
  ) {
    const {
      useCache = true,
      cacheKey = null,
      cacheDuration = 5 * 60 * 1000,
      retries = this.retryConfig.MAX_RETRIES,
      timeout = null
    } = options;

    // Check cache first
    if (useCache && cacheKey && ['GET'].includes(method.toUpperCase())) {
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Make request with retry
    const response = await this._requestWithRetry(
      method,
      url,
      data,
      retries,
      timeout
    );

    // Cache response
    if (useCache && cacheKey && ['GET'].includes(method.toUpperCase())) {
      cacheService.set(cacheKey, response, cacheDuration);
    }

    return response;
  }

  /**
   * Request with exponential backoff retry
   */
  async _requestWithRetry(
    method,
    url,
    data,
    attemptsLeft,
    timeout = null
  ) {
    try {
      return await httpClient({
        method,
        url,
        data,
        ...(timeout && { timeout })
      });
    } catch (error) {
      if (
        attemptsLeft > 0 &&
        this._shouldRetry(error)
      ) {
        const delay = this._getBackoffDelay(
          this.retryConfig.MAX_RETRIES - attemptsLeft
        );
        await this._sleep(delay);
        return this._requestWithRetry(
          method,
          url,
          data,
          attemptsLeft - 1,
          timeout
        );
      }
      throw error;
    }
  }

  /**
   * Determine if request should be retried
   */
  _shouldRetry(error) {
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    return (
      error.status && retryableStatusCodes.includes(error.status)
    ) || error.message === 'Network Error';
  }

  /**
   * Calculate exponential backoff delay
   */
  _getBackoffDelay(attemptNumber) {
    const delay =
      this.retryConfig.INITIAL_DELAY *
      Math.pow(this.retryConfig.BACKOFF_MULTIPLIER, attemptNumber);
    
    return Math.min(delay, this.retryConfig.MAX_DELAY);
  }

  /**
   * Sleep helper
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  get(url, options = {}) {
    return this.request('GET', url, null, options);
  }

  /**
   * POST request
   */
  post(url, data, options = {}) {
    return this.request('POST', url, data, options);
  }

  /**
   * PUT request
   */
  put(url, data, options = {}) {
    return this.request('PUT', url, data, options);
  }

  /**
   * DELETE request
   */
  delete(url, options = {}) {
    return this.request('DELETE', url, null, options);
  }

  /**
   * Clear specific cache
   */
  clearCache(cacheKey) {
    cacheService.remove(cacheKey);
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    cacheService.clear();
  }
}

export default new APIClient();
