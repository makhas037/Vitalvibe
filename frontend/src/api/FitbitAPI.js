// File: /src/api/providers/FitbitAPI.js

import CryptoJS from 'crypto-js';

class FitbitAPI {
  constructor(options = {}) {
    // Configuration
    this.clientId = process.env.REACT_APP_FITBIT_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_FITBIT_CLIENT_SECRET;
    this.redirectUri = process.env.REACT_APP_FITBIT_REDIRECT_URI || `${window.location.origin}/auth/fitbit`;
    this.baseUrl = 'https://api.fitbit.com/1';
    this.authUrl = 'https://www.fitbit.com/oauth2/authorize';
    this.tokenUrl = 'https://api.fitbit.com/oauth2/token';
    
    // State management
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.isConnected = false;
    this.rateLimitRemaining = 150; // Fitbit default
    this.rateLimitReset = null;
    
    // Callbacks
    this.onDataUpdate = options.onDataUpdate || (() => {});
    this.onConnectionChange = options.onConnectionChange || (() => {});
    this.onError = options.onError || (() => {});
    this.onRateLimit = options.onRateLimit || (() => {});
    
    // Initialize
    this.loadStoredTokens();
    this.setupErrorHandling();
    
    console.log('🔧 FitbitAPI initialized', { 
      clientId: this.clientId ? '✅ Set' : '❌ Missing',
      redirectUri: this.redirectUri 
    });
  }

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  async connect(credentials = null) {
    console.log('🔗 Starting Fitbit connection...');
    
    try {
      if (credentials?.accessToken) {
        // Direct token connection (for testing or existing tokens)
        await this.connectWithTokens(credentials);
      } else if (this.hasStoredTokens()) {
        // Use stored tokens
        await this.validateStoredTokens();
      } else {
        // Start OAuth flow
        return this.initiateOAuth();
      }

      // Test connection with user profile
      const profile = await this.fetchUserProfile();
      this.isConnected = true;
      
      console.log('✅ Fitbit connected successfully', profile);
      this.onConnectionChange({ 
        connected: true, 
        provider: 'fitbit', 
        profile,
        timestamp: new Date()
      });
      
      return {
        success: true,
        profile,
        message: 'Successfully connected to Fitbit',
        provider: 'fitbit'
      };
      
    } catch (error) {
      console.error('❌ Fitbit connection failed:', error);
      this.handleConnectionError(error);
      throw new Error(`Fitbit connection failed: ${error.message}`);
    }
  }

  async connectWithTokens(credentials) {
    this.accessToken = credentials.accessToken;
    this.refreshToken = credentials.refreshToken;
    this.tokenExpiry = credentials.tokenExpiry ? new Date(credentials.tokenExpiry) : null;
    
    // Store tokens securely
    this.storeTokens();
    console.log('🔑 Connected with provided tokens');
  }

  async validateStoredTokens() {
    if (!this.accessToken) {
      throw new Error('No stored tokens found');
    }
    
    // Check if token is expired
    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      console.log('🔄 Access token expired, refreshing...');
      await this.refreshAccessToken();
    }
    
