/**
 * FILE: web-app/src/pages/AuthCallbackPage/index.jsx
 * PROFESSIONAL: Generic OAuth callback handler for all providers
 * Supports: Fitbit, Google Fit, and other OAuth providers
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './AuthCallbackPage.css';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Authenticating you...');
  const [provider, setProvider] = useState('OAuth Provider');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extract OAuth parameters
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Detect provider from state or URL
        const detectedProvider = detectProvider();
        setProvider(detectedProvider);

        // Handle errors
        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${errorDescription || error}`);
          console.error(`${detectedProvider} Auth Error:`, error);
          
          // Redirect after 3 seconds
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 3000);
          return;
        }

        // Handle successful authentication
        if (code) {
          await exchangeCodeForToken(code, state, detectedProvider);
        } else if (window.location.hash) {
          // Handle implicit flow (access token in hash)
          await handleImplicitFlow(detectedProvider);
        } else {
          throw new Error('No authorization code or token found');
        }

      } catch (err) {
        console.error('Callback handling error:', err);
        setStatus('error');
        setMessage(`Authentication failed: ${err.message}`);
        
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const detectProvider = () => {
    const state = searchParams.get('state');
    if (state?.includes('fitbit')) return 'Fitbit';
    if (state?.includes('google')) return 'Google Fit';
    if (state?.includes('apple')) return 'Apple Health';
    return 'OAuth Provider';
  };

  const exchangeCodeForToken = async (code, state, providerName) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
      
      // Determine endpoint based on provider
      const endpoints = {
        'Fitbit': '/auth/fitbit/callback',
        'Google Fit': '/auth/google/callback',
        'Apple Health': '/auth/apple/callback'
      };

      const endpoint = endpoints[providerName] || '/auth/oauth/callback';

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          state,
          provider: providerName.toLowerCase()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to exchange code for token');
      }

      const data = await response.json();

      // Store tokens securely
      if (data.access_token) {
        localStorage.setItem(`${providerName.toLowerCase()}_access_token`, data.access_token);
      }
      if (data.refresh_token) {
        localStorage.setItem(`${providerName.toLowerCase()}_refresh_token`, data.refresh_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setStatus('success');
      setMessage(`Successfully connected ${providerName}!`);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);

    } catch (err) {
      throw err;
    }
  };

  const handleImplicitFlow = async (providerName) => {
    try {
      // Extract token from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const expiresIn = params.get('expires_in');

      if (!accessToken) {
        throw new Error('No access token found in callback');
      }

      // Store token
      localStorage.setItem(`${providerName.toLowerCase()}_access_token`, accessToken);
      
      if (expiresIn) {
        const expiryTime = new Date().getTime() + (parseInt(expiresIn) * 1000);
        localStorage.setItem(`${providerName.toLowerCase()}_token_expiry`, expiryTime);
      }

      setStatus('success');
      setMessage(`Successfully connected ${providerName}!`);

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);

    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="auth-callback-page">
      <div className="callback-container">
        <div className={`callback-card ${status}`}>
          {/* Status Icon */}
          <div className="status-icon">
            {status === 'processing' && <div className="spinner"></div>}
            {status === 'success' && <span className="success-icon">✓</span>}
            {status === 'error' && <span className="error-icon">✕</span>}
          </div>

          {/* Message */}
          <h1>{provider}</h1>
          <p className="status-message">{message}</p>

          {/* Additional Info */}
          <div className="callback-info">
            {status === 'success' && (
              <div className="info-box success">
                <p>✅ Authentication successful</p>
                <small>Redirecting to dashboard...</small>
              </div>
            )}
            {status === 'error' && (
              <div className="info-box error">
                <p>❌ Authentication failed</p>
                <small>Redirecting to dashboard...</small>
              </div>
            )}
            {status === 'processing' && (
              <div className="info-box processing">
                <p>⏳ Please wait while we authenticate you</p>
                <small>This typically takes a few seconds</small>
              </div>
            )}
          </div>

          {/* Redirect Message */}
          <p className="redirect-message">
            You will be redirected shortly. If not, <a href="/dashboard">click here</a>.
          </p>
        </div>

        {/* Background Animation */}
        <div className="callback-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
