const axios = require('axios');

const USDA_API_KEY = process.env.USDA_API_KEY;
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

class NutritionAPIService {
  /**
   * Search for foods using USDA FoodData Central API
   */
  async searchFoods(query) {
    try {
      const response = await axios.post(
        `${USDA_BASE_URL}/foods/search`,
        {
          query: query,
          pageSize: 10,
          pageNumber: 1,
          dataType: ['Foundation', 'SR Legacy', 'Branded']
        },
        {
          params: { api_key: USDA_API_KEY },
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const foods = response.data.foods || [];
      return foods.map(food => this.transformFoodData(food));
    } catch (error) {
      console.error('USDA API Error:', error.message);
      throw new Error(`Failed to search foods: ${error.message}`);
    }
  }

  /**
   * Get detailed nutrition info for a specific food
   */
  async getFoodDetails(fdcId) {
    try {
      const response = await axios.get(
        `${USDA_BASE_URL}/food/${fdcId}`,
        { params: { api_key: USDA_API_KEY } }
      );
      return this.transformFoodData(response.data);
    } catch (error) {
      console.error('USDA API Error:', error.message);
      throw new Error(`Failed to get food details: ${error.message}`);
    }
  }

  /**
   * Transform USDA food data to our application format
   */
  transformFoodData(food) {
    const nutrients = food.foodNutrients || [];
    
    const getNutrient = (nutrientId) => {
      const nutrient = nutrients.find(n => n.nutrientId === nutrientId);
      return nutrient ? nutrient.value : 0;
    };

    return {
      fdcId: food.fdcId,
      name: food.description || food.lowercaseDescription || 'Unknown',
      brand: food.brandOwner || food.brandName || 'Generic',
      category: food.foodCategory || 'General',
      servingSize: food.servingSize || 100,
      servingUnit: food.servingSizeUnit || 'g',
      nutrients: {
        calories: getNutrient(1008) || getNutrient(2047),
        protein: getNutrient(1003),
        carbs: getNutrient(1005),
        fat: getNutrient(1004),
        fiber: getNutrient(1079),
        sugar: getNutrient(2000),
        sodium: getNutrient(1093),
        cholesterol: getNutrient(1253),
        saturatedFat: getNutrient(1258),
        transFat: getNutrient(1257)
      }
    };
  }

  /**
   * Test USDA API connection
   */
  async testConnection() {
    try {
      await axios.get(
        `${USDA_BASE_URL}/foods/list`,
        {
          params: { 
            api_key: USDA_API_KEY,
            pageSize: 1
          }
        }
      );
      return true;
    } catch (error) {
      console.error('USDA API Connection Test Failed:', error.message);
      return false;
    }
  }
}

module.exports = new NutritionAPIService();

