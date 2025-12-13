const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Pending'
  },
  // Additional fields for future expansion
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  createdBy: {
    type: String,
    trim: true
  },
  teamMembers: [{
    name: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  }]
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for project age
projectSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for completion status
projectSchema.virtual('isOverdue').get(function() {
  return this.endDate && this.status !== 'Completed' && new Date() > this.endDate;
});

// Index for better query performance
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware for validation
projectSchema.pre('save', function(next) {
  // Validate that end date is after start date
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Static method to get project statistics
projectSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return stats.reduce((acc, stat) => {
    acc[stat._id] = stat.count;
    return acc;
  }, {});
};

// Instance method to update progress
projectSchema.methods.updateProgress = function(newProgress) {
  this.progress = Math.max(0, Math.min(100, newProgress));
  
  // Auto-update status based on progress
  if (this.progress === 100) {
    this.status = 'Completed';
  } else if (this.progress > 0 && this.status === 'Pending') {
    this.status = 'In Progress';
  }
  
  return this.save();
};

module.exports = mongoose.model('Project', projectSchema);
