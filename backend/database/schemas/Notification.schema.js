const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },  // Changed to String
    type: { type: String, required: true, enum: ['goal', 'reminder', 'health', 'sync', 'achievement', 'system'] },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: String,
    color: String,
    action: {
      route: String,
      data: mongoose.Schema.Types.Mixed
    },
    read: { type: Boolean, default: false },
    readAt: Date,
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    expiresAt: Date
  },
  { timestamps: true, collection: 'notifications' }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
module.exports = mongoose.model('Notification', notificationSchema);
