// File: /src/api/providers/index.js

/**
 * Centralized exports for all provider classes
 */

export { default as FitbitProvider } from './FitbitProvider';
export { default as GoogleFitProvider } from './GoogleFitProvider';
// More providers will be added here as created

export default {
  FitbitProvider: require('./FitbitProvider').default,
  GoogleFitProvider: require('./GoogleFitProvider').default
};
