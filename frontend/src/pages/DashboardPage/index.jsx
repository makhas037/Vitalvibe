// FILE: /src/pages/DashboardPage/index.jsx
// PROFESSIONAL: Integration with useDashboard hook and fixed data processing

import React, { useState, useEffect, useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { IoRefreshCircle, IoAlertCircleOutline, IoHeart, IoWalk, IoWater, IoMoon } from 'react-icons/io5';
import { useDashboard } from '../../hooks/useDashboard';
import dashboardAPI from '../../services/dashboardAPI'; // Assuming this provides non-metric data like weather
import './DashboardPage.css';

// Register Chart.js elements
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
    Title, Tooltip, Legend, Filler
);

// --- Data Normalization and Processing ---
const processDashboardData = (rawData) => {
    // Fallbacks
    if (!rawData || !rawData.healthMetrics) return null;
    const metrics = rawData.healthMetrics;
    
    // 🛑 CRITICAL FIX: notifications is now guaranteed to be an array from the hook, but check again for safety.
    const notifications = Array.isArray(rawData.notifications) ? rawData.notifications : []; 

    // --- Steps Data Processing (Ensure arrays are safe) ---
    const stepsData = Array.isArray(metrics.steps) ? metrics.steps : [];
    const stepsHistory = stepsData.map(d => d.steps || 0).slice(-7); 
    const latestSteps = stepsHistory.slice(-1)[0] || 0;
    const stepsGoal = 10000;
    const stepsPercent = Math.min(100, (latestSteps / stepsGoal) * 100).toFixed(0);

    // --- Hydration Data Processing ---
    const hydrationData = Array.isArray(metrics.hydration) ? metrics.hydration : [];
    const latestHydration = hydrationData.slice(-1)[0]?.liters || 1.5;
    const hydrationGoal = 2.5;
    const hydrationPercent = Math.min(100, (latestHydration / hydrationGoal) * 100).toFixed(0);

    // --- Heart Rate Data Processing ---
    const heartRateData = Array.isArray(metrics.heartRate) ? metrics.heartRate : [];
    const latestHR = heartRateData.slice(-1)[0]?.rate || 75;
    const heartStatus = latestHR > 80 ? 'High' : (latestHR < 60 ? 'Low' : 'Normal');

    // --- Sleep Data Processing ---
    const sleepData = Array.isArray(metrics.sleep) ? metrics.sleep : [];
    const latestSleep = sleepData.slice(-1)[0]?.durationHours || 7.2;
    const sleepQuality = sleepData.slice(-1)[0]?.quality || 'Good';

    // --- Quick Stats (Mocked or retrieved from separate endpoint) ---
    const quickStats = {
        calories: metrics.caloriesBurned || 2100, 
        activeMinutes: metrics.activeMinutes || 90, 
        weather: { temp: 25, condition: 'Sunny', humidity: 60, icon: '01d' } 
    };

    return {
        latestSteps, stepsGoal, stepsPercent, stepsHistory,
        latestHR, heartStatus,
        latestHydration, hydrationGoal, hydrationPercent,
        latestSleep: parseFloat(latestSleep.toFixed(1)), 
        sleepQuality,
        // 🛑 FIX: notifications.filter is now safe
        notificationsCount: notifications.filter(n => !n.read).length,
        ...quickStats,
    };
};

