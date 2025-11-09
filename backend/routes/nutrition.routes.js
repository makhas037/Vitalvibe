const express = require('express');
const router = express.Router();
const Nutrition = require('../database/schemas/Nutrition.schema');
const nutritionAPIService = require('../services/nutritionAPI.service');

// GET: Search foods using USDA API
router.get('/search', async (req, res) => {
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
    console.error('Food search error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET: Get food details by FDC ID
router.get('/food/:fdcId', async (req, res) => {
  try {
    const { fdcId } = req.params;
    const food = await nutritionAPIService.getFoodDetails(fdcId);
    
    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    console.error('Food details error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET: Get nutrition logs by user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, start, end } = req.query;

    let query = { userId };
    
    if (date) {
      // Single date query
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (start && end) {
      // Date range query
      query.date = { $gte: new Date(start), $lte: new Date(end) };
    }

    const nutrition = await Nutrition.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: nutrition.length,
      data: nutrition
    });
  } catch (error) {
    console.error('Get nutrition error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST: Create nutrition log
router.post('/', async (req, res) => {
  try {
    const { userId, date, mealType, mealName, foods, totals } = req.body;

    // Validate required fields
    if (!userId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and date are required' 
      });
    }

    const newNutrition = new Nutrition({
      userId,
      date: new Date(date),
      mealType: mealType || 'snack',
      mealName: mealName || 'Meal',
      time: new Date(),
      foods: foods || [],
      totals: totals || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    });

    const savedNutrition = await newNutrition.save();
    console.log('✅ Nutrition logged:', savedNutrition._id);
    
    res.status(201).json({
      success: true,
      message: 'Meal logged successfully',
      data: savedNutrition
    });
  } catch (error) {
    console.error('Create nutrition error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE: Remove nutrition log
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await Nutrition.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Nutrition log not found' 
      });
    }

    res.json({
      success: true,
      message: 'Nutrition log deleted successfully'
    });
  } catch (error) {
    console.error('Delete nutrition error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
