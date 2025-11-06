// File: server/routes/healthMetrics.routes.js
const express = require('express');
const router = express.Router();
const { HealthMetric } = require('../database').models;

// @route   GET /api/health-metrics/:userId
// @desc    Get health metrics for user
router.get('/:userId', async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    const query = { userId: req.params.userId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const metrics = await HealthMetric.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, count: metrics.length, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/health-metrics
// @desc    Create health metric
router.post('/', async (req, res) => {
  try {
    const metric = await HealthMetric.create(req.body);
    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
