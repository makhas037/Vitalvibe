/**
 * FILE: server/database/utils/seed.js
 * CREATES: Demo data for testing - ALL COLLECTIONS
 */

const db = require('../index');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    await db.connection.connect();

    // Demo user ID
    const demoUserId = 'demo-user';

    // Clear existing data
    console.log('🗑️  Clearing existing collections...');
    await db.models.HealthMetrics.deleteMany({ userId: demoUserId });
    await db.models.Mood.deleteMany({ userId: demoUserId });
    await db.models.Workout.deleteMany({ userId: demoUserId });
    await db.models.Nutrition.deleteMany({ userId: demoUserId });
    await db.models.Routine.deleteMany({ userId: demoUserId });
    await db.models.Symptom.deleteMany({ userId: demoUserId });
    await db.models.Notification.deleteMany({ userId: demoUserId });
    await db.models.ChatLog.deleteMany({ userId: demoUserId });

    // ============================================================
    // SEED HEALTH METRICS (Last 7 days)
    // ============================================================
    console.log('📊 Seeding Health Metrics...');
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await db.models.HealthMetrics.create({
        userId: demoUserId,
        date,
        steps: Math.floor(7000 + Math.random() * 5000),
        distance: parseFloat((5 + Math.random() * 5).toFixed(1)),
        floors: Math.floor(10 + Math.random() * 20),
        activeMinutes: Math.floor(30 + Math.random() * 60),
        calories: Math.floor(1800 + Math.random() * 600),
        heartRate: {
          resting: Math.floor(60 + Math.random() * 20),
          average: Math.floor(75 + Math.random() * 20),
          max: Math.floor(140 + Math.random() * 60),
          min: Math.floor(50 + Math.random() * 10)
        },
        sleep: {
          totalMinutes: Math.floor(360 + Math.random() * 120),
          minutesAsleep: Math.floor(350 + Math.random() * 100),
          efficiency: Math.floor(75 + Math.random() * 20),
          quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)]
        },
        hydration: {
          amount: Math.floor(1500 + Math.random() * 1500),
          goal: 2500,
          logs: []
        },
        source: 'manual'
      });
    }
    console.log('✅ Health Metrics seeded');

    // ============================================================
    // SEED MOODS (Last 7 days, multiple per day)
    // ============================================================
    console.log('😊 Seeding Moods...');
    const moodValues = ['happy', 'sad', 'good', 'okay', 'great', 'calm', 'energetic'];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(i / 2));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      await db.models.Mood.create({
        userId: demoUserId,
        date: date,
        time: new Date(date),
        mood: moodValues[Math.floor(Math.random() * moodValues.length)],
        intensity: Math.floor(1 + Math.random() * 10),
        notes: 'Sample mood entry',
        triggers: ['work', 'exercise', 'sleep'][Math.floor(Math.random() * 3)] ? ['work'] : [],
        source: 'manual'
      });
    }
    console.log('✅ Moods seeded');

    // ============================================================
    // SEED WORKOUTS (Last 7 days)
    // ============================================================
    console.log('💪 Seeding Workouts...');
    const workoutTypes = ['Running', 'Cycling', 'Gym', 'Yoga', 'Swimming', 'Walking'];
    for (let i = 0; i < 10; i++) {
      const startTime = new Date(today);
      startTime.setDate(startTime.getDate() - Math.floor(i / 1.5));
      startTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const endTime = new Date(startTime);
      const duration = Math.floor(20 + Math.random() * 90);
      endTime.setMinutes(endTime.getMinutes() + duration);

      await db.models.Workout.create({
        userId: demoUserId,
        name: `${workoutTypes[Math.floor(Math.random() * workoutTypes.length)]} Session`,
        type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
        startTime,
        endTime,
        duration,
        calories: Math.floor(200 + Math.random() * 500),
        distance: parseFloat((2 + Math.random() * 10).toFixed(1)),
        intensity: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
        mood: 'good',
        completed: true,
        source: 'manual'
      });
    }
    console.log('✅ Workouts seeded');

    // ============================================================
    // SEED NUTRITION (Last 7 days, 3 meals per day)
    // ============================================================
    console.log('🍎 Seeding Nutrition...');
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const foods = [
      { name: 'Oatmeal', calories: 150, protein: 5, carbs: 30, fat: 3 },
      { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      { name: 'Rice', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      { name: 'Broccoli', calories: 31, protein: 2.6, carbs: 6, fat: 0.4 },
      { name: 'Salmon', calories: 208, protein: 22, carbs: 0, fat: 13 }
    ];

    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(i / 3));
      const mealType = mealTypes[i % 3];

      const food = foods[Math.floor(Math.random() * foods.length)];

      await db.models.Nutrition.create({
        userId: demoUserId,
        date,
        mealType,
        mealName: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} - ${food.name}`,
        time: new Date(date),
        foods: [
          {
            name: food.name,
            servingSize: 100,
            servingUnit: 'g',
            quantity: 1,
            nutrients: {
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat
            }
          }
        ],
        totals: {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat
        },
        source: 'manual'
      });
    }
    console.log('✅ Nutrition seeded');

    // ============================================================
    // SEED ROUTINES
    // ============================================================
    console.log('📋 Seeding Routines...');
    await db.models.Routine.create({
      userId: demoUserId,
      title: 'Morning Routine',
      description: 'Daily morning exercises',
      time: '06:00',
      type: 'morning',
      tasks: [
        { name: 'Drink Water', duration: '5 min', completed: true, order: 1 },
        { name: 'Exercise', duration: '30 min', completed: true, order: 2 },
        { name: 'Shower', duration: '15 min', completed: true, order: 3 }
      ],
      isActive: true,
      isArchived: false
    });

    await db.models.Routine.create({
      userId: demoUserId,
      title: 'Evening Routine',
      description: 'Daily evening wind-down',
      time: '21:00',
      type: 'evening',
      tasks: [
        { name: 'Meditation', duration: '10 min', completed: false, order: 1 },
        { name: 'Read', duration: '20 min', completed: false, order: 2 },
        { name: 'Sleep', duration: '8 hours', completed: false, order: 3 }
      ],
      isActive: true,
      isArchived: false
    });
    console.log('✅ Routines seeded');

    // ============================================================
    // SEED SYMPTOMS
    // ============================================================
    console.log('🏥 Seeding Symptoms...');
    await db.models.Symptom.create({
      userId: demoUserId,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      symptoms: [
        { name: 'Headache', severity: 'mild', severityScore: 3 },
        { name: 'Fatigue', severity: 'mild', severityScore: 2 }
      ],
      aiAnalysis: {
        possibleConditions: ['Common Cold', 'Stress', 'Dehydration'],
        recommendations: ['Rest', 'Stay hydrated', 'Consult doctor if worsens'],
        urgency: 'low'
      },
      resolved: true
    });
    console.log('✅ Symptoms seeded');

    // ============================================================
    // SEED NOTIFICATIONS
    // ============================================================
    console.log('🔔 Seeding Notifications...');
    const notifications = [
      { type: 'health', title: 'Good hydration!', message: 'You have reached your daily water goal' },
      { type: 'achievement', title: 'Streak achieved!', message: 'You have a 5-day workout streak' },
      { type: 'reminder', title: 'Time to exercise', message: 'Your scheduled workout is coming up' },
      { type: 'sync', title: 'Fitbit synced', message: 'Your Fitbit data has been updated' }
    ];

    for (const notif of notifications) {
      await db.models.Notification.create({
        userId: demoUserId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: Math.random() > 0.5,
        priority: 'medium'
      });
    }
    console.log('✅ Notifications seeded');

    // ============================================================
    // SEED CHAT SESSIONS
    // ============================================================
    console.log('💬 Seeding Chat Sessions...');
    await db.models.ChatLog.create({
      userId: demoUserId,
      sessionId: 'session-001',
      title: 'Health Consultation',
      messages: [
        {
          role: 'user',
          content: 'I have been feeling tired lately',
          timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000)
        },
        {
          role: 'assistant',
          content: 'I understand. Tiredness can have many causes. Have you been sleeping well?',
          timestamp: new Date(today.getTime() - 1.9 * 60 * 60 * 1000)
        },
        {
          role: 'user',
          content: 'Not really, only 5-6 hours',
          timestamp: new Date(today.getTime() - 1.8 * 60 * 60 * 1000)
        },
        {
          role: 'assistant',
          content: 'That could be the cause. Try to get 7-9 hours of sleep. Also increase water intake.',
          timestamp: new Date(today.getTime() - 1.7 * 60 * 60 * 1000)
        }
      ],
      isActive: true
    });
    console.log('✅ Chat sessions seeded');

    console.log('\n✅ DATABASE SEED COMPLETE!\n');
    console.log('📊 Seeded Collections:');
    console.log('   ✓ Health Metrics (7 days)');
    console.log('   ✓ Moods (14 entries)');
    console.log('   ✓ Workouts (10 sessions)');
    console.log('   ✓ Nutrition (21 meals)');
    console.log('   ✓ Routines (2 routines)');
    console.log('   ✓ Symptoms (1 entry)');
    console.log('   ✓ Notifications (4 entries)');
    console.log('   ✓ Chat Sessions (1 session)');
    console.log('\n🎯 All ready to use with demo-user!\n');

  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    await db.connection.disconnect();
  }
}

module.exports = seedDatabase;

if (require.main === module) {
  seedDatabase();
}
