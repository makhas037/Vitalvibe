// FILE: E:\CLOUD PROJECT\vitalvibe\backend\config\database.config.js
// PURPOSE: Database configuration

module.exports = {
  development: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/vitalvibe',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true
    }
  },

  production: {
    url: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      ssl: true,
      authSource: 'admin'
    }
  },

  test: {
    url: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/vitalvibe-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};
