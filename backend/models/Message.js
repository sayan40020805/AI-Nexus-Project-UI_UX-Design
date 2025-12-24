const mongoose = require('mongoose');

/**
 * Message Schema
 * Stores individual chat messages between users/companies
 */
const messageSchema = new mongoose.Schema({
  // Participants in the conversation
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Message content
  content: {
    type: String,
    required: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },

  // Message metadata
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },

  // Message status tracking
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },

  // Read status for receiver
  readAt: {
    type: Date,
    default: null
  },

  // Delivered status for receiver
  deliveredAt: {
    type: Date,
    default: null
  },

  // Reply to functionality
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },

  // Message reactions/emojis
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Deletion flags
  deletedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }],

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
messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, status: 1 });
messageSchema.index({ readAt: 1 });

// Virtual for conversation ID (combination of sender and receiver)
messageSchema.virtual('conversationId').get(function() {
  const participants = [this.sender.toString(), this.receiver.toString()].sort();
  return participants.join('_');
});

// Method to check if message is deleted by user
messageSchema.methods.isDeletedBy = function(userId) {
  return this.deletedBy.some(del => del.user.toString() === userId.toString());
};

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  if (!this.readAt) {
    this.readAt = new Date();
    this.status = 'read';
  }
  return this.save();
};

// Method to mark as delivered
messageSchema.methods.markAsDelivered = function() {
  if (!this.deliveredAt) {
    this.deliveredAt = new Date();
    this.status = 'delivered';
  }
  return this.save();
};

module.exports = mongoose.model('Message', messageSchema);
