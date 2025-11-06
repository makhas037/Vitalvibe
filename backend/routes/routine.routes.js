/**
 * FILE: server/routes/routine.routes.js
 * ROUTINE MANAGEMENT - NO AUTH REQUIRED
 */

const express = require('express');
const router = express.Router();
const { Routine } = require('../database').models;

// GET active routines
router.get('/', async (req, res, next) => {
  try {
    const routines = await Routine.find({ isArchived: false }).sort({ createdAt: -1 });
    res.json({ success: true, count: routines.length, data: routines });
  } catch (error) {
    next(error);
  }
});

// GET archived
router.get('/archived', async (req, res, next) => {
  try {
    const routines = await Routine.find({ isArchived: true }).sort({ updatedAt: -1 });
    res.json({ success: true, count: routines.length, data: routines });
  } catch (error) {
    next(error);
  }
});

// POST create
router.post('/', async (req, res, next) => {
  try {
    const { title, description, time, activities } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title required' });

    const routine = await Routine.create({
      title,
      description: description || '',
      time: time || '08:00',
      activities: activities || [],
      isArchived: false
    });

    res.status(201).json({ success: true, data: routine });
  } catch (error) {
    next(error);
  }
});

// PUT toggle activity
router.put('/:routineId/toggle/:activityId', async (req, res, next) => {
  try {
    const { routineId, activityId } = req.params;
    if (!routineId || !activityId) {
      return res.status(400).json({ success: false, message: 'IDs required' });
    }

    const routine = await Routine.findById(routineId);
    if (!routine) return res.status(404).json({ success: false, message: 'Not found' });

    const activity = routine.activities?.find(a => a._id.toString() === activityId);
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });

    activity.completed = !activity.completed;
    await routine.save();

    res.json({ success: true, data: routine });
  } catch (error) {
    next(error);
  }
});

// PUT archive
router.put('/:routineId/archive', async (req, res, next) => {
  try {
    const routine = await Routine.findByIdAndUpdate(
      req.params.routineId,
      { isArchived: true },
      { new: true }
    );

    if (!routine) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: routine });
  } catch (error) {
    next(error);
  }
});

// PUT restore
router.put('/:routineId/restore', async (req, res, next) => {
  try {
    const routine = await Routine.findByIdAndUpdate(
      req.params.routineId,
      { isArchived: false },
      { new: true }
    );

    if (!routine) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: routine });
  } catch (error) {
    next(error);
  }
});

// DELETE
router.delete('/:routineId', async (req, res, next) => {
  try {
    const routine = await Routine.findByIdAndDelete(req.params.routineId);
    if (!routine) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