    console.log('✅ Using stored tokens');
  }

  initiateOAuth() {
    console.log('🚀 Starting OAuth flow...');
    
    const scope = [
      'activity', 'heartrate', 'location', 'nutrition', 
      'profile', 'settings', 'sleep', 'social', 'weight'
    ].join(' ');

    const state = this.generateSecureState();
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // Store PKCE parameters securely
    this.storeOAuthState(state, codeVerifier);

    const authUrl = `${this.authUrl}?${new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scope,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    })}`;

    console.log('🌐 Redirecting to Fitbit OAuth...');
    window.location.href = authUrl;
    
    return { redirect: true, url: authUrl };
  }

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

      // Store tokens securely
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
        code: code,
        code_verifier: codeVerifier
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error_description || response.statusText}`);
    }

    return await response.json();
  }

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
      // Clear invalid tokens
      this.clearTokens();
      throw error;
    }
  }

  // ========================================
  // DATA FETCHING METHODS
  // ========================================

  async fetchData(timeRange = 'today') {
    if (!this.isConnected) {
      throw new Error('Fitbit not connected');
    }

    console.log(`📊 Fetching Fitbit data for: ${timeRange}`);
    await this.ensureValidToken();

    const dateRange = this.getDateRange(timeRange);
    const startTime = Date.now();

    try {
      // Fetch all data types in parallel with error handling
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

  async fetchSleepData(dateRange) {
    try {
      const response = await this.makeRequest(`user/-/sleep/date/${dateRange.start}.json`);
      return response.sleep?.[0] || {};
    } catch (error) {
      console.warn('Sleep data unavailable:', error.message);
      return {};
    }
  }

  async fetchWeightData(dateRange) {
    try {
      const response = await this.makeRequest(`user/-/body/log/weight/date/${dateRange.start}/${dateRange.end}.json`);
      return response.weight || [];
    } catch (error) {
      console.warn('Weight data unavailable:', error.message);
      return [];
    }
  }

  async fetchNutritionData(dateRange) {
    try {
      const response = await this.makeRequest(`user/-/foods/log/date/${dateRange.start}.json`);
      return response.summary || {};
    } catch (error) {
      console.warn('Nutrition data unavailable:', error.message);
      return {};
    }
  }

  async fetchUserProfile() {
    const response = await this.makeRequest('user/-/profile.json');
    return response.user;
  }

  // ========================================
  // HTTP REQUEST HANDLER
  // ========================================

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

    console.log(`🌐 Making request to: ${endpoint}`);

    try {
      const response = await fetch(url, requestOptions);
      
      // Update rate limiting info
      this.updateRateLimitInfo(response);

      if (!response.ok) {
        await this.handleHTTPError(response, endpoint);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error(`❌ Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async handleHTTPError(response, endpoint) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      console.log('🔄 Access token expired, attempting refresh...');
      await this.refreshAccessToken();
      // The caller will retry the request
      throw new Error('TOKEN_EXPIRED');
    }
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || 3600;
      this.onRateLimit({ retryAfter: parseInt(retryAfter) });
      throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }
    
    throw new Error(
      `Fitbit API error (${response.status}): ${errorData.errors?.[0]?.message || response.statusText}`
    );
  }

  updateRateLimitInfo(response) {
    const remaining = response.headers.get('Fitbit-Rate-Limit-Remaining');
    const reset = response.headers.get('Fitbit-Rate-Limit-Reset');
    
    if (remaining) {
      this.rateLimitRemaining = parseInt(remaining);
    }
    if (reset) {
      this.rateLimitReset = new Date(parseInt(reset) * 1000);
    }
  }

  async checkRateLimit() {
    if (this.rateLimitRemaining <= 5) {
      const waitTime = this.rateLimitReset ? this.rateLimitReset - new Date() : 60000;
      if (waitTime > 0) {
        console.warn(`⚠️  Rate limit low (${this.rateLimitRemaining}), waiting ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000)));
      }
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async ensureValidToken() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    if (this.tokenExpiry && new Date() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
  }

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

  // ========================================
  // SECURITY & STORAGE METHODS
  // ========================================

  storeTokens() {
    const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
    if (!encryptionKey) {
      console.warn('⚠️  No encryption key found, storing tokens in plain text');
    }

    const tokens = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry?.toISOString(),
      provider: 'fitbit',
      timestamp: new Date().toISOString()
    };

    const tokenString = JSON.stringify(tokens);
    const encryptedTokens = encryptionKey ? 
      CryptoJS.AES.encrypt(tokenString, encryptionKey).toString() : 
      tokenString;

    localStorage.setItem('vitalvibe_fitbit_tokens', encryptedTokens);
    console.log('🔐 Fitbit tokens stored securely');
  }

  loadStoredTokens() {
    try {
      const stored = localStorage.getItem('vitalvibe_fitbit_tokens');
      if (!stored) return false;

      const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
      let tokenString = stored;

      if (encryptionKey) {
        const decrypted = CryptoJS.AES.decrypt(stored, encryptionKey);
        tokenString = decrypted.toString(CryptoJS.enc.Utf8);
      }

      if (!tokenString) {
        console.warn('⚠️  Failed to decrypt stored tokens');
        return false;
      }

      const tokens = JSON.parse(tokenString);
      
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.tokenExpiry = tokens.tokenExpiry ? new Date(tokens.tokenExpiry) : null;

      console.log('✅ Stored Fitbit tokens loaded');
      return true;
      
    } catch (error) {
      console.warn('⚠️  Failed to load stored tokens:', error.message);
      this.clearTokens();
      return false;
    }
  }

  hasStoredTokens() {
    return !!(this.accessToken && this.refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.isConnected = false;
    localStorage.removeItem('vitalvibe_fitbit_tokens');
    console.log('🗑️  Fitbit tokens cleared');
  }

  storeOAuthState(state, codeVerifier) {
    const oauthData = {
      state,
      codeVerifier,
      timestamp: Date.now()
    };
    sessionStorage.setItem('vitalvibe_fitbit_oauth', JSON.stringify(oauthData));
  }

  getStoredOAuthState() {
    const stored = sessionStorage.getItem('vitalvibe_fitbit_oauth');
    if (!stored) return null;

    try {
      const data = JSON.parse(stored);
      // Check if state is not too old (10 minutes max)
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

  clearOAuthState() {
    sessionStorage.removeItem('vitalvibe_fitbit_oauth');
  }

  // ========================================
  // PKCE METHODS (for OAuth security)
  // ========================================

  generateSecureState() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  generateCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    return window.crypto.subtle.digest('SHA-256', data)
      .then(hash => btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, ''));
  }

  // ========================================
  // ERROR HANDLING & CLEANUP
  // ========================================

  setupErrorHandling() {
    window.addEventListener('unload', () => this.cleanup());
  }

  handleConnectionError(error) {
    this.onError(error);
    if (error.message.includes('401') || error.message.includes('TOKEN_EXPIRED')) {
      this.clearTokens();
    }
  }

  async disconnect() {
    console.log('🔌 Disconnecting from Fitbit...');

    try {
      // Revoke token if possible
      if (this.accessToken) {
        await fetch('https://api.fitbit.com/oauth2/revoke', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
          },
          body: new URLSearchParams({
            token: this.accessToken
          })
        }).catch(error => console.warn('Token revocation failed:', error));
      }
    } catch (error) {
      console.warn('⚠️  Error during token revocation:', error.message);
    }

    // Clear all stored data
    this.clearTokens();
    this.clearOAuthState();

    this.onConnectionChange({ connected: false, provider: 'fitbit' });
    console.log('✅ Disconnected from Fitbit');
  }

  cleanup() {
    this.clearOAuthState();
  }

  // ========================================
  // CONNECTION STATUS
  // ========================================

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      provider: 'fitbit',
      hasTokens: this.hasStoredTokens(),
      tokenExpiry: this.tokenExpiry,
      rateLimitRemaining: this.rateLimitRemaining,
      rateLimitReset: this.rateLimitReset
    };
  }
}

export default FitbitAPI;
