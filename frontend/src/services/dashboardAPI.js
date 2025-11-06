// File: /src/services/dashboardAPI.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

class DashboardAPI {
  constructor() {
    this.fitbitToken = localStorage.getItem('fitbit_token');
    this.weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  }

  // Fitbit - Get Today's Activity
  async getFitbitActivity() {
    try {
      if (!this.fitbitToken) {
        return this.getMockFitbitData();
      }

      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/date/today.json', {
        headers: {
          'Authorization': `Bearer ${this.fitbitToken}`
        }
      });

      return {
        steps: response.data.summary.steps,
        calories: response.data.summary.caloriesOut,
        distance: response.data.summary.distances[0].distance,
        activeMinutes: response.data.summary.veryActiveMinutes + response.data.summary.fairlyActiveMinutes
      };
    } catch (error) {
      console.error('Fitbit API Error:', error);
      return this.getMockFitbitData();
    }
  }

  // Fitbit - Get Heart Rate
  async getFitbitHeartRate() {
    try {
      if (!this.fitbitToken) {
        return { heartRate: 72, status: 'Normal' };
      }

      const response = await axios.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', {
        headers: {
          'Authorization': `Bearer ${this.fitbitToken}`
        }
      });

      const hr = response.data['activities-heart'][0].value.restingHeartRate || 72;
      return {
        heartRate: hr,
        status: hr < 60 ? 'Low' : hr > 100 ? 'High' : 'Normal'
      };
    } catch (error) {
      console.error('Fitbit Heart Rate Error:', error);
      return { heartRate: 72, status: 'Normal' };
    }
  }

  // Fitbit - Get Sleep Data
  async getFitbitSleep() {
    try {
      if (!this.fitbitToken) {
        return { hours: 7.2, quality: 'Good' };
      }

      const response = await axios.get('https://api.fitbit.com/1.2/user/-/sleep/date/today.json', {
        headers: {
          'Authorization': `Bearer ${this.fitbitToken}`
        }
      });

      const sleep = response.data.summary;
      const hours = sleep.totalMinutesAsleep / 60;
      return {
        hours: parseFloat(hours.toFixed(1)),
        quality: hours >= 7 ? 'Good' : hours >= 6 ? 'Fair' : 'Poor'
      };
    } catch (error) {
      console.error('Fitbit Sleep Error:', error);
      return { hours: 7.2, quality: 'Good' };
    }
  }

  // Weather API - Get Current Weather
  async getWeather(city = 'New Delhi') {
    try {
      const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
        params: {
          q: city,
          appid: this.weatherApiKey,
          units: 'metric'
        }
      });

      return {
        temp: Math.round(response.data.main.temp),
        condition: response.data.weather[0].main,
        icon: response.data.weather[0].icon,
        humidity: response.data.main.humidity
      };
    } catch (error) {
      console.error('Weather API Error:', error);
      return { temp: 25, condition: 'Clear', icon: '01d', humidity: 60 };
    }
  }

  // USDA Nutrition API - Get Food Data
  async searchFood(query) {
    try {
      const apiKey = import.meta.env.VITE_USDA_API_KEY;
      const response = await axios.get(`https://api.nal.usda.gov/fdc/v1/foods/search`, {
        params: {
          query: query,
          pageSize: 5,
          api_key: apiKey
        }
      });

      return response.data.foods.slice(0, 3).map(food => ({
        name: food.description,
        calories: food.foodNutrients.find(n => n.nutrientName === 'Energy')?.value || 0
      }));
    } catch (error) {
      console.error('USDA API Error:', error);
      return [];
    }
  }

  // COVID-19 API - Get Stats
  async getCovidStats() {
    try {
      const response = await axios.get('https://disease.sh/v3/covid-19/countries/India');
      return {
        cases: response.data.todayCases.toLocaleString(),
        recovered: response.data.todayRecovered.toLocaleString()
      };
    } catch (error) {
      console.error('COVID API Error:', error);
      return { cases: '0', recovered: '0' };
    }
  }

  // Mock Data for Development
  getMockFitbitData() {
    return {
      steps: 8543,
      calories: 2100,
      distance: 6.4,
      activeMinutes: 45
    };
  }

  // Health Summary
  async getHealthSummary() {
    try {
      const [activity, heartRate, sleep, weather] = await Promise.all([
        this.getFitbitActivity(),
        this.getFitbitHeartRate(),
        this.getFitbitSleep(),
        this.getWeather()
      ]);

      return {
        heartRate: heartRate.heartRate,
        heartStatus: heartRate.status,
        steps: activity.steps,
        stepsGoal: 10000,
        stepsPercent: Math.round((activity.steps / 10000) * 100),
        hydration: 1.8,
        hydrationGoal: 2.5,
        hydrationPercent: Math.round((1.8 / 2.5) * 100),
        sleep: sleep.hours,
        sleepQuality: sleep.quality,
        calories: activity.calories,
        activeMinutes: activity.activeMinutes,
        weather: weather
      };
    } catch (error) {
      console.error('Health Summary Error:', error);
      return this.getMockHealthSummary();
    }
  }

  getMockHealthSummary() {
    return {
      heartRate: 72,
      heartStatus: 'Normal',
      steps: 8543,
      stepsGoal: 10000,
      stepsPercent: 85,
      hydration: 1.8,
      hydrationGoal: 2.5,
      hydrationPercent: 72,
      sleep: 7.2,
      sleepQuality: 'Good',
      calories: 2100,
      activeMinutes: 45,
      weather: { temp: 25, condition: 'Clear', icon: '01d', humidity: 60 }
    };
  }
}

export default new DashboardAPI();
