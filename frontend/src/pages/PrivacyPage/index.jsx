// File: /src/pages/PrivacyPage/index.jsx
import React, { useState } from 'react';
import './PrivacyPage.css';

const PrivacyPage = () => {
  const [expanded, setExpanded] = useState(null);

  const sections = [
    {
      title: '🔒 Privacy & Data',
      content: 'Manage your privacy preferences and data controls'
    },
    {
      title: '🛡️ Data Security',
      content: 'Industry-standard encryption protects your health data'
    },
    {
      title: '📤 Export my data',
      content: 'Download a copy of all your personal data'
    },
    {
      title: '🗑️ Delete my data',
      content: 'Permanently remove your account and all data'
    }
  ];

  return (
    <div className="privacy-page">
      <header className="page-header-privacy">
        <h1>🔐 Privacy & Data</h1>
        <p>Manage your privacy preferences and data controls</p>
      </header>

      <div className="privacy-container">
        <div className="privacy-content">
          {/* Privacy Controls */}
          <section className="privacy-section">
            <h2>Privacy Controls</h2>
            <div className="control-item">
              <h3>Analytics & Performance</h3>
              <p>Help improve the app with anonymous usage data</p>
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                <span>Allow analytics</span>
              </label>
            </div>
            <div className="control-item">
              <h3>Marketing Communications</h3>
              <p>Receive updates about new features and health tips</p>
              <label className="checkbox">
                <input type="checkbox" />
                <span>Allow marketing emails</span>
              </label>
            </div>
            <div className="control-item">
              <h3>Crash Reports</h3>
              <p>Automatically send crash reports to improve stability</p>
              <label className="checkbox">
                <input type="checkbox" defaultChecked />
                <span>Send crash reports</span>
              </label>
            </div>
          </section>

          {/* Data Management */}
          <section className="privacy-section">
            <h2>Data Management</h2>
            <div className="action-item">
              <h3>📥 Export my data</h3>
              <p>Download a complete copy of your personal data in CSV format</p>
              <button className="btn-secondary">Export Data</button>
            </div>
            <div className="action-item danger">
              <h3>🗑️ Delete my account</h3>
              <p>Permanently remove your account and all associated data. This cannot be undone.</p>
              <button className="btn-danger">Delete Account</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
