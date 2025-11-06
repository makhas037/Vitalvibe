import React, { useState, useEffect } from 'react';
import { 
  IconPalette, 
  IconBell, 
  IconLock, 
  IconTrash, 
  IconCheck, 
  IconDownload 
} from '../../components/Icons';
import { useTheme } from '../../context/ThemeContext';
import './SettingsPage.css';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    animations: true,
    highContrast: false,
    autoSync: true,
    offlineMode: false,
    dataCollection: true
  });

  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || 'http://localhost:5000/api');
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const savedSettings = localStorage.getItem('vitalvibe_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (err) {
        console.error('Error loading settings:', err);
      }
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    showNotification(`Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode`, 'success');
  };

  const handleSaveSettings = async () => {
    try {
      localStorage.setItem('vitalvibe_settings', JSON.stringify(settings));
      showNotification('All settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
    }
  };

  const handleSaveApiSettings = async () => {
    try {
      localStorage.setItem('apiUrl', apiUrl);
      showNotification('API settings updated successfully!', 'success');
      setShowApiSettings(false);
    } catch (error) {
      console.error('Error saving API settings:', error);
      showNotification('Failed to save API settings', 'error');
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure? This will clear all cached data.')) {
      try {
        localStorage.clear();
        sessionStorage.clear();
        showNotification('Cache cleared successfully!', 'success');
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        console.error('Error clearing cache:', error);
        showNotification('Failed to clear cache', 'error');
      }
    }
  };

  const handleExportSettings = () => {
    try {
      const dataToExport = {
        settings,
        theme,
        exportDate: new Date().toISOString()
      };
      const json = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vitalvibe-settings-${Date.now()}.json`;
      a.click();
      showNotification('Settings exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting settings:', error);
      showNotification('Failed to export settings', 'error');
    }
  };

  const settingGroups = [
    {
      title: 'Theme & Appearance',
      icon: <IconPalette size={28} color="var(--accent-primary)" />,
      items: [
        {
          key: 'theme',
          label: 'Color Scheme',
          description: 'Choose your preferred theme',
          type: 'dropdown',
          options: [
            { value: 'light', label: '☀️ Light Mode' },
            { value: 'dark', label: '🌙 Dark Mode' }
          ]
        },
        { key: 'animations', label: 'Animations', description: 'Enable smooth transitions and effects', type: 'toggle' },
        { key: 'highContrast', label: 'High Contrast', description: 'Increase text and icon contrast', type: 'toggle' }
      ]
    },
    {
      title: 'Notifications & Alerts',
      icon: <IconBell size={28} color="var(--accent-primary)" />,
      items: [
        { key: 'notifications', label: 'Push Notifications', description: 'Get health alerts and reminders', type: 'toggle' },
        { key: 'emailUpdates', label: 'Email Updates', description: 'Receive weekly health reports', type: 'toggle' }
      ]
    },
    {
      title: 'Data & Privacy',
      icon: <IconLock size={28} color="var(--accent-primary)" />,
      items: [
        { key: 'autoSync', label: 'Auto Sync', description: 'Automatically sync your data', type: 'toggle' },
        { key: 'offlineMode', label: 'Offline Mode', description: 'Use app without internet', type: 'toggle' },
        { key: 'dataCollection', label: 'Analytics', description: 'Help improve VitalVibe', type: 'toggle' }
      ]
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1>⚙️ Settings</h1>
          <p>Customize your VitalVibe experience</p>
        </div>
      </header>

      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          <span>{notification.type === 'success' ? '✓' : '✕'}</span>
          <p>{notification.message}</p>
        </div>
      )}

      <div className="settings-container">
        {settingGroups.map((group, idx) => (
          <div key={idx} className="settings-group card">
            <div className="group-header">
              <span className="group-icon">{group.icon}</span>
              <h2>{group.title}</h2>
            </div>

            <div className="settings-items">
              {group.items.map(item => (
                <div key={item.key} className="setting-item">
                  {item.type === 'toggle' && (
                    <>
                      <div className="setting-info">
                        <h3>{item.label}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          id={item.key}
                          checked={settings[item.key]}
                          onChange={() => handleToggle(item.key)}
                        />
                        <label htmlFor={item.key}></label>
                      </div>
                    </>
                  )}

                  {item.type === 'dropdown' && (
                    <>
                      <div className="setting-info">
                        <h3>{item.label}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="dropdown-group">
                        {item.options.map(option => (
                          <button
                            key={option.value}
                            className={`theme-option ${theme === option.value ? 'active' : ''}`}
                            onClick={() => handleThemeChange(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="settings-actions">
          <button className="btn btn-primary" onClick={handleSaveSettings}>
            <IconCheck size={18} /> Save All Changes
          </button>
          <button className="btn btn-secondary" onClick={handleExportSettings}>
            <IconDownload size={18} /> Export Settings
          </button>
          <button className="btn btn-danger" onClick={handleClearCache}>
            <IconTrash size={18} /> Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
