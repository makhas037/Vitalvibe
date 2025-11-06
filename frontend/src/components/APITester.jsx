// File: /src/components/APITester.jsx
import React, { useState } from 'react';
import dashboardAPI from '../services/dashboardAPI';
import './APITester.css';

const APITester = () => {
  const [results, setResults] = useState({});
  const [testing, setTesting] = useState({});

  const testAPI = async (name, apiFunction) => {
    setTesting(prev => ({ ...prev, [name]: true }));
    try {
      const result = await apiFunction();
      setResults(prev => ({ ...prev, [name]: { success: true, data: result } }));
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { success: false, error: error.message } }));
    } finally {
      setTesting(prev => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    { name: 'Fitbit Activity', fn: () => dashboardAPI.getFitbitActivity() },
    { name: 'Fitbit Heart Rate', fn: () => dashboardAPI.getFitbitHeartRate() },
    { name: 'Fitbit Sleep', fn: () => dashboardAPI.getFitbitSleep() },
    { name: 'Weather API', fn: () => dashboardAPI.getWeather() },
    { name: 'COVID Stats', fn: () => dashboardAPI.getCovidStats() },
    { name: 'Health Summary', fn: () => dashboardAPI.getHealthSummary() }
  ];

  return (
    <div className="api-tester">
      <h2>🧪 API Tester</h2>
      <div className="tests-grid">
        {tests.map(test => (
          <div key={test.name} className="test-card">
            <h3>{test.name}</h3>
            <button
              onClick={() => testAPI(test.name, test.fn)}
              disabled={testing[test.name]}
              className="btn-test"
            >
              {testing[test.name] ? 'Testing...' : 'Test API'}
            </button>
            {results[test.name] && (
              <div className={`result ${results[test.name].success ? 'success' : 'error'}`}>
                {results[test.name].success ? (
                  <>
                    <div className="status">✓ Success</div>
                    <pre>{JSON.stringify(results[test.name].data, null, 2)}</pre>
                  </>
                ) : (
                  <>
                    <div className="status">✗ Error</div>
                    <div className="error-msg">{results[test.name].error}</div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default APITester;
