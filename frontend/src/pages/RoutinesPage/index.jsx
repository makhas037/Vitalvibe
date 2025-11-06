import React, { useState, useCallback } from 'react';
import './RoutinesPage.css';
import AddRoutineModal from '../../components/Routines/AddRoutineModal';
import { IoTrash, IoReturnUpForward, IoCloseCircleOutline } from 'react-icons/io5';

const RoutineCard = React.memo(({ routine, onToggleActivity, onArchive }) => {
    const activities = routine.activities || routine.tasks || [];
    const completedCount = activities.filter(a => a.completed).length;
    const totalCount = activities.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <div className="routine-card">
            <div className="routine-header">
                <h3>{routine.title}</h3>
                <div className="header-actions">
                    <span className="routine-time">{routine.time}</span>
                    <button className="delete-btn" onClick={() => onArchive(routine._id)} title="Archive Routine">
                        <IoTrash />
                    </button>
                </div>
            </div>

            {routine.description && <p className="routine-description">{routine.description}</p>}

            <div className="routine-activities">
                {activities.length > 0 ? (
                    activities.map(activity => (
                        <div
                            key={activity.id}
                            className={`activity-item ${activity.completed ? 'completed' : ''}`}
                            onClick={() => onToggleActivity(routine._id, activity.id)}
                        >
                            <div className="activity-check">
                                {activity.completed && '✓'}
                            </div>
                            <span className="activity-name">{activity.name}</span>
                            {activity.duration && <span className="activity-duration">{activity.duration}</span>}
                        </div>
                    ))
                ) : (
                    <p className="no-activities-text">No activities defined.</p>
                )}
            </div>

            <div className="routine-progress">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <span>{completedCount} of {totalCount} completed</span>
            </div>
        </div>
    );
});

const HistoryPanel = React.memo(({ history, onRestore }) => (
    <div className="history-panel">
        <h3>📜 Routine History</h3>
        <p>Archived routines. Restore them to use them again.</p>
        <div className="history-list">
            {history.length > 0 ? (
                history.map(routine => (
                    <div key={routine._id} className="history-item">
                        <span>{routine.title}</span>
                        <button className="btn btn--secondary" onClick={() => onRestore(routine._id)}>
                            <IoReturnUpForward /> Restore
                        </button>
                    </div>
                ))
            ) : (
                <p className="no-history-text">No archived routines.</p>
            )}
        </div>
    </div>
));

const RoutinesPage = () => {
    // LOCAL STATE ONLY - NO API CALLS
    const [activeRoutines, setActiveRoutines] = useState([
        {
            _id: '1',
            title: 'Morning Routine',
            time: '06:00',
            description: 'Start your day right',
            isArchived: false,
            tasks: [
                { id: '1-1', name: 'Drink Water', duration: '5 min', completed: false },
                { id: '1-2', name: 'Exercise', duration: '30 min', completed: false },
                { id: '1-3', name: 'Shower', duration: '15 min', completed: false }
            ]
        },
        {
            _id: '2',
            title: 'Evening Routine',
            time: '21:00',
            description: 'Wind down for better sleep',
            isArchived: false,
            tasks: [
                { id: '2-1', name: 'Meditation', duration: '10 min', completed: false },
                { id: '2-2', name: 'Read', duration: '20 min', completed: false }
            ]
        }
    ]);

    const [historyRoutines, setHistoryRoutines] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);

    const handleToggleActivity = useCallback((routineId, activityId) => {
        setActiveRoutines(prevRoutines =>
            prevRoutines.map(routine => {
                if (routine._id === routineId) {
                    return {
                        ...routine,
                        tasks: routine.tasks.map(activity =>
                            activity.id === activityId
                                ? { ...activity, completed: !activity.completed }
                                : activity
                        )
                    };
                }
                return routine;
            })
        );
        console.log('✅ Activity toggled:', routineId, activityId);
    }, []);

    const handleAddRoutine = useCallback(async (newRoutineData) => {
        console.log('✅ Adding routine locally:', newRoutineData);
        
        try {
            const newRoutine = {
                _id: Date.now().toString(),
                title: newRoutineData.title,
                time: newRoutineData.time,
                description: newRoutineData.description || '',
                isArchived: false,
                tasks: newRoutineData.activities.map((a, idx) => ({
                    id: `${Date.now()}-${idx}`,
                    name: a.name,
                    duration: a.duration,
                    completed: false
                }))
            };

            setActiveRoutines(prev => [...prev, newRoutine]);
            console.log('✅ Routine added to local state');
        } catch (err) {
            console.error('Failed to add routine:', err);
            setError('Failed to add routine');
            throw err;
        }
    }, []);

    const handleArchive = useCallback((routineId) => {
        if (!window.confirm('Archive this routine?')) return;

        setActiveRoutines(prev => prev.filter(r => r._id !== routineId));
        setHistoryRoutines(prev => {
            const routine = activeRoutines.find(r => r._id === routineId);
            return routine ? [...prev, { ...routine, isArchived: true }] : prev;
        });
        console.log('✅ Routine archived:', routineId);
    }, [activeRoutines]);

    const handleRestore = useCallback((routineId) => {
        const routine = historyRoutines.find(r => r._id === routineId);
        if (!routine) return;

        setHistoryRoutines(prev => prev.filter(r => r._id !== routineId));
        setActiveRoutines(prev => [...prev, { ...routine, isArchived: false }]);
        console.log('✅ Routine restored:', routineId);
    }, [historyRoutines]);

    return (
        <>
            <AddRoutineModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddRoutine={handleAddRoutine}
            />

            <section id="routines" className="content-section active">
                <div className="section-header">
                    <div>
                        <h1>🗓️ Smart Health Routines</h1>
                        <p>Manage your daily health routines and track progress (Local Mode - No API)</p>
                    </div>
                    <button className="btn btn--primary" onClick={() => setIsModalOpen(true)}>
                        + Add New Routine
                    </button>
                </div>

                {error && (
                    <div className="alert-error">
                        <IoCloseCircleOutline />
                        {error}
                        <button className="btn-clear-error" onClick={() => setError(null)}>
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="page-layout">
                    <div className="routines-grid">
                        {activeRoutines.length > 0 ? (
                            activeRoutines.map(routine => (
                                <RoutineCard
                                    key={routine._id}
                                    routine={routine}
                                    onToggleActivity={handleToggleActivity}
                                    onArchive={handleArchive}
                                />
                            ))
                        ) : (
                            <div className="no-data-message">
                                No active routines found. Click "Add New Routine" to start!
                            </div>
                        )}
                    </div>

                    <HistoryPanel history={historyRoutines} onRestore={handleRestore} />
                </div>
            </section>
        </>
    );
};

export default RoutinesPage;