/**
 * frontend/src/utils/validators/dataValidators.js
 * Data Validators
 * Validate health data
 */

export const dataValidators = {
  /**
   * Validate health metrics
   */
  validateHealthMetrics: (data) => {
    const errors = {};

    if (data.heartRate) {
      if (data.heartRate < 30 || data.heartRate > 220) {
        errors.heartRate = 'Heart rate should be between 30 and 220 bpm';
      }
    }

    if (data.sleepHours) {
      if (data.sleepHours < 0 || data.sleepHours > 24) {
        errors.sleepHours = 'Sleep hours should be between 0 and 24';
      }
    }

    if (data.hydration) {
      if (data.hydration < 0 || data.hydration > 10) {
        errors.hydration = 'Hydration should be between 0 and 10 liters';
      }
    }

    if (data.steps) {
      if (data.steps < 0 || data.steps > 100000) {
        errors.steps = 'Steps should be between 0 and 100000';
      }
    }

    return errors;
  },

  /**
   * Validate mood entry
   */
  validateMoodEntry: (data) => {
    const errors = {};

    if (!data.mood) {
      errors.mood = 'Mood is required';
    }

    if (data.intensity) {
      if (data.intensity < 1 || data.intensity > 10) {
        errors.intensity = 'Intensity should be between 1 and 10';
      }
    }

    return errors;
  },

  /**
   * Validate workout
   */
  validateWorkout: (data) => {
    const errors = {};

    if (!data.type) {
      errors.type = 'Workout type is required';
    }

    if (data.duration) {
      if (data.duration < 1 || data.duration > 600) {
        errors.duration = 'Duration should be between 1 and 600 minutes';
      }
    }

    if (data.distance) {
      if (data.distance < 0 || data.distance > 1000) {
        errors.distance = 'Distance should be between 0 and 1000 km';
      }
    }

    if (data.calories) {
      if (data.calories < 0 || data.calories > 5000) {
        errors.calories = 'Calories should be between 0 and 5000';
      }
    }

    return errors;
  },

  /**
   * Validate nutrition entry
   */
  validateNutritionEntry: (data) => {
    const errors = {};

    if (!data.foodName) {
      errors.foodName = 'Food name is required';
    }

    if (data.calories) {
      if (data.calories < 0 || data.calories > 10000) {
        errors.calories = 'Calories should be between 0 and 10000';
      }
    }

    if (data.protein) {
      if (data.protein < 0 || data.protein > 500) {
        errors.protein = 'Protein should be between 0 and 500g';
      }
    }

    return errors;
  },

  /**
   * Validate routine
   */
  validateRoutine: (data) => {
    const errors = {};

    if (!data.title) {
      errors.title = 'Title is required';
    }

    if (!data.activities || data.activities.length === 0) {
      errors.activities = 'At least one activity is required';
    }

    return errors;
  }
};

export default dataValidators;
