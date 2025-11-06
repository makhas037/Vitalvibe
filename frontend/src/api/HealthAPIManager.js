// File: /src/api/HealthAPIManager.js

import FitbitProvider from './providers/FitbitProvider';
import GoogleFitProvider from './providers/GoogleFitProvider';

/**
 * Centralized manager for all health data providers
 * Handles multiple provider connections and data aggregation
 */
class HealthAPIManager {
  constructor() {
    this.providers = {
      fitbit: null,
      googleFit: null
    };
    
    this.connectedProviders = [];
    this.onProviderChange = () => {};
    this.onDataUpdate = () => {};
    this.onError = () => {};
    
    console.log('🎯 HealthAPIManager initialized');
  }

  /**
   * Initialize a provider
   */
  initProvider(providerName, options = {}) {
    const config = {
      onDataUpdate: (data) => this.handleDataUpdate(providerName, data),
      onConnectionChange: (status) => this.handleConnectionChange(providerName, status),
      onError: (error) => this.onError(error),
      ...options
    };

    switch (providerName.toLowerCase()) {
      case 'fitbit':
        this.providers.fitbit = new FitbitProvider(config);
        return this.providers.fitbit;
      
      case 'googlefit':
      case 'google-fit':
        this.providers.googleFit = new GoogleFitProvider(config);
        return this.providers.googleFit;
      
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  /**
   * Connect a provider
   */
  async connect(providerName, credentials = null) {
    const provider = this.providers[providerName.toLowerCase()];
    
    if (!provider) {
      throw new Error(`Provider ${providerName} not initialized`);
    }

    try {
      const result = await provider.connect(credentials);
      console.log(`✅ ${providerName} connected`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to connect ${providerName}:`, error);
      throw error;
    }
  }

  /**
   * Disconnect a provider
   */
  async disconnect(providerName) {
    const provider = this.providers[providerName.toLowerCase()];
    
    if (provider) {
      await provider.disconnect();
      console.log(`✅ ${providerName} disconnected`);
    }
  }

  /**
   * Get data from a specific provider
   */
  async getData(providerName, timeRange = 'today') {
    const provider = this.providers[providerName.toLowerCase()];
    
    if (!provider) {
      throw new Error(`Provider ${providerName} not initialized`);
    }

    return await provider.fetchData(timeRange);
  }

  /**
   * Get aggregated data from all connected providers
   */
  async getAggregatedData(timeRange = 'today') {
    const results = {};

    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider && provider.isConnected) {
        try {
          results[name] = await provider.fetchData(timeRange);
        } catch (error) {
          console.warn(`Failed to get data from ${name}:`, error);
          results[name] = null;
        }
      }
    }

    return {
      data: results,
      timestamp: new Date(),
      providers: this.getConnectedProviders()
    };
  }

  /**
   * Handle data updates
   */
  handleDataUpdate(providerName, data) {
    console.log(`📊 Data update from ${providerName}:`, data);
    this.onDataUpdate({ provider: providerName, data });
  }

  /**
   * Handle connection changes
   */
  handleConnectionChange(providerName, status) {
    if (status.connected) {
      if (!this.connectedProviders.includes(providerName)) {
        this.connectedProviders.push(providerName);
      }
    } else {
      this.connectedProviders = this.connectedProviders.filter(
        p => p !== providerName
      );
    }

    console.log(`🔗 Provider status changed:`, status);
    this.onProviderChange({ provider: providerName, status });
  }

  /**
   * Get list of connected providers
   */
  getConnectedProviders() {
    return this.connectedProviders;
  }

  /**
   * Get provider status
   */
  getProviderStatus(providerName) {
    const provider = this.providers[providerName.toLowerCase()];
    return provider ? provider.getStatus() : null;
  }

  /**
   * Get all providers status
   */
  getAllStatus() {
    const status = {};
    for (const [name, provider] of Object.entries(this.providers)) {
      if (provider) {
        status[name] = provider.getStatus();
      }
    }
    return status;
  }
}

// Singleton instance
export const healthAPIManager = new HealthAPIManager();

export default HealthAPIManager;
