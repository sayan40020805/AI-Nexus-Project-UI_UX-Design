const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Common fields
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  role: {
    type: String,
    enum: ['user', 'company'],
    default: 'user',
    required: true,
  },
  // User-specific fields
  username: {
    type: String,
    required: function() { return this.role === 'user'; },
    unique: function() { return this.role === 'user'; },
    trim: true,
    maxlength: [30, 'Username cannot be more than 30 characters'],
  },
  profilePicture: {
    type: String,
    default: '',
  },
  // Company-specific fields
  companyName: {
    type: String,
    required: function() { return this.role === 'company'; },
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters'],
  },
  companyDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Company description cannot be more than 500 characters'],
  },
  companyLogo: {
    type: String,
    default: '',
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


// Index for better query performance
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);
