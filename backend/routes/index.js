const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const chatRoutes = require('./chat.routes');
const routineRoutes = require('./routine.routes');
const symptomRoutes = require('./symptom.routes');
const healthMetricsRoutes = require('./healthMetrics.routes');
const moodRoutes = require('./mood.routes');
const nutritionRoutes = require('./nutrition.routes');
const workoutRoutes = require('./workout.routes');
const userRoutes = require('./users.routes');
const notificationsRoutes = require('./notifications.routes');
const fitbitRoutes = require('./fitbit.routes');
const weatherRoutes = require('./weather.routes');

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/routines', routineRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/health-metrics', healthMetricsRoutes);
router.use('/moods', moodRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/workouts', workoutRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/fitbit', fitbitRoutes);
router.use('/weather', weatherRoutes);

router.get('/status', (req, res) => {
  res.json({ 
    status: 'API running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    routes: {
      auth: '/api/auth',
      chat: '/api/chat',
      routines: '/api/routines',
      symptoms: '/api/symptoms',
      healthMetrics: '/api/health-metrics',
      moods: '/api/moods',
      nutrition: '/api/nutrition',
      workouts: '/api/workouts',
      users: '/api/users',
      notifications: '/api/notifications',
      fitbit: '/api/fitbit',
      weather: '/api/weather'
    }
  });
});

router.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found: ' + req.method + ' ' + req.path 
  });
});

router.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

module.exports = router;
