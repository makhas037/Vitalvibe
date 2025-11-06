const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://makhas037:Makhas037%23123*@vitalvibe.4ols0x8.mongodb.net/vitalvibe?retryWrites=true&w=majority&appName=vitalvibe';

async function cleanup() {
  try {
    console.log('🔧 Starting cleanup...');
    
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Delete ALL old documents (those without userId or with old structure)
    console.log('🗑️  Deleting old/orphaned routines...');
    const routineCollection = db.collection('routines');
    
    // Delete routines without userId field
    const result1 = await routineCollection.deleteMany({ userId: { $exists: false } });
    console.log(`   Deleted ${result1.deletedCount} routines without userId`);
    
    // Delete routines with old structure (title: "morning" instead of "Morning Routine")
    const result2 = await routineCollection.deleteMany({ title: { $in: ['morning', 'evening'] } });
    console.log(`   Deleted ${result2.deletedCount} old format routines`);
    
    console.log('📋 Remaining routines:');
    const remaining = await routineCollection.find({ userId: 'demo-user' }).toArray();
    console.log(`   Total: ${remaining.length} routines`);
    remaining.forEach((r, i) => {
      console.log(`   ${i+1}. ${r.title} (${r.time}) - Type: ${r.type}`);
    });
    
    console.log('\n✅ Cleanup complete!');
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanup();
