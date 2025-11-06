const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },  // Changed to String
    date: { type: Date, default: Date.now, index: true },
    symptoms: [
      {
        name: { type: String, required: true },
        severity: { type: String, enum: ['mild', 'moderate', 'severe'], default: 'mild' },
        severityScore: { type: Number, min: 1, max: 10 },
        duration: String,
        bodyPart: String
      }
    ],
    aiAnalysis: {
      query: String,
      response: String,
      possibleConditions: [String],
      recommendations: [String],
      urgency: { type: String, enum: ['low', 'medium', 'high', 'emergency'] }
    },
    notes: String,
    resolved: { type: Boolean, default: false },
    followUpRequired: { type: Boolean, default: false }
  },
  { timestamps: true, collection: 'symptoms' }
);

symptomSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model('Symptom', symptomSchema);
