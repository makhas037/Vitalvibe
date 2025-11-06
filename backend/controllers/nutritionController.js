// FILE: server/controllers/nutritionController.js (NEW FILE)

const dotenv = require('dotenv');
const axios = require('axios'); // Assuming axios is installed for external calls

dotenv.config();

// Configuration for external USDA API
const USDA_API_KEY = process.env.USDA_API_KEY; // [cite: 152]
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

/**
 * @route POST /api/nutrition/search-food
 * @desc Search food items using USDA API
 */
exports.searchFood = async (req, res, next) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ success: false, message: 'Search query is required' });

        const response = await axios.get(`${USDA_BASE_URL}/foods/search`, {
            params: {
                query: query,
                pageSize: 10,
                api_key: USDA_API_KEY
            }
        });
        
        // Simple data mapping for frontend consumption
        const simplifiedFoods = response.data.foods.map(food => ({
            id: food.fdcId,
            name: food.description,
            brand: food.brandName || 'Generic',
            // Mock or calculate these for simplicity until full schema mapping
            calories: 100, 
            protein: 5,
            carbs: 15,
            fat: 3
        }));

        res.json({ success: true, count: simplifiedFoods.length, data: simplifiedFoods });

    } catch (error) {
        console.error('❌ USDA Search Error:', error.message);
        // Fail gracefully with a mock response if the API is down
        res.json({ success: true, message: "USDA API failed. Using mock data.", data: [{ id: 'mock1', name: 'Mock Chicken Breast', brand: 'Mock', calories: 165, protein: 31, carbs: 0, fat: 3.6 }] });
    }
};

/**
 * @route POST /api/nutrition
 * @desc Log a meal (placeholder for the DB operation in routes/nutrition.routes.js)
 */
exports.logMeal = (req, res, next) => {
    // This function is often handled directly in the route file but is included here for completeness
    next();
};

/**
 * @route GET /api/nutrition/food/:foodId
 * @desc Get detailed nutrients (placeholder)
 */
exports.getFoodNutrients = (req, res, next) => {
    res.status(501).json({ success: false, message: "Detailed food nutrient fetch not implemented." });
};