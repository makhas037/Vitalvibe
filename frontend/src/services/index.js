import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

const getDemoUser = () => 'demo-user';

// ✅ HEALTH METRICS SERVICE
export const healthMetricsService = {
  getRecent: (userId = getDemoUser(), days = 7) =>
    apiClient.get(`/health-metrics/${userId}?days=${days}`),
  getByDateRange: (userId = getDemoUser(), startDate, endDate) =>
    apiClient.get(`/health-metrics/${userId}?start=${startDate}&end=${endDate}`),
  create: (data) => apiClient.post('/health-metrics', { ...data, userId: getDemoUser() }),
  delete: (id) => apiClient.delete(`/health-metrics/${id}`)
};

// ✅ MOOD SERVICE
export const moodService = {
  getByUserId: (userId = getDemoUser()) => apiClient.get(`/moods/${userId}`),
  getByDateRange: (userId = getDemoUser(), startDate, endDate) =>
    apiClient.get(`/moods/${userId}?start=${startDate}&end=${endDate}`),
  create: (data) => apiClient.post('/moods', { 
    ...data, 
    userId: getDemoUser(),
    mood: String(data.mood).toLowerCase()
  }),
  delete: (id) => apiClient.delete(`/moods/${id}`)
};

// ✅ WORKOUT SERVICE
export const workoutService = {
  getByUserId: (userId = getDemoUser()) => apiClient.get(`/workouts/${userId}`),
  getByDateRange: (userId = getDemoUser(), startDate, endDate) =>
    apiClient.get(`/workouts/${userId}?start=${startDate}&end=${endDate}`),
  create: (data) => apiClient.post('/workouts', { 
    ...data, 
    userId: getDemoUser(),
    startTime: data.date || new Date(),
    name: data.type || 'Workout'
  }),
  delete: (id) => apiClient.delete(`/workouts/${id}`)
};

// ✅ NUTRITION SERVICE
export const nutritionService = {
  getByUserId: (userId = getDemoUser(), date) => 
    apiClient.get(`/nutrition/${userId}?date=${date}`),
  getDailyNutrition: (userId = getDemoUser(), date) =>
    apiClient.get(`/nutrition/${userId}?date=${date}`),
  getByDateRange: (userId = getDemoUser(), startDate, endDate) =>
    apiClient.get(`/nutrition/${userId}?start=${startDate}&end=${endDate}`),
  create: (data) => apiClient.post('/nutrition', { 
    ...data, 
    userId: getDemoUser(),
    date: data.date || new Date()
  }),
  delete: (id) => apiClient.delete(`/nutrition/${id}`)
};

// ✅ ROUTINE SERVICE
export const routineService = {
  getAll: (userId = getDemoUser()) => apiClient.get(`/routines?userId=${userId}`),
  getActive: (userId = getDemoUser()) => apiClient.get(`/routines?userId=${userId}&active=true`),
  getActiveRoutines: (userId = getDemoUser()) => apiClient.get(`/routines?userId=${userId}`),
  getById: (id) => apiClient.get(`/routines/${id}`),
  create: (data) => apiClient.post('/routines', { 
    ...data, 
    userId: getDemoUser()
  }),
  addRoutine: (data) => apiClient.post('/routines', { 
    ...data, 
    userId: getDemoUser()
  }),
  update: (id, data) => apiClient.put(`/routines/${id}`, data),
  delete: (id) => apiClient.delete(`/routines/${id}`),
  toggleActivity: (routineId, activityId) =>
    apiClient.put(`/routines/${routineId}/toggle/${activityId}`, {})
};

// ✅ SYMPTOM SERVICE
export const symptomService = {
  diagnose: (symptoms, sessionId) => {
    const symptomsArray = Array.isArray(symptoms) ? symptoms : [String(symptoms)];
    return apiClient.post('/symptoms/diagnose', { 
      symptoms: symptomsArray,
      sessionId: sessionId,
      userId: getDemoUser()
    });
  },

};

// ✅ NOTIFICATION SERVICE
export const notificationService = {
  getByUserId: (userId = getDemoUser()) => apiClient.get(`/notifications/${userId}`),
  getAll: () => apiClient.get('/notifications'),
  create: (data) => apiClient.post('/notifications', { ...data, userId: getDemoUser() }),
  markAsRead: (id) => apiClient.put(`/notifications/${id}/read`, {}),
  delete: (id) => apiClient.delete(`/notifications/${id}`)
};

// ✅ CHAT SERVICE
export const chatService = {
  getSessions: (userId = getDemoUser()) => apiClient.get(`/chat/sessions/${userId}`),
  createSession: (userId = getDemoUser(), title) => 
    apiClient.post('/chat/sessions', { userId, title }),
  getSession: (sessionId) => apiClient.get(`/chat/session/${sessionId}`),
  logMessage: (sessionId, userMessage, aiResponse) =>
    apiClient.post('/chat/log', { sessionId, userMessage, aiResponse }),
  deleteSession: (sessionId) => apiClient.delete(`/chat/session/${sessionId}`)
};

// ✅ AUTH SERVICE
export const authService = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => { localStorage.removeItem('user'); },
  getProfile: () => apiClient.get(`/users/${getDemoUser()}`)
};

// ✅ USER SERVICE
export const userService = {
  getProfile: (userId = getDemoUser()) => apiClient.get(`/users/${userId}`),
  updateProfile: (userId = getDemoUser(), data) => apiClient.put(`/users/${userId}`, data)
};

// ✅ INITIALIZE SERVICES
export const initializeServices = () => {
  console.log('✅ VitalVibe Services initialized');
  console.log('🔗 API Base:', API_BASE);
  
  if (!localStorage.getItem('user')) {
    localStorage.setItem('user', JSON.stringify({ 
      _id: 'demo-user', 
      name: 'Demo User',
      email: 'demo@vitalvibe.com'
    }));
  }
};

// ✅ DEFAULT EXPORT
export default {
  authService,
  healthMetricsService,
  moodService,
  workoutService,
  nutritionService,
  routineService,
  symptomService,
  notificationService,
  chatService,
  userService,
  initializeServices
};