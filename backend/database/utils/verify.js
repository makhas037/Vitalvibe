const db = require('../index');

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database...\n');
    await db.connection.connect();

    const stats = {
      Users: await db.models.User.countDocuments(),
      HealthMetrics: await db.models.HealthMetrics.countDocuments(),
      Workouts: await db.models.Workout.countDocuments(),
      Nutrition: await db.models.Nutrition.countDocuments(),
      Moods: await db.models.Mood.countDocuments(),
      Routines: await db.models.Routine.countDocuments(),
      Symptoms: await db.models.Symptom.countDocuments(),
      Notifications: await db.models.Notification.countDocuments(),
      ChatLogs: await db.models.ChatLog.countDocuments()
    };

    console.log('📊 Database Statistics:');
    console.table(stats);

    const mongoose = require('mongoose');
    const dbStats = await mongoose.connection.db.stats();
    console.log('\n💾 Database Size:');
    console.log(`   Data: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Indexes: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('\n✅ Verification complete!\n');
  } catch (error) {
    console.error('❌ Verification error:', error.message);
  } finally {
    await db.connection.disconnect();
  }
}

module.exports = verifyDatabase;

if (require.main === module) {
  verifyDatabase();
}
