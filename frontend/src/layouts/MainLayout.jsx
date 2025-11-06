// File: web-app/src/layouts/MainLayout.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom'; // Added Outlet

import Sidebar from '../components/Sidebar';
import DashboardPage from '../pages/DashboardPage';
import HealthMetricsPage from '../pages/HealthMetricsPage';
import SymptomCheckerPage from '../pages/SymptomCheckerPage';
import RoutinesPage from '../pages/RoutinesPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';
import AboutPage from '../pages/AboutPage';
import PrivacyPage from '../pages/PrivacyPage';
import TermsPage from '../pages/TermsPage';
import ProfilePage from '../pages/ProfilePage';
import NutritionPage from '../pages/NutritionPage';
import MoodTrackerPage from '../pages/MoodTrackerPage';
import FitnessPage from '../pages/FitnessPage';
import './MainLayout.css';

const sectionToPath = {
    dashboard: '/dashboard',
    'health-metrics': '/health-metrics',
    'ai-chat': '/symptom-checker',
    nutrition: '/nutrition',
    mood: '/mood',
    fitness: '/fitness',
    routines: '/routines',
    reports: '/reports',
    settings: '/settings',
    about: '/about',
    privacy: '/privacy',
    terms: '/terms',
    profile: '/profile'
};

const pathToSection = {
    '/': 'dashboard',
    '/dashboard': 'dashboard',
    '/health-metrics': 'health-metrics',
    '/symptom-checker': 'ai-chat',
    '/nutrition': 'nutrition',
    '/mood': 'mood',
    '/fitness': 'fitness',
    '/routines': 'routines',
    '/reports': 'reports',
    '/settings': 'settings',
    '/about': 'about',
    '/privacy': 'privacy',
    '/terms': 'terms',
    '/profile': 'profile'
};

const MainLayout = ({ theme, setTheme }) => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [navNotification, setNavNotification] = useState('');
    const [notificationKey, setNotificationKey] = useState(0);
    const [isSidebarExpanded] = useState(true); // Assuming expanded by default

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Map current path to active section for sidebar highlighting
        const match = pathToSection[location.pathname] || 'dashboard';
        setActiveSection(match);
    }, [location.pathname]);

    const handleNavClick = (sectionId, sectionLabel) => {
        if (sectionId !== activeSection) {
            setActiveSection(sectionId);
            const nextPath = sectionToPath[sectionId] || '/dashboard';
            navigate(nextPath);
            setNavNotification(`Navigating to ${sectionLabel}`);
            setNotificationKey(prevKey => prevKey + 1);
        }
    };

    return (
        <div className="main-layout">
            <Sidebar
                activeSection={activeSection}
                onNavClick={handleNavClick}
                isExpanded={isSidebarExpanded}
                onToggleExpanded={() => {}}
            />

            <main className="main-content">
                <div key={location.pathname} className="content-section-wrapper">
                    {/* The Outlet renders the nested route content defined in App.jsx */}
                    <Outlet />
                </div>
            </main>

            {navNotification && (
                <div id="nav-notification" key={notificationKey} className="nav-notification">
                    {navNotification}
                </div>
            )}
        </div>
    );
};

export default MainLayout;