const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  // Content fields
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Post content cannot exceed 2000 characters']
  },
  
  // Media fields
  media: {
    images: [String], // Array of image URLs
    video: String, // Video URL
    document: String // Document URL
  },
  
  // Post type - determines which page it appears on
  postType: {
    type: String,
    enum: [
      'normal', // → Home
      'shorts', // → AI Shorts  
      'news', // → AI News
      'model', // → Models
      'career', // → Career
      'event', // → Events
      'showcase' // → Showcase
    ],
    required: true,
    default: 'normal'
  },
  
  // Author information
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Social interactions
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Share/Repost tracking
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Post metadata
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
PostSchema.index({ postType: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ 'likes.user': 1 });
PostSchema.index({ 'shares.user': 1 });

module.exports = mongoose.model('Post', PostSchema);
