// File: /src/pages/AboutPage/index.jsx
import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  const features = [
    { icon: '📊', title: 'Comprehensive Dashboards', desc: 'Beautiful, real-time health data visualization' },
    { icon: '🔗', title: 'Multi-Platform Integration', desc: 'Connect with Fitbit, Google Fit, Apple Health' },
    { icon: '🤖', title: 'AI-Powered Insights', desc: 'Get personalized health recommendations' },
    { icon: '📈', title: 'Advanced Analytics', desc: 'Track trends and patterns in your health data' },
    { icon: '🔐', title: 'Privacy First', desc: 'Your data is encrypted and secure' },
    { icon: '📱', title: 'Responsive Design', desc: 'Works seamlessly on all devices' }
  ];

  const team = [
    { icon: '👨‍💻', name: 'Development', desc: 'Built with React, Node.js, MongoDB' },
    { icon: '🎨', name: 'Design', desc: 'Modern dark theme with cyan accents' },
    { icon: '🔒', name: 'Security', desc: 'Industry-standard encryption & best practices' }
  ];

  return (
    <div className="about-page">
      <header className="about-header">
        <div className="header-content">
          <h1>💚 About VitalVibe</h1>
          <p>Your comprehensive health and wellness companion</p>
        </div>
      </header>

      <div className="about-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-icon">💪</div>
          <h2>Empowering Your Health Journey</h2>
          <p>VitalVibe is a comprehensive health tracking platform designed to help you take control of your wellbeing through intelligent analytics, personalized insights, and seamless integration with popular health devices and apps.</p>
        </section>

        {/* Features Grid */}
        <section className="features-section">
          <h2>✨ Key Features</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack */}
        <section className="tech-section">
          <h2>🛠️ Technology Stack</h2>
          <div className="tech-grid">
            {['React', 'Node.js', 'MongoDB', 'Google Gemini AI', 'Chart.js', 'REST API'].map((tech, idx) => (
              <div key={idx} className="tech-badge">{tech}</div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="team-section">
          <h2>👥 Built By</h2>
          <div className="team-grid">
            {team.map((member, idx) => (
              <div key={idx} className="team-card">
                <div className="team-icon">{member.icon}</div>
                <h3>{member.name}</h3>
                <p>{member.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Version */}
        <section className="version-section">
          <div className="version-card">
            <h3>Version 1.0.0</h3>
            <p>Released: November 2024</p>
            <p className="version-desc">Initial release with core health tracking features, API integrations, and AI-powered insights.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
