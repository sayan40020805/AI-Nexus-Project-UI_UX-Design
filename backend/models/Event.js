const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  endTime: {
    type: String,
    match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  eventType: {
    type: String,
    enum: ['Seminar', 'Hackathon', 'Quiz', 'Workshop'],
    required: [true, 'Event type is required'],
    default: 'Workshop'
  },
  tags: [{
    type: String,
    trim: true
  }],
  maxAttendees: {
    type: Number,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  registrationRequired: {
    type: Boolean,
    default: true
  },
  registrationDeadline: {
    type: Date
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  meetingPassword: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  // Virtual/Online event specific fields
  streamingUrl: {
    type: String,
    trim: true
  },
  recordingUrl: {
    type: String,
    trim: true
  },
  // Analytics
  views: {
    type: Number,
    default: 0
  },
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
  // Comments section
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
EventSchema.index({ date: 1, status: 1 });
EventSchema.index({ organizer: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ location: 1 });
EventSchema.index({ tags: 1 });
EventSchema.index({ isPublic: 1, status: 1 });

// Virtual for total registrations count
EventSchema.virtual('registrationCount', {
  ref: 'EventRegistration',
  localField: '_id',
  foreignField: 'event',
  count: true
});

// Method to check if event is full
EventSchema.methods.isFull = function() {
  return this.maxAttendees && this.currentAttendees >= this.maxAttendees;
};

// Method to check if registration is still open
EventSchema.methods.isRegistrationOpen = function() {
  if (!this.registrationRequired) return false;
  if (this.status !== 'published') return false;
  if (this.isFull()) return false;
  if (this.registrationDeadline && new Date() > this.registrationDeadline) return false;
  return true;
};

// Pre-save middleware to update currentAttendees count
EventSchema.pre('save', async function(next) {
  if (this.isModified('currentAttendees')) {
    try {
      const EventRegistration = mongoose.model('EventRegistration');
      const count = await EventRegistration.countDocuments({ 
        event: this._id, 
        status: { $in: ['confirmed', 'pending'] } 
      });
      this.currentAttendees = count;
    } catch (error) {
      console.error('Error updating attendee count:', error);
    }
  }
  next();
});

module.exports = mongoose.model('Event', EventSchema);
