// File: /src/pages/healthmetrics/index.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
} from 'chart.js';

// Import our advanced tab components
import HeartRateTab from '../../components/HealthMetrics/HeartRateTab';
import StepsTab from '../../components/HealthMetrics/StepsTab';
import HydrationTab from '../../components/HealthMetrics/HydrationTab';
import SleepTab from '../../components/HealthMetrics/SleepTab';

import './HealthMetricsPage.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  Filler
);

const HealthMetricsPage = () => {
  const [activeTab, setActiveTab] = useState('heart-rate');
  const [timeframe, setTimeframe] = useState('week');
  const [isRealTime, setIsRealTime] = useState(false);
  const [healthData, setHealthData] = useState({
    'heart-rate': {
      current: 72,
      resting: 65,
      max: 185,
      hrv: 42,
      zones: {
        fat_burn: { min: 111, max: 130, time: 45 },
        cardio: { min: 130, max: 157, time: 22 },
        peak: { min: 157, max: 185, time: 8 }
      },
      history: [
        { time: new Date(Date.now() - 6000), value: 68 },
        { time: new Date(Date.now() - 5000), value: 71 },
        { time: new Date(Date.now() - 4000), value: 74 },
        { time: new Date(Date.now() - 3000), value: 72 },
        { time: new Date(Date.now() - 2000), value: 69 },
        { time: new Date(Date.now() - 1000), value: 75 },
        { time: new Date(), value: 72 }
      ]
    },
    steps: {
      steps: 8543,
      goal: 10000,
      calories: 342,
      distance: 6.8,
      active_minutes: 67,
      floors: 12,
      history: [
        { time: 6, steps: 120 },
        { time: 7, steps: 200 },
        { time: 8, steps: 450 },
        { time: 9, steps: 680 },
        { time: 10, steps: 890 },
        { time: 11, steps: 1200 },
        { time: 12, steps: 1500 }
      ]
    },
    hydration: {
      current: 1.2,
      goal: 2.5,
      percentage: 48,
      last_intake: '2 hours ago',
      log: [
        { time: '8:00 AM', amount: 0.25, timestamp: Date.now() - 28800000 },
        { time: '10:30 AM', amount: 0.3, timestamp: Date.now() - 19800000 },
        { time: '12:15 PM', amount: 0.4, timestamp: Date.now() - 14100000 },
        { time: '2:30 PM', amount: 0.25, timestamp: Date.now() - 7200000 }
      ]
    },
    sleep: {
      duration: 7.2,
      quality: 85,
      efficiency: 92,
      stages: {
        deep: 2.1,
        light: 3.3,
        rem: 1.8,
        awake: 0.3
      },
      bedtime: '23:30',
      wake_time: '06:42',
      heart_rate_dip: 12
    }
  });

  const pageRef = useRef();

  // Tab configuration with proper data mapping
  const tabsConfig = [
    {
      id: 'heart-rate',
      label: 'Heart Rate',
      icon: '❤️',
      value: `${healthData['heart-rate'].current} bpm`,
      color: '#EF4444',
      component: HeartRateTab,
      data: healthData['heart-rate']
    },
    {
      id: 'steps',
      label: 'Steps',
      icon: '🚶',
      value: healthData.steps.steps?.toLocaleString() || '0',
      color: '#06B6D4',
      component: StepsTab,
      data: healthData.steps
    },
    {
      id: 'hydration',
      label: 'Hydration',
      icon: '💧',
      value: `${healthData.hydration.current}L`,
      color: '#06B6D4',
      component: HydrationTab,
      data: healthData.hydration
    },
    {
      id: 'sleep',
      label: 'Sleep',
      icon: '😴',
      value: `${healthData.sleep.duration}h`,
      color: '#8B5CF6',
      component: SleepTab,
      data: healthData.sleep
    }
  ];

  // Handle metric updates from child components
  const handleUpdateMetric = (metric, value) => {
    setHealthData(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        ...(typeof value === 'object' ? value : { current: value })
      }
    }));
  };

  // Toggle real-time monitoring
  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
  };

  // Export functionality placeholder
  const handleExport = () => {
    const dataStr = JSON.stringify(healthData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `health-metrics-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const activeTabConfig = tabsConfig.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section id="metrics" className="health-metrics-page" ref={pageRef}>
      {/* Keep the existing header section as requested */}
      <div className="section-header">
        <div className="header-content">
          <h1>
            <span className="header-icon">📊</span>
            Health Metrics
          </h1>
          <p>Track and analyze your vital health indicators with advanced insights and real-time monitoring</p>
        </div>
        <div className="header-actions">
          <motion.button 
            className="btn btn--outline"
            onClick={handleExport}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>📊</span>
            Export Data
          </motion.button>
          <motion.button 
            className={`btn ${isRealTime ? 'btn--primary' : 'btn--outline'}`}
            onClick={toggleRealTime}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{isRealTime ? '⏸️' : '▶️'}</span>
            {isRealTime ? 'Pause' : 'Live Mode'}
          </motion.button>
        </div>
      </div>

      {/* Enhanced Navigation */}
      <motion.div 
        className="metrics-navigation"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="metrics-tabs">
          {tabsConfig.map((tab, index) => (
            <motion.button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              variants={itemVariants}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ '--tab-color': tab.color }}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              <span className="tab-value">{tab.value}</span>
              
              {activeTab === tab.id && (
                <motion.div
                  className="active-indicator"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="metrics-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            className="tab-content active"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {ActiveComponent && (
              <ActiveComponent
                data={activeTabConfig.data}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                isRealTime={isRealTime}
                onUpdate={handleUpdateMetric}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default HealthMetricsPage;
