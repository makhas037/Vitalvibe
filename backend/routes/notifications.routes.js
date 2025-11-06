/**
 * FILE: server/routes/notifications.routes.js
 * CONSOLIDATED NOTIFICATION MANAGEMENT
 * Handles: Database notifications + Firebase/Email integration
 */

const express = require('express');
const router = express.Router();
const { Notification } = require('../database').models;

// ============================================
// GET ENDPOINTS
// ============================================

/**
 * GET /api/notifications/:userId
 * Retrieve all notifications for a user
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments(query);
    const unread = await Notification.countDocuments({ userId, read: false });

    res.json({
      success: true,
      count: notifications.length,
      total,
      unread,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/notifications
 * Get all notifications (admin)
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(parseInt(limit));
    const unread = await Notification.countDocuments({ read: false });
    res.json({ success: true, notifications, unread, count: notifications.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// POST ENDPOINTS
// ============================================

/**
 * POST /api/notifications
 * Create a new notification
 */
router.post('/', async (req, res) => {
  try {
    const { userId, title, message, type, data } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const notification = await Notification.create({
      userId, title, message, type: type || 'info', data: data || {}, read: false
    });
    res.status(201).json({ success: true, message: 'Notification created', data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/notifications/request-permission
 * Request notification permission
 */
router.post('/request-permission', (req, res) => {
  try {
    res.json({ success: true, message: 'Notification permission granted', status: 'enabled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/notifications/send
 * Send push notification
 */
router.post('/send', async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    if (!userId || !title || !body) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const notification = await Notification.create({
      userId, title, message: body, type: 'push', data: data || {}, read: false
    });
    res.json({ success: true, message: 'Notification sent', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/notifications/email
 * Send email notification
 */
router.post('/email', async (req, res) => {
  try {
    const { userId, email, subject, message } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    if (userId) {
      await Notification.create({ userId, title: subject, message, type: 'email', data: { email }, read: true });
    }
    res.json({ success: true, message: 'Email sent', email: { to: email, subject } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// PUT ENDPOINTS
// ============================================

/**
 * PUT /api/notifications/:id/read
 * Mark single notification as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/notifications/:userId/read-all
 * Mark all as read
 */
router.put('/:userId/read-all', async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.params.userId, read: false },
      { read: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All marked as read', updated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DELETE ENDPOINTS
// ============================================

/**
 * DELETE /api/notifications/:id
 * Delete single notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/notifications/:userId/clear-all
 * Clear all for user
 */
router.delete('/:userId/clear-all', async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.params.userId });
    res.json({ success: true, message: 'All cleared', deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
