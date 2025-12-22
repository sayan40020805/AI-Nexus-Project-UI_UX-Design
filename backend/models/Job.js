const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  // Basic job information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Job description cannot exceed 2000 characters']
  },
  requirements: {
    type: String,
    required: [true, 'Job requirements are required'],
    maxlength: [2000, 'Requirements cannot exceed 2000 characters']
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
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'],
    required: [true, 'Job type is required'],
    default: 'Full-time'
  },
  experienceLevel: {
    type: String,
    enum: ['Entry-level', 'Mid-level', 'Senior-level', 'Executive'],
    required: [true, 'Experience level is required'],
    default: 'Mid-level'
  },
  salary: {
    type: String,
    required: [true, 'Salary information is required'],
    trim: true,
    maxlength: [50, 'Salary cannot exceed 50 characters']
  },
  techStack: [{
    type: String,
    trim: true,
    maxlength: [30, 'Technology cannot exceed 30 characters']
  }],
  
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
  
  // Additional fields
  isUrgent: {
    type: Boolean,
    default: false
  },
  applicationDeadline: {
    type: Date,
    default: null
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

// Index for better query performance
JobSchema.index({ company: 1, status: 1 });
JobSchema.index({ jobType: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ createdAt: -1 });
JobSchema.index({ title: 'text', description: 'text', requirements: 'text', techStack: 'text' });

module.exports = mongoose.model('Job', JobSchema);
