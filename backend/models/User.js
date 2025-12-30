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
    trim: true,
    maxlength: [30, 'Username cannot be more than 30 characters'],
    validate: {
      validator: function(v) {
        // Only validate uniqueness for user role and when username is provided
        if (this.role === 'user' && v) {
          return true;
        }
        return true;
      },
      message: 'Username must be unique for users'
    }
  },
  profilePicture: {
    type: String,
    default: '',
  },
  coverPhoto: {
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
  
  // Bio and other profile fields
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot be more than 200 characters'],
    default: 'AI enthusiast exploring the future of technology'
  },
  
  // Settings for privacy and preferences
  settings: {
    privacy: {
      type: String,
      enum: ['public', 'private', 'connections'],
      default: 'public'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    messaging: {
      allowDirectMessages: { type: Boolean, default: true },
      allowConnectionsOnly: { type: Boolean, default: false }
    },
    profile: {
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: false }
    }
  },

  // Saved/bookmarked posts
  savedPosts: [{
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],

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


// Indexes for optimized search performance
// Text indexes for search functionality
UserSchema.index({ 
  username: 'text', 
  companyName: 'text',
  bio: 'text',
  companyDescription: 'text'
});

// Compound indexes for better query performance
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ role: 1, username: 1 });
UserSchema.index({ role: 1, companyName: 1 });

// Index for follow relationships optimization
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
