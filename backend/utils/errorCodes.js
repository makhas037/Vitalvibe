// FILE: E:\CLOUD PROJECT\vitalvibe\backend\utils\errorCodes.js
// PURPOSE: Centralized error codes and messages

const ERROR_CODES = {
  // Authentication Errors (1000-1999)
  AUTH_UNAUTHORIZED: {
    code: 1001,
    status: 401,
    message: 'Unauthorized access'
  },
  AUTH_INVALID_TOKEN: {
    code: 1002,
    status: 401,
    message: 'Invalid or expired token'
  },
  AUTH_TOKEN_EXPIRED: {
    code: 1003,
    status: 401,
    message: 'Token has expired'
  },
  AUTH_INVALID_CREDENTIALS: {
    code: 1004,
    status: 401,
    message: 'Invalid email or password'
  },

  // User Errors (2000-2999)
  USER_NOT_FOUND: {
    code: 2001,
    status: 404,
    message: 'User not found'
  },
  USER_EMAIL_EXISTS: {
    code: 2002,
    status: 409,
    message: 'Email already registered'
  },
  USER_INVALID_PASSWORD: {
    code: 2003,
    status: 400,
    message: 'Password does not meet requirements'
  },

  // Validation Errors (3000-3999)
  VALIDATION_ERROR: {
    code: 3001,
    status: 400,
    message: 'Validation error'
  },
  INVALID_EMAIL: {
    code: 3002,
    status: 400,
    message: 'Invalid email format'
  },
  INVALID_PHONE: {
    code: 3003,
    status: 400,
    message: 'Invalid phone format'
  },

  // Resource Errors (4000-4999)
  RESOURCE_NOT_FOUND: {
    code: 4001,
    status: 404,
    message: 'Resource not found'
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 4002,
    status: 409,
    message: 'Resource already exists'
  },

  // Server Errors (5000-5999)
  INTERNAL_SERVER_ERROR: {
    code: 5001,
    status: 500,
    message: 'Internal server error'
  },
  DATABASE_ERROR: {
    code: 5002,
    status: 500,
    message: 'Database error'
  }
};

module.exports = ERROR_CODES;
