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
  
  // Share reference (for shared posts)
  sharedFrom: {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }
  },
  
  // Social interactions - arrays for quick lookup
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
  
  // Denormalized counts for performance (updated via middleware/hooks)
  likesCount: {
    type: Number,
    default: 0,
    index: true
  },
  commentsCount: {
    type: Number,
    default: 0,
    index: true
  },
  sharesCount: {
    type: Number,
    default: 0,
    index: true
  },
  savesCount: {
    type: Number,
    default: 0
  },
  viewsCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Soft delete support
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  deletedAt: {
    type: Date
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ========================
// MIDDLEWARE
// ========================

// Update the updatedAt field before saving
PostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update denormalized counts if arrays have changed
  if (this.isModified('likes')) {
    this.likesCount = this.likes ? this.likes.length : 0;
  }
  if (this.isModified('comments')) {
    this.commentsCount = this.comments ? this.comments.length : 0;
  }
  if (this.isModified('shares')) {
    this.sharesCount = this.shares ? this.shares.length : 0;
  }
  if (this.isModified('savedBy')) {
    this.savesCount = this.savedBy ? this.savedBy.length : 0;
  }
  
  next();
});

// Pre-remove hook to cleanup related data
PostSchema.pre('remove', async function(next) {
  // Optionally cleanup related comments, etc.
  next();
});

// ========================
// INDEXES
// ========================

// Primary query indexes
PostSchema.index({ postType: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ isDeleted: 1, createdAt: -1 });

// Social interaction indexes
PostSchema.index({ 'likes.user': 1 });
PostSchema.index({ 'shares.user': 1 });
PostSchema.index({ 'savedBy.user': 1 });

// For engagement-based queries (trending, popular)
PostSchema.index({ likesCount: -1, createdAt: -1 });
PostSchema.index({ commentsCount: -1, createdAt: -1 });
PostSchema.index({ sharesCount: -1, createdAt: -1 });
PostSchema.index({ viewsCount: -1, createdAt: -1 });

// Compound index for profile page queries
PostSchema.index({ author: 1, isDeleted: 1, createdAt: -1 });

// Text index for content search (if needed)
PostSchema.index({ content: 'text', title: 'text' });

// ========================
// INSTANCE METHODS
// ========================

// Check if a user has liked this post
PostSchema.methods.isLikedBy = function(userId) {
  if (!userId || !this.likes) return false;
  return this.likes.some(like => 
    like.user && like.user.toString() === userId.toString()
  );
};

// Check if a user has shared this post
PostSchema.methods.isSharedBy = function(userId) {
  if (!userId || !this.shares) return false;
  return this.shares.some(share => 
    share.user && share.user.toString() === userId.toString()
  );
};

// Check if a user has saved this post
PostSchema.methods.isSavedBy = function(userId) {
  if (!userId || !this.savedBy) return false;
  return this.savedBy.some(save => 
    save.user && save.user.toString() === userId.toString()
  );
};

// Soft delete the post
PostSchema.methods.softDelete = async function(userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  await this.save();
  return this;
};

// Get post with interaction status for a specific user
PostSchema.methods.enrichWithInteraction = function(currentUserId) {
  const postObj = this.toObject();
  
  return {
    ...postObj,
    isLiked: this.isLikedBy(currentUserId),
    isShared: this.isSharedBy(currentUserId),
    isSaved: this.isSavedBy(currentUserId),
    isOwner: currentUserId && this.author.toString() === currentUserId.toString()
  };
};

// ========================
// STATIC METHODS
// ========================

// Get posts by author with cursor-based pagination
PostSchema.statics.getByAuthor = async function(authorId, options = {}) {
  const { cursor = null, limit = 20, includeDeleted = false } = options;
  
  const query = { author: authorId };
  
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }
  
  const posts = await this.find(query)
    .populate('author', 'username companyName profilePicture companyLogo role')
    .sort({ createdAt: -1 })
    .limit(limit + 1); // Fetch one extra to check for more
  
  const hasMore = posts.length > limit;
  const results = hasMore ? posts.slice(0, limit) : posts;
  
  return {
    posts: results,
    pagination: {
      nextCursor: hasMore ? results[results.length - 1].createdAt.toISOString() : null,
      hasMore,
      total: await this.countDocuments({ author: authorId, isDeleted: false })
    }
  };
};

// Get posts with media only
PostSchema.statics.getWithMedia = async function(authorId, options = {}) {
  const { cursor = null, limit = 20, mediaType = 'all' } = options;
  
  const query = { 
    author: authorId,
    isDeleted: false,
    $or: [
      { 'media.images': { $exists: true, $ne: [] } },
      { 'media.video': { $exists: true, $ne: '' } }
    ]
  };
  
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }
  
  const posts = await this.find(query)
    .populate('author', 'username companyName profilePicture companyLogo role')
    .sort({ createdAt: -1 })
    .limit(limit + 1);
  
  const hasMore = posts.length > limit;
  const results = hasMore ? posts.slice(0, limit) : posts;
  
  // Filter by media type if specified
  let filteredResults = results;
  if (mediaType === 'images') {
    filteredResults = results.filter(p => p.media && p.media.images && p.media.images.length > 0);
  } else if (mediaType === 'videos') {
    filteredResults = results.filter(p => p.media && p.media.video);
  }
  
  return {
    posts: filteredResults,
    pagination: {
      nextCursor: hasMore ? results[results.length - 1].createdAt.toISOString() : null,
      hasMore
    }
  };
};

// Get posts user has liked
PostSchema.statics.getLikedByUser = async function(userId, options = {}) {
  const { cursor = null, limit = 20 } = options;
  
  // This is a complex query - in production, consider denormalization
  const query = { 
    isDeleted: false,
    'likes.user': userId
  };
  
  if (cursor) {
    // Find the post with this cursor to get its createdAt
    const cursorPost = await this.findById(cursor);
    if (cursorPost) {
      query.createdAt = { $lt: cursorPost.createdAt };
    }
  }
  
  const posts = await this.find(query)
    .populate('author', 'username companyName profilePicture companyLogo role')
    .sort({ createdAt: -1 })
    .limit(limit + 1);
  
  const hasMore = posts.length > limit;
  const results = hasMore ? posts.slice(0, limit) : posts;
  
  return {
    posts: results,
    pagination: {
      nextCursor: hasMore ? results[results.length - 1]._id : null,
      hasMore
    }
  };
};

module.exports = mongoose.model('Post', PostSchema);
