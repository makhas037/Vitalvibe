import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import {
  IoGrid,
  IoBarChart,
  IoChatbubbleEllipses,
  IoRepeat,
  IoNewspaper,
  IoSettings,
  IoMenu,
  IoClose,
  IoPersonCircle,
  IoInformationCircle,
  IoShieldCheckmark,
  IoDocumentText,
  IoFlash,
  IoFastFood,
  IoHeart,
  IoBarbell
} from 'react-icons/io5';
import { useNavigate, useLocation } from 'react-router-dom';

const navMap = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: <IoGrid size={22} />, badge: null },
  { id: 'health-metrics', label: 'Health Metrics', path: '/health-metrics', icon: <IoBarChart size={22} />, badge: null },
  { id: 'ai-chat', label: 'AI Analysis', path: '/symptom-checker', icon: <IoChatbubbleEllipses size={22} />, badge: 'New' },
  { id: 'nutrition', label: 'Nutrition', path: '/nutrition', icon: <IoFastFood size={22} />, badge: null },
  { id: 'mood', label: 'Mood Tracker', path: '/mood', icon: <IoHeart size={22} />, badge: null },
  { id: 'fitness', label: 'Fitness', path: '/fitness', icon: <IoBarbell size={22} />, badge: null },
  { id: 'routines', label: 'Routines', path: '/routines', icon: <IoRepeat size={22} />, badge: null },
  { id: 'reports', label: 'Reports', path: '/reports', icon: <IoNewspaper size={22} />, badge: null },
  { id: 'settings', label: 'Settings', path: '/settings', icon: <IoSettings size={22} />, badge: null }
];

const auxLinks = [
  { id: 'about', label: 'About', path: '/about', icon: <IoInformationCircle size={18} /> },
  { id: 'privacy', label: 'Privacy', path: '/privacy', icon: <IoShieldCheckmark size={18} /> },
  { id: 'terms', label: 'Terms', path: '/terms', icon: <IoDocumentText size={18} /> }
];

const Sidebar = ({ activeSection, onNavClick, isExpanded, onToggleExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (item) => {
    onNavClick?.(item.id, item.label);
    if (item.path && item.path !== location.pathname) {
      navigate(item.path);
      if (isMobile) setMobileOpen(false);
    }
  };

  const closeMobileSidebar = () => setMobileOpen(false);

  return (
    <>
      {isMobile && !mobileOpen && (
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
          <IoMenu size={24} />
        </button>
      )}

      {isMobile && mobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobileSidebar} />
      )}

      <nav className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'} ${isMobile ? (mobileOpen ? 'mobile-open' : 'mobile-closed') : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <IoFlash size={24} className="logo-flash" />
            </div>
            {(isExpanded || isMobile) && (
              <div className="logo-text-wrapper">
                <h2 className="logo-text">VitalVibe</h2>
                <p className="logo-subtext">Health Hub</p>
              </div>
            )}
          </div>
          <button
            className="toggle-btn"
            onClick={() => {
              if (isMobile) closeMobileSidebar();
              else onToggleExpanded();
            }}
            aria-label="Toggle sidebar"
          >
            {isMobile ? <IoClose size={24} /> : <IoMenu size={20} />}
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section">
            <p className="nav-section-title">Main</p>
            {navMap.slice(0, 3).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                isExpanded={isExpanded || isMobile}
                onClick={() => handleClick(item)}
              />
            ))}
          </div>

          <div className="nav-section">
            <p className="nav-section-title">Health</p>
            {navMap.slice(3, 7).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                isExpanded={isExpanded || isMobile}
                onClick={() => handleClick(item)}
              />
            ))}
          </div>

          <div className="nav-section">
            <p className="nav-section-title">Other</p>
            {navMap.slice(7).map((item) => (
              <NavItem
                key={item.id}
                item={item}
                isActive={activeSection === item.id}
                isExpanded={isExpanded || isMobile}
                onClick={() => handleClick(item)}
              />
            ))}
          </div>
        </div>

        <div className="sidebar-separator" />

        <div className="sidebar-aux">
          <p className="nav-section-title">Info</p>
          {auxLinks.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={location.pathname === item.path}
              isExpanded={isExpanded || isMobile}
              onClick={() => {
                navigate(item.path);
                if (isMobile) closeMobileSidebar();
              }}
            />
          ))}
        </div>

        <div className="sidebar-profile">
          <button
            className="profile-btn"
            onClick={() => {
              navigate('/profile');
              if (isMobile) closeMobileSidebar();
            }}
          >
            <div className="profile-avatar">
              <IoPersonCircle size={40} className="profile-icon" />
              <div className="profile-status-dot active" />
            </div>
            {(isExpanded || isMobile) && (
              <div className="profile-info">
                <span className="profile-name">Malack Hassan</span>
                <span className="profile-status">🟢 Online</span>
              </div>
            )}
          </button>
          {!isExpanded && !isMobile && <div className="tooltip profile-tooltip">Profile</div>}
        </div>
      </nav>
    </>
  );
};

const NavItem = ({ item, isActive, isExpanded, onClick }) => {
  return (
    <div className="nav-item-wrapper">
      <button
        className={`nav-item ${isActive ? 'active' : ''}`}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="nav-item-content">
          <span className="nav-icon">{item.icon}</span>
          {isExpanded && (
            <>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </>
          )}
        </span>
      </button>
      {!isExpanded && <div className="tooltip">{item.label}</div>}
    </div>
  );
};

export default Sidebar;
