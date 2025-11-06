// File: /src/components/healthmetrics/HeartRateTab.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Heart, Activity, TrendingUp, Zap, Shield, Radio, Timer, Target, Award, Info, BarChart3
} from 'lucide-react';
import './HeartRateTab.css';

const HeartRateTab = ({ data = {}, timeframe = 'week', onTimeframeChange, isRealTime = false, onUpdate }) => {
  const [currentHR, setCurrentHR] = useState(data?.current || 72);
  const [selectedZone, setSelectedZone] = useState(null);
  const [history, setHistory] = useState(data?.history || []);
  const intervalRef = useRef(null);

  // Initialize history if it's not an array
  useEffect(() => {
    if (!Array.isArray(history)) {
      setHistory([]);
    }
  }, [history]);

  const zones = [
    { id: 'zone1', name: 'Resting', range: [50, 60], color: '#22c55e', icon: '💤', description: 'Rest and recovery', percentage: 25 },
    { id: 'zone2', name: 'Fat Burn', range: [61, 75], color: '#6d28d9', icon: '🔥', description: 'Fat burning zone', percentage: 45 },
    { id: 'zone3', name: 'Cardio', range: [76, 85], color: '#fb923c', icon: '❤️', description: 'Cardio zone', percentage: 20 },
    { id: 'zone4', name: 'Peak', range: [86, 100], color: '#dc2626', icon: '⚡', description: 'Peak performance', percentage: 10 }
  ];

  useEffect(() => {
    if (isRealTime) {
      intervalRef.current = setInterval(() => {
        const newHR = Math.floor(55 + Math.random() * 45);
        setCurrentHR(newHR);
        setHistory(prevHistory => {
          const newHistory = Array.isArray(prevHistory) ? prevHistory : [];
          const updatedHistory = [...(newHistory.length >= 30 ? newHistory.slice(1) : newHistory), { 
            time: new Date(), 
            value: newHR 
          }];
          return updatedHistory;
        });
        onUpdate && onUpdate('heartRate', newHR);
      }, 4000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRealTime, onUpdate]);

  const safeHistory = Array.isArray(history) ? history : [];

  const dataChart = {
    labels: safeHistory.length > 0 ? safeHistory.map(d => d.time?.toLocaleTimeString ? d.time.toLocaleTimeString() : 'N/A') : ['No Data'],
    datasets: [{
      label: 'Heart Rate',
      data: safeHistory.length > 0 ? safeHistory.map(d => d.value || 0) : [currentHR],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239,68,68,0.25)',
      fill: true,
      tension: 0.4,
      pointRadius: 3
    }]
  };

  const doughnutData = {
    labels: zones.map(z => z.name),
    datasets: [{
      data: zones.map(z => z.percentage),
      backgroundColor: zones.map(z => z.color),
      borderWidth: 0
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' },
      tooltip: { mode: 'index' }
    },
    scales: {
      y: {
        min: 40,
        max: 110,
        ticks: { color: '#888' },
        grid: { color: '#222' }
      },
      x: {
        ticks: { color: '#888' },
        grid: { display: false }
      }
    }
  };

  const container = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div className="hr-tab-container" variants={container} initial="hidden" animate="visible">
      <motion.div className="hr-live-display" variants={item}>
        <div className="hr-current">
          <Heart size={48} color="#ef4444" />
          <div className="hr-value">
            <motion.span 
              key={currentHR} 
              className="value" 
              animate={{ scale: [1.2, 1] }} 
              transition={{ duration: 0.3 }}
            >
              {currentHR}
            </motion.span>
            <span>bpm</span>
          </div>
          <div className={`hr-status ${isRealTime ? 'live' : 'static'}`}>
            {isRealTime ? "Live" : "Static"}
          </div>
        </div>

        <div className="hr-history-chart">
          <Line data={dataChart} options={options} />
        </div>
      </motion.div>

      <motion.div className="zones-section" variants={item}>
        <div className="section-header">
          <h3>Heart Rate Zones</h3>
          <div className="zone-chart">
            <Doughnut data={doughnutData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }} />
          </div>
        </div>
        <div className="zones-list">
          {zones.map(zone => (
            <div 
              key={zone.id} 
              className={`zone-item ${selectedZone === zone.id ? 'selected' : ''}`}
              style={{ borderColor: zone.color }}
              onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
            >
              <span className="zone-icon" style={{ backgroundColor: zone.color }}>
                {zone.icon}
              </span>
              <div className="zone-info">
                <div className="zone-name">{zone.name}</div>
                <div className="zone-range">{zone.range[0]}-{zone.range[1]} bpm</div>
                <div className="zone-desc">{zone.description}</div>
              </div>
              <div className="zone-percentage">{zone.percentage}%</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div className="analytics-section" variants={item}>
        <h3>Heart Rate Analytics</h3>
        <div className="analytics-list">
          {['Resting HR', 'Max HR', 'HR Variability'].map((title, idx) => {
            const metric = {
              'Resting HR': { value: data?.resting || 65, unit: 'bpm', icon: Shield, color: '#22c55e' },
              'Max HR': { value: data?.max || 185, unit: 'bpm', icon: Zap, color: '#ef4444' },
              'HR Variability': { value: data?.hrv || 35, unit: 'ms', icon: Radio, color: '#3b82f6' }
            }[title];
            const IconComp = metric.icon;
            return (
              <div key={title} className="analytic-item" style={{ borderColor: metric.color }}>
                <IconComp size={24} color={metric.color} />
                <div>
                  <div className="value">{metric.value} {metric.unit}</div>
                  <div className="label">{title}</div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeartRateTab;
