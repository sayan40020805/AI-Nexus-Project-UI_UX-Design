const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
  // Who is following
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Who is being followed
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique follower-following pairs
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Indexes for better query performance
FollowSchema.index({ follower: 1 });
FollowSchema.index({ following: 1 });
FollowSchema.index({ createdAt: -1 });

// Prevent users from following themselves
FollowSchema.pre('save', function(next) {
  if (this.follower.toString() === this.following.toString()) {
    next(new Error('Users cannot follow themselves'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Follow', FollowSchema);
