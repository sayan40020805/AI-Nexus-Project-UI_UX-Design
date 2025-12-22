const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema({
  // References
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job reference is required']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant reference is required']
  },
  
  // Application details
  status: {
    type: String,
    enum: ['pending', 'under_review', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Application content
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Additional info cannot exceed 1000 characters']
  },
  
  // File uploads
  resume: {
    type: String, // File path or URL
    default: null
  },
  portfolio: {
    type: String, // File path or URL
    default: null
  },
  
  // Application tracking
  appliedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Company feedback and notes
  companyNotes: {
    type: String,
    maxlength: [1000, 'Company notes cannot exceed 1000 characters'],
    default: ''
  },
  internalRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Interview scheduling
  interviewDate: {
    type: Date,
    default: null
  },
  interviewNotes: {
    type: String,
    maxlength: [1000, 'Interview notes cannot exceed 1000 characters'],
    default: ''
  },
  
  // Rejection reason (if applicable)
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    default: ''
  }
});

// Update the lastUpdated field before saving
JobApplicationSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Compound indexes for better performance
JobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true }); // Prevent duplicate applications
JobApplicationSchema.index({ job: 1, status: 1 });
JobApplicationSchema.index({ applicant: 1, status: 1 });
JobApplicationSchema.index({ appliedAt: -1 });
JobApplicationSchema.index({ lastUpdated: -1 });

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
