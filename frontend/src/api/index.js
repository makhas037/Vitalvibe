// File: /src/api/index.js

/**
 * Unified API entry point
 * Exports all API managers and utilities
 */

export { default as HealthAPIManager, healthAPIManager } from './HealthAPIManager';
export * from './providers/index';
export { default as httpClient } from './core/httpClient';
export { default as BaseProvider } from './core/BaseProvider';

// Re-export services through this layer
export { default as services } from '../services';

console.log('✅ API layer initialized');
