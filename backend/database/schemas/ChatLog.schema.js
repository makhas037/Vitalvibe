/**
 * FILE: server/database/schemas/ChatLog.schema.js
 * FIXED: Support for demo-user
 */

const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },  // Added userId
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    isActive: { type: Boolean, default: true },
    title: String,
    summary: String
  },
  { timestamps: true, collection: 'chatlogs' }
);

chatLogSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('ChatLog', chatLogSchema);
