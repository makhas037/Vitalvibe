// FILE: E:\CLOUD PROJECT\vitalvibe\backend\config\constants.js
// PURPOSE: Application-wide constants

module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    GUEST: 'guest'
  },

  // Data Limits
  LIMITS: {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    MAX_REQUEST_BODY: '50mb',
    MAX_ITEMS_PER_PAGE: 100,
    DEFAULT_PAGE_SIZE: 20
  },

  // Cache Duration (in milliseconds)
  CACHE_DURATION: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 15 * 60 * 1000, // 15 minutes
    LONG: 60 * 60 * 1000 // 1 hour
  },

  // JWT
  JWT: {
    EXPIRY: '7d',
    REFRESH_EXPIRY: '30d',
    ALGORITHM: 'HS256'
  },

  // Error Messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_TOKEN: 'Invalid or expired token',
    USER_NOT_FOUND: 'User not found',
    EMAIL_EXISTS: 'Email already registered',
    INVALID_CREDENTIALS: 'Invalid email or password',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error'
  },

  // Workout Types
  WORKOUT_TYPES: ['running', 'cycling', 'swimming', 'walking', 'gym', 'yoga', 'sports', 'other'],

  // Mood Types
  MOOD_TYPES: ['happy', 'sad', 'anxious', 'calm', 'energetic', 'tired', 'stressed', 'neutral'],

  // Meal Types
  MEAL_TYPES: ['breakfast', 'lunch', 'dinner', 'snack'],

  // Routine Frequencies
  ROUTINE_FREQUENCIES: ['daily', 'weekly', 'monthly']
};
