const mongoose = require('mongoose');

// HARDCODED URI - Direct connection
const MONGO_URI = 'mongodb+srv://makhas037:Makhas037%23123*@vitalvibe.4ols0x8.mongodb.net/vitalvibe?retryWrites=true&w=majority&appName=vitalvibe';

async function seed() {
  try {
    console.log('🌱 Starting direct database seed...');
    console.log('🔗 MongoDB URI:', MONGO_URI.substring(0, 40) + '...');
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB!');
    
    const demoUserId = 'demo-user';
    
    // ============ SCHEMAS ============
    const moodSchema = new mongoose.Schema({
      userId: String,
      date: Date,
      time: Date,
      mood: String,
      intensity: Number,
      emotions: [String],
      notes: String,
      triggers: [String]
    }, { collection: 'moods', timestamps: true });
    
    const healthSchema = new mongoose.Schema({
      userId: String,
      date: Date,
      steps: Number,
      distance: Number,
      calories: Number,
      heartRate: mongoose.Schema.Types.Mixed,
      sleep: mongoose.Schema.Types.Mixed,
      hydration: mongoose.Schema.Types.Mixed
    }, { collection: 'healthmetrics', timestamps: true });
    
    const workoutSchema = new mongoose.Schema({
      userId: String,
      name: String,
      type: String,
      startTime: Date,
      endTime: Date,
      duration: Number,
      calories: Number,
      distance: Number,
      intensity: String
    }, { collection: 'workouts', timestamps: true });
    
    const nutritionSchema = new mongoose.Schema({
      userId: String,
      date: Date,
      mealType: String,
      mealName: String,
      time: Date,
      foods: [mongoose.Schema.Types.Mixed],
      totals: mongoose.Schema.Types.Mixed
    }, { collection: 'nutrition', timestamps: true });
    
    const routineSchema = new mongoose.Schema({
      userId: String,
      title: String,
      description: String,
      time: String,
      type: String,
      tasks: [mongoose.Schema.Types.Mixed],
      isActive: Boolean,
      isArchived: Boolean
    }, { collection: 'routines', timestamps: true });
    
    const symptomSchema = new mongoose.Schema({
      userId: String,
      date: Date,
      symptoms: [mongoose.Schema.Types.Mixed],
      resolved: Boolean
    }, { collection: 'symptoms', timestamps: true });
    
    const notificationSchema = new mongoose.Schema({
      userId: String,
      type: String,
      title: String,
      message: String,
      read: Boolean,
      priority: String
    }, { collection: 'notifications', timestamps: true });
    
    const chatLogSchema = new mongoose.Schema({
      userId: String,
      sessionId: String,
      title: String,
      messages: [mongoose.Schema.Types.Mixed],
      isActive: Boolean
    }, { collection: 'chatlogs', timestamps: true });
    
    // ============ MODELS ============
    const Mood = mongoose.model('Mood', moodSchema);
    const Health = mongoose.model('Health', healthSchema);
    const Workout = mongoose.model('Workout', workoutSchema);
    const Nutrition = mongoose.model('Nutrition', nutritionSchema);
    const Routine = mongoose.model('Routine', routineSchema);
    const Symptom = mongoose.model('Symptom', symptomSchema);
    const Notification = mongoose.model('Notification', notificationSchema);
    const ChatLog = mongoose.model('ChatLog', chatLogSchema);
    
    // ============ CLEAR EXISTING ============
    console.log('🗑️  Clearing existing data for demo-user...');
    await Mood.deleteMany({ userId: demoUserId });
    await Health.deleteMany({ userId: demoUserId });
    await Workout.deleteMany({ userId: demoUserId });
    await Nutrition.deleteMany({ userId: demoUserId });
    await Routine.deleteMany({ userId: demoUserId });
    await Symptom.deleteMany({ userId: demoUserId });
    await Notification.deleteMany({ userId: demoUserId });
    await ChatLog.deleteMany({ userId: demoUserId });
    
    // ============ SEED DATA ============
    console.log('📊 Seeding Health Metrics...');
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      await Health.create({
        userId: demoUserId,
        date,
        steps: Math.floor(7000 + Math.random() * 5000),
        distance: parseFloat((5 + Math.random() * 5).toFixed(1)),
        calories: Math.floor(1800 + Math.random() * 600),
        heartRate: {
          resting: Math.floor(60 + Math.random() * 20),
          average: Math.floor(75 + Math.random() * 20),
          max: Math.floor(140 + Math.random() * 60)
        },
        sleep: {
          totalMinutes: Math.floor(360 + Math.random() * 120),
          efficiency: Math.floor(75 + Math.random() * 20),
          quality: ['poor', 'fair', 'good', 'excellent'][Math.floor(Math.random() * 4)]
        },
        hydration: {
          amount: Math.floor(1500 + Math.random() * 1500),
          goal: 2500
        }
      });
    }
    console.log('✅ Health Metrics seeded (7 entries)');
    
    console.log('😊 Seeding Moods...');
    const moodValues = ['happy', 'sad', 'good', 'okay', 'great', 'calm', 'energetic'];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(i / 2));
      date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      await Mood.create({
        userId: demoUserId,
        date,
        time: new Date(date),
        mood: moodValues[Math.floor(Math.random() * moodValues.length)],
        intensity: Math.floor(1 + Math.random() * 10),
        notes: 'Sample mood entry',
        triggers: Math.random() > 0.5 ? ['work'] : []
      });
    }
    console.log('✅ Moods seeded (14 entries)');
    
    console.log('💪 Seeding Workouts...');
    const workoutTypes = ['Running', 'Cycling', 'Gym', 'Yoga', 'Swimming', 'Walking'];
    for (let i = 0; i < 10; i++) {
      const startTime = new Date(today);
      startTime.setDate(startTime.getDate() - Math.floor(i / 1.5));
      startTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      const endTime = new Date(startTime);
      const duration = Math.floor(20 + Math.random() * 90);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      await Workout.create({
        userId: demoUserId,
        name: workoutTypes[Math.floor(Math.random() * workoutTypes.length)] + ' Session',
        type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
        startTime,
        endTime,
        duration,
        calories: Math.floor(200 + Math.random() * 500),
        distance: parseFloat((2 + Math.random() * 10).toFixed(1)),
        intensity: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)]
      });
    }
    console.log('✅ Workouts seeded (10 entries)');
    
    console.log('🍎 Seeding Nutrition...');
    const mealTypes = ['breakfast', 'lunch', 'dinner'];
    const foods = [
      { name: 'Oatmeal', calories: 150, protein: 5 },
      { name: 'Chicken Breast', calories: 165, protein: 31 },
      { name: 'Rice', calories: 130, protein: 2.7 },
      { name: 'Salmon', calories: 208, protein: 22 }
    ];
    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(i / 3));
      const mealType = mealTypes[i % 3];
      const food = foods[Math.floor(Math.random() * foods.length)];
      
      await Nutrition.create({
        userId: demoUserId,
        date,
        mealType,
        mealName: mealType.charAt(0).toUpperCase() + mealType.slice(1) + ' - ' + food.name,
        time: new Date(date),
        foods: [{ name: food.name, calories: food.calories, protein: food.protein }],
        totals: { calories: food.calories, protein: food.protein }
      });
    }
    console.log('✅ Nutrition seeded (21 entries)');
    
    console.log('📋 Seeding Routines...');
    await Routine.create({
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
    
    await Routine.create({
      userId: demoUserId,
      title: 'Evening Routine',
      description: 'Daily evening wind-down',
      time: '21:00',
      type: 'evening',
      tasks: [
        { name: 'Meditation', duration: '10 min', completed: false, order: 1 },
        { name: 'Read', duration: '20 min', completed: false, order: 2 }
      ],
      isActive: true,
      isArchived: false
    });
    console.log('✅ Routines seeded (2 entries)');
    
    console.log('🏥 Seeding Symptoms...');
    await Symptom.create({
      userId: demoUserId,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      symptoms: [
        { name: 'Headache', severity: 'mild' },
        { name: 'Fatigue', severity: 'mild' }
      ],
      resolved: true
    });
    console.log('✅ Symptoms seeded (1 entry)');
    
    console.log('🔔 Seeding Notifications...');
    const notifications = [
      { type: 'health', title: 'Good hydration!', message: 'Daily water goal reached' },
      { type: 'achievement', title: 'Streak!', message: '5-day workout streak' },
      { type: 'reminder', title: 'Exercise time', message: 'Scheduled workout coming up' },
      { type: 'sync', title: 'Fitbit synced', message: 'Data has been updated' }
    ];
    for (const notif of notifications) {
      await Notification.create({
        userId: demoUserId,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: Math.random() > 0.5,
        priority: 'medium'
      });
    }
    console.log('✅ Notifications seeded (4 entries)');
    
    console.log('💬 Seeding Chat Sessions...');
    await ChatLog.create({
      userId: demoUserId,
      sessionId: 'session-001',
      title: 'Health Consultation',
      messages: [
        { role: 'user', content: 'I feel tired', timestamp: new Date() },
        { role: 'assistant', content: 'Have you been sleeping well?', timestamp: new Date() }
      ],
      isActive: true
    });
    console.log('✅ Chat sessions seeded (1 entry)');
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║     ✅ DATABASE SEED COMPLETE!             ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\n📊 Collections Created:');
    console.log('   ✓ healthmetrics (7 docs)');
    console.log('   ✓ moods (14 docs)');
    console.log('   ✓ workouts (10 docs)');
    console.log('   ✓ nutrition (21 docs)');
    console.log('   ✓ routines (2 docs)');
    console.log('   ✓ symptoms (1 doc)');
    console.log('   ✓ notifications (4 docs)');
    console.log('   ✓ chatlogs (1 doc)');
    console.log('\n✅ All data ready for demo-user!\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seed();
