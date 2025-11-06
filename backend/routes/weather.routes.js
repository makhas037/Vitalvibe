// FILE: server/routes/weather.routes.js

const express = require('express');
const router = express.Router();
// Assuming a dedicated controller handles external API calls
const weatherController = require('../controllers/weatherController'); 

// @route  GET /api/weather?city=...
// @desc   Get current weather by city
router.get('/', weatherController.getCurrentWeather);

// @route  GET /api/weather/forecast?lat=...&lon=...
// @desc   Get weather forecast by coordinates
router.get('/forecast', weatherController.getWeatherForecast);

module.exports = router;