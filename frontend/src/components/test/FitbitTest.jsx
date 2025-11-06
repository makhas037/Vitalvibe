// File: /src/components/test/FitbitTest.jsx

import React, { useState, useEffect } from 'react';
import FitbitAPI from '../../api/FitbitAPI';

const FitbitTest = () => {
  const [fitbitApi, setFitbitApi] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    // Initialize Fitbit API
    const api = new FitbitAPI({
      onDataUpdate: (data) => {
        console.log('📊 Data update received:', data);
        setHealthData(data);
        addTestResult('Data Update', 'Data received successfully', 'success');
      },
      onConnectionChange: (status) => {
        console.log('🔗 Connection changed:', status);
        setConnectionStatus(status);
        addTestResult('Connection Change', `Status: ${status.connected}`, status.connected ? 'success' : 'error');
      },
      onError: (error) => {
        console.error('❌ Fitbit error:', error);
        addTestResult('Error', error.message, 'error');
      },
      onRateLimit: (info) => {
        console.warn('⚠️  Rate limit:', info);
        addTestResult('Rate Limit', `Retry after: ${info.retryAfter}s`, 'warning');
      }
    });

    setFitbitApi(api);
  }, []);

  const addTestResult = (action, message, type) => {
    const result = {
      id: Date.now(),
      timestamp: new Date(),
      action,
      message,
      type
    };
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testConnection = async () => {
    if (!fitbitApi) return;
    
    setIsLoading(true);
    addTestResult('Connection Test', 'Starting connection test...', 'info');
    
    try {
      const result = await fitbitApi.connect();
      addTestResult('Connection Test', `Success: ${result.message}`, 'success');
    } catch (error) {
      addTestResult('Connection Test', `Failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testDataFetch = async () => {
    if (!fitbitApi || !fitbitApi.isConnected) {
      addTestResult('Data Fetch', 'Not connected to Fitbit', 'error');
      return;
    }

    setIsLoading(true);
    addTestResult('Data Fetch', 'Fetching data...', 'info');

    try {
      const data = await fitbitApi.fetchData('today');
      addTestResult('Data Fetch', 'Data fetched successfully', 'success');
    } catch (error) {
      addTestResult('Data Fetch', `Failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testDisconnect = async () => {
    if (!fitbitApi) return;

    setIsLoading(true);
    addTestResult('Disconnect Test', 'Disconnecting...', 'info');

    try {
      await fitbitApi.disconnect();
      addTestResult('Disconnect Test', 'Disconnected successfully', 'success');
    } catch (error) {
      addTestResult('Disconnect Test', `Failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ 
        background: '#1F2937', 
        padding: '24px', 
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <h1 style={{ color: '#F9FAFB', margin: '0 0 16px 0' }}>
          🏥 Fitbit API Integration Test
        </h1>
        <p style={{ color: '#9CA3AF', margin: 0 }}>
          Test your Fitbit API integration and monitor connection status
        </p>
      </div>

      {/* Connection Status */}
      <div style={{ 
        background: '#374151', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: '#F9FAFB', margin: '0 0 12px 0' }}>Connection Status</h3>
        {connectionStatus ? (
          <div>
            <div style={{ color: connectionStatus.connected ? '#10B981' : '#EF4444' }}>
              {connectionStatus.connected ? '✅ Connected' : '❌ Disconnected'}
            </div>
            {connectionStatus.profile && (
              <div style={{ color: '#D1D5DB', marginTop: '8px' }}>
                👤 {connectionStatus.profile.fullName} ({connectionStatus.profile.memberSince})
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: '#9CA3AF' }}>Not tested yet</div>
        )}
      </div>

      {/* Test Controls */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <button
          onClick={testConnection}
          disabled={isLoading}
          style={{
            background: '#3B82F6',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? '⏳ Testing...' : '🔗 Test Connection'}
        </button>

        <button
          onClick={testDataFetch}
          disabled={isLoading || !connectionStatus?.connected}
          style={{
            background: '#10B981',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: (isLoading || !connectionStatus?.connected) ? 0.7 : 1
          }}
        >
          {isLoading ? '⏳ Fetching...' : '📊 Fetch Data'}
        </button>

        <button
          onClick={testDisconnect}
          disabled={isLoading}
          style={{
            background: '#EF4444',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? '⏳ Disconnecting...' : '🔌 Disconnect'}
        </button>
      </div>

      {/* Test Results */}
      <div style={{ 
        background: '#374151', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <h3 style={{ color: '#F9FAFB', margin: '0 0 16px 0' }}>Test Results</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {testResults.length === 0 ? (
            <div style={{ color: '#9CA3AF' }}>No tests run yet</div>
          ) : (
            testResults.map((result) => (
              <div 
                key={result.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid #4B5563',
                  color: getStatusColor(result.type)
                }}
              >
                <div>
                  <strong>{result.action}:</strong> {result.message}
                </div>
                <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Health Data Preview */}
      {healthData && (
        <div style={{ 
          background: '#374151', 
          padding: '20px', 
          borderRadius: '8px'
        }}>
          <h3 style={{ color: '#F9FAFB', margin: '0 0 16px 0' }}>Latest Health Data</h3>
          <pre style={{ 
            background: '#1F2937',
            padding: '12px',
            borderRadius: '4px',
            color: '#D1D5DB',
            fontSize: '12px',
            overflow: 'auto'
          }}>
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}

      {/* Configuration Help */}
      <div style={{ 
        background: '#065F46', 
        padding: '16px', 
        borderRadius: '8px',
        marginTop: '24px'
      }}>
        <h4 style={{ color: '#D1FAE5', margin: '0 0 8px 0' }}>📋 Configuration Required:</h4>
        <ol style={{ color: '#A7F3D0', margin: 0 }}>
          <li>Create a Fitbit app at <a href="https://dev.fitbit.com/apps" style={{ color: '#34D399' }}>dev.fitbit.com</a></li>
          <li>Add your Client ID and Secret to .env.local</li>
          <li>Set redirect URI to: http://localhost:3000/auth/fitbit</li>
          <li>Click "Test Connection" to start OAuth flow</li>
        </ol>
      </div>
    </div>
  );
};

export default FitbitTest;
