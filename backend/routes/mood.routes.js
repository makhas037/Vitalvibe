const express = require('express');
const router = express.Router();
const Mood = require('../database/schemas/Mood.schema');
const moodAnalysisService = require('../services/moodAnalysis.service');

// Emoji to text mapping
const emojiToText = {
  '😊': 'happy',
  '😔': 'sad',
  '😤': 'angry',
  '😰': 'anxious',
  '😴': 'tired',
  '😐': 'neutral'
};

// GET: Get moods by date range
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;

    let query = { userId };

    if (start && end) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const moods = await Mood.find(query).sort({ date: -1, time: -1 });

    res.json({
      success: true,
      count: moods.length,
      data: moods
    });
  } catch (error) {
    console.error('❌ Get moods error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// POST: Create mood with AI analysis
router.post('/', async (req, res) => {
  try {
    const { userId, date, mood, intensity, notes, triggers } = req.body;

    if (!userId || !date || !mood || !intensity) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId, date, mood, and intensity are required' 
      });
    }

    // Convert emoji to text
    const moodText = emojiToText[mood] || mood;

    // Prepare mood data for analysis
    const moodData = {
      userId,
      date: new Date(date),
      time: new Date(),
      mood,
      moodText,
      intensity,
      notes: notes || '',
      triggers: triggers || []
    };

    // Get AI analysis
    console.log('🧠 Analyzing mood with AI...');
    const aiAnalysis = await moodAnalysisService.analyzeMood(moodData);

    // Save mood with AI analysis
    const newMood = new Mood({
      ...moodData,
      aiAnalysis
    });

    const savedMood = await newMood.save();
    console.log('✅ Mood saved with AI analysis:', savedMood._id);

    res.status(201).json({
      success: true,
      message: 'Mood logged successfully with AI insights',
      data: savedMood
    });
  } catch (error) {
    console.error('❌ Mood create error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// GET: Get mood trends
router.get('/:userId/trends', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moods = await Mood.find({
      userId,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    const trends = await moodAnalysisService.analyzeTrends(moods);

    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('❌ Trends error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE: Remove mood entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Mood.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mood entry not found' 
      });
    }

    res.json({
      success: true,
      message: 'Mood deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete mood error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
