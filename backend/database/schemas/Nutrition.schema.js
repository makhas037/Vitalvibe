const mongoose = require('mongoose');

const NutritionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'snack'
    },
    mealName: {
      type: String,
      required: true
    },
    foods: [
      {
        name: String,
        brand: String,
        servingSize: Number,
        servingUnit: String,
        quantity: Number,
        nutrients: {
          calories: Number,
          protein: Number,
          carbs: Number,
          fat: Number
        }
      }
    ],
    totals: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 }
    },
    time: {
      type: Date,
      default: Date.now
    },
    notes: String,
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Nutrition', NutritionSchema);
