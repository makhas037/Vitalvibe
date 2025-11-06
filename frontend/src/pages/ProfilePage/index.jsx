// File: /src/pages/ProfilePage/index.jsx
import React, { useState, useEffect } from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: 'Malack Hassan',
    email: 'malack@example.com',
    age: 25,
    height: 175,
    weight: 70,
    location: 'New Delhi, India',
    bio: 'Health enthusiast | Fitness lover | Always learning',
    joinDate: 'Nov 2024',
    workoutsCompleted: 42,
    achievements: 5
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const achievements = [
    { icon: '🏃', label: 'Week Warrior', desc: '7 workouts in a week' },
    { icon: '🎯', label: 'Goal Setter', desc: 'Set your first goal' },
    { icon: '🔥', label: 'On Fire', desc: '30-day streak' },
    { icon: '💪', label: 'Strong Start', desc: '50 workouts completed' },
    { icon: '🥗', label: 'Nutrition Pro', desc: '100 meals logged' }
  ];

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>👤 Profile</h1>
        <p>Manage your account and personal information</p>
      </header>

      <div className="profile-container">
        {/* Profile Card */}
        <div className="profile-card main-profile">
          <div className="profile-banner"></div>
          <div className="profile-pic">
            <div className="avatar">MH</div>
          </div>
          
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
              />
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Bio"
                rows="3"
              ></textarea>
              <div className="form-row">
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                />
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Height (cm)"
                />
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Weight (kg)"
                />
              </div>
              <div className="edit-actions">
                <button className="btn-save" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
                <button className="btn-cancel" onClick={() => { setIsEditing(false); setFormData(profile); }}>
                  ✕ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <h2>{profile.name}</h2>
              <p className="email">{profile.email}</p>
              <p className="bio">{profile.bio}</p>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Age</span>
                  <span className="value">{profile.age} years</span>
                </div>
                <div className="info-item">
                  <span className="label">Height</span>
                  <span className="value">{profile.height} cm</span>
                </div>
                <div className="info-item">
                  <span className="label">Weight</span>
                  <span className="value">{profile.weight} kg</span>
                </div>
                <div className="info-item">
                  <span className="label">Location</span>
                  <span className="value">{profile.location}</span>
                </div>
              </div>

              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                ✎ Edit Profile
              </button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="profile-stats">
          <div className="stat-box">
            <div className="stat-icon">🏃</div>
            <div className="stat-text">
              <div className="stat-number">{profile.workoutsCompleted}</div>
              <div className="stat-label">Workouts</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">🎖️</div>
            <div className="stat-text">
              <div className="stat-number">{profile.achievements}</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">📅</div>
            <div className="stat-text">
              <div className="stat-number">2m</div>
              <div className="stat-label">Member</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="achievements-section">
          <h3>🏆 Your Achievements</h3>
          <div className="achievements-grid">
            {achievements.map((achievement, idx) => (
              <div key={idx} className="achievement-card">
                <div className="achievement-icon">{achievement.icon}</div>
                <div className="achievement-label">{achievement.label}</div>
                <div className="achievement-desc">{achievement.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
