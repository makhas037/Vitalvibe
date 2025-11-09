// FILE: /src/pages/DashboardPage/index.jsx
// PROFESSIONAL: Integration with useDashboard hook and Weather API


import React, { useState, useEffect, useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
    Title, Tooltip, Legend, Filler
} from 'chart.js';
import { IoRefreshCircle, IoAlertCircleOutline, IoHeart, IoWalk, IoWater, IoMoon, IoCloudOutline } from 'react-icons/io5';
import { useDashboard } from '../../hooks/useDashboard';
import dashboardAPI from '../../services/dashboardAPI';
import './DashboardPage.css';


// Register Chart.js elements
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, ArcElement,
    Title, Tooltip, Legend, Filler
);


// --- Data Normalization and Processing ---
const processDashboardData = (rawData) => {
    if (!rawData || !rawData.healthMetrics) return null;
    const metrics = rawData.healthMetrics;
    const notifications = Array.isArray(rawData.notifications) ? rawData.notifications : []; 

    const stepsData = Array.isArray(metrics.steps) ? metrics.steps : [];
    const stepsHistory = stepsData.map(d => d.steps || 0).slice(-7); 
    const latestSteps = stepsHistory.slice(-1)[0] || 0;
    const stepsGoal = 10000;
    const stepsPercent = Math.min(100, (latestSteps / stepsGoal) * 100).toFixed(0);

    const hydrationData = Array.isArray(metrics.hydration) ? metrics.hydration : [];
    const latestHydration = hydrationData.slice(-1)[0]?.liters || 1.5;
    const hydrationGoal = 2.5;
    const hydrationPercent = Math.min(100, (latestHydration / hydrationGoal) * 100).toFixed(0);

    const heartRateData = Array.isArray(metrics.heartRate) ? metrics.heartRate : [];
    const latestHR = heartRateData.slice(-1)[0]?.rate || 75;
    const heartStatus = latestHR > 80 ? 'High' : (latestHR < 60 ? 'Low' : 'Normal');

    const sleepData = Array.isArray(metrics.sleep) ? metrics.sleep : [];
    const latestSleep = sleepData.slice(-1)[0]?.durationHours || 7.2;
    const sleepQuality = sleepData.slice(-1)[0]?.quality || 'Good';

    const quickStats = {
        calories: metrics.caloriesBurned || 2100, 
        activeMinutes: metrics.activeMinutes || 90, 
    };

    return {
        latestSteps, stepsGoal, stepsPercent, stepsHistory,
        latestHR, heartStatus,
        latestHydration, hydrationGoal, hydrationPercent,
        latestSleep: parseFloat(latestSleep.toFixed(1)), 
        sleepQuality,
        notificationsCount: notifications.filter(n => !n.read).length,
        ...quickStats,
    };
};


const DashboardPage = () => {
    const rawUser = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = rawUser._id || null; 

    const { data: hookData, loading, error, refetch, lastUpdated } = useDashboard(userId);
    
    const [weatherData, setWeatherData] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const healthData = useMemo(() => processDashboardData(hookData), [hookData]);

    // Fetch Weather Data
    useEffect(() => {
        const fetchWeather = async () => {
            setWeatherLoading(true);
            try {
                const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '05895af7db66255898643c62bfa63ad3';
                const city = 'Vellore'; // Default city, you can make this dynamic
                
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setWeatherData({
                        temp: Math.round(data.main.temp),
                        condition: data.weather[0].main,
                        description: data.weather[0].description,
                        humidity: data.main.humidity,
                        windSpeed: data.wind.speed,
                        icon: data.weather[0].icon,
                        city: data.name,
                        feelsLike: Math.round(data.main.feels_like)
                    });
                }
            } catch (err) {
                console.error('Weather fetch error:', err);
                setWeatherData(null);
            } finally {
                setWeatherLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
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

                {/* 5. Weather Card - NEW */}
                <div className="metric-card weather-card animated">
                    <div className="card-header">
                        <div className="metric-icon"><IoCloudOutline /></div>
                    </div>
                    <div className="metric-content">
                        {weatherLoading ? (
                            <div className="weather-loading">
                                <div className="mini-loader"></div>
                                <p>Loading weather...</p>
                            </div>
                        ) : weatherData ? (
                            <>
                                <h3>Current Weather</h3>
                                <div className="weather-location">{weatherData.city}</div>
                                <div className="weather-main">
                                    <img 
                                        src={`https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`}
                                        alt={weatherData.description}
                                        className="weather-icon-img"
                                    />
                                    <div className="weather-temp">
                                        {weatherData.temp}°C
                                    </div>
                                </div>
                                <div className="weather-condition">{weatherData.description}</div>
                                <div className="weather-details">
                                    <div className="weather-detail">
                                        <span className="detail-label">Feels Like</span>
                                        <span className="detail-value">{weatherData.feelsLike}°C</span>
                                    </div>
                                    <div className="weather-detail">
                                        <span className="detail-label">Humidity</span>
                                        <span className="detail-value">{weatherData.humidity}%</span>
                                    </div>
                                    <div className="weather-detail">
                                        <span className="detail-label">Wind</span>
                                        <span className="detail-value">{weatherData.windSpeed} m/s</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="weather-error">
                                <p>Unable to load weather data</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Weekly Steps Chart */}
                <div className="chart-card full-width animated">
                    <div className="chart-header">
                        <h3>📈 Weekly Steps Trend</h3>
                    </div>
                    <div className="chart-container">
                        <Line data={weeklyStepsData} options={chartOptions} />
                    </div>
                </div>

                {/* 7. Health Tips */}
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
                            <span>Perfect weather for outdoor activities today!</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
