import React, { useState, useEffect, useCallback } from 'react';
import { moodService } from '../../services';
import './MoodTrackerPage.css';

const MoodTrackerPage = () => {
  const userId = 'demo-user';
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mood: '😊',
    intensity: 5,
    notes: '',
    triggers: []
  });

  const moodOptions = [
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '😔', label: 'Sad', value: 'sad' },
    { emoji: '😤', label: 'Angry', value: 'angry' },
    { emoji: '😰', label: 'Anxious', value: 'anxious' },
    { emoji: '😴', label: 'Tired', value: 'tired' },
    { emoji: '😐', label: 'Neutral', value: 'neutral' }
  ];

  const fetchMoods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await moodService.getByDateRange(userId, selectedDate, selectedDate);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Moods fetched:', data);
      setMoods(data);
    } catch (err) {
      console.error('Failed to load moods:', err);
      setError('Failed to load mood data');
      setMoods([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    fetchMoods();
  }, [fetchMoods]);

  const handleAddMood = async (e) => {
    e.preventDefault();
    if (!formData.mood) return;

    setLoading(true);
    setError(null);
    try {
      console.log('📤 Adding mood:', formData);
      
      await moodService.create({
        date: selectedDate,
        mood: 'happy',
        intensity: formData.intensity,
        notes: formData.notes,
        triggers: formData.triggers
      });
      
      console.log('✅ Mood saved successfully');
      setSuccess('✅ Mood saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
      
      setFormData({ mood: '😊', intensity: 5, notes: '', triggers: [] });
      setShowForm(false);
      
      await fetchMoods();
    } catch (err) {
      console.error('Error adding mood:', err);
      setError('Failed to add mood entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mood-tracker-page">
      <header className="mood-header">
        <h1>😊 Mood Tracker</h1>
        <p>Track and understand your emotional patterns</p>
      </header>

      <div className="mood-container">
        <div className="mood-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <button 
            className="btn-add-mood"
            onClick={() => setShowForm(!showForm)}
          >
            ➕ Add Mood
          </button>
        </div>

        {success && <div className="success-message" style={{background: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{success}</div>}
        {error && <div className="error-message" style={{background: '#ef4444', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{error}</div>}

        {showForm && (
          <div className="mood-form-container">
            <form onSubmit={handleAddMood} className="mood-form">
              <div className="form-group">
                <label>How are you feeling?</label>
                <div className="mood-selector">
                  {moodOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`mood-btn ${formData.mood === option.emoji ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, mood: option.emoji })}
                      title={option.label}
                    >
                      {option.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Intensity: {formData.intensity}/10</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.intensity}
                  onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                  className="intensity-slider"
                />
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What's on your mind?"
                  className="notes-input"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Triggers (optional)</label>
                <div className="triggers-grid">
                  {['Work', 'Sleep', 'Exercise', 'Social', 'Food', 'Health'].map(trigger => (
                    <button
                      key={trigger}
                      type="button"
                      className={`trigger-chip ${formData.triggers.includes(trigger) ? 'active' : ''}`}
                      onClick={() => {
                        const triggers = formData.triggers.includes(trigger)
                          ? formData.triggers.filter(t => t !== trigger)
                          : [...formData.triggers, trigger];
                        setFormData({ ...formData, triggers });
                      }}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Mood'}
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading moods...</div>
        ) : (
          <div className="moods-list">
            {moods.length > 0 ? (
              moods.map((mood) => (
                <div key={mood._id} className="mood-entry" style={{border: '1px solid #333', padding: '16px', borderRadius: '8px', marginBottom: '12px'}}>
                  <div className="mood-emoji">😊</div>
                  <div className="mood-details">
                    <div className="mood-header">
                      <span className="mood-intensity">Intensity: {mood.intensity}/10</span>
                      <span className="mood-time">{new Date(mood.time || mood.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {mood.notes && <p className="mood-notes">{mood.notes}</p>}
                    {mood.triggers && mood.triggers.length > 0 && (
                      <div className="mood-triggers">
                        {mood.triggers.map(trigger => (
                          <span key={trigger} className="trigger-tag" style={{background: '#20c997', padding: '4px 8px', borderRadius: '4px', marginRight: '4px'}}>{trigger}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-moods" style={{textAlign: 'center', padding: '24px', color: '#999'}}>No mood entries for this date</div>
            )}
          </div>
        )}

        {moods.length > 0 && (
          <div className="mood-stats" style={{marginTop: '24px', padding: '16px', background: '#1a1a1a', borderRadius: '8px'}}>
            <h3>Today's Summary</h3>
            <div className="stats-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '12px'}}>
              <div className="stat-card" style={{padding: '12px', background: '#242424', borderRadius: '8px'}}>
                <span className="stat-label">Average Intensity</span>
                <span className="stat-value" style={{fontSize: '24px', fontWeight: 'bold'}}>
                  {(moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length).toFixed(1)}/10
                </span>
              </div>
              <div className="stat-card" style={{padding: '12px', background: '#242424', borderRadius: '8px'}}>
                <span className="stat-label">Entries</span>
                <span className="stat-value" style={{fontSize: '24px', fontWeight: 'bold'}}>{moods.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTrackerPage;