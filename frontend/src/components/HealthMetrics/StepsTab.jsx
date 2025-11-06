// File: /src/components/healthmetrics/StepsTab.jsx

import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Footprints, Target, Flame, MapPin, Clock, Award, TrendingUp } from 'lucide-react';
import './StepsTab.css';

const StepsTab = ({ data = {}, timeframe = 'week', onTimeframeChange, isRealTime = false, onUpdate }) => {
  const [steps, setSteps] = useState(data?.steps || 8543);
  const [goal, setGoal] = useState(data?.goal || 10000);
  const [history, setHistory] = useState(data?.history || []);

  useEffect(() => {
    if (!Array.isArray(history)) {
      setHistory([]);
    }
  }, [history]);

  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        const increment = Math.floor(Math.random() * 50) + 10;
        setSteps(prev => Math.min(prev + increment, goal * 1.5));
        setHistory(prev => {
          const safeHistory = Array.isArray(prev) ? prev : [];
          return [...(safeHistory.length >= 24 ? safeHistory.slice(1) : safeHistory), {
            time: new Date().getHours(),
            steps: increment,
            timestamp: Date.now()
          }];
        });
        onUpdate && onUpdate('steps', steps);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [goal, isRealTime, onUpdate, steps]);

  const percentage = Math.round((steps / goal) * 100);
  const remaining = Math.max(0, goal - steps);

  const milestones = [
    { steps: 2000, label: 'Getting Started', icon: '🌱', achieved: steps >= 2000 },
    { steps: 5000, label: 'Good Progress', icon: '🚶', achieved: steps >= 5000 },
    { steps: 7500, label: 'Active Day', icon: '💪', achieved: steps >= 7500 },
    { steps: 10000, label: 'Daily Goal', icon: '🎯', achieved: steps >= 10000 },
    { steps: 12500, label: 'Superstar', icon: '⭐', achieved: steps >= 12500 },
    { steps: 15000, label: 'Champion', icon: '🏆', achieved: steps >= 15000 }
  ];

  const safeHistory = Array.isArray(history) ? history : [];
  
  const chartData = {
    labels: safeHistory.length > 0 
      ? safeHistory.map((_, i) => `${i + 6}:00`)
      : Array.from({length: 12}, (_, i) => `${i + 6}:00`),
    datasets: [{
      label: 'Steps per Hour',
      data: safeHistory.length > 0 
        ? safeHistory.map(h => h.steps || Math.floor(Math.random() * 500))
        : Array.from({length: 12}, () => Math.floor(Math.random() * 500)),
      backgroundColor: (context) => {
        const value = context.parsed?.y || 0;
        if (value > 300) return '#10b981';
        if (value > 150) return '#f59e0b';
        return '#6b7280';
      },
      borderRadius: 4,
      borderSkipped: false
    }]
  };

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Daily Steps',
      data: [7200, 8100, 9600, 8800, 10200, 11000, steps],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.2)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#06b6d4'
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { color: '#aaa' }, grid: { color: '#333' } },
      x: { ticks: { color: '#aaa' }, grid: { display: false } }
    },
    plugins: { legend: { display: false }, tooltip: { enabled: true } }
  };

  const container = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } }
  };

  const item = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0 } 
  };

  return (
    <motion.div className="steps-tab-container" variants={container} initial="hidden" animate="visible">
      <motion.div className="steps-header" variants={item}>
        <div className="steps-display">
          <Footprints size={48} color="#06b6d4" />
          <div className="steps-info">
            <h2>Step Counter</h2>
            <div className="steps-metrics">
              <div className="current-steps">
                <span className="steps-value">{steps.toLocaleString()}</span>
                <span className="steps-label">steps today</span>
              </div>
              <div className="progress-info">
                <span className={`percentage ${percentage >= 100 ? 'complete' : ''}`}>
                  {percentage}% of goal
                </span>
                <span className="remaining">
                  {remaining > 0 ? `${remaining.toLocaleString()} to go` : '🎉 Goal achieved!'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="steps-stats" variants={item}>
        <div className="stats-grid">
          <div className="stat-card">
            <Flame size={20} />
            <div>
              <div className="stat-value">342</div>
              <div className="stat-label">Calories</div>
            </div>
          </div>
          <div className="stat-card">
            <MapPin size={20} />
            <div>
              <div className="stat-value">6.8km</div>
              <div className="stat-label">Distance</div>
            </div>
          </div>
          <div className="stat-card">
            <Clock size={20} />
            <div>
              <div className="stat-value">67min</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          <div className="stat-card">
            <TrendingUp size={20} />
            <div>
              <div className="stat-value">12</div>
              <div className="stat-label">Floors</div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="milestones-section" variants={item}>
        <h3>Daily Milestones</h3>
        <div className="steps-milestones">
          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.steps}
              className={`milestone ${milestone.achieved ? 'achieved' : ''}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: "spring" }}
            >
              <div className="milestone-icon">
                {milestone.achieved ? milestone.icon : '⚪'}
              </div>
              <div className="milestone-info">
                <div className="milestone-steps">{milestone.steps.toLocaleString()}</div>
                <div className="milestone-label">{milestone.label}</div>
              </div>
              {milestone.achieved && (
                <motion.div
                  className="achievement-glow"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="steps-chart-section" variants={item}>
        <div className="chart-tabs">
          <button className="chart-tab active">Hourly</button>
          <button className="chart-tab">Weekly</button>
        </div>
        <div className="steps-chart">
          <Bar data={chartData} options={options} />
        </div>
      </motion.div>

      <motion.div className="steps-insights" variants={item}>
        <h3>Step Insights</h3>
        <div className="insights-grid">
          <div className="insight-card success">
            <Award size={24} />
            <div>
              <h4>Great Progress!</h4>
              <p>You're {percentage >= 100 ? 'ahead of' : 'on track with'} your daily step goal. Keep up the excellent work!</p>
            </div>
          </div>
          <div className="insight-card info">
            <Target size={24} />
            <div>
              <h4>Weekly Target</h4>
              <p>Your weekly average is trending upward. Aim for consistency to maintain this progress.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepsTab;
