import BaseProvider from '../core/BaseProvider';

class USDANutritionProvider extends BaseProvider {
  constructor(options = {}) {
    super('USDA Nutrition', options);
    
    this.baseUrl = 'https://fdc.nal.usda.gov/api';
    this.pageSize = 10;
    
    console.log('🍎 USDANutritionProvider initialized');
  }

  /**
   * Search for food by name
   */
  async searchFood(foodName) {
    if (!foodName || foodName.trim().length === 0) {
      throw new Error('Food name is required');
    }

    console.log(`🔍 Searching for: ${foodName}`);

    try {
      const response = await fetch(`${this.baseUrl}/foods/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: foodName,
          pageSize: this.pageSize
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      const foods = data.foods.map(food => ({
        id: food.fdcId,
        name: food.description,
        type: food.dataType,
        brand: food.brandName || 'Generic',
        servingSize: food.servingSize || 100,
        servingUnit: food.servingSizeUnit || 'g',
        calories: this.getNutrient(food.foodNutrients, 'Energy'),
        protein: this.getNutrient(food.foodNutrients, 'Protein'),
        carbs: this.getNutrient(food.foodNutrients, 'Carbohydrate'),
        fat: this.getNutrient(food.foodNutrients, 'Total lipid'),
        fiber: this.getNutrient(food.foodNutrients, 'Fiber'),
        sugar: this.getNutrient(food.foodNutrients, 'Sugars')
      }));

      console.log(`✅ Found ${foods.length} foods`);
      
      this.onDataUpdate({ results: foods });
      return foods;
    } catch (error) {
      console.error('❌ Food search failed:', error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Get detailed nutrition for a food
   */
  async getFoodDetails(fdcId) {
    if (!fdcId) {
      throw new Error('Food ID is required');
    }

    console.log(`📊 Getting details for food ID: ${fdcId}`);

    try {
      const response = await fetch(`${this.baseUrl}/foods/${fdcId}`);

      if (!response.ok) {
        throw new Error(`Failed to get food details: ${response.status}`);
      }

      const food = await response.json();
      
      const details = {
        id: food.fdcId,
        name: food.description,
        type: food.dataType,
        nutrients: this.extractAllNutrients(food.foodNutrients),
        metadata: {
          lastUpdated: food.publishedDate,
          source: 'USDA FoodData Central',
          dataType: food.dataType
        }
      };

      console.log('✅ Got food details');
      
      return details;
    } catch (error) {
      console.error('❌ Failed to get food details:', error);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Extract specific nutrient from array
   */
  getNutrient(nutrients, nutrientName) {
    if (!nutrients) return 0;
    
    const nutrient = nutrients.find(n => 
      n.nutrientName.toLowerCase().includes(nutrientName.toLowerCase())
    );
    
    return nutrient ? Math.round(nutrient.value) : 0;
  }

  /**
   * Extract all nutrients
   */
  extractAllNutrients(nutrients) {
    if (!nutrients) return {};
    
    return nutrients.reduce((acc, nutrient) => {
      acc[nutrient.nutrientName] = {
        value: Math.round(nutrient.value * 100) / 100,
        unit: nutrient.unitName
      };
      return acc;
    }, {});
  }

  /**
   * Log a meal
   */
  async logMeal(food, servings = 1) {
    const meal = {
      food,
      servings,
      timestamp: new Date(),
      totalCalories: food.calories * servings,
      totalProtein: food.protein * servings,
      totalCarbs: food.carbs * servings,
      totalFat: food.fat * servings
    };

    console.log('🍽️ Meal logged:', meal);
    
    this.onDataUpdate({ meal });
    return meal;
  }

  /**
   * Calculate daily nutrition
   */
  calculateDailyTotals(meals) {
    return meals.reduce((totals, meal) => ({
      calories: totals.calories + meal.totalCalories,
      protein: totals.protein + meal.totalProtein,
      carbs: totals.carbs + meal.totalCarbs,
      fat: totals.fat + meal.totalFat,
      mealCount: totals.mealCount + 1
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      mealCount: 0
    });
  }

  getStatus() {
    return {
      ...super.getStatus(),
      connected: true,
      baseUrl: this.baseUrl
    };
  }
}

export default USDANutritionProvider;
