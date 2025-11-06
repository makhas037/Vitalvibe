// File: /src/api/core/BaseProvider.js

/**
 * Base class for all health data providers
 * Handles common functionality like error handling, rate limiting, etc.
 */
class BaseProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.isConnected = false;
    this.rateLimitRemaining = null;
    this.rateLimitReset = null;
    
    // Callbacks
    this.onDataUpdate = config.onDataUpdate || (() => {});
    this.onConnectionChange = config.onConnectionChange || (() => {});
    this.onError = config.onError || (() => {});
    this.onRateLimit = config.onRateLimit || (() => {});
    
    console.log(`✅ ${name} Provider initialized`);
  }

  /**
   * Store tokens securely
   */
  storeTokens(tokens, providerName = this.name) {
    const key = `vitalvibe_${providerName}_tokens`;
    localStorage.setItem(key, JSON.stringify({
      ...tokens,
      provider: providerName,
      timestamp: new Date().toISOString()
    }));
    console.log(`🔐 ${providerName} tokens stored`);
  }

  /**
   * Load stored tokens
   */
  loadStoredTokens(providerName = this.name) {
    try {
      const key = `vitalvibe_${providerName}_tokens`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn(`⚠️ Failed to load ${providerName} tokens:`, error.message);
      return null;
    }
  }

  /**
   * Clear stored tokens
   */
  clearTokens(providerName = this.name) {
    const key = `vitalvibe_${providerName}_tokens`;
    localStorage.removeItem(key);
    this.isConnected = false;
    console.log(`🗑️ ${providerName} tokens cleared`);
  }

  /**
   * Update rate limit information
   */
  updateRateLimitInfo(response) {
    const remaining = response.headers?.get('X-RateLimit-Remaining') ||
                      response.headers?.get('Fitbit-Rate-Limit-Remaining');
    const reset = response.headers?.get('X-RateLimit-Reset') ||
                  response.headers?.get('Fitbit-Rate-Limit-Reset');
    
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = new Date(parseInt(reset) * 1000);
  }

  /**
   * Check if rate limited and wait if needed
   */
  async checkRateLimit() {
    if (this.rateLimitRemaining && this.rateLimitRemaining <= 5) {
      const waitTime = this.rateLimitReset ? 
        this.rateLimitReset - new Date() : 60000;
      
      if (waitTime > 0) {
        console.warn(`⚠️ ${this.name} rate limit low, waiting ${waitTime}ms`);
        this.onRateLimit({ 
          provider: this.name, 
          retryAfter: Math.ceil(waitTime / 1000) 
        });
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(waitTime, 60000))
        );
      }
    }
  }

  /**
   * Make HTTP request with error handling
   */
  async makeRequest(url, options = {}) {
    await this.checkRateLimit();

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      this.updateRateLimitInfo(response);

      if (!response.ok) {
        throw new Error(
          `${this.name} API Error (${response.status}): ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ ${this.name} request failed:`, error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      provider: this.name,
      connected: this.isConnected,
      rateLimitRemaining: this.rateLimitRemaining,
      rateLimitReset: this.rateLimitReset
    };
  }
}

export default BaseProvider;
