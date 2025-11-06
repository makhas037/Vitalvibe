// File: /src/api/providers/FitbitProvider.js
// ==========================================
// ULTIMATE FITBIT PROVIDER
// Combines best features of both implementations
// ==========================================

import BaseProvider from '../core/BaseProvider';
import CryptoJS from 'crypto-js';

class FitbitProvider extends BaseProvider {
  constructor(options = {}) {
    super('Fitbit', options);
    
    // OAuth Configuration
    this.clientId = import.meta.env.VITE_FITBIT_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_FITBIT_CLIENT_SECRET;
    this.redirectUri = import.meta.env.VITE_FITBIT_REDIRECT_URI || 
                       `${window.location.origin}/auth/fitbit`;
    this.encryptionKey = import.meta.env.VITE_ENCRYPTION_KEY;
    
    // API Configuration
    this.baseUrl = 'https://api.fitbit.com/1';
    this.authUrl = 'https://www.fitbit.com/oauth2/authorize';
    this.tokenUrl = 'https://api.fitbit.com/oauth2/token';
    this.revokeUrl = 'https://api.fitbit.com/oauth2/revoke';
    
    // Token Management
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // Rate Limiting
    this.rateLimitRemaining = 150;
    this.rateLimitReset = null;
    
    // Load existing tokens
    this.loadStoredTokens();
    
    // Setup error handling
    this.setupErrorHandling();
    
    console.log('🔧 FitbitProvider configured', {
      clientId: this.clientId ? '✅' : '❌',
      encryption: this.encryptionKey ? '✅' : '⚠️',
      redirectUri: this.redirectUri
    });
  }

  // ========================================
  // INITIALIZATION & CONNECTION
  // ========================================

