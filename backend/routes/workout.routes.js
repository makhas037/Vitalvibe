const express = require('express');
const Workout = require('../database/schemas/Workout.schema');
const router = express.Router();

// GET all workouts for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const workouts = await Workout.find({ userId }).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET workouts by date range
router.get('/:userId/range', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end } = req.query;
    
    const workouts = await Workout.find({
      userId,
      startTime: { $gte: new Date(start), $lte: new Date(end) }
    }).sort({ createdAt: -1 });
    
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Create workout
router.post('/', async (req, res) => {
  try {
    const { userId, date, type, duration, distance, calories, intensity } = req.body;
    
    const newWorkout = new Workout({
      userId,
      name: type,
      type,
      duration,
      distance,
      calories,
      intensity,
      startTime: new Date(date),
      completed: true
    });
    
    const saved = await newWorkout.save();
    console.log('✅ Workout saved:', saved);
    
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Workout create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE workout
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Workout.findByIdAndDelete(id);
    res.json({ message: 'Workout deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
