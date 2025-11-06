// FILE: server/controllers/fitbitController.js

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const FITBIT_BASE_URL = 'https://api.fitbit.com/1';

// NOTE: In a real application, you must use a middleware to validate 
// and attach the user's Fitbit access token (stored in the User model) 
// to req.headers before these controllers run. These controllers assume
// the token is accessible or passed.

// --- Mock Data for Development ---
const mockActivity = { steps: 8543, calories: 2100, distance: 6.4, activeMinutes: 45, isMock: true };
const mockHeartRate = { resting: 65, average: 75, isMock: true };
const mockSleep = { duration: 7.2, quality: 'Good', isMock: true };


/**
 * @route GET /api/fitbit/activities
 * @desc Get activities (Uses mock data as no token validation middleware is present)
 */
exports.getActivities = (req, res) => {
    // Ideally: Fetch token from User DB, then call Fitbit API
    res.json({ success: true, data: mockActivity });
};

/**
 * @route GET /api/fitbit/heart-rate
 * @desc Get heart rate data
 */
exports.getHeartRate = (req, res) => {
    res.json({ success: true, data: mockHeartRate });
};

/**
 * @route GET /api/fitbit/sleep
 * @desc Get sleep data
 */
exports.getSleep = (req, res) => {
    res.json({ success: true, data: mockSleep });
};