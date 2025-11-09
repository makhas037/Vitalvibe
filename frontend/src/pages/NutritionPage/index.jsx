import React, { useState, useEffect, useCallback } from 'react';
import { nutritionService } from '../../services';
import { IoSearch, IoTrash, IoCalendar, IoFastFoodOutline } from 'react-icons/io5';
import './NutritionPage.css';

const NutritionPage = () => {
    const userId = 'demo-user';
    const [searchTerm, setSearchTerm] = useState('');
    const [foodResults, setFoodResults] = useState([]);
    const [todaysMeals, setTodaysMeals] = useState([]);
    const [dailyTotals, setDailyTotals] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFood, setSelectedFood] = useState(null);
    const [servings, setServings] = useState(1);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const loadDailyNutrition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await nutritionService.getDailyNutrition(userId, selectedDate);
        const meals = response.data?.data || [];
        
        setTodaysMeals(meals);
        
        // Calculate totals from meals
        const totals = meals.reduce((acc, meal) => ({
            calories: acc.calories + (meal.totals?.calories || 0),
            protein: acc.protein + (meal.totals?.protein || 0),
            carbs: acc.carbs + (meal.totals?.carbs || 0),
            fat: acc.fat + (meal.totals?.fat || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
        
        setDailyTotals(totals);
    } catch (err) {
        console.error('Failed to load meals:', err);
        setError('Failed to load nutrition data');
        setTodaysMeals([]);
        setDailyTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    } finally {
        setLoading(false);
    }
}, [userId, selectedDate]);


    useEffect(() => {
        loadDailyNutrition();
    }, [loadDailyNutrition]);

    const searchFood = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
        // Use USDA API for real food data
        const response = await nutritionService.searchFoods(searchTerm);
        const foods = response.data?.data || [];
        
        // Transform to component format
        const results = foods.map(food => ({
            fdcId: food.fdcId,
            name: food.name,
            brand: food.brand,
            calories: Math.round(food.nutrients.calories),
            protein: food.nutrients.protein.toFixed(1),
            carbs: food.nutrients.carbs.toFixed(1),
            fat: food.nutrients.fat.toFixed(1)
        }));
        
        setFoodResults(results);
    } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search food. Please try again.');
        setFoodResults([]);
    } finally {
        setLoading(false);
    }
};

    const logMeal = async (food) => {
    setLoading(true);
    setError(null);
    
    try {
        const mealData = {
            date: selectedDate,
            mealType: 'snack',
            mealName: food.name,
            time: new Date(),
            foods: [{
                fdcId: food.fdcId,
                name: food.name,
                brand: food.brand,
                servingSize: 100,
                servingUnit: 'g',
                quantity: servings,
                nutrients: {
                    calories: parseFloat(food.calories),
                    protein: parseFloat(food.protein),
                    carbs: parseFloat(food.carbs),
                    fat: parseFloat(food.fat)
                }
            }],
            totals: {
                calories: parseFloat(food.calories) * servings,
                protein: parseFloat(food.protein) * servings,
                carbs: parseFloat(food.carbs) * servings,
                fat: parseFloat(food.fat) * servings
            }
        };

        await nutritionService.create(mealData);
        
        setSelectedFood(null);
        setServings(1);
        setFoodResults([]);
        setSearchTerm('');
        await loadDailyNutrition();
        
    } catch (err) {
        console.error('Meal logging failed:', err);
        setError('Failed to log meal. Please try again.');
    } finally {
        setLoading(false);
    }
};


    const removeMeal = async (mealId) => {
        if (!window.confirm('Delete this meal?')) return;
        
        setLoading(true);
        try {
            await nutritionService.delete(mealId);
            await loadDailyNutrition();
        } catch (err) {
            console.error('Failed to remove meal:', err);
            setError('Failed to remove meal');
        } finally {
            setLoading(false);
        }
    };

    const getMacroProgress = (value, goal) => {
        if (!goal) return 0;
        return Math.min(100, (value / goal) * 100);
    };

    return (
        <div className="nutrition-page">
            <header className="nutrition-header">
                <h1>🍎 Nutrition Tracker</h1>
                <p>Monitor your daily calorie and macro intake</p>
            </header>

            {error && <div className="error-message">{error}</div>}

            <div className="nutrition-layout">
                <section className="search-and-log">
                    <div className="date-selector card">
                        <IoCalendar className="icon" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="date-input"
                            max={new Date().toISOString().split('T')[0]}
                            disabled={loading}
                        />
                    </div>
                    
                    <div className="search-section card">
                        <h2>Search & Log Food</h2>
                        <form onSubmit={searchFood} className="search-form">
                            <input
                                type="text"
                                placeholder="Search for food (e.g., chicken, banana, rice)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={loading}
                            />
                            <button type="submit" disabled={loading || !searchTerm.trim()}>
                                <IoSearch /> Search
                            </button>
                        </form>

                        {foodResults.length > 0 && (
                            <div className="food-results">
                                <h3>Results ({foodResults.length})</h3>
                                <div className="food-list">
                                    {foodResults.map((food) => (
                                        <div key={food.id} className="food-item">
                                            <div className="food-info">
                                                <h4>{food.name}</h4>
                                                <p>{food.brand || 'Generic'}</p>
                                                <div className="food-nutrition">
                                                    <span>🔥 {food.calories} cal</span>
                                                    <span>🍗 {food.protein}g P</span>
                                                    <span>🥕 {food.carbs}g C</span>
                                                    <span>🧈 {food.fat}g F</span>
                                                </div>
                                            </div>
                                            <button
                                                className="btn-add"
                                                onClick={() => setSelectedFood(food)}
                                                disabled={loading}
                                            >
                                                + Log
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <section className="meals-log">
                        <h2>Meals Logged ({todaysMeals.length})</h2>
                        {todaysMeals.length > 0 ? (
                            <div className="meals-list card">
                                {todaysMeals.map((meal) => (
                                    <div key={meal._id} className="meal-card">
                                        <div className="meal-header">
                                            <h4>{meal.mealName}</h4>
                                            <span className="meal-time">
                                                {new Date(meal.time || meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="meal-nutrition">
                                            <span>🔥 {(meal.totals?.calories || 0).toFixed(0)} cal</span>
                                            <span>🍗 {(meal.totals?.protein || 0).toFixed(1)}g</span>
                                            <span>🥕 {(meal.totals?.carbs || 0).toFixed(1)}g</span>
                                            <span>🧈 {(meal.totals?.fat || 0).toFixed(1)}g</span>
                                        </div>
                                        <button className="btn-remove" onClick={() => removeMeal(meal._id)} disabled={loading}>
                                            <IoTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-meals">No meals logged for this date</p>
                        )}
                    </section>
                </section>

                <section className="summary-and-goals">
                    <h2>Daily Goals & Progress</h2>
                    
                    {dailyTotals && (
                        <div className="daily-summary card">
                            <div className="summary-grid">
                                <div className="summary-card calorie-card">
                                    <div className="summary-label">Calories</div>
                                    <div className="summary-value">{dailyTotals.calories.toFixed(0)} <small>kcal</small></div>
                                    <div className="summary-goal">Goal: 2000 kcal</div>
                                </div>

                                {[
                                    { name: 'Protein', key: 'protein', goal: 50 }, 
                                    { name: 'Carbs', key: 'carbs', goal: 250 }, 
                                    { name: 'Fat', key: 'fat', goal: 70 }
                                ].map(macro => (
                                    <div key={macro.key} className="summary-card macro-card">
                                        <div className="summary-label">{macro.name}</div>
                                        <div className="summary-value">{dailyTotals[macro.key].toFixed(1)} <small>g</small></div>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar">
                                                <div 
                                                    className="progress-fill" 
                                                    style={{ width: `${getMacroProgress(dailyTotals[macro.key], macro.goal)}%` }}
                                                ></div>
                                            </div>
                                            <span className="progress-percent">
                                                {getMacroProgress(dailyTotals[macro.key], macro.goal).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="summary-goal">Goal: {macro.goal}g</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {selectedFood && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Log {selectedFood.name}</h3>
                        <p className="modal-brand">{selectedFood.brand || 'Generic'}</p>
                        
                        <div className="form-group">
                            <label>Servings:</label>
                            <div className="servings-control">
                                <button onClick={() => setServings(Math.max(0.5, servings - 0.5))}>−</button>
                                <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={servings}
                                    onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
                                />
                                <button onClick={() => setServings(servings + 0.5)}>+</button>
                            </div>
                        </div>

                        <div className="nutrition-preview">
                            <h4>Total Nutrition:</h4>
                            <div className="nutrition-grid">
                                <div>🔥 {(selectedFood.calories * servings).toFixed(0)} cal</div>
                                <div>🍗 {(selectedFood.protein * servings).toFixed(1)}g protein</div>
                                <div>🥕 {(selectedFood.carbs * servings).toFixed(1)}g carbs</div>
                                <div>🧈 {(selectedFood.fat * servings).toFixed(1)}g fat</div>
                            </div>
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => {setSelectedFood(null); setServings(1);}}>
                                Cancel
                            </button>
                            <button className="btn-confirm" onClick={() => logMeal(selectedFood)} disabled={loading}>
                                {loading ? 'Adding...' : 'Add to Log'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NutritionPage;