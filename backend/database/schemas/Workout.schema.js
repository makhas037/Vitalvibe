/**
 * FILE: server/database/schemas/Workout.schema.js
 * FIXED: Proper enum values, required fields, userId as String
 */

const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: String,  // Changed from ObjectId to String for demo-user support
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Running', 'Walking', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'HIIT', 'Sports', 'cardio', 'strength', 'flexibility', 'pilates'],
      default: 'Gym'
    },
    category: {
      type: String,
      enum: ['running', 'cycling', 'swimming', 'gym', 'yoga', 'pilates', 'hiking', 'walking', 'basketball', 'football', 'other']
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: Date,
    duration: {
      type: Number,
      required: true,
      min: 1
    },
    calories: {
      type: Number,
      default: 0,
      min: 0
    },
    distance: {
      type: Number,
      default: 0,
      min: 0
    },
    elevation: Number,
    avgHeartRate: Number,
    maxHeartRate: Number,
    avgPace: Number,
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'medium', 'high', 'intense'],
      default: 'moderate'
    },
    mood: {
      type: String,
      enum: ['terrible', 'bad', 'okay', 'good', 'great']
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard', 'very hard']
    },
    notes: {
      type: String,
      maxlength: 1000
    },
    location: String,
    weather: String,
    completed: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      enum: ['fitbit', 'googlefit', 'manual'],
      default: 'manual'
    }
  },
  {
    timestamps: true,
    collection: 'workouts'
  }
);

workoutSchema.index({ userId: 1, startTime: -1 });
workoutSchema.index({ type: 1, startTime: -1 });

module.exports = mongoose.model('Workout', workoutSchema);
