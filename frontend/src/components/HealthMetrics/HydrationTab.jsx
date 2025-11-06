// File: /src/components/healthmetrics/HydrationTab.jsx

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Droplets, Plus, Clock, Target, Award, Zap } from 'lucide-react';
import './HydrationTab.css';

const HydrationTab = ({ data = {}, timeframe = 'week', onTimeframeChange, isRealTime = false, onUpdate }) => {
  const [currentAmount, setCurrentAmount] = useState(data?.current || 1.2);
  const [goal, setGoal] = useState(data?.goal || 2.5);
  const [log, setLog] = useState(data?.log || []);

  useEffect(() => {
    if (!Array.isArray(log)) {
      setLog([]);
    }
  }, [log]);

  useEffect(() => {
    if (isRealTime) {
      const interval = setInterval(() => {
        const drink = (Math.random() * 0.1).toFixed(2);
        setCurrentAmount(prev => Math.min(prev + Number(drink), goal));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isRealTime, goal]);

  const handleAddWater = (amount) => {
    const newAmount = Math.min(currentAmount + amount, goal * 1.2);
    setCurrentAmount(Number(newAmount.toFixed(2)));
    const newLogEntry = { 
      time: new Date().toLocaleTimeString(), 
      amount,
      timestamp: Date.now()
    };
    setLog(prevLog => {
      const safeLog = Array.isArray(prevLog) ? prevLog : [];
      return [...safeLog, newLogEntry];
    });
    onUpdate && onUpdate('hydration', newAmount);
  };

  const safeLog = Array.isArray(log) ? log : [];
  const percentage = Math.round((currentAmount / goal) * 100);

  const chartData = {
    labels: safeLog.length > 0 ? safeLog.map(e => e.time) : ['Start'],
    datasets: [{
      label: 'Hydration (L)',
      data: safeLog.length > 0 ? safeLog.map(e => e.amount) : [currentAmount],
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.3)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointBackgroundColor: '#06b6d4'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    scales: {
      y: { 
        min: 0, 
        max: goal, 
        grid: { color: '#333' }, 
        ticks: { color: '#aaa' } 
      },
      x: { 
        grid: { display: false }, 
        ticks: { color: '#aaa' } 
      }
    }
  };

  const container = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } }
  };

  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div className="hydration-tab-container" variants={container} initial="hidden" animate="visible">
      <motion.div className="hydration-header" variants={item}>
        <div className="hydration-display">
          <Droplets size={48} color="#06b6d4" />
          <div className="hydration-info">
            <h2>Hydration Tracker</h2>
            <div className="current-intake">
              <span className="amount">{currentAmount.toFixed(1)}L</span>
              <span className="goal">/ {goal}L</span>
            </div>
            <div className="progress-info">
              <span className={`percentage ${percentage >= 100 ? 'complete' : ''}`}>
                {percentage}% Complete
              </span>
              <span className="remaining">
                {currentAmount >= goal ? '🎉 Goal Achieved!' : `${(goal - currentAmount).toFixed(1)}L remaining`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="quick-add-section" variants={item}>
        <h3>Quick Add Water</h3>
        <div className="quick-add-buttons">
          {[
            { amount: 0.1, label: 'Sip', icon: '💧' },
            { amount: 0.25, label: 'Cup', icon: '☕' },
            { amount: 0.5, label: 'Bottle', icon: '🍾' },
            { amount: 1.0, label: 'Large', icon: '🥤' }
          ].map(({ amount, label, icon }) => (
            <button 
              key={amount} 
              onClick={() => handleAddWater(amount)} 
              className="hydration-btn"
            >
              <span className="btn-icon">{icon}</span>
              <span className="btn-amount">+{amount}L</span>
              <span className="btn-label">{label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div className="hydration-chart-section" variants={item}>
        <h3>Hydration Progress</h3>
        <div className="hydration-chart">
          <Line data={chartData} options={chartOptions} />
        </div>
      </motion.div>

      <motion.div className="hydration-log-section" variants={item}>
        <div className="log-header">
          <h3>Today's Hydration Log</h3>
          <div className="log-stats">
            <span className="total-entries">{safeLog.length} entries</span>
            <span className="status-indicator">
              {isRealTime ? '🟢 Live' : '⚪ Static'}
            </span>
          </div>
        </div>
        <div className="hydration-log">
          {safeLog.length > 0 ? (
            <ul>
              {safeLog.slice(-8).reverse().map((entry, i) => (
                <li key={i} className="log-entry">
                  <span className="log-time">{entry.time}</span>
                  <span className="log-amount">+{entry.amount}L</span>
                  <span className="log-icon">💧</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-log">
              <Droplets size={32} />
              <p>No hydration logged yet today. Start by adding some water!</p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div className="hydration-insights" variants={item}>
        <div className="insights-grid">
          <div className="insight-card">
            <Target size={20} />
            <div>
              <div className="insight-value">{percentage}%</div>
              <div className="insight-label">Daily Progress</div>
            </div>
          </div>
          <div className="insight-card">
            <Award size={20} />
            <div>
              <div className="insight-value">{safeLog.length}</div>
              <div className="insight-label">Sessions Today</div>
            </div>
          </div>
          <div className="insight-card">
            <Clock size={20} />
            <div>
              <div className="insight-value">
                {safeLog.length > 0 ? safeLog[safeLog.length - 1].time : 'N/A'}
              </div>
              <div className="insight-label">Last Intake</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HydrationTab;