const DashboardPage = () => {
    // 🛑 FIX: userId handling moved to hook. We pass a null or actual ID if present.
    const rawUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = rawUser._id || null; 

    const { data: hookData, loading, error, refetch, lastUpdated } = useDashboard(userId);
    
    const [secondarySummary, setSecondarySummary] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Process hook data whenever it changes
    const healthData = useMemo(() => processDashboardData(hookData), [hookData]);

    // Load secondary data (e.g., weather/summary)
    useEffect(() => {
        const loadSecondarySummary = async () => {
             // Use weatherService or dashboardAPI, depending on what's available
             const summary = await dashboardAPI.getHealthSummary().catch(() => ({ weather: healthData.weather }));
             setSecondarySummary(summary);
        };
        if (healthData && !secondarySummary) {
            loadSecondarySummary();
        }
    }, [healthData, secondarySummary]);


    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        const summary = await dashboardAPI.getHealthSummary().catch(() => ({}));
        setSecondarySummary(summary);
        setRefreshing(false);
    };

    if (loading && !hookData) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    <div className="loader"></div>
                    <p>Loading your personalized health overview...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-error">
                    <div className="error-icon"><IoAlertCircleOutline /></div>
                    <h2>Dashboard Error</h2>
                    <p>{error}</p>
                    <button className="btn-retry" onClick={handleRefresh}>Retry Loading</button>
                </div>
            </div>
        );
    }

    if (!healthData) {
         return <div className="dashboard-page"><p className="no-data">No comprehensive health data available. Log in to sync data.</p></div>;
    }


    // --- Chart Data Definition ---

    const weeklyStepsData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            label: 'Steps',
            data: healthData.stepsHistory || [7200, 8100, 9200, 8500, 9500, 10200, 9800],
            borderColor: '#20c997',
            backgroundColor: 'rgba(32, 201, 151, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#20c997',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    const hydrationChartData = {
        labels: ['Consumed', 'Remaining'],
        datasets: [{
            data: [healthData.latestHydration, healthData.hydrationGoal - healthData.latestHydration],
            backgroundColor: ['#20c997', '#2d3748'],
            borderWidth: 0
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } },
            x: { grid: { display: false } }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed.toFixed(1)}L` } }
        }
    };


    // --- Render Component ---

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <h1>🏠 Health Dashboard</h1>
                    <p>Welcome back! Your personalized health overview is current.</p>
                </div>
                <div className="header-actions">
                    <span className="last-updated">Last Updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'N/A'}</span>
                    <button 
                        className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <IoRefreshCircle /> {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </header>

            {/* Quick Stats Bar */}
            <div className="quick-stats">
                <div className="quick-stat">
                    <span className="stat-icon">🔥</span>
                    <div>
                        <span className="stat-label">Calories Burned</span>
                        <span className="stat-value">{healthData.calories}</span>
                    </div>
                </div>
                <div className="quick-stat">
                    <span className="stat-icon">⏱️</span>
                    <div>
                        <span className="stat-label">Active Minutes</span>
                        <span className="stat-value">{healthData.activeMinutes}min</span>
                    </div>
                </div>
                <div className="quick-stat">
                    <span className="stat-icon">🔔</span>
                    <div>
                        <span className="stat-label">Notifications</span>
                        <span className="stat-value">{healthData.notificationsCount} new</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                
                {/* 1. Heart Rate Card */}
                <div className="metric-card heart animated">
                    <div className="card-header">
                        <div className="metric-icon pulse"><IoHeart /></div>
                        <div className="metric-badge quality">{healthData.heartStatus}</div>
                    </div>
                    <div className="metric-content">
                        <h3>Resting Heart Rate</h3>
                        <div className="metric-value">
                            {healthData.latestHR} <span className="unit">bpm</span>
                        </div>
                        <div className="metric-trend">
                            <span className="trend-icon">↔️</span>
                            <span>Stable average</span>
                        </div>
                    </div>
                </div>

                {/* 2. Steps Card */}
                <div className="metric-card steps animated">
                    <div className="card-header">
                        <div className="metric-icon"><IoWalk /></div>
                    </div>
                    <div className="metric-content">
                        <h3>Steps Today</h3>
                        <div className="metric-value">
                            {healthData.latestSteps.toLocaleString()} <span className="unit">steps</span>
                        </div>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill" 
                                style={{ width: `${healthData.stepsPercent}%` }}
                            ></div>
                        </div>
                        <div className="metric-status">
                            {healthData.stepsPercent}% of {healthData.stepsGoal.toLocaleString()} goal
                        </div>
                    </div>
                </div>

                {/* 3. Hydration Card */}
                <div className="metric-card hydration animated">
                    <div className="card-header">
                        <div className="metric-icon"><IoWater /></div>
                    </div>
                    <div className="metric-content">
                        <h3>Hydration</h3>
                        <div className="metric-value">
                            {healthData.latestHydration}L <span className="unit">/ {healthData.hydrationGoal}L</span>
                        </div>
                        <div className="hydration-chart">
                            <Doughnut data={hydrationChartData} options={doughnutOptions} />
                            <div className="chart-center-text">
                                {healthData.hydrationPercent}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Sleep Card */}
                <div className="metric-card sleep animated">
                    <div className="card-header">
                        <div className="metric-icon"><IoMoon /></div>
                        <div className="metric-badge quality">{healthData.sleepQuality}</div>
                    </div>
                    <div className="metric-content">
                        <h3>Sleep Last Night</h3>
                        <div className="metric-value">
                            {healthData.latestSleep} <span className="unit">hours</span>
                        </div>
                        <div className="sleep-stages">
                            <div className="stage">
                                <span className="stage-label">Deep</span>
                                <span className="stage-value">2.1h</span>
                            </div>
                            <div className="stage">
                                <span className="stage-label">REM</span>
                                <span className="stage-value">1.5h</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Weekly Steps Chart */}
                <div className="chart-card full-width animated">
                    <div className="chart-header">
                        <h3>📈 Weekly Steps Trend</h3>
                    </div>
                    <div className="chart-container">
                        <Line data={weeklyStepsData} options={chartOptions} />
                    </div>
                </div>

                {/* 6. Weather & Tips (Use secondarySummary data) */}
                <div className="info-card tips animated">
                    <h3>💡 Today's Health Tips</h3>
                    <div className="tips-list">
                        <div className="tip-item">
                            <span className="tip-icon">💧</span>
                            <span>Drink more water—{(healthData.hydrationGoal - healthData.latestHydration).toFixed(1)}L left.</span>
                        </div>
                        <div className="tip-item">
                            <span className="tip-icon">🚶</span>
                            <span>{(healthData.stepsGoal - healthData.latestSteps).toLocaleString()} steps to reach your goal.</span>
                        </div>
                        <div className="tip-item">
                            <span className="tip-icon">☀️</span>
                            {/* Use secondary summary for weather info if available */}
                            <span>Outdoor air quality is {secondarySummary?.airQuality || 'good'}.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;