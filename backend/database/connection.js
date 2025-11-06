// File: server/database/connection.js
const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      console.log('✅ Using existing MongoDB connection');
      return this.connection;
    }

    try {
      // Get connection string from .env
      let mongoUri = process.env.MONGO_URI;

      // Fix: Remove any trailing port numbers from mongodb+srv connections
      if (mongoUri && mongoUri.includes('mongodb+srv://')) {
        // Remove :27017 or any port from mongodb+srv URIs
        mongoUri = mongoUri.replace(':27017', '');
        mongoUri = mongoUri.replace(/:(\d+)/, ''); // Remove any port numbers
      }

      console.log('🔗 Connecting to MongoDB...');

      // Modern connection options (no deprecated options)
      const options = {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority'
      };

      this.connection = await mongoose.connect(mongoUri, options);
      this.isConnected = true;

      console.log(`✅ MongoDB Connected: ${this.connection.connection.host}`);
      console.log(`📊 Database: ${this.connection.connection.name}`);

      // Connection event handlers
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB Error:', err.message);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB Disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB Reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB Connection Failed:', error.message);
      console.log('\n💡 TROUBLESHOOTING:');
      console.log('   1. Check MONGO_URI in .env file');
      console.log('   2. Remove any port numbers from mongodb+srv:// URIs');
      console.log('   3. Ensure IP whitelist includes your machine in MongoDB Atlas');
      console.log('   4. Verify username and password are URL-encoded\n');
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await mongoose.connection.close();
      console.log('🔌 MongoDB Connection Closed');
      this.isConnected = false;
    }
  }

  getConnection() {
    return this.connection;
  }

  isReady() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

module.exports = new DatabaseConnection();
