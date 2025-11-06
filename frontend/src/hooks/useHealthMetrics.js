/**
 * FILE: web-app/src/hooks/useHealthMetrics.js
 * PROFESSIONAL HYBRID: Fetches real data and calculates rich insights for the UI.
 */

import { useState, useEffect, useCallback } from 'react';
import { healthMetricsService } from '../services'; // Assumes correct import

// --- Default/Mock Data Structure for Initial State & Fallback ---
const initialMetricState = {
    'heart-rate': { current: 70, resting: 65, zones: {}, history: { week: [] }, insights: { trend: 'stable', shortRecommendation: 'N/A' } },
    steps: { current: 0, goal: 10000, calories: 0, distance: 0, history: { week: [] }, insights: { trend: 'stable', shortRecommendation: 'No data' } },
    hydration: { current: 0, goal: 2.5, percentage: 0, history: { week: [] }, insights: { trend: 'needs_attention', shortRecommendation: 'Needs attention' } },
    sleep: { duration: 0, quality: 0, efficiency: 0, stages: {}, history: { week: [] }, insights: { trend: 'good', shortRecommendation: 'No data' } },
};

export const useHealthMetrics = (userId, days = 7) => {
    const [healthData, setHealthData] = useState(initialMetricState);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRealTimeActive, setIsRealTimeActive] = useState(false);

    // --- Data Processing/Calculation Logic ---

    const processRawData = useCallback((rawData) => {
        // This function would contain the logic to convert raw history arrays
        // into the rich structure required by the UI (scores, current values, insights).
        
        // For demonstration, we'll simulate the current value and score calculation based on the mock data logic.
        
        const latestSteps = rawData.steps.slice(-1)[0] || 0;
        const avgSleepQuality = rawData.sleep.reduce((a, b) => a + b.quality, 0) / (rawData.sleep.length || 1);
        const latestHydration = rawData.hydration.slice(-1)[0] || 0;
        const latestHR = rawData.heartRate.slice(-1)[0] || 70;

        return {
            'heart-rate': { 
                ...initialMetricState['heart-rate'], 
                current: latestHR,
                history: { week: rawData.heartRate },
                // Add real zone calculation based on user age/max HR if available
            },
            steps: { 
                ...initialMetricState.steps, 
                current: latestSteps,
                percentage: Math.min(100, (latestSteps / 10000) * 100),
                insights: { trend: 'improving', shortRecommendation: `${Math.round((latestSteps / 10000) * 100)}% to goal` },
                history: { week: rawData.steps }
            },
            hydration: { 
                ...initialMetricState.hydration, 
                current: latestHydration,
                percentage: Math.min(100, (latestHydration / 2.5) * 100),
                insights: { trend: 'needs_attention', shortRecommendation: 'Needs attention' },
                history: { week: rawData.hydration }
            },
            sleep: { 
                ...initialMetricState.sleep, 
                quality: Math.round(avgSleepQuality),
                duration: rawData.sleep.slice(-1)[0]?.duration || 0,
                insights: { trend: 'good', shortRecommendation: 'Quality sleep' },
                history: { week: rawData.sleep.map(s => s.duration) }
            },
        };
    }, []);

    // --- API Fetching Logic ---

    const fetchMetrics = useCallback(async () => {
        if (!userId) {
             setLoading(false);
             setError("User ID is required to fetch metrics.");
             return;
        }

        setLoading(true);
        setError(null);

        try {
            // Assume the service returns a single object containing all metric arrays:
            // { heartRate: [...], sleep: [...], hydration: [...], steps: [...] }
            const response = await healthMetricsService.getRecent(userId, days);
            
            // Convert the raw data arrays into the rich UI structure
            const processedData = processRawData(response.data || response); 
            setHealthData(processedData);

        } catch (err) {
            console.error('Error fetching health metrics:', err);
            setError(err.message || 'Failed to load health metrics.');
            setHealthData(initialMetricState); // Reset to initial state on error
        } finally {
            setLoading(false);
        }
    }, [userId, days, processRawData]);

    useEffect(() => {
        fetchMetrics();
        // Set up auto-refresh
        const interval = setInterval(fetchMetrics, 10 * 60 * 1000); // Refresh every 10 minutes
        return () => clearInterval(interval);
    }, [fetchMetrics]);

    // --- Real-Time Simulation (Retained for UI demo purposes) ---
    useEffect(() => {
        if (!isRealTimeActive) return;

        const interval = setInterval(() => {
            setHealthData(prev => ({
                ...prev,
                'heart-rate': {
                    ...prev['heart-rate'],
                    current: Math.round(Math.max(65, Math.min(85, prev['heart-rate'].current + (Math.random() * 4 - 2))))
                }
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, [isRealTimeActive]);


    // --- Core Functions ---

    const updateMetric = useCallback((metric, data) => {
        // Allows local UI updates before API sync (if needed)
        setHealthData(prev => ({
            ...prev,
            [metric]: { ...prev[metric], ...data }
        }));
    }, []);

    const getHealthScore = useCallback(() => {
        // Calculates a unified score based on processed data
        const scores = [
            (healthData.steps.current / healthData.steps.goal) * 100,
            healthData.sleep.quality, // Assuming quality is 0-100
            healthData.hydration.percentage, // Assuming percentage is 0-100
            100 - ((healthData['heart-rate'].current - healthData['heart-rate'].resting) / 10), // Example formula
        ];
        // Filter out NaN/invalid scores before calculating average
        const validScores = scores.filter(s => !isNaN(s) && s > 0);
        return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) || 0;
    }, [healthData]);

    const getInsights = useCallback((metric) => {
        return healthData[metric]?.insights || {};
    }, [healthData]);


    return {
        healthData,
        loading,
        error,
        refetch: fetchMetrics,
        updateMetric,
        isRealTimeActive,
        toggleRealTime: () => setIsRealTimeActive(prev => !prev),
        getHealthScore,
        getInsights
    };
};

export default useHealthMetrics;