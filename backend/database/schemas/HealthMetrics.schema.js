/**
 * FILE: server/database/schemas/HealthMetrics.schema.js
 * FIXED: userId as String, proper structure
 */

const mongoose = require('mongoose');

const healthMetricsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,  // Changed from ObjectId to String
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      index: true
    },
    steps: { type: Number, default: 0, min: 0 },
    distance: { type: Number, default: 0, min: 0 },
    floors: { type: Number, default: 0, min: 0 },
    activeMinutes: { type: Number, default: 0, min: 0 },
    calories: { type: Number, default: 0, min: 0 },
    
    heartRate: {
      resting: Number,
      average: Number,
      max: Number,
      min: Number,
      measurements: [
        {
          time: Date,
          value: { type: Number, min: 30, max: 250 }
        }
      ]
    },
    
    sleep: {
      totalMinutes: Number,
      minutesAsleep: Number,
      minutesAwake: Number,
      efficiency: { type: Number, min: 0, max: 100 },
      quality: { type: String, enum: ['poor', 'fair', 'good', 'excellent'] },
      startTime: Date,
      endTime: Date,
      stages: {
        deep: { type: Number, default: 0 },
        light: { type: Number, default: 0 },
        rem: { type: Number, default: 0 },
        wake: { type: Number, default: 0 }
      }
    },
    
    hydration: {
      amount: { type: Number, default: 0, min: 0 },
      goal: { type: Number, default: 2500, min: 0 },
      logs: [
        {
          time: Date,
          amount: Number
        }
      ]
    },
    
    weight: {
      value: Number,
      bmi: Number,
      bodyFat: Number,
      muscleMass: Number
    },
    
    vitals: {
      bloodPressure: { systolic: Number, diastolic: Number },
      pulse: Number,
      temperature: Number,
      oxygenSaturation: Number
    },
    
    source: {
      type: String,
      enum: ['fitbit', 'googlefit', 'applehealth', 'manual', 'imported'],
      default: 'manual'
    },
    lastSynced: { type: Date, default: Date.now },
    notes: String
  },
  {
    timestamps: true,
    collection: 'healthmetrics'
  }
);

healthMetricsSchema.index({ userId: 1, date: -1 });
healthMetricsSchema.index({ userId: 1, source: 1 });

module.exports = mongoose.model('HealthMetrics', healthMetricsSchema);
