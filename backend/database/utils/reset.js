// File: server/database/utils/reset.js
const db = require('../index');

async function resetDatabase() {
  try {
    console.log('⚠️  RESETTING DATABASE...\n');
    await db.connection.connect();

    const collections = Object.values(db.models);
    
    for (const Model of collections) {
      await Model.deleteMany({});
      console.log(`✅ Cleared ${Model.collection.name}`);
    }

    console.log('\n✅ Database reset complete!\n');
  } catch (error) {
    console.error('❌ Reset error:', error.message);
  } finally {
    await db.connection.disconnect();
  }
}

module.exports = resetDatabase;

if (require.main === module) {
  resetDatabase();
}
