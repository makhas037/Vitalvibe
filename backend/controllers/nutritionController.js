// FILE: backend/controllers/nutritionController.js
// NUTRITION API CONTROLLER

const dotenv = require('dotenv');
const nutritionAPIService = require('../services/nutritionAPI.service');

dotenv.config();

/**
 * @route GET /api/nutrition/search
 * @desc Search food items using USDA API
 */
exports.searchFood = async (req, res, next) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Search query is required' 
            });
        }

        const foods = await nutritionAPIService.searchFoods(query);
        
        res.json({
            success: true,
            count: foods.length,
            data: foods
        });

    } catch (error) {
        console.error('❌ USDA Search Error:', error.message);
        
        // Fallback to mock data if API fails
        res.json({ 
            success: true, 
            message: "Using mock data (API unavailable)", 
            data: [{
                fdcId: 'mock-1',
                name: 'Chicken Breast (Grilled)',
                brand: 'Generic',
                nutrients: {
                    calories: 165,
                    protein: 31,
                    carbs: 0,
                    fat: 3.6
                }
            }]
        });
    }
};

/**
 * @route GET /api/nutrition/food/:fdcId
 * @desc Get detailed food nutrients by FDC ID
 */
exports.getFoodDetails = async (req, res, next) => {
    try {
        const { fdcId } = req.params;
        const food = await nutritionAPIService.getFoodDetails(fdcId);
        
        res.json({
            success: true,
            data: food
        });
    } catch (error) {
        console.error('❌ Get Food Details Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

/**
 * @route POST /api/nutrition
 * @desc Log a meal (handled in routes)
 */
exports.logMeal = (req, res, next) => {
    next();
};
