// File: server/database/schemas/User.schema.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },

  // Profile
  name: { type: String, required: [true, 'Name is required'], trim: true },
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  
  // Health Info
  height: Number, // cm
  weight: Number, // kg
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  
  // Location
  location: {
    city: String,
    country: String,
    timezone: { type: String, default: 'UTC' }
  },

  // Profile Details
  avatar: String,
  bio: { type: String, maxlength: 500 },
  phoneNumber: String,

  // Health Goals
  goals: {
    dailySteps: { type: Number, default: 10000, min: 0 },
    dailyWater: { type: Number, default: 2.5, min: 0 }, // liters
    sleepHours: { type: Number, default: 8, min: 0, max: 24 },
    dailyCalories: { type: Number, default: 2000, min: 0 },
    weeklyWorkouts: { type: Number, default: 5, min: 0 },
    targetWeight: Number
  },

  // API Integrations
  integrations: {
    fitbit: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      userId: String,
      lastSync: Date
    },
    googleFit: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      expiresAt: Date,
      lastSync: Date
    },
    appleHealth: {
      connected: { type: Boolean, default: false },
      lastSync: Date
    }
  },

  // Settings
  settings: {
    theme: { type: String, default: 'dark', enum: ['light', 'dark', 'auto'] },
    language: { type: String, default: 'en' },
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      reminders: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, default: 'private', enum: ['public', 'private', 'friends'] },
      dataSharing: { type: Boolean, default: false },
      analytics: { type: Boolean, default: true }
    },
    units: {
      temperature: { type: String, default: 'celsius', enum: ['celsius', 'fahrenheit'] },
      distance: { type: String, default: 'km', enum: ['km', 'miles'] },
      weight: { type: String, default: 'kg', enum: ['kg', 'lbs'] },
      height: { type: String, default: 'cm', enum: ['cm', 'ft'] }
    }
  },

  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Tracking
  lastLogin: Date,
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isVerified: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
userSchema.methods.generateVerificationToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

// Clean JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  if (user.integrations) {
    if (user.integrations.fitbit) {
      delete user.integrations.fitbit.accessToken;
      delete user.integrations.fitbit.refreshToken;
    }
    if (user.integrations.googleFit) {
      delete user.integrations.googleFit.accessToken;
      delete user.integrations.googleFit.refreshToken;
    }
  }
  return user;
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);
