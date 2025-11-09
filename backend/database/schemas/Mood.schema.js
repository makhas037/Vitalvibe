/**
 * FILE: server/database/schemas/Mood.schema.js
 * UPDATED: Support for both emoji and text mood values
 */

const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    time: {
      type: Date,
      default: Date.now
    },
    mood: {
      type: String,
      required: true,
      // Accept both text and emoji values
      enum: ['happy', 'sad', 'anxious', 'stressed', 'calm', 'energetic', 'tired', 'angry', 'excited', 'lonely', 'neutral', '😊', '😔', '😰', '😤', '😴', '😐']
    },
    moodText: {
      type: String,
      // Store the text version for analysis
      enum: ['happy', 'sad', 'anxious', 'angry', 'tired', 'neutral']
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    emotions: [String],
    notes: {
      type: String,
      maxlength: 2000
    },
    triggers: [String],
    activities: [String],
    aiAnalysis: {
      sentiment: String,
      advice: String,
      insights: [String],
      riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
      generatedAt: Date
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'moods'
  }
);

moodSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Mood', moodSchema);