  /**
   * Main connection method
   * Handles OAuth flow, token validation, and profile verification
   */
  async connect(credentials = null) {
    try {
      console.log('🔗 Starting Fitbit connection...');
      
      // Priority 1: Use provided credentials
      if (credentials?.accessToken) {
        this.connectWithTokens(credentials);
        console.log('🔑 Using provided credentials');
      }
      // Priority 2: Use stored tokens
      else if (this.hasStoredTokens()) {
        await this.validateStoredTokens();
        console.log('✅ Using stored tokens');
      }
      // Priority 3: Start OAuth flow
      else {
        console.log('🚀 Starting OAuth flow');
        return this.initiateOAuth();
      }

      // Verify connection with profile
      const profile = await this.fetchUserProfile();
      this.isConnected = true;
      
      console.log('✅ Fitbit connected successfully', {
        user: profile.user?.displayName,
        avatar: profile.user?.avatar ? '✅' : '❌'
      });
      
      // Notify listeners
      this.onConnectionChange({
        connected: true,
        provider: 'fitbit',
        profile: profile.user,
        timestamp: new Date()
      });
      
      return {
        success: true,
        profile: profile.user,
        message: 'Successfully connected to Fitbit'
      };
      
    } catch (error) {
      console.error('❌ Fitbit connection failed:', error);
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Connect using provided tokens
   */
  connectWithTokens(credentials) {
    this.accessToken = credentials.accessToken;
    this.refreshToken = credentials.refreshToken;
    this.tokenExpiry = credentials.tokenExpiry ? 
      new Date(credentials.tokenExpiry) : null;
    this.storeTokens();
  }

  /**
   * Validate and refresh stored tokens
   */
  async validateStoredTokens() {
    const stored = this.loadStoredTokens();
    if (!stored) {
      throw new Error('No stored tokens found');
    }
    
    // Check expiration and refresh if needed
    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Check if valid tokens are stored
   */
  hasStoredTokens() {
    return !!(this.accessToken && this.refreshToken);
  }

  // ========================================
  // OAUTH FLOW
  // ========================================

  /**
   * Initiate OAuth authorization flow with PKCE
   */
  initiateOAuth() {
    const scope = [
      'activity', 'heartrate', 'location', 'nutrition',
      'profile', 'settings', 'sleep', 'social', 'weight'
    ].join(' ');

    // Generate PKCE parameters
    const state = this.generateSecureState();
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // Store PKCE parameters
    this.storeOAuthState(state, codeVerifier);

    // Build authorization URL
    const authUrl = `${this.authUrl}?${new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    })}`;

    console.log('🌐 Redirecting to Fitbit OAuth...');
    window.location.href = authUrl;
    
    return { redirect: true, url: authUrl };
  }

  /**
   * Handle OAuth callback from Fitbit
   */
  async handleOAuthCallback(code, state) {
    console.log('🔄 Processing OAuth callback...');
    
    const storedState = this.getStoredOAuthState();
    if (!storedState || state !== storedState.state) {
      throw new Error('Invalid OAuth state - possible CSRF attack');
    }

    try {
      const tokenData = await this.exchangeCodeForToken(code, storedState.codeVerifier);
      
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token;
      this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

      this.storeTokens();
      this.clearOAuthState();
      
      console.log('✅ OAuth callback processed successfully');
      return tokenData;
      
    } catch (error) {
      console.error('❌ OAuth callback failed:', error);
      this.clearOAuthState();
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code, codeVerifier) {
    const response = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
        code,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error_description || response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('🔄 Refreshing access token...');

    try {
      const response = await fetch(this.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Token refresh failed: ${error.error_description || response.statusText}`);
      }

      const tokenData = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token || this.refreshToken;
      this.tokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);

      this.storeTokens();
      console.log('✅ Access token refreshed successfully');
      
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      this.clearTokens();
      throw error;
    }
  }

  // ========================================
  // DATA FETCHING
  // ========================================

  /**
   * Fetch all health data for specified time range
   */
  async fetchData(timeRange = 'today') {
    if (!this.isConnected) {
      throw new Error('Fitbit not connected');
    }

    console.log(`📊 Fetching Fitbit data for: ${timeRange}`);
    await this.ensureValidToken();

    const dateRange = this.getDateRange(timeRange);
    const startTime = Date.now();

    try {
      // Fetch all data in parallel
      const [
        activity,
        heartRate,
        sleep,
        weight,
        nutrition
      ] = await Promise.allSettled([
        this.fetchActivityData(dateRange),
        this.fetchHeartRateData(dateRange),
        this.fetchSleepData(dateRange),
        this.fetchWeightData(dateRange),
        this.fetchNutritionData(dateRange)
      ]);

      const data = {
        activity: activity.status === 'fulfilled' ? activity.value : null,
        heartRate: heartRate.status === 'fulfilled' ? heartRate.value : null,
        sleep: sleep.status === 'fulfilled' ? sleep.value : null,
        weight: weight.status === 'fulfilled' ? weight.value : null,
        nutrition: nutrition.status === 'fulfilled' ? nutrition.value : null,
        metadata: {
          lastSync: new Date(),
          provider: 'fitbit',
          timeRange,
          fetchTime: Date.now() - startTime,
          rateLimitRemaining: this.rateLimitRemaining
        }
      };

      console.log('✅ Fitbit data fetched successfully', {
        fetchTime: `${data.metadata.fetchTime}ms`,
        rateLimitRemaining: this.rateLimitRemaining
      });

      this.onDataUpdate(data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to fetch Fitbit data:', error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Fetch activity data
   */
  async fetchActivityData(dateRange) {
    const endpoints = [
      `user/-/activities/date/${dateRange.start}.json`,
      `user/-/activities/steps/date/${dateRange.start}/${dateRange.end}.json`,
      `user/-/activities/calories/date/${dateRange.start}/${dateRange.end}.json`,
      `user/-/activities/distance/date/${dateRange.start}/${dateRange.end}.json`,
      `user/-/activities/floors/date/${dateRange.start}/${dateRange.end}.json`,
      `user/-/activities/minutesVeryActive/date/${dateRange.start}/${dateRange.end}.json`
    ];

    const requests = endpoints.map(endpoint => 
      this.makeRequest(endpoint).catch(error => {
        console.warn(`Activity endpoint failed: ${endpoint}`, error);
        return null;
      })
    );

    const responses = await Promise.all(requests);

    return {
      summary: responses[0],
      steps: responses[1]?.['activities-steps'] || [],
      calories: responses[2]?.['activities-calories'] || [],
      distance: responses[3]?.['activities-distance'] || [],
      floors: responses[4]?.['activities-floors'] || [],
      activeMinutes: responses[5]?.['activities-minutesVeryActive'] || []
    };
  }

  /**
   * Fetch heart rate data
   */
  async fetchHeartRateData(dateRange) {
    try {
      const [timeSeries, intraday] = await Promise.allSettled([
        this.makeRequest(`user/-/activities/heart/date/${dateRange.start}/${dateRange.end}.json`),
        this.makeRequest(`user/-/activities/heart/date/${dateRange.start}/1d/1min.json`)
      ]);

      return {
        timeSeries: timeSeries.status === 'fulfilled' ? timeSeries.value['activities-heart'] : [],
        intraday: intraday.status === 'fulfilled' ? intraday.value['activities-heart-intraday'] : null,
        zones: timeSeries.status === 'fulfilled' ? 
          timeSeries.value['activities-heart']?.[0]?.value?.heartRateZones || [] : []
      };
    } catch (error) {
      console.warn('Heart rate data unavailable:', error.message);
      return { timeSeries: [], intraday: null, zones: [] };
    }
  }

  /**
   * Fetch sleep data
   */
  async fetchSleepData(dateRange) {
    try {
      const response = await this.makeRequest(`user/-/sleep/date/${dateRange.start}.json`);
      return response.sleep?.[0] || {};
    } catch (error) {
      console.warn('Sleep data unavailable:', error.message);
      return {};
    }
  }

  /**
   * Fetch weight data
   */
  async fetchWeightData(dateRange) {
    try {
      const response = await this.makeRequest(`user/-/body/log/weight/date/${dateRange.start}/${dateRange.end}.json`);
      return response.weight || [];
    } catch (error) {
      console.warn('Weight data unavailable:', error.message);
      return [];
    }
  }

  /**
   * Fetch nutrition data
   */
  async fetchNutritionData(dateRange) {
    try {
      const response = await this.makeRequest(`user/-/foods/log/date/${dateRange.start}.json`);
      return response.summary || {};
    } catch (error) {
      console.warn('Nutrition data unavailable:', error.message);
      return {};
    }
  }

  /**
   * Fetch user profile
   */
  async fetchUserProfile() {
    return await this.makeRequest('user/-/profile.json');
  }

  // ========================================
  // HTTP REQUEST HANDLING
  // ========================================

  /**
   * Make HTTP request with token management and rate limiting
   */
  async makeRequest(endpoint, options = {}) {
    await this.ensureValidToken();
    await this.checkRateLimit();

    const url = `${this.baseUrl}/${endpoint}`;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    };

    console.log(`🌐 ${requestOptions.method} ${endpoint}`);

    try {
      const response = await fetch(url, requestOptions);
      
      // Update rate limit info
      this.updateRateLimitInfo(response);

      if (!response.ok) {
        await this.handleHTTPError(response, endpoint);
      }

      return await response.json();
      
    } catch (error) {
      console.error(`❌ Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * Handle HTTP errors
   */
  async handleHTTPError(response, endpoint) {
    const errorData = await response.json().catch(() => ({}));
    
    // Token expired - attempt refresh
    if (response.status === 401) {
      console.log('🔄 Token expired, attempting refresh...');
      await this.refreshAccessToken();
      throw new Error('TOKEN_EXPIRED');
    }
    
    // Rate limited
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 3600;
      this.onRateLimit({ retryAfter: parseInt(retryAfter) });
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }
    
    throw new Error(
      `Fitbit API error (${response.status}): ${errorData.errors?.[0]?.message || response.statusText}`
    );
  }

  /**
   * Update rate limit information from response headers
   */
  updateRateLimitInfo(response) {
    const remaining = response.headers.get('Fitbit-Rate-Limit-Remaining');
    const reset = response.headers.get('Fitbit-Rate-Limit-Reset');
    
    if (remaining) this.rateLimitRemaining = parseInt(remaining);
    if (reset) this.rateLimitReset = new Date(parseInt(reset) * 1000);
  }

  /**
   * Check rate limit and wait if necessary
   */
  async checkRateLimit() {
    if (this.rateLimitRemaining <= 5) {
      const waitTime = this.rateLimitReset ? 
        this.rateLimitReset - new Date() : 60000;
      
      if (waitTime > 0) {
        console.warn(`⚠️ Rate limit low (${this.rateLimitRemaining}), waiting...`);
        this.onRateLimit({ 
          provider: 'fitbit',
          retryAfter: Math.ceil(waitTime / 1000)
        });
        await new Promise(resolve => 
          setTimeout(resolve, Math.min(waitTime, 60000))
        );
      }
    }
  }

  // ========================================
  // TOKEN & SECURITY MANAGEMENT
  // ========================================

  /**
   * Ensure access token is valid
   */
  async ensureValidToken() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Store tokens securely (with optional encryption)
   */
  storeTokens() {
    const tokens = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry?.toISOString(),
      provider: 'fitbit',
      timestamp: new Date().toISOString()
    };

    const tokenString = JSON.stringify(tokens);
    const storedValue = this.encryptionKey ? 
      CryptoJS.AES.encrypt(tokenString, this.encryptionKey).toString() : 
      tokenString;

    localStorage.setItem('vitalvibe_fitbit_tokens', storedValue);
    console.log('🔐 Fitbit tokens stored', {
      encrypted: !!this.encryptionKey
    });
  }

  /**
   * Load tokens from storage (with optional decryption)
   */
  loadStoredTokens() {
    try {
      const stored = localStorage.getItem('vitalvibe_fitbit_tokens');
      if (!stored) return false;

      let tokenString = stored;

      // Decrypt if encryption key exists
      if (this.encryptionKey) {
        try {
          const decrypted = CryptoJS.AES.decrypt(stored, this.encryptionKey);
          tokenString = decrypted.toString(CryptoJS.enc.Utf8);
        } catch (e) {
          console.warn('⚠️ Decryption failed, tokens may be corrupted');
          this.clearTokens();
          return false;
        }
      }

      const tokens = JSON.parse(tokenString);
      
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.tokenExpiry = tokens.tokenExpiry ? new Date(tokens.tokenExpiry) : null;

      console.log('✅ Stored tokens loaded');
      return true;
      
    } catch (error) {
      console.warn('⚠️ Failed to load tokens:', error.message);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all stored tokens
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.isConnected = false;
    localStorage.removeItem('vitalvibe_fitbit_tokens');
    console.log('🗑️ Fitbit tokens cleared');
  }

  // ========================================
  // PKCE SECURITY
  // ========================================

  /**
   * Generate secure random state
   */
  generateSecureState() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate PKCE code verifier
   */
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Store OAuth state and code verifier
   */
  storeOAuthState(state, codeVerifier) {
    const oauthData = {
      state,
      codeVerifier,
      timestamp: Date.now()
    };
    sessionStorage.setItem('vitalvibe_fitbit_oauth', JSON.stringify(oauthData));
  }

  /**
   * Retrieve stored OAuth state
   */
  getStoredOAuthState() {
    const stored = sessionStorage.getItem('vitalvibe_fitbit_oauth');
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      // Validate state is not older than 10 minutes
      if (Date.now() - data.timestamp > 600000) {
        this.clearOAuthState();
        return null;
      }
      return data;
    } catch {
      this.clearOAuthState();
      return null;
    }
  }

  /**
   * Clear OAuth state
   */
  clearOAuthState() {
    sessionStorage.removeItem('vitalvibe_fitbit_oauth');
  }

  // ========================================
  // DISCONNECTION & CLEANUP
  // ========================================

  /**
   * Disconnect from Fitbit
   */
  async disconnect() {
    console.log('🔌 Disconnecting from Fitbit...');

    try {
      // Attempt token revocation
      if (this.accessToken) {
        await fetch(this.revokeUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
          },
          body: new URLSearchParams({ token: this.accessToken })
        }).catch(error => console.warn('⚠️ Token revocation failed:', error));
      }
    } catch (error) {
      console.warn('⚠️ Error during token revocation:', error.message);
    }

    // Clear all data
    this.clearTokens();
    this.clearOAuthState();

    this.onConnectionChange({ connected: false, provider: 'fitbit' });
    console.log('✅ Disconnected from Fitbit');
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    window.addEventListener('unload', () => this.cleanup());
  }

  /**
   * Handle connection errors
   */
  handleConnectionError(error) {
    this.onError(error);
    if (error.message.includes('401') || error.message.includes('TOKEN_EXPIRED')) {
      this.clearTokens();
    }
  }

  /**
   * Cleanup on window unload
   */
  cleanup() {
    this.clearOAuthState();
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Get date range for specified time period
   */
  getDateRange(timeRange) {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];

    switch (timeRange) {
      case 'today':
        return { start: formatDate(today), end: formatDate(today) };
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { start: formatDate(weekAgo), end: formatDate(today) };
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start: formatDate(monthAgo), end: formatDate(today) };
      case 'year':
        const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
        return { start: formatDate(yearAgo), end: formatDate(today) };
      default:
        return { start: formatDate(today), end: formatDate(today) };
    }
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      hasTokens: this.hasStoredTokens(),
      tokenExpiry: this.tokenExpiry,
      rateLimitRemaining: this.rateLimitRemaining,
      rateLimitReset: this.rateLimitReset
    };
  }
}

export default FitbitProvider;
