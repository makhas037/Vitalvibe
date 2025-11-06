// File: /src/pages/TermsPage/index.jsx
import React from 'react';
import './TermsPage.css';

const TermsPage = () => {
  const sections = [
    {
      num: '1',
      title: 'Information We Collect',
      content: 'VitalVibe collects health and fitness data from connected devices and services including Fitbit, Google Fit, and Apple Health. This includes activity data, sleep metrics, heart rate, nutrition, and mood information.'
    },
    {
      num: '2',
      title: 'How We Use Your Information',
      content: 'Your health data is used to provide personalized insights, health recommendations, and analytics. We process data solely for providing VitalVibe services and never sell your data to third parties.'
    },
    {
      num: '3',
      title: 'Data Security',
      content: 'We implement industry-standard security measures including encryption at rest and in transit, regular security audits, and secure token storage to protect your health data.'
    },
    {
      num: '4',
      title: 'Data Sharing',
      content: 'We do not sell, trade, or share your personal health data with third parties. Your data remains private and is used exclusively to improve your VitalVibe experience.'
    },
    {
      num: '5',
      title: 'Your Rights',
      content: 'You have the right to access, modify, export, or delete your data at any time. You can disconnect integrated services or disable data collection through your account settings.'
    }
  ];

  return (
    <div className="terms-page">
      <header className="terms-header">
        <h1>📋 Terms of Service</h1>
        <p>Last updated: November 2024</p>
      </header>

      <div className="terms-container">
        <div className="terms-intro">
          <p>Welcome to VitalVibe. These terms and conditions outline the rules and regulations for the use of our service. By accessing this application, we assume you accept these terms and conditions.</p>
        </div>

        <div className="terms-content">
          {sections.map((section, idx) => (
            <div key={idx} className="term-section">
              <div className="section-number">{section.num}</div>
              <div className="section-content">
                <h2>{section.title}</h2>
                <p>{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="terms-footer">
          <h3>Questions?</h3>
          <p>If you have any questions about these terms, please contact us at support@vitalvibe.app</p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
