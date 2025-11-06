/**
 * FILE: server/database/schemas/Mood.schema.js
 * FIXED: Proper enum values and userId as String (for demo-user)
 */

const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema(
  {
    userId: {
      type: String,  // Changed from ObjectId to String for demo-user support
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
      enum: ['terrible', 'bad', 'okay', 'good', 'great', 'happy', 'sad', 'anxious', 'stressed', 'calm', 'energetic', 'tired', 'angry', 'excited', 'lonely'],
      lowercase: true
    },
    intensity: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    emotions: [
      {
        type: String,
        enum: ['happy', 'sad', 'anxious', 'stressed', 'calm', 'energetic', 'tired', 'angry', 'excited', 'lonely']
      }
    ],
    notes: {
      type: String,
      maxlength: 2000
    },
    triggers: [String],
    activities: [
      {
        type: String,
        enum: ['work', 'exercise', 'socializing', 'relaxing', 'eating', 'sleeping', 'entertainment', 'hobbies']
      }
    ],
    isPrivate: {
      type: Boolean,
      default: true
    },
    context: {
      stressLevel: { type: Number, min: 1, max: 10 },
      energyLevel: { type: Number, min: 1, max: 10 },
      gratitude: String
    }
  },
  {
    timestamps: true,
    collection: 'moods'
  }
);

moodSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Mood', moodSchema);
