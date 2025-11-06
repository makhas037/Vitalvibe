import React, { useState, useEffect, useCallback } from 'react';
import { workoutService } from '../../services';
import './FitnessPage.css';

const FitnessPage = () => {
  const userId = 'demo-user';
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Running',
    duration: 30,
    distance: 5,
    calories: 300,
    intensity: 'moderate'
  });

  const workoutTypes = [
    'Running', 'Walking', 'Cycling', 'Swimming', 'Gym', 'Yoga', 'HIIT', 'Sports'
  ];

  const intensityLevels = ['low', 'moderate', 'high', 'intense'];

  const fetchWorkouts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workoutService.getByDateRange(userId, selectedDate, selectedDate);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('✅ Workouts fetched:', data);
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to load workouts:', err);
      setError('Failed to load workout data');
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    if (!formData.type) return;

    setLoading(true);
    setError(null);
    try {
      console.log('📤 Adding workout:', formData);
      
      await workoutService.create({
        date: selectedDate,
        type: formData.type,
        duration: formData.duration,
        distance: formData.distance,
        calories: formData.calories,
        intensity: formData.intensity
      });
      
      console.log('✅ Workout saved successfully');
      setSuccess('✅ Workout saved successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
      
      setFormData({ type: 'Running', duration: 30, distance: 5, calories: 300, intensity: 'moderate' });
      setShowForm(false);
      
      await fetchWorkouts();
    } catch (err) {
      console.error('Error adding workout:', err);
      setError('Failed to add workout');
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutIcon = (type) => {
    const icons = {
      'Running': '🏃',
      'Walking': '🚶',
      'Cycling': '🚴',
      'Swimming': '🏊',
      'Gym': '💪',
      'Yoga': '🧘',
      'HIIT': '⚡',
      'Sports': '⚽'
    };
    return icons[type] || '🏋️';
  };

  return (
    <div className="fitness-page">
      <header className="fitness-header">
        <h1>💪 Fitness Tracker</h1>
        <p>Track your workouts and achieve your goals</p>
      </header>

      <div className="fitness-container">
        <div className="fitness-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <button 
            className="btn-add-workout"
            onClick={() => setShowForm(!showForm)}
          >
            ➕ Add Workout
          </button>
        </div>

        {success && <div className="success-message" style={{background: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{success}</div>}
        {error && <div className="error-message" style={{background: '#ef4444', color: 'white', padding: '12px', borderRadius: '8px', marginBottom: '16px'}}>{error}</div>}

        {showForm && (
          <div className="workout-form-container">
            <form onSubmit={handleAddWorkout} className="workout-form">
              <div className="form-group">
                <label>Workout Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="form-select"
                >
                  {workoutTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="form-input"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>Distance (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distance}
                  onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Calories Burned</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  className="form-input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Intensity</label>
                <div className="intensity-options">
                  {intensityLevels.map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`intensity-btn ${formData.intensity === level ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, intensity: level })}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Workout'}
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
          <div className="loading-state">Loading workouts...</div>
        ) : (
          <div className="workouts-list">
            {workouts.length > 0 ? (
              workouts.map((workout) => (
                <div key={workout._id} className="workout-card" style={{border: '1px solid #333', padding: '16px', borderRadius: '8px', marginBottom: '12px', display: 'flex', gap: '16px'}}>
                  <div className="workout-icon" style={{fontSize: '32px'}}>{getWorkoutIcon(workout.type)}</div>
                  <div className="workout-info" style={{flex: 1}}>
                    <h3>{workout.type}</h3>
                    <p className="workout-time" style={{color: '#999', fontSize: '14px'}}>{new Date(workout.startTime || workout.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <div className="workout-stats" style={{display: 'flex', gap: '16px'}}>
                    <div className="stat">
                      <span className="icon">⏱️</span>
                      <span className="value" style={{fontWeight: 'bold'}}>{workout.duration}</span>
                      <span className="unit" style={{fontSize: '12px', color: '#999'}}>min</span>
                    </div>
                    <div className="stat">
                      <span className="icon">📍</span>
                      <span className="value" style={{fontWeight: 'bold'}}>{workout.distance}</span>
                      <span className="unit" style={{fontSize: '12px', color: '#999'}}>km</span>
                    </div>
                    <div className="stat">
                      <span className="icon">🔥</span>
                      <span className="value" style={{fontWeight: 'bold'}}>{workout.calories}</span>
                      <span className="unit" style={{fontSize: '12px', color: '#999'}}>cal</span>
                    </div>
                    <div className="intensity-badge" style={{padding: '6px 12px', background: '#20c997', borderRadius: '4px', fontSize: '12px'}}>
                      {workout.intensity}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-workouts" style={{textAlign: 'center', padding: '24px', color: '#999'}}>No workouts logged for this date</div>
            )}
          </div>
        )}

        {workouts.length > 0 && (
          <div className="fitness-summary" style={{marginTop: '24px', padding: '16px', background: '#1a1a1a', borderRadius: '8px'}}>
            <h3>Today's Summary</h3>
            <div className="summary-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '12px'}}>
              <div className="summary-card" style={{padding: '12px', background: '#242424', borderRadius: '8px'}}>
                <span className="label">Total Workouts</span>
                <span className="value" style={{fontSize: '24px', fontWeight: 'bold', display: 'block'}}>{workouts.length}</span>
              </div>
              <div className="summary-card" style={{padding: '12px', background: '#242424', borderRadius: '8px'}}>
                <span className="label">Total Duration</span>
                <span className="value" style={{fontSize: '24px', fontWeight: 'bold', display: 'block'}}>{workouts.reduce((sum, w) => sum + w.duration, 0)} min</span>
              </div>
              <div className="summary-card" style={{padding: '12px', background: '#242424', borderRadius: '8px'}}>
                <span className="label">Total Distance</span>
                <span className="value" style={{fontSize: '24px', fontWeight: 'bold', display: 'block'}}>{workouts.reduce((sum, w) => sum + w.distance, 0).toFixed(1)} km</span>
              </div>
              <div className="summary-card" style={{padding: '12px', background: '#242424', borderRadius: '8px'}}>
                <span className="label">Calories Burned</span>
                <span className="value" style={{fontSize: '24px', fontWeight: 'bold', display: 'block'}}>{workouts.reduce((sum, w) => sum + w.calories, 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessPage;