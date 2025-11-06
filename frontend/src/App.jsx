import './index.css';
import './styles/theme.css'; // Import global theme variables
import React, { useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { initializeServices } from './services';
import MainLayout from './layouts/MainLayout';
import AuthCallbackPage from './pages/AuthCallbackPage'; 

import DashboardPage from './pages/DashboardPage';
import HealthMetricsPage from './pages/HealthMetricsPage';
import SymptomCheckerPage from './pages/SymptomCheckerPage';
import RoutinesPage from './pages/RoutinesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProfilePage from './pages/ProfilePage';
import NutritionPage from './pages/NutritionPage';
import MoodTrackerPage from './pages/MoodTrackerPage';
import FitnessPage from './pages/FitnessPage';

function AppContent() {
    useEffect(() => {
        initializeServices();
        console.log('🚀 VitalVibe initialized');
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="health-metrics" element={<HealthMetricsPage />} />
                    <Route path="symptom-checker" element={<SymptomCheckerPage />} />
                    <Route path="nutrition" element={<NutritionPage />} />
                    <Route path="mood" element={<MoodTrackerPage />} />
                    <Route path="fitness" element={<FitnessPage />} />
                    <Route path="routines" element={<RoutinesPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="about" element={<AboutPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="terms" element={<TermsPage />} />
                </Route>

                <Route path="/auth/fitbit" element={<AuthCallbackPage />} />
                <Route path="/auth/googlefit" element={<AuthCallbackPage />} />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <ThemeProvider>
            <AppContent />
        </ThemeProvider>
    );
}

export default App;
