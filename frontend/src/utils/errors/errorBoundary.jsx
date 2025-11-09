/**
 * utils/errors/errorBoundary.jsx
 * Error Boundary Component
 * Catches React errors
 */

import React from 'react';
import ErrorHandler from './errorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    ErrorHandler.log(
      {
        message: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      },
      'ErrorBoundary'
    );
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 'var(--spacing-2xl)',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>
            ⚠️ Something went wrong
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '24px',
            maxWidth: '500px'
          }}>
            {this.state.error?.toString()}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details style={{
              maxWidth: '600px',
              textAlign: 'left',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                Error Details (Development Only)
              </summary>
              {this.state.error?.stack}
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
