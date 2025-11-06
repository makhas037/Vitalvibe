// File: /src/components/healthmetrics/SleepTab.jsx

import React, { useState, useEffect } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock, Award, Brain, Timer } from 'lucide-react';
import './SleepTab.css';

const SleepTab = ({ data = {}, timeframe = 'week', onTimeframeChange, isRealTime = false, onUpdate }) => {
  const [duration, setDuration] = useState(data?.duration || 7.2);
  const [quality, setQuality] = useState(data?.quality || 85);
  const [stages, setStages] = useState(data?.stages || { 
    deep: 2.1, 
    light: 3.3, 
    rem: 1.8, 
    awake: 0.3 
  });

  const sleepStages = [
    { 
      name: 'Deep Sleep', 
      value: stages.deep, 
      color: '#1e293b', 
      icon: '🛌',
      description: 'Physical restoration & memory consolidation',
      percentage: Math.round((stages.deep / duration) * 100)
    },
    { 
      name: 'Light Sleep', 
      value: stages.light, 
      color: '#475569', 
      icon: '😴',
      description: 'Transition phase & easy awakening',
      percentage: Math.round((stages.light / duration) * 100)
    },
    { 
      name: 'REM Sleep', 
      value: stages.rem, 
      color: '#8b5cf6', 
      icon: '💭',
      description: 'Dreams & cognitive processing',
      percentage: Math.round((stages.rem / duration) * 100)
    },
    { 
      name: 'Awake', 
      value: stages.awake, 
      color: '#dc2626', 
      icon: '👁️',
      description: 'Brief wake periods during night',
      percentage: Math.round((stages.awake / duration) * 100)
    }
  ];

  const chartData = {
    labels: sleepStages.map(stage => stage.name),
    datasets: [{
      data: sleepStages.map(stage => stage.value),
      backgroundColor: sleepStages.map(stage => stage.color),
      borderColor: sleepStages.map(stage => stage.color),
      borderWidth: 2,
      hoverOffset: 8
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { 
          color: '#999',
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: { 
        enabled: true,
        callbacks: {
          label: (context) => {
            const stage = sleepStages[context.dataIndex];
            return `${stage.name}: ${stage.value}h (${stage.percentage}%)`;
          }
        }
      }
    },
    cutout: '60%'
  };

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Sleep Duration (h)',
      data: [7.1, 6.8, 7.5, 7.2, 6.9, 8.1, 7.2],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      fill: true,
      tension: 0.4
    }]
  };

  const container = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div className="sleep-tab-container" variants={container} initial="hidden" animate="visible">
      <motion.div className="sleep-header" variants={item}>
        <div className="sleep-display">
          <Moon size={48} color="#8b5cf6" />
          <div className="sleep-info">
            <h2>Sleep Overview</h2>
            <div className="sleep-metrics">
              <div className="metric">
                <span className="value">{duration}h</span>
                <span className="label">Total Sleep</span>
              </div>
              <div className="metric">
                <span className="value">{quality}%</span>
                <span className="label">Sleep Quality</span>
              </div>
              <div className="metric">
                <span className="value">23:30</span>
                <span className="label">Bedtime</span>
              </div>
              <div className="metric">
                <span className="value">06:42</span>
                <span className="label">Wake Time</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="sleep-chart-section" variants={item}>
        <div className="chart-container">
          <div className="stages-chart">
            <h3>Sleep Stages Distribution</h3>
            <Doughnut data={chartData} options={options} />
          </div>
          <div className="weekly-trend">
            <h3>Weekly Sleep Trend</h3>
            <Line data={weeklyData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { min: 6, max: 9, ticks: { color: '#aaa' } },
                x: { ticks: { color: '#aaa' } }
              }
            }} />
          </div>
        </div>
      </motion.div>

      <motion.div className="sleep-stages-section" variants={item}>
        <h3>Sleep Stages Analysis</h3>
        <div className="stages-list">
          {sleepStages.map((stage, index) => (
            <motion.div
              key={stage.name}
              className="stage-item"
              style={{ borderLeftColor: stage.color }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stage-header">
                <span className="stage-icon">{stage.icon}</span>
                <div className="stage-info">
                  <div className="stage-name">{stage.name}</div>
                  <div className="stage-description">{stage.description}</div>
                </div>
              </div>
              <div className="stage-metrics">
                <div className="stage-time">{stage.value}h</div>
                <div className="stage-percentage">{stage.percentage}%</div>
              </div>
              <div className="stage-progress">
                <motion.div
                  className="progress-fill"
                  style={{ backgroundColor: stage.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${stage.percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div className="sleep-insights" variants={item}>
        <h3>Sleep Insights</h3>
        <div className="insights-grid">
          <div className="insight-card excellent">
            <Brain size={24} />
            <div>
              <h4>Sleep Quality</h4>
              <p>Excellent sleep efficiency at {quality}%. Your deep sleep and REM cycles are well balanced.</p>
            </div>
          </div>
          <div className="insight-card good">
            <Timer size={24} />
            <div>
              <h4>Sleep Duration</h4>
              <p>You're getting {duration} hours of sleep, which is within the recommended 7-9 hours for adults.</p>
            </div>
          </div>
          <div className="insight-card info">
            <Sun size={24} />
            <div>
              <h4>Sleep Schedule</h4>
              <p>Consistent bedtime helps maintain your circadian rhythm. Try to keep regular sleep hours.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SleepTab;
