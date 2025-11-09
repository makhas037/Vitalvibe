/**
 * utils/errors/errorHandler.js
 * Error Handler
 * Centralized error handling
 */

import { ERROR_MESSAGES, HTTP_STATUS } from '../../config/constants';

class ErrorHandler {
  /**
   * Handle API error
   */
  static handleAPIError(error) {
    if (!error) {
      return {
        message: ERROR_MESSAGES.UNKNOWN_ERROR,
        code: 'UNKNOWN_ERROR'
      };
    }

    // Network error
    if (!error.status && error.message === 'Network Error') {
      return {
        message: ERROR_MESSAGES.NETWORK_ERROR,
        code: 'NETWORK_ERROR'
      };
    }

    // Timeout
    if (error.code === 'ECONNABORTED') {
      return {
        message: ERROR_MESSAGES.TIMEOUT,
        code: 'TIMEOUT'
      };
    }

    // HTTP Status errors
    switch (error.status) {
      case HTTP_STATUS.BAD_REQUEST:
        return {
          message: error.message || ERROR_MESSAGES.VALIDATION_ERROR,
          code: 'BAD_REQUEST'
        };

      case HTTP_STATUS.UNAUTHORIZED:
        return {
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'UNAUTHORIZED'
        };

      case HTTP_STATUS.FORBIDDEN:
        return {
          message: ERROR_MESSAGES.FORBIDDEN,
          code: 'FORBIDDEN'
        };

      case HTTP_STATUS.NOT_FOUND:
        return {
          message: ERROR_MESSAGES.NOT_FOUND,
          code: 'NOT_FOUND'
        };

      case HTTP_STATUS.RATE_LIMIT:
        return {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT'
        };

      case HTTP_STATUS.SERVER_ERROR:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return {
          message: ERROR_MESSAGES.SERVER_ERROR,
          code: 'SERVER_ERROR'
        };

      default:
        return {
          message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          code: 'UNKNOWN_ERROR'
        };
    }
  }

  /**
   * Handle form validation error
   */
  static handleValidationError(errors) {
    if (typeof errors === 'string') {
      return errors;
    }

    if (Array.isArray(errors)) {
      return errors[0];
    }

    if (typeof errors === 'object') {
      return Object.values(errors)[0];
    }

    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  /**
   * Log error
   */
  static log(error, context = '') {
    const errorData = {
      timestamp: new Date().toISOString(),
      context,
      ...error
    };

    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Error:', errorData);
    }

    // Could send to error tracking service (Sentry, etc.)
  }
}

export default ErrorHandler;
