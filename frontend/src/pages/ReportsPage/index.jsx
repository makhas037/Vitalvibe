import React, { useState, useEffect, useRef } from 'react';
import './ReportsPage.css';

const ReportsPage = () => {
  const [healthScore, setHealthScore] = useState(0);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const [animatedStats, setAnimatedStats] = useState({
    steps: 0,
    sleep: 0,
    hydration: 0,
    heartRate: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const reportRef = useRef();

  const timeframes = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' }
  ];

  const healthData = {
    weekly: {
      score: 85,
      steps: 8543,
      sleep: 7.2,
      hydration: 2.5,
      heartRate: 72,
      improvements: [
        { icon: '🚶', text: 'Increased daily step count by 12%', trend: '+12%' },
        { icon: '😴', text: 'Maintained consistent sleep schedule', trend: 'Stable' },
        { icon: '💧', text: 'Improved hydration levels', trend: '+15%' },
        { icon: '❤️', text: 'Heart rate variability improved', trend: '+8%' }
      ],
      recommendations: [
        { icon: '🎯', text: 'Focus on increasing deep sleep duration', priority: 'high' },
        { icon: '🏋️', text: 'Consider adding strength training twice weekly', priority: 'medium' },
        { icon: '😌', text: 'Monitor stress levels during busy periods', priority: 'medium' },
        { icon: '🥗', text: 'Include more protein in your diet', priority: 'low' }
      ]
    },
    monthly: {
      score: 78,
      steps: 7892,
      sleep: 6.8,
      hydration: 2.2,
      heartRate: 75,
      improvements: [
        { icon: '🚶', text: 'Average daily steps maintained', trend: 'Stable' },
        { icon: '😴', text: 'Sleep quality slightly decreased', trend: '-5%' },
        { icon: '💧', text: 'Hydration needs improvement', trend: '-8%' },
        { icon: '❤️', text: 'Resting heart rate stable', trend: 'Stable' }
      ],
      recommendations: [
        { icon: '💤', text: 'Establish consistent bedtime routine', priority: 'high' },
        { icon: '💧', text: 'Set hourly hydration reminders', priority: 'high' },
        { icon: '🧘', text: 'Practice mindfulness meditation', priority: 'medium' },
        { icon: '🏃', text: 'Add cardio workouts 3x per week', priority: 'medium' }
      ]
    },
    quarterly: {
      score: 82,
      steps: 8127,
      sleep: 7.0,
      hydration: 2.4,
      heartRate: 73,
      improvements: [
        { icon: '🚶', text: 'Overall activity level increased', trend: '+18%' },
        { icon: '😴', text: 'Sleep patterns more consistent', trend: '+10%' },
        { icon: '💧', text: 'Hydration habits improved significantly', trend: '+22%' },
        { icon: '❤️', text: 'Cardiovascular fitness enhanced', trend: '+12%' }
      ],
      recommendations: [
        { icon: '🎯', text: 'Maintain current exercise routine', priority: 'high' },
        { icon: '📱', text: 'Use fitness tracking consistently', priority: 'medium' },
        { icon: '🥘', text: 'Focus on balanced nutrition', priority: 'medium' },
        { icon: '🧠', text: 'Consider mental health check-ins', priority: 'low' }
      ]
    }
  };

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (reportRef.current) {
      observer.observe(reportRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate health score
  useEffect(() => {
    if (isVisible) {
      const targetScore = healthData[selectedTimeframe].score;
      const duration = 2000;
      const steps = 60;
      const increment = targetScore / steps;
      let currentScore = 0;

      const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
          setHealthScore(targetScore);
          clearInterval(timer);
        } else {
          setHealthScore(Math.floor(currentScore));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isVisible, selectedTimeframe]);

  // Animate stats
  useEffect(() => {
    if (isVisible) {
      const data = healthData[selectedTimeframe];
      const animateValue = (key, target, suffix = '') => {
        const duration = 1500;
        const steps = 50;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setAnimatedStats(prev => ({ ...prev, [key]: target }));
            clearInterval(timer);
          } else {
            setAnimatedStats(prev => ({ ...prev, [key]: Math.floor(current) }));
          }
        }, duration / steps);
      };

      // Animate each stat with delay
      setTimeout(() => animateValue('steps', data.steps), 200);
      setTimeout(() => animateValue('sleep', data.sleep), 400);
      setTimeout(() => animateValue('hydration', data.hydration), 600);
      setTimeout(() => animateValue('heartRate', data.heartRate), 800);
    }
  }, [isVisible, selectedTimeframe]);

  const exportToPDF = async () => {
    // Using html2pdf library
    const element = reportRef.current;
    const opt = {
      margin: 1,
      filename: `VitalVibe-Health-Report-${selectedTimeframe}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // Import html2pdf dynamically
    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(element).save();
  };

  const currentData = healthData[selectedTimeframe];
  const scorePercentage = (healthScore / 100) * 283; // SVG circle circumference

  return (
    <section id="reports" className="content-section active">
      <div className="section-header">
        <div>
          <h1>Health Reports</h1>
          <p>Your personalized health insights and progress analysis</p>
        </div>
        <div className="header-controls">
          <div className="timeframe-selector">
            {timeframes.map(timeframe => (
              <button
                key={timeframe.value}
                className={`timeframe-btn ${selectedTimeframe === timeframe.value ? 'active' : ''}`}
                onClick={() => setSelectedTimeframe(timeframe.value)}
              >
                {timeframe.label}
              </button>
            ))}
          </div>
          <button className="btn btn--outline export-btn" onClick={exportToPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="reports-container" ref={reportRef}>
        {/* Main Health Score Card */}
        <div className="report-card main-score-card">
          <div className="report-header">
            <h2>
              {selectedTimeframe.charAt(0).toUpperCase() + selectedTimeframe.slice(1)} Health Report
            </h2>
            <div className="score-display">
              <div className="score-circle">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle
                    cx="70"
                    cy="70"
                    r="45"
                    fill="none"
                    stroke="var(--color-secondary)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="45"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeDasharray="283"
                    strokeDashoffset={283 - scorePercentage}
                    strokeLinecap="round"
                    className="score-progress"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="#64d2ff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="score-text">
                  <span className="score-number">{healthScore}</span>
                  <span className="score-label">Health Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="metric-icon steps">🚶</div>
            <div className="metric-content">
              <h4>Daily Steps</h4>
              <div className="metric-value">{animatedStats.steps.toLocaleString()}</div>
              <div className="metric-trend positive">+12% from last period</div>
            </div>
          </div>

          <div className="metric-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="metric-icon sleep">😴</div>
            <div className="metric-content">
              <h4>Sleep Quality</h4>
              <div className="metric-value">{animatedStats.sleep}h</div>
              <div className="metric-trend neutral">Consistent pattern</div>
            </div>
          </div>

          <div className="metric-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="metric-icon hydration">💧</div>
            <div className="metric-content">
              <h4>Hydration</h4>
              <div className="metric-value">{animatedStats.hydration}L</div>
              <div className="metric-trend positive">+15% improvement</div>
            </div>
          </div>

          <div className="metric-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="metric-icon heart">❤️</div>
            <div className="metric-content">
              <h4>Heart Rate</h4>
              <div className="metric-value">{animatedStats.heartRate} bpm</div>
              <div className="metric-trend positive">Optimal range</div>
            </div>
          </div>
        </div>

        {/* Improvements and Recommendations */}
        <div className="report-content">
          <div className="report-section improvements-section">
            <h3>
              <span className="section-icon">📈</span>
              Key Improvements
            </h3>
            <div className="improvement-list">
              {currentData.improvements.map((improvement, index) => (
                <div 
                  key={index} 
                  className="improvement-item animate-slide-in"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="improvement-icon">{improvement.icon}</div>
                  <div className="improvement-content">
                    <p>{improvement.text}</p>
                    <span className="improvement-trend">{improvement.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="report-section recommendations-section">
            <h3>
              <span className="section-icon">💡</span>
              Recommendations
            </h3>
            <div className="recommendation-list">
              {currentData.recommendations.map((recommendation, index) => (
                <div 
                  key={index} 
                  className={`recommendation-item animate-slide-in priority-${recommendation.priority}`}
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <div className="recommendation-icon">{recommendation.icon}</div>
                  <div className="recommendation-content">
                    <p>{recommendation.text}</p>
                    <span className={`priority-badge ${recommendation.priority}`}>
                      {recommendation.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="insights-section">
          <div className="insight-card">
            <h4>🎯 Weekly Goal Progress</h4>
            <div className="progress-bars">
              <div className="progress-item">
                <span>Steps Goal</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '85%' }}></div>
                </div>
                <span>8,500 / 10,000</span>
              </div>
              <div className="progress-item">
                <span>Active Minutes</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '72%' }}></div>
                </div>
                <span>36 / 50 min</span>
              </div>
              <div className="progress-item">
                <span>Water Intake</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
                <span>2.5 / 2.5L</span>
              </div>
            </div>
          </div>

          <div className="insight-card">
            <h4>📊 Health Trends</h4>
            <div className="trend-chart">
              <div className="trend-item">
                <span>Fitness Level</span>
                <div className="trend-indicator up">↗️ Improving</div>
              </div>
              <div className="trend-item">
                <span>Sleep Quality</span>
                <div className="trend-indicator stable">➡️ Stable</div>
              </div>
              <div className="trend-item">
                <span>Stress Level</span>
                <div className="trend-indicator down">↘️ Decreasing</div>
              </div>
              <div className="trend-item">
                <span>Nutrition Score</span>
                <div className="trend-indicator up">↗️ Improving</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportsPage;
