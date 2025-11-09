/**
 * Application Constants
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'You don\'t have permission to access this.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'An unknown error occurred. Please try again.'
};

export const CACHE_KEYS = {
  HEALTH_METRICS: 'HEALTH_METRICS',
  WORKOUTS: 'WORKOUTS',
  MOODS: 'MOODS',
  NUTRITION: 'NUTRITION',
  ROUTINES: 'ROUTINES',
  USER_PROFILE: 'USER_PROFILE',
  SETTINGS: 'SETTINGS',
  REPORTS: 'REPORTS'
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'VITALVIBE_AUTH_TOKEN',
  REFRESH_TOKEN: 'VITALVIBE_REFRESH_TOKEN',
  USER_ID: 'VITALVIBE_USER_ID',
  THEME: 'VITALVIBE_THEME',
  SETTINGS: 'VITALVIBE_SETTINGS',
  TERMS_ACCEPTED: 'VITALVIBE_TERMS_ACCEPTED'
};

export const API_RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000,
  BACKOFF_MULTIPLIER: 2
};

export const TIMEOUT_VALUES = {
  SHORT: 5000,     // 5 seconds
  MEDIUM: 15000,   // 15 seconds
  LONG: 30000      // 30 seconds
};

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export const NOTIFICATION_DURATION = {
  SHORT: 2000,
  MEDIUM: 4000,
  LONG: 6000
};

export const DATA_LIMITS = {
  HEALTH_METRICS_DAYS: 365,
  WORKOUTS_DAYS: 365,
  MOODS_DAYS: 90,
  NUTRITION_DAYS: 90,
  CHAT_HISTORY_MONTHS: 12
};

export const HEALTH_GOALS = {
  DAILY_STEPS: 10000,
  DAILY_CALORIES: 2000,
  DAILY_WATER: 2.5, // liters
  DAILY_SLEEP: 8, // hours
  ACTIVE_MINUTES: 150
};

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest'
};

export default {
  HTTP_STATUS,
  ERROR_MESSAGES,
  CACHE_KEYS,
  LOCAL_STORAGE_KEYS,
  API_RETRY_CONFIG,
  TIMEOUT_VALUES,
  NOTIFICATION_TYPES,
  NOTIFICATION_DURATION,
  DATA_LIMITS,
  HEALTH_GOALS,
  THEME_MODES,
  USER_ROLES
};
