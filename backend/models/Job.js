const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // Basic job information
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  companyName: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  jobDescription: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  skillsRequired: {
    type: String,
    required: [true, 'Skills required are required'],
    maxlength: [2000, 'Skills required cannot exceed 2000 characters']
  },
  
  // Job details
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  jobType: {
    type: String,
    enum: ['Internship', 'Full-Time', 'Part-Time'],
    required: [true, 'Job type is required'],
    default: 'Full-Time'
  },
  applyDeadline: {
    type: Date,
    required: [true, 'Application deadline is required']
  },
  
  // Company information (referenced to User model)
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Company reference is required']
  },
  
  // Application tracking
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobApplication'
  }],
  applicantCount: {
    type: Number,
    default: 0
  },
  
  // Job status
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
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
JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to auto-populate companyName from user profile
JobSchema.pre('save', async function(next) {
  if (this.isModified('company') || this.isNew) {
    try {
      const User = mongoose.model('User');
      const companyUser = await User.findById(this.company).select('companyName');
      if (companyUser && companyUser.companyName) {
        this.companyName = companyUser.companyName;
      }
    } catch (error) {
      console.error('Error auto-populating company name:', error);
    }
  }
  next();
});

// Index for better query performance
JobSchema.index({ company: 1, status: 1 });
JobSchema.index({ jobType: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ jobTitle: 'text', jobDescription: 'text', skillsRequired: 'text' });

module.exports = mongoose.model('Job', JobSchema);
