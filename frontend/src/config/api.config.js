// FILE: E:\CLOUD PROJECT\vitalvibe\frontend\src\config\api.config.js
// PURPOSE: API Configuration for Vite

const API_CONFIG = {
  // Base URL - Use Vite's import.meta.env instead of process.env
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Request settings
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  CACHE_ENABLED: true,
  
  // Endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify',
      DELETE: '/auth/delete-account'
    },
    
    // Health Metrics
    HEALTH: {
      GET_METRICS: '/health-metrics',
      CREATE_METRIC: '/health-metrics',
      UPDATE_METRIC: '/health-metrics/:id',
      DELETE_METRIC: '/health-metrics/:id'
    },
    
    // Fitness
    FITNESS: {
      GET_WORKOUTS: '/workouts',
      CREATE_WORKOUT: '/workouts',
      UPDATE_WORKOUT: '/workouts/:id',
      DELETE_WORKOUT: '/workouts/:id',
      GET_PERSONAL_RECORDS: '/workouts/records'
    },
    
    // Mood
    MOOD: {
      GET_MOODS: '/moods',
      CREATE_MOOD: '/moods',
      UPDATE_MOOD: '/moods/:id',
      DELETE_MOOD: '/moods/:id',
      GET_TRIGGERS: '/moods/triggers'
    },
    
    // Nutrition
    NUTRITION: {
      GET_MEALS: '/nutrition',
      CREATE_MEAL: '/nutrition',
      UPDATE_MEAL: '/nutrition/:id',
      DELETE_MEAL: '/nutrition/:id',
      SEARCH_FOOD: '/nutrition/search'
    },
    
    // Routines
    ROUTINE: {
      GET_ROUTINES: '/routines',
      CREATE_ROUTINE: '/routines',
      UPDATE_ROUTINE: '/routines/:id',
      DELETE_ROUTINE: '/routines/:id',
      GET_STATS: '/routines/stats'
    },
    
    // Chat/Symptom Checker
    CHAT: {
      GET_SESSIONS: '/chat/sessions',
      GET_SESSION: '/chat/sessions/:id',
      CREATE_SESSION: '/chat/sessions',
      DELETE_SESSION: '/chat/sessions/:id',
      LOG_MESSAGE: '/chat/messages'
    },
    
    // Diagnosis
    DIAGNOSIS: {
      DIAGNOSE: '/symptoms/diagnose'
    },
    
    // Reports
    REPORTS: {
      GENERATE: '/reports/generate',
      GET_SAVED: '/reports',
      SAVE_REPORT: '/reports',
      DELETE_REPORT: '/reports/:id'
    },
    
    // User Profile
    USER: {
      GET_PROFILE: '/users/profile',
      UPDATE_PROFILE: '/users/profile',
      GET_ACHIEVEMENTS: '/users/achievements',
      GET_STATS: '/users/stats'
    },
    
    // Settings
    SETTINGS: {
      GET: '/settings',
      UPDATE: '/settings',
      RESET: '/settings/reset',
      CLEAR_DATA: '/settings/clear-data',
      GET_STATISTICS: '/settings/statistics'
    },
    
    // Privacy
    PRIVACY: {
      GET_SETTINGS: '/privacy',
      UPDATE_SETTINGS: '/privacy',
      EXPORT_DATA: '/privacy/export',
      GET_DATA_STATS: '/privacy/statistics'
    }
  },

  // HTTP Headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Status codes to retry
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],

  // Public endpoints (no auth required)
  PUBLIC_ENDPOINTS: [
    '/auth/login',
    '/auth/register',
    '/about'
  ]
};

export default API_CONFIG;
