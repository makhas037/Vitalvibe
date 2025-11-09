// FILE: E:\CLOUD PROJECT\vitalvibe\backend\utils\validators.js
// PURPOSE: Data validation utilities

const { LIMITS } = require('../config/constants');

class Validator {
  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone) {
    const regex = /^\+?[\d\s()-]{10,}$/;
    return regex.test(phone);
  }

  /**
   * Validate numeric range
   */
  static isInRange(value, min, max) {
    return value >= min && value <= max;
  }

  /**
   * Validate health metrics
   */
  static validateHealthMetrics(data) {
    const errors = [];

    if (data.heartRate) {
      if (!this.isInRange(data.heartRate, 30, 220)) {
        errors.push('Heart rate must be between 30-220 bpm');
      }
    }

    if (data.sleepHours) {
      if (!this.isInRange(data.sleepHours, 0, 24)) {
        errors.push('Sleep hours must be between 0-24');
      }
    }

    if (data.steps) {
      if (data.steps < 0 || data.steps > 100000) {
        errors.push('Steps must be between 0-100000');
      }
    }

    if (data.hydration) {
      if (!this.isInRange(data.hydration, 0, 10)) {
        errors.push('Hydration must be between 0-10 liters');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate workout data
   */
  static validateWorkout(data) {
    const errors = [];

    if (!data.type) {
      errors.push('Workout type is required');
    }

    if (data.duration) {
      if (!this.isInRange(data.duration, 1, 600)) {
        errors.push('Duration must be between 1-600 minutes');
      }
    }

    if (data.calories) {
      if (data.calories < 0 || data.calories > 5000) {
        errors.push('Calories must be between 0-5000');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate mood entry
   */
  static validateMood(data) {
    const errors = [];

    if (!data.mood) {
      errors.push('Mood is required');
    }

    if (data.intensity) {
      if (!this.isInRange(data.intensity, 1, 10)) {
        errors.push('Intensity must be between 1-10');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate pagination
   */
  static validatePagination(page, limit) {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(LIMITS.MAX_ITEMS_PER_PAGE, parseInt(limit) || LIMITS.DEFAULT_PAGE_SIZE);
    return { page: validPage, limit: validLimit };
  }
}

module.exports = Validator;
