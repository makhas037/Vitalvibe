const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },  // Changed to String
    title: { type: String, required: true, trim: true },
    description: String,
    time: String,
    category: String,
    type: { type: String, enum: ['morning', 'evening', 'workout', 'meditation', 'custom'], default: 'custom' },
    schedule: {
      frequency: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
      days: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
      time: String,
      reminder: { type: Boolean, default: true },
      reminderMinutes: { type: Number, default: 10 }
    },
    tasks: [
      {
        name: { type: String, required: true },
        duration: String,
        completed: { type: Boolean, default: false },
        order: Number
      }
    ],
    progress: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      totalCompletions: { type: Number, default: 0 },
      lastCompleted: Date
    },
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'routines' }
);

routineSchema.index({ userId: 1, isActive: 1 });
module.exports = mongoose.model('Routine', routineSchema);
