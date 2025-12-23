const mongoose = require('mongoose');

const LiveSessionSchema = new mongoose.Schema({
  // Who is streaming
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Session details
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Session title cannot exceed 200 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Session description cannot exceed 1000 characters']
  },
  
  // Session status
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  
  // Session timing
  scheduledStart: {
    type: Date,
    required: true
  },
  
  actualStart: {
    type: Date
  },
  
  actualEnd: {
    type: Date
  },
  
  // Viewers tracking
  viewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    leftAt: {
      type: Date
    }
  }],
  
  // Maximum concurrent viewers
  maxViewers: {
    type: Number,
    default: 0
  },
  
  // Session metadata
  category: {
    type: String,
    enum: ['general', 'demo', 'tutorial', 'discussion', 'announcement'],
    default: 'general'
  },
  
  // Stream quality settings
  quality: {
    type: String,
    enum: ['low', 'medium', 'high', 'hd'],
    default: 'medium'
  },

  // ZEGOCLOUD Integration Fields
  zegoRoomId: {
    type: String,
    unique: true,
    sparse: true // Allows null values but ensures uniqueness when present
  },
  
  zegoConfig: {
    appId: {
      type: Number,
      default: function() {
        return process.env.ZEGO_APP_ID ? parseInt(process.env.ZEGO_APP_ID) : null;
      }
    },
    environment: {
      type: String,
      enum: ['development', 'production'],
      default: process.env.NODE_ENV === 'production' ? 'production' : 'development'
    },
    maxUserCount: {
      type: Number,
      default: 1000
    },
    enableCamera: {
      type: Boolean,
      default: true
    },
    enableMicrophone: {
      type: Boolean,
      default: true
    },
    enableScreenShare: {
      type: Boolean,
      default: false
    },
    enableChat: {
      type: Boolean,
      default: true
    }
  },

  // Streaming statistics
  streamingStats: {
    totalConnections: {
      type: Number,
      default: 0
    },
    peakViewers: {
      type: Number,
      default: 0
    },
    averageViewTime: {
      type: Number, // in seconds
      default: 0
    },
    bandwidthUsed: {
      type: Number, // in MB
      default: 0
    }
  },
  
  // Chat messages during live session
  chatMessages: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: [200, 'Chat message cannot exceed 200 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Recording settings
  isRecorded: {
    type: Boolean,
    default: false
  },
  
  recordingUrl: {
    type: String
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
LiveSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
LiveSessionSchema.index({ status: 1, scheduledStart: 1 });
LiveSessionSchema.index({ streamer: 1, status: 1 });
LiveSessionSchema.index({ scheduledStart: 1 });
LiveSessionSchema.index({ 'viewers.user': 1 });

module.exports = mongoose.model('LiveSession', LiveSessionSchema);
