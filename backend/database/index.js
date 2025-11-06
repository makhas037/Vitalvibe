// File: server/database/index.js
const connection = require('./connection');
const mongoose = require('mongoose');

// Import all schemas
const ChatLog = require('./schemas/ChatLog.schema');
const HealthMetrics = require('./schemas/HealthMetrics.schema');
const Mood = require('./schemas/Mood.schema');
const Notification = require('./schemas/Notification.schema');
const Nutrition = require('./schemas/Nutrition.schema');
const Routine = require('./schemas/Routine.schema');
const Symptom = require('./schemas/Symptom.schema');
const User = require('./schemas/User.schema');
const Workout = require('./schemas/Workout.schema');

const models = {
  ChatLog,
  HealthMetrics,
  Mood,
  Notification,
  Nutrition,
  Routine,
  Symptom,
  User,
  Workout
};

module.exports = {
  connection,
  models
};
