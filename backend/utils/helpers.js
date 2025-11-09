// FILE: E:\CLOUD PROJECT\vitalvibe\backend\utils\helpers.js
// PURPOSE: Helper utility functions

class Helper {
  /**
   * Calculate BMI
   */
  static calculateBMI(height, weight) {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  /**
   * Calculate health score (0-100)
   */
  static calculateHealthScore(metrics) {
    let score = 0;

    // Heart rate (25 points)
    if (metrics.heartRate) {
      score += (metrics.heartRate >= 60 && metrics.heartRate <= 100) ? 25 : 10;
    }

    // Sleep (25 points)
    if (metrics.sleepHours) {
      score += (metrics.sleepHours >= 7 && metrics.sleepHours <= 9) ? 25 : 15;
    }

    // Steps (25 points)
    if (metrics.steps) {
      score += (metrics.steps >= 10000) ? 25 : (metrics.steps / 10000) * 25;
    }

    // Hydration (25 points)
    if (metrics.hydration) {
      score += (metrics.hydration >= 2 && metrics.hydration <= 3) ? 25 : 15;
    }

    return Math.round(score);
  }

  /**
   * Format date to ISO string
   */
  static formatDate(date) {
    return new Date(date).toISOString();
  }

  /**
   * Get date range
   */
  static getDateRange(days) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate, endDate };
  }

  /**
   * Paginate array
   */
  static paginate(array, page, limit) {
    const start = (page - 1) * limit;
    return {
      data: array.slice(start, start + limit),
      total: array.length,
      page,
      limit,
      pages: Math.ceil(array.length / limit)
    };
  }

  /**
   * Generate random code
   */
  static generateCode(length = 6) {
    return Math.random().toString(36).substring(2, length + 2).toUpperCase();
  }

  /**
   * Parse query string to filter object
   */
  static parseFilters(query) {
    const filters = {};

    if (query.startDate) {
      filters.createdAt = { $gte: new Date(query.startDate) };
    }

    if (query.endDate) {
      if (!filters.createdAt) filters.createdAt = {};
      filters.createdAt.$lte = new Date(query.endDate);
    }

    if (query.type) {
      filters.type = query.type;
    }

    if (query.status) {
      filters.status = query.status;
    }

    return filters;
  }

  /**
   * Generate CSV from array of objects
   */
  static generateCSV(data, headers) {
    const csv = [headers.join(',')];
    data.forEach(row => {
      const values = headers.map(header => row[header] || '');
      csv.push(values.map(v => `"${v}"`).join(','));
    });
    return csv.join('\n');
  }
}

module.exports = Helper;
