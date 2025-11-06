const express = require('express');
const Mood = require('../database/schemas/Mood.schema');
const router = express.Router();

// GET all moods for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const moods = await Mood.find({ userId }).sort({ createdAt: -1 });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET moods by date range
router.get('/:userId/range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;
    
    const moods = await Mood.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ createdAt: -1 });
    
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Create mood
router.post('/', async (req, res) => {
  try {
    const { userId, date, mood, intensity, notes, triggers } = req.body;
    
    const newMood = new Mood({
      userId,
      date,
      mood,
      intensity,
      notes,
      triggers: triggers || [],
      time: new Date(),
      createdAt: new Date()
    });
    
    const saved = await newMood.save();
    console.log('✅ Mood saved:', saved);
    
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Mood create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE mood
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Mood.findByIdAndDelete(id);
    res.json({ message: 'Mood deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
