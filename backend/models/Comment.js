const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  // Post this comment belongs to
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  
  // Comment author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Comment content
  content: {
    type: String,
    required: true,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  
  // Parent comment for threading (null for top-level comments)
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
    index: true
  },
  
  // Nested replies (limited depth for performance)
  // Note: For deep threading, use parentCommentId references instead
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  
  // Likes on this comment
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Count of replies (denormalized for performance)
  repliesCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Count of likes (denormalized for performance)
  likesCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  deletedContent: {
    type: String // Store truncated content for deleted comments
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
CommentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Update denormalized counts
  if (this.isModified('likes')) {
    this.likesCount = this.likes ? this.likes.length : 0;
  }
  if (this.isModified('replies')) {
    this.repliesCount = this.replies ? this.replies.length : 0;
  }
  
  next();
});

// Pre-save to handle parent-child relationship
CommentSchema.pre('save', async function(next) {
  if (this.isNew && this.parentCommentId) {
    // Increment parent's reply count
    const parentComment = await this.constructor.findById(this.parentCommentId);
    if (parentComment) {
      parentComment.repliesCount = (parentComment.repliesCount || 0) + 1;
      parentComment.replies.push(this._id);
      await parentComment.save();
    }
  }
  next();
});

// ========================
// INDEXES
// ========================

// Primary query indexes
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ createdAt: -1 });

// For top-level comments query
CommentSchema.index({ postId: 1, parentCommentId: 1, createdAt: -1 });

// For user activity (comments they've made)
CommentSchema.index({ author: 1, createdAt: -1 });

// For popular comments (most liked)
CommentSchema.index({ postId: 1, likesCount: -1 });

// ========================
// INSTANCE METHODS
// ========================

// Check if a user has liked this comment
CommentSchema.methods.isLikedBy = function(userId) {
  if (!userId || !this.likes) return false;
  return this.likes.some(id => id.toString() === userId.toString());
};

// Soft delete the comment
CommentSchema.methods.softDelete = async function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedContent = this.content.substring(0, 50) + '...';
  this.content = ''; // Clear actual content
  await this.save();
  return this;
};

// Get enriched comment with author info
CommentSchema.methods.enrich = function() {
  return {
    id: this._id,
    postId: this.postId,
    author: this.author,
    content: this.isDeleted ? this.deletedContent : this.content,
    parentCommentId: this.parentCommentId,
    replies: this.replies,
    repliesCount: this.repliesCount,
    likesCount: this.likesCount,
    isLiked: false, // Will be set by the caller
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    isDeleted: this.isDeleted
  };
};

// ========================
// STATIC METHODS
// ========================

// Get top-level comments for a post
CommentSchema.statics.getTopLevelComments = async function(postId, options = {}) {
  const { skip = 0, limit = 20, sortBy = 'popular' } = options;
  
  const query = {
    postId,
    parentCommentId: null,
    isDeleted: false
  };
  
  const sortOptions = sortBy === 'popular' 
    ? { likesCount: -1, createdAt: -1 }
    : { createdAt: -1 };
  
  const [comments, total] = await Promise.all([
    this.find(query)
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);
  
  return { comments, total };
};

// Get replies for a comment
CommentSchema.statics.getReplies = async function(commentId, options = {}) {
  const { skip = 0, limit = 50 } = options;
  
  const query = {
    parentCommentId: commentId,
    isDeleted: false
  };
  
  const [replies, total] = await Promise.all([
    this.find(query)
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: 1 }) // Oldest first for replies
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);
  
  return { replies, total };
};

// Get comment by ID with full thread
CommentSchema.statics.getWithThread = async function(commentId) {
  const comment = await this.findById(commentId)
    .populate('author', 'username companyName profilePicture companyLogo role');
  
  if (!comment || comment.isDeleted) {
    return null;
  }
  
  // Get all replies in the thread
  const replies = await this.find({
    $or: [
      { parentCommentId: commentId },
      { 
        parentCommentId: { $in: await this.getDescendantIds(commentId) }
      }
    ],
    isDeleted: false
  })
  .populate('author', 'username companyName profilePicture companyLogo role')
  .sort({ createdAt: 1 });
  
  return {
    comment,
    replies
  };
};

// Helper to get all descendant IDs
CommentSchema.statics.getDescendantIds = async function(commentId) {
  const directReplies = await this.find({ parentCommentId: commentId }).select('_id').lean();
  const replyIds = directReplies.map(r => r._id);
  
  for (const replyId of replyIds) {
    const descendants = await this.getDescendantIds(replyId);
    replyIds.push(...descendants);
  }
  
  return replyIds;
};

// Get activity (comments) by user
CommentSchema.statics.getByUser = async function(userId, options = {}) {
  const { cursor = null, limit = 20 } = options;
  
  const query = {
    author: userId,
    isDeleted: false
  };
  
  if (cursor) {
    const cursorComment = await this.findById(cursor);
    if (cursorComment) {
      query.createdAt = { $lt: cursorComment.createdAt };
    }
  }
  
  const comments = await this.find(query)
    .populate('postId', 'content author') // Populate post reference
    .sort({ createdAt: -1 })
    .limit(limit + 1);
  
  const hasMore = comments.length > limit;
  const results = hasMore ? comments.slice(0, limit) : comments;
  
  return {
    comments: results,
    pagination: {
      nextCursor: hasMore ? results[results.length - 1]._id : null,
      hasMore
    }
  };
};

module.exports = mongoose.model('Comment', CommentSchema);

