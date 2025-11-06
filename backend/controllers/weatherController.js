// FILE: server/controllers/weatherController.js

const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const UNITS = process.env.OPENWEATHER_UNITS || 'metric';

/**
 * @route GET /api/weather?city=[city]
 * @desc Get current weather data
 */
exports.getCurrentWeather = async (req, res, next) => {
    const city = req.query.city || 'New Delhi';
    try {
        if (!OPENWEATHER_API_KEY) {
            console.warn('⚠️  OpenWeather API Key is missing. Using mock data.');
            return res.json({ success: true, data: { temp: 25, condition: 'Clear Sky', icon: '01d', city: city, isMock: true } });
        }

        const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: UNITS
            }
        });

        const weather = {
            city: response.data.name,
            temp: Math.round(response.data.main.temp),
            condition: response.data.weather[0].description,
            icon: response.data.weather[0].icon,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed
        };

        res.json({ success: true, data: weather });
    } catch (error) {
        console.error('❌ Weather API Error:', error.message);
        next({ status: 502, message: 'Failed to fetch weather data from external API.' });
    }
};

/**
 * @route GET /api/weather/forecast?lat=[lat]&lon=[lon]
 * @desc Get 5-day forecast (Not fully implemented, placeholder)
 */
exports.getWeatherForecast = (req, res) => {
    res.status(501).json({ success: false, message: "Weather forecast endpoint not implemented." });
};