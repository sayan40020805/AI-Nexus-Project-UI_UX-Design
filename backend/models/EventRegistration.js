const mongoose = require('mongoose');

const EventRegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'waitlisted', 'attended', 'no-show'],
    default: 'pending'
  },
  // Registration details
  firstName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  // Additional questions/fields from event organizer
  customFields: [{
    question: String,
    answer: String
  }],
  // Special requirements or notes
  dietaryRestrictions: {
    type: String,
    maxlength: 500
  },
  accessibilityNeeds: {
    type: String,
    maxlength: 500
  },
  additionalNotes: {
    type: String,
    maxlength: 1000
  },
  // Payment information (if applicable)
  paymentRequired: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number,
    min: 0
  },
  paymentDate: {
    type: Date
  },
  // Check-in information
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkInTime: {
    type: Date
  },
  // Communication tracking
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  followUpSent: {
    type: Boolean,
    default: false
  },
  followUpSentAt: {
    type: Date
  },
  // Feedback after event
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: {
      type: String,
      maxlength: 2000
    },
    submittedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
EventRegistrationSchema.index({ event: 1, user: 1 }, { unique: true }); // Prevent duplicate registrations
EventRegistrationSchema.index({ event: 1, status: 1 });
EventRegistrationSchema.index({ user: 1, status: 1 });
EventRegistrationSchema.index({ registrationDate: -1 });

// Pre-save middleware to ensure email consistency
EventRegistrationSchema.pre('save', async function(next) {
  // If email is not provided, try to get it from the user's profile
  if (!this.email && this.user) {
    try {
      const User = mongoose.model('User');
      const user = await User.findById(this.user).select('email');
      if (user && user.email) {
        this.email = user.email;
      }
    } catch (error) {
      console.error('Error fetching user email for registration:', error);
    }
  }
  next();
});

// Method to check if registration is active
EventRegistrationSchema.methods.isActive = function() {
  return ['pending', 'confirmed', 'waitlisted'].includes(this.status);
};

// Method to check if user can attend
EventRegistrationSchema.methods.canAttend = function() {
  return this.status === 'confirmed' && this.checkedIn;
};

// Static method to get registration stats for an event
EventRegistrationSchema.statics.getEventStats = async function(eventId) {
  const stats = await this.aggregate([
    { $match: { event: mongoose.Types.ObjectId(eventId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    waitlisted: 0,
    attended: 0,
    noShow: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Method to generate registration confirmation details
EventRegistrationSchema.methods.getConfirmationDetails = async function() {
  const populatedRegistration = await this.populate(['event', 'user']);
  
  return {
    registrationId: this._id,
    event: {
      title: populatedRegistration.event.title,
      date: populatedRegistration.event.date,
      time: populatedRegistration.event.time,
      location: populatedRegistration.event.location
    },
    user: {
      firstName: this.firstName || populatedRegistration.user.firstName,
      lastName: this.lastName || populatedRegistration.user.lastName,
      email: this.email || populatedRegistration.user.email
    },
    status: this.status,
    registrationDate: this.registrationDate
  };
};

module.exports = mongoose.model('EventRegistration', EventRegistrationSchema);
