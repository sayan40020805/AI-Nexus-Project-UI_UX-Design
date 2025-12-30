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
    lowercase: true, // Store username in lowercase for case-insensitive search
    validate: {
      validator: function(v) {
        if (this.role === 'user' && v) {
          return /^[a-zA-Z0-9_]+$/.test(v); // Only alphanumeric and underscore
        }
        return true;
      },
      message: 'Username can only contain letters, numbers, and underscores'
    }
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: [50, 'Display name cannot be more than 50 characters']
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
  companyWebsite: {
    type: String,
    trim: true
  },
  companyIndustry: {
    type: String,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
  },
  companyLocation: {
    type: String,
    trim: true
  },
  
  // Bio and other profile fields
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot be more than 200 characters'],
    default: 'AI enthusiast exploring the future of technology'
  },
  
  // Location
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot be more than 100 characters']
  },
  website: {
    type: String,
    trim: true
  },
  
  // Verification status
  verified: {
    type: Boolean,
    default: false
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'verified', 'premium', 'official'],
    default: 'none'
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

  // Denormalized counts for performance
  // These are updated via middleware/background jobs
  postsCount: {
    type: Number,
    default: 0,
    index: true
  },
  followerCount: {
    type: Number,
    default: 0,
    index: true
  },
  followingCount: {
    type: Number,
    default: 0,
    index: true
  },
  likesCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Activity tracking
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ========================
// MIDDLEWARE
// ========================

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set displayName from username if not set
  if (this.role === 'user' && !this.displayName && this.username) {
    this.displayName = this.username;
  }
  
  next();
});

// Indexes for optimized search performance
// Text indexes for full-text search functionality (for basic search)
UserSchema.index({ 
  username: 'text', 
  displayName: 'text',
  companyName: 'text',
  bio: 'text',
  companyDescription: 'text'
});

// Edge n-gram index for autocomplete (partial matching)
UserSchema.index({
  username: 'text',
  displayName: 'text',
  companyName: 'text'
}, {
  weights: {
    username: 10,
    displayName: 8,
    companyName: 8,
    bio: 2,
    companyDescription: 2
  }
});

// Compound indexes for better query performance
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ role: 1, username: 1 });
UserSchema.index({ role: 1, companyName: 1 });

// Indexes for follower/following counts (for ranking)
UserSchema.index({ followerCount: -1 });
UserSchema.index({ postsCount: -1 });
UserSchema.index({ createdAt: -1 });

// Index for follow relationships optimization
UserSchema.index({ email: 1 }, { unique: true });

// Index for username lookup (case-insensitive)
UserSchema.index({ username: 1 });

// ========================
// INSTANCE METHODS
// ========================

// Get public profile data
UserSchema.methods.getPublicProfile = function(currentUserId = null) {
  const isOwner = currentUserId && this._id.toString() === currentUserId.toString();
  const isFollowing = false; // Will be set by the caller
  
  const profile = {
    id: this._id,
    role: this.role,
    username: this.username,
    displayName: this.displayName || this.username,
    profilePicture: this.profilePicture,
    coverPhoto: this.coverPhoto,
    bio: this.bio,
    location: this.location,
    website: this.website,
    verified: this.verified,
    verificationBadge: this.verificationBadge,
    createdAt: this.createdAt,
    stats: {
      postsCount: this.postsCount,
      followersCount: this.followerCount,
      followingCount: this.followingCount,
      likesCount: this.likesCount
    }
  };
  
  if (this.role === 'company') {
    profile.companyName = this.companyName;
    profile.companyLogo = this.companyLogo;
    profile.companyDescription = this.companyDescription;
    profile.companyWebsite = this.companyWebsite;
    profile.companyIndustry = this.companyIndustry;
    profile.companySize = this.companySize;
    profile.companyLocation = this.companyLocation;
  }
  
  // For private profiles, limit visible info
  if (this.settings.privacy === 'private' && !isOwner) {
    return {
      id: this._id,
      role: this.role,
      username: this.username,
      displayName: this.displayName || this.username,
      profilePicture: this.profilePicture,
      verified: this.verified,
      bio: this.bio?.substring(0, 120) + '...',
      isPrivate: true,
      stats: {
        postsCount: 0,
        followersCount: this.followerCount,
        followingCount: this.followingCount
      }
    };
  }
  
  return profile;
};

// Update denormalized counts
UserSchema.methods.updateCounts = async function() {
  const Follow = mongoose.model('Follow');
  const Post = mongoose.model('Post');
  
  const [followerCount, followingCount, postsCount] = await Promise.all([
    Follow.countDocuments({ following: this._id }),
    Follow.countDocuments({ follower: this._id }),
    Post.countDocuments({ author: this._id, isDeleted: false })
  ]);
  
  this.followerCount = followerCount;
  this.followingCount = followingCount;
  this.postsCount = postsCount;
  
  await this.save();
  return this;
};

module.exports = mongoose.model('User', UserSchema);
