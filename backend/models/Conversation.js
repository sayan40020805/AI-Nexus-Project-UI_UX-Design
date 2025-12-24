const mongoose = require('mongoose');

/**
 * Conversation Schema
 * Manages chat rooms between two participants
 * Prevents duplicate conversations between the same users
 */
const conversationSchema = new mongoose.Schema({
  // Participants in the conversation (always exactly 2)
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],

  // Conversation metadata
  conversationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Last message in the conversation
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },

  // Unread message counts for each participant
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map()
  },

  // Conversation settings
  settings: {
    isArchived: {
      type: Boolean,
      default: false
    },
    isMuted: {
      type: Map,
      of: Boolean,
      default: new Map()
    },
    isBlocked: {
      type: Map,
      of: Boolean,
      default: new Map()
    }
  },

  // Online status for participants
  onlineStatus: {
    type: Map,
    of: {
      isOnline: { type: Boolean, default: false },
      lastSeen: { type: Date, default: null }
    },
    default: new Map()
  },

  // Typing indicators
  typingStatus: {
    type: Map,
    of: {
      isTyping: { type: Boolean, default: false },
      typingSince: { type: Date, default: null }
    },
    default: new Map()
  },

  // Message count for performance optimization
  messageCount: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to generate conversationId
conversationSchema.pre('save', function(next) {
  if (this.isNew && this.participants.length === 2) {
    // Sort participants to ensure consistent conversation ID
    const sortedParticipants = this.participants.map(p => p.toString()).sort();
    this.conversationId = sortedParticipants.join('_');
  }
  next();
});

// Indexes for better query performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ conversationId: 1 }, { unique: true });
conversationSchema.index({ lastActivity: -1 });
conversationSchema.index({ 'unreadCounts': 1 });
conversationSchema.index({ updatedAt: -1 });

// Static method to find or create conversation
conversationSchema.statics.findOrCreateConversation = async function(userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  const conversationId = sortedIds.join('_');

  let conversation = await this.findOne({ conversationId })
    .populate('participants', 'username companyName profilePicture companyLogo role')
    .populate('lastMessage');

  if (!conversation) {
    conversation = new this({
      participants: [userId1, userId2],
      conversationId
    });
    await conversation.save();
    conversation = await this.findOne({ conversationId })
      .populate('participants', 'username companyName profilePicture companyLogo role')
      .populate('lastMessage');
  }

  return conversation;
};

// Method to get conversation for two users
conversationSchema.methods.getConversationBetween = function(userId1, userId2) {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  const targetIds = this.participants.map(p => p.toString()).sort();
  return JSON.stringify(sortedIds) === JSON.stringify(targetIds);
};

// Method to update unread count
conversationSchema.methods.updateUnreadCount = function(userId, count) {
  this.unreadCounts.set(userId.toString(), count);
  return this.save();
};

// Method to increment unread count
conversationSchema.methods.incrementUnreadCount = function(userId) {
  const currentCount = this.unreadCounts.get(userId.toString()) || 0;
  this.unreadCounts.set(userId.toString(), currentCount + 1);
  return this.save();
};

// Method to mark conversation as read for user
conversationSchema.methods.markAsRead = function(userId) {
  this.unreadCounts.set(userId.toString(), 0);
  return this.save();
};

// Method to update online status
conversationSchema.methods.updateOnlineStatus = function(userId, isOnline) {
  const status = this.onlineStatus.get(userId.toString()) || { isOnline: false, lastSeen: null };
  status.isOnline = isOnline;
  if (!isOnline) {
    status.lastSeen = new Date();
  }
  this.onlineStatus.set(userId.toString(), status);
  return this.save();
};

// Method to update typing status
conversationSchema.methods.updateTypingStatus = function(userId, isTyping) {
  const status = this.typingStatus.get(userId.toString()) || { isTyping: false, typingSince: null };
  status.isTyping = isTyping;
  if (isTyping) {
    status.typingSince = new Date();
  } else {
    status.typingSince = null;
  }
  this.typingStatus.set(userId.toString(), status);
  return this.save();
};

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function(currentUserId) {
  return this.participants.find(p => p._id.toString() !== currentUserId.toString());
};

// Method to archive conversation
conversationSchema.methods.archive = function(userId) {
  this.settings.isArchived = true;
  return this.save();
};

// Method to mute conversation
conversationSchema.methods.mute = function(userId, isMuted = true) {
  this.settings.isMuted.set(userId.toString(), isMuted);
  return this.save();
};

// Method to block conversation
conversationSchema.methods.block = function(userId, isBlocked = true) {
  this.settings.isBlocked.set(userId.toString(), isBlocked);
  return this.save();
};

// Method to update last activity
conversationSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

module.exports = mongoose.model('Conversation', conversationSchema);
