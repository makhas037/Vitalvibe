// FILE: server/routes/fitbit.routes.js

const express = require('express');
const router = express.Router();
// Assuming a dedicated controller handles external API calls and token validation
const fitbitController = require('../controllers/fitbitController');

// @route  GET /api/fitbit/activities
// @desc   Get recent Fitbit activities
router.get('/activities', fitbitController.getActivities);

// @route  GET /api/fitbit/heart-rate
// @desc   Get recent Fitbit heart rate data
router.get('/heart-rate', fitbitController.getHeartRate);

// @route  GET /api/fitbit/sleep
// @desc   Get recent Fitbit sleep data
router.get('/sleep', fitbitController.getSleep);

// Note: OAuth flow (e.g., /api/auth/fitbit) is typically handled elsewhere.

module.exports = router;