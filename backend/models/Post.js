const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  // Content fields
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [5000, 'Post content cannot exceed 5000 characters']
  },
  
  // Title field for enhanced posts
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
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
      'ai_short', // → AI Shorts  
      'ai_news', // → AI News
      'ai_models', // → Models
      'ai_showcase', // → Showcase
      'career', // → Career
      'event' // → Events
    ],
    required: true,
    default: 'normal'
  },

  // Enhanced fields for Normal Posts
  feeling: {
    type: String,
    trim: true
  },
  
  location: {
    type: String,
    trim: true
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public'
  },

  // Enhanced fields for AI Models
  modelName: {
    type: String,
    trim: true
  },
  
  modelType: {
    type: String,
    enum: [
      'language-model',
      'vision-model', 
      'audio-model',
      'multimodal',
      'generative',
      'classification',
      'other'
    ]
  },
  
  capabilities: [{
    type: String,
    trim: true
  }],
  
  useCases: [{
    type: String,
    trim: true
  }],
  
  pricing: {
    type: String,
    enum: ['free', 'freemium', 'paid', 'enterprise'],
    default: 'free'
  },
  
  performance: {
    type: String,
    trim: true
  },
  
  limitations: {
    type: String,
    trim: true
  },
  
  githubUrl: {
    type: String,
    trim: true
  },
  
  demoUrl: {
    type: String,
    trim: true
  },
  
  paperUrl: {
    type: String,
    trim: true
  },
  
  category: {
    type: String,
    enum: [
      'nlp',
      'cv',
      'audio', 
      'robotics',
      'recommendation',
      'prediction',
      'other'
    ],
    default: 'other'
  },
  
  releaseDate: {
    type: Date
  },
  
  company: {
    type: String,
    trim: true
  },
  
  license: {
    type: String,
    enum: ['open-source', 'commercial', 'research', 'proprietary'],
    default: 'open-source'
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
  
  // Save/Bookmark tracking
  savedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Report tracking
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'harassment', 'misinformation', 'other'],
      required: true
    },
    description: {
      type: String,
      maxlength: 500
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
