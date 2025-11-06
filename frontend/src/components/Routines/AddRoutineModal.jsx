import React, { useState } from 'react';
import Modal from '../UI/Modal';

const AddRoutineModal = ({ isOpen, onClose, onAddRoutine }) => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('');
    const [activities, setActivities] = useState([{ id: 1, name: '', duration: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleActivityChange = (id, field, value) => {
        setActivities(currentActivities =>
            currentActivities.map(act => (act.id === id ? { ...act, [field]: value } : act))
        );
    };

    const addActivityField = () => {
        setActivities(currentActivities => [
            ...currentActivities,
            { id: Date.now(), name: '', duration: '' }
        ]);
    };

    const removeActivityField = (id) => {
        setActivities(currentActivities => currentActivities.filter(act => act.id !== id));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title || !time) {
            alert('Please fill in a title and time for the routine.');
            return;
        }

        const finalActivities = activities
            .filter(a => a.name.trim() && a.duration.trim())
            .map(({ name, duration }) => ({ name, duration, completed: false }));

        if (finalActivities.length === 0) {
            alert('Please add at least one activity.');
            return;
        }

        setIsSubmitting(true);
        
        try {
            console.log('🚀 Submitting routine:', { title, time, activities: finalActivities });
            
            // Wait for the routine to be added
            await onAddRoutine({ title, time, activities: finalActivities });
            
            console.log('✅ Routine submitted successfully');
            
            // Reset form for next time
            setTitle('');
            setTime('');
            setActivities([{ id: 1, name: '', duration: '' }]);
            
            // Close modal after successful submission
            onClose();
        } catch (error) {
            console.error('❌ Error submitting routine:', error);
            alert('Failed to create routine. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Routine">
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Routine Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g., Morning Workout" 
                        required 
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label>Time</label>
                    <input 
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)} 
                        required 
                        disabled={isSubmitting}
                    />
                </div>
                
                <label>Activities</label>
                {activities.map((activity, index) => (
                    <div key={activity.id} className="activity-input-group">
                        <input 
                            type="text" 
                            value={activity.name} 
                            onChange={(e) => handleActivityChange(activity.id, 'name', e.target.value)} 
                            placeholder={`Activity ${index + 1}`} 
                            disabled={isSubmitting}
                        />
                        <input 
                            type="text" 
                            value={activity.duration} 
                            onChange={(e) => handleActivityChange(activity.id, 'duration', e.target.value)} 
                            placeholder="e.g., 30 min" 
                            disabled={isSubmitting}
                        />
                        {activities.length > 1 && (
                            <button 
                                type="button" 
                                className="remove-activity-btn" 
                                onClick={() => removeActivityField(activity.id)}
                                disabled={isSubmitting}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}
                <button 
                    type="button" 
                    className="btn btn--outline" 
                    onClick={addActivityField}
                    disabled={isSubmitting}
                >
                    + Add Activity
                </button>
                
                <div className="form-actions">
                    <button 
                        type="button" 
                        className="btn btn--secondary" 
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn--primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save Routine'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddRoutineModal;
