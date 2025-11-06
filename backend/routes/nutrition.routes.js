
const express = require('express');
const router = express.Router();
const Nutrition = require('../database/schemas/Nutrition.schema');

// GET nutrition by user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, start, end } = req.query;

    let query = { userId };
    if (date) {
      query.date = date;
    } else if (start && end) {
      query.date = { $gte: start, $lte: end };
    }

    const nutrition = await Nutrition.find(query).sort({ createdAt: -1 });
    res.json(nutrition);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create nutrition
router.post('/', async (req, res) => {
  try {
    const { userId, date, mealType, mealName, foods, totals } = req.body;

    const newNutrition = new Nutrition({
      userId,
      date,
      mealType,
      mealName,
      foods: foods || [],
      totals: totals || {}
    });

    const savedNutrition = await newNutrition.save();
    console.log('✅ Nutrition created:', savedNutrition);
    
    // Return the saved nutrition
    res.status(201).json(savedNutrition);
  } catch (error) {
    console.error('Error creating nutrition:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;