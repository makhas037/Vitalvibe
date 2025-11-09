// FILE: middleware/rateLimiter.js
// PURPOSE: Rate limiting configuration

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: isDev ? 60 * 60 * 1000 : 15 * 60 * 1000, // 1 hour (dev) / 15 min (prod)
  max: isDev ? 10000 : 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  // Skip for development
  handler: (req, res) => {
    if (isDev) {
      // Pass through in development
      return;
    }
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.'
    });
  }
});

// Auth Rate Limiter (login/register)
const authLimiter = rateLimit({
  windowMs: isDev ? 60 * 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 10000 : 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: !isDev,
  handler: (req, res) => {
    if (isDev) {
      return;
    }
    res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.'
    });
  }
});

// Read Operations Rate Limiter
const readLimiter = rateLimit({
  windowMs: isDev ? 60 * 60 * 1000 : 60 * 1000,
  max: isDev ? 10000 : 30,
  handler: (req, res) => {
    if (isDev) {
      return;
    }
    res.status(429).json({
      success: false,
      message: 'Too many read requests.'
    });
  }
});

// Create Operations Rate Limiter
const createLimiter = rateLimit({
  windowMs: isDev ? 60 * 60 * 1000 : 60 * 1000,
  max: isDev ? 10000 : 10,
  handler: (req, res) => {
    if (isDev) {
      return;
    }
    res.status(429).json({
      success: false,
      message: 'Too many create requests.'
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  readLimiter,
  createLimiter
};
