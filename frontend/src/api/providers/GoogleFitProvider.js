// File: /src/api/providers/GoogleFitProvider.js

import BaseProvider from '../core/BaseProvider';

class GoogleFitProvider extends BaseProvider {
  constructor(options = {}) {
    super('Google Fit', options);
    
    this.clientId = import.meta.env.VITE_GOOGLE_FIT_CLIENT_ID;
    this.clientSecret = import.meta.env.VITE_GOOGLE_FIT_CLIENT_SECRET;
    this.redirectUri = import.meta.env.VITE_GOOGLE_FIT_REDIRECT_URI ||
                       `${window.location.origin}/auth/googlefit`;
    
    this.baseUrl = 'https://www.googleapis.com/fitness/v1';
    this.accessToken = null;
    this.refreshToken = null;
    
    this.loadStoredTokens();
  }

  async connect() {
    const stored = this.loadStoredTokens();
    
    if (stored?.accessToken) {
      this.accessToken = stored.accessToken;
      this.refreshToken = stored.refreshToken;
      this.isConnected = true;
      
      this.onConnectionChange({ connected: true, provider: 'google-fit' });
      return { success: true };
    }

    return this.initiateOAuth();
  }

  initiateOAuth() {
    const scope = encodeURIComponent([
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' '));

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline'
    })}`;

    window.location.href = authUrl;
    return { redirect: true, url: authUrl };
  }

  async fetchData(timeRange = 'today') {
    if (!this.isConnected) throw new Error('Google Fit not connected');

    const dateRange = this.getDateRange(timeRange);
    const startTime = new Date(dateRange.start).getTime();
    const endTime = new Date(dateRange.end).getTime();

    try {
      const [activity, heartRate, sleep] = await Promise.allSettled([
        this.fetchActivityData(startTime, endTime),
        this.fetchHeartRateData(startTime, endTime),
        this.fetchSleepData(startTime, endTime)
      ]);

      const data = {
        activity: activity.status === 'fulfilled' ? activity.value : null,
        heartRate: heartRate.status === 'fulfilled' ? heartRate.value : null,
        sleep: sleep.status === 'fulfilled' ? sleep.value : null,
        metadata: {
          lastSync: new Date(),
          provider: 'google-fit',
          timeRange
        }
      };

      this.onDataUpdate(data);
      return data;
    } catch (error) {
      console.error('❌ Google Fit fetch failed:', error);
      throw error;
    }
  }

  async fetchActivityData(startTime, endTime) {
    return await this.makeRequest(
      `${this.baseUrl}/users/me/dataset:aggregate`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta'
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        })
      }
    );
  }

  async fetchHeartRateData(startTime, endTime) {
    return await this.makeRequest(
      `${this.baseUrl}/users/me/dataset:aggregate`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.heart_rate.bpm'
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        })
      }
    );
  }

  async fetchSleepData(startTime, endTime) {
    return await this.makeRequest(
      `${this.baseUrl}/users/me/dataset:aggregate`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.sleep.segment'
          }],
          bucketByTime: { durationMillis: 86400000 },
          startTimeMillis: startTime,
          endTimeMillis: endTime
        })
      }
    );
  }

  getDateRange(timeRange) {
    const today = new Date().toISOString().split('T')[0];
    const date = new Date();
    
    switch (timeRange) {
      case 'today':
        return { start: today, end: today };
      case 'week':
        date.setDate(date.getDate() - 7);
        return { start: date.toISOString().split('T')[0], end: today };
      case 'month':
        date.setDate(date.getDate() - 30);
        return { start: date.toISOString().split('T')[0], end: today };
      default:
        return { start: today, end: today };
    }
  }

  async disconnect() {
    this.clearTokens();
    this.isConnected = false;
    this.onConnectionChange({ connected: false, provider: 'google-fit' });
  }
}

export default GoogleFitProvider;
