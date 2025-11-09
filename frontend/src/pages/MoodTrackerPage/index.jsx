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
      const data = response.data?.data || response.data || [];
      console.log('✅ Moods fetched:', data);
      setMoods(Array.isArray(data) ? data : []);
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
      console.log('📤 Adding mood with AI analysis:', formData);
      
      await moodService.create({
        date: selectedDate,
        mood: formData.mood, // Send emoji
        intensity: formData.intensity,
        notes: formData.notes,
        triggers: formData.triggers
      });
      
      console.log('✅ Mood saved and analyzed successfully');
      setSuccess('✅ Mood analyzed and saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
      
      setFormData({ mood: '😊', intensity: 5, notes: '', triggers: [] });
      setShowForm(false);
      
      await fetchMoods();
    } catch (err) {
      console.error('Error adding mood:', err);
      setError('Failed to add mood entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mood-tracker-page">
      <header className="mood-header">
        <h1>😊 Mood Tracker</h1>
        <p>Track and understand your emotional patterns with AI-powered insights</p>
      </header>

      <div className="mood-container">
        <div className="mood-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
            max={new Date().toISOString().split('T')[0]}
          />
          <button 
            className="btn-add-mood"
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
          >
            ➕ Add Mood
          </button>
        </div>

        {success && (
          <div className="success-message" style={{
            background: '#10b981', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}
        
        {error && (
          <div className="error-message" style={{
            background: '#ef4444', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

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
                  placeholder="What's on your mind? Share details for better AI analysis..."
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
                  {loading ? 'Analyzing & Saving...' : '🧠 Analyze & Save'}
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

        {loading && !showForm ? (
          <div className="loading-state">Loading moods...</div>
        ) : (
          <div className="moods-list">
            {moods.length > 0 ? (
              moods.map((mood) => (
                <div key={mood._id} className="mood-entry">
                  <div className="mood-emoji">{mood.mood}</div>
                  <div className="mood-details">
                    <div className="mood-header">
                      <span className="mood-intensity">Intensity: {mood.intensity}/10</span>
                      <span className="mood-time">
                        {new Date(mood.time || mood.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    {mood.notes && <p className="mood-notes">{mood.notes}</p>}
                    
                    {mood.triggers && mood.triggers.length > 0 && (
                      <div className="mood-triggers">
                        {mood.triggers.map((trigger, idx) => (
                          <span key={idx} className="trigger-tag">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* AI Analysis Inline Display */}
                    {mood.aiAnalysis && (
                      <div className="ai-analysis-inline" style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(32, 201, 151, 0.1)',
                        borderRadius: '8px',
                        borderLeft: '3px solid var(--primary)'
                      }}>
                        <div style={{
                          fontWeight: '600', 
                          color: 'var(--primary)', 
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          🧠 AI Insights
                          {mood.aiAnalysis.riskLevel === 'high' && (
                            <span style={{
                              padding: '2px 6px',
                              background: '#ef4444',
                              color: 'white',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              HIGH RISK
                            </span>
                          )}
                        </div>
                        
                        <p style={{
                          fontSize: '13px', 
                          color: 'var(--text-secondary)', 
                          margin: '4px 0',
                          fontStyle: 'italic'
                        }}>
                          {mood.aiAnalysis.sentiment}
                        </p>
                        
                        <p style={{
                          fontSize: '14px', 
                          color: 'var(--text-primary)', 
                          margin: '8px 0 0 0'
                        }}>
                          {mood.aiAnalysis.advice}
                        </p>

                        {mood.aiAnalysis.riskLevel === 'high' && (
                          <div style={{
                            marginTop: '8px',
                            padding: '8px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#fca5a5'
                          }}>
                            ⚠️ Consider reaching out to a mental health professional for support.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-moods" style={{
                textAlign: 'center', 
                padding: '40px', 
                color: '#999',
                background: 'var(--bg-surface)',
                borderRadius: '12px',
                border: '1px dashed var(--border)'
              }}>
                <div style={{fontSize: '48px', marginBottom: '12px'}}>📝</div>
                <p>No mood entries for this date</p>
                <p style={{fontSize: '14px', marginTop: '8px'}}>
                  Click "Add Mood" to track your emotions
                </p>
              </div>
            )}
          </div>
        )}

        {moods.length > 0 && (
          <>
            <div className="mood-stats" style={{
              marginTop: '24px', 
              padding: '20px', 
              background: 'var(--bg-surface)', 
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{margin: '0 0 16px', color: 'var(--text-primary)'}}>
                Today's Summary
              </h3>
              <div className="stats-grid" style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '16px'
              }}>
                <div className="stat-card" style={{
                  padding: '16px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <span className="stat-label" style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px'
                  }}>
                    Average Intensity
                  </span>
                  <span className="stat-value" style={{
                    display: 'block',
                    fontSize: '28px', 
                    fontWeight: 'bold',
                    color: 'var(--primary)'
                  }}>
                    {(moods.reduce((sum, m) => sum + m.intensity, 0) / moods.length).toFixed(1)}/10
                  </span>
                </div>
                
                <div className="stat-card" style={{
                  padding: '16px', 
                  background: 'var(--bg-hover)', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <span className="stat-label" style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--text-tertiary)',
                    marginBottom: '8px'
                  }}>
                    Entries Today
                  </span>
                  <span className="stat-value" style={{
                    display: 'block',
                    fontSize: '28px', 
                    fontWeight: 'bold',
                    color: 'var(--primary)'
                  }}>
                    {moods.length}
                  </span>
                </div>

                {moods.some(m => m.aiAnalysis?.riskLevel === 'high') && (
                  <div className="stat-card" style={{
                    padding: '16px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px solid #ef4444'
                  }}>
                    <span className="stat-label" style={{
                      display: 'block',
                      fontSize: '12px',
                      color: '#fca5a5',
                      marginBottom: '8px'
                    }}>
                      Risk Alert
                    </span>
                    <span className="stat-value" style={{
                      display: 'block',
                      fontSize: '20px', 
                      fontWeight: 'bold',
                      color: '#ef4444'
                    }}>
                      ⚠️ HIGH
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced AI Mood Analysis Section */}
            {moods[0]?.aiAnalysis && (
              <div className="mood-ai-advice" style={{
                marginTop: '24px', 
                padding: '24px', 
                background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)', 
                borderRadius: '12px',
                border: '1px solid var(--primary)',
                boxShadow: '0 4px 12px rgba(32, 201, 151, 0.1)'
              }}>
                <h3 style={{
                  color: 'var(--primary)', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🧠 VitalVibe AI Analysis
                  <span style={{
                    fontSize: '12px',
                    background: 'rgba(32, 201, 151, 0.2)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontWeight: 'normal'
                  }}>
                    Powered by Gemini
                  </span>
                </h3>
                
                <div style={{marginBottom: '16px'}}>
                  <strong style={{
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    Sentiment Analysis:
                  </strong>
                  <p style={{
                    marginTop: '4px', 
                    color: '#d1d5db',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    fontStyle: 'italic'
                  }}>
                    {moods[0].aiAnalysis.sentiment}
                  </p>
                </div>

                <div style={{marginBottom: '16px'}}>
                  <strong style={{
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '6px'
                  }}>
                    Personalized Advice:
                  </strong>
                  <p style={{
                    marginTop: '4px', 
                    color: '#d1d5db',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {moods[0].aiAnalysis.advice}
                  </p>
                </div>

                {moods[0].aiAnalysis.insights && moods[0].aiAnalysis.insights.length > 0 && (
                  <div style={{marginBottom: '16px'}}>
                    <strong style={{
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Key Insights:
                    </strong>
                    <ul style={{
                      marginTop: '8px', 
                      paddingLeft: '20px', 
                      color: '#d1d5db',
                      fontSize: '14px',
                      lineHeight: '1.8'
                    }}>
                      {moods[0].aiAnalysis.insights.map((insight, idx) => (
                        <li key={idx} style={{marginBottom: '6px'}}>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  <span>
                    Risk Level: <span style={{
                      color: moods[0].aiAnalysis.riskLevel === 'high' ? '#ef4444' : 
                             moods[0].aiAnalysis.riskLevel === 'medium' ? '#f59e0b' : '#10b981',
                      fontWeight: '600',
                      marginLeft: '4px'
                    }}>
                      {moods[0].aiAnalysis.riskLevel?.toUpperCase()}
                    </span>
                  </span>
                  <span>
                    Generated: {new Date(moods[0].aiAnalysis.generatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoodTrackerPage;
