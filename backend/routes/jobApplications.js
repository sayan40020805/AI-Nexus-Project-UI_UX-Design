const express = require('express');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const router = express.Router();

// ========================
// APPLY FOR JOB (User Only)
// ========================
router.post('/jobs/:jobId/apply', authMiddleware, roleMiddleware('user'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, additionalInfo, resume, portfolio } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ msg: 'This job is no longer accepting applications' });
    }

    // Check if user already applied
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    // Create new application
    const newApplication = new JobApplication({
      job: jobId,
      applicant: req.user.id,
      coverLetter: coverLetter || '',
      additionalInfo: additionalInfo || '',
      resume: resume || null,
      portfolio: portfolio || null
    });

    await newApplication.save();

    // Add application to job's applicants array
    job.applicants.push(newApplication._id);
    job.applicantCount = job.applicants.length;
    await job.save();

    // Populate application details
    await newApplication.populate([
      { path: 'job', select: 'title company', populate: { path: 'company', select: 'companyName companyLogo' } },
      { path: 'applicant', select: 'username profilePicture email' }
    ]);

    res.status(201).json({
      msg: 'Application submitted successfully',
      application: newApplication
    });

  } catch (err) {
    console.error('Apply for job error:', err);
    res.status(500).json({ msg: 'Server error applying for job' });
  }
});

// ========================
// GET USER'S APPLICATIONS (User Only)
// ========================
router.get('/my-applications', authMiddleware, roleMiddleware('user'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { applicant: req.user.id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await JobApplication.find(filter)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'companyName companyLogo companyDescription' }
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await JobApplication.countDocuments(filter);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalApplications,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (err) {
    console.error('Get user applications error:', err);
    res.status(500).json({ msg: 'Server error getting applications' });
  }
});

// ========================
// GET COMPANY'S APPLICATIONS (Company Only)
// ========================
router.get('/company/applications', authMiddleware, roleMiddleware('company'), async (req, res) => {
  try {
    const { jobId, status, page = 1, limit = 10 } = req.query;

    // Build filter - only get applications for company's jobs
    let jobFilter = { company: req.user.id };
    if (jobId) jobFilter._id = jobId;

    const companyJobs = await Job.find(jobFilter).distinct('_id');
    
    const filter = { job: { $in: companyJobs } };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await JobApplication.find(filter)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'companyName companyLogo' }
      })
      .populate('applicant', 'username profilePicture email')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalApplications = await JobApplication.countDocuments(filter);
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    res.json({
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalApplications,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (err) {
    console.error('Get company applications error:', err);
    res.status(500).json({ msg: 'Server error getting applications' });
  }
});

// ========================
// GET SINGLE APPLICATION (Company Only - Own Job)
// Endpoint moved to '/api/applications/:id' to avoid root-level route collisions
// ========================
router.get('/applications/:id', authMiddleware, async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'companyName companyLogo' }
      })
      .populate('applicant', 'username profilePicture email');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if user is either the applicant or owns the job
    const isApplicant = application.applicant._id.toString() === req.user.id;
    const isCompany = application.job.company._id.toString() === req.user.id;

    if (!isApplicant && !isCompany) {
      return res.status(403).json({ msg: 'Not authorized to view this application' });
    }

    res.json({ application });

  } catch (err) {
    console.error('Get application error:', err);
    res.status(500).json({ msg: 'Server error getting application' });
  }
});

// ========================
// UPDATE APPLICATION STATUS (Company Only - Own Job)
// Endpoint moved to '/api/applications/:id/status'
// ========================
router.put('/applications/:id/status', authMiddleware, roleMiddleware('company'), async (req, res) => {
  try {
    const { status, companyNotes, internalRating, interviewDate, interviewNotes, rejectionReason } = req.body;

    const application = await JobApplication.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if company owns this job
    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this application' });
    }

    // Update status
    if (status) application.status = status;
    if (companyNotes !== undefined) application.companyNotes = companyNotes;
    if (internalRating !== undefined) application.internalRating = internalRating;
    if (interviewDate !== undefined) application.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (interviewNotes !== undefined) application.interviewNotes = interviewNotes;
    if (rejectionReason !== undefined) application.rejectionReason = rejectionReason;

    await application.save();

    // Populate for response
    await application.populate([
      { path: 'job', populate: { path: 'company', select: 'companyName companyLogo' } },
      { path: 'applicant', select: 'username profilePicture email' }
    ]);

    res.json({
      msg: 'Application status updated successfully',
      application
    });

  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ msg: 'Server error updating application status' });
  }
});

// ========================
// WITHDRAW APPLICATION (User Only - Own Application)
// ========================
router.put('/applications/:id/withdraw', authMiddleware, roleMiddleware('user'), async (req, res) => {
  try {
    const application = await JobApplication.findById(req.params.id)
      .populate('job');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if user owns this application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to withdraw this application' });
    }

    // Check if application is still in a withdrawable state
    if (['accepted', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({ msg: 'This application can no longer be withdrawn' });
    }

    // Update status
    application.status = 'withdrawn';
    await application.save();

    // Remove from job's applicants array
    const job = await Job.findById(application.job._id);
    job.applicants = job.applicants.filter(appId => appId.toString() !== application._id.toString());
    job.applicantCount = job.applicants.length;
    await job.save();

    res.json({
      msg: 'Application withdrawn successfully',
      application
    });

  } catch (err) {
    console.error('Withdraw application error:', err);
    res.status(500).json({ msg: 'Server error withdrawing application' });
  }
});

// ========================
// GET APPLICATION STATISTICS (Company Only)
// ========================
router.get('/company/stats', authMiddleware, roleMiddleware('company'), async (req, res) => {
  try {
    // Get all jobs for this company
    const companyJobs = await Job.find({ company: req.user.id }).distinct('_id');
    
    // Get statistics by status
    const statusStats = await JobApplication.aggregate([
      { $match: { job: { $in: companyJobs } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get total applications
    const totalApplications = await JobApplication.countDocuments({
      job: { $in: companyJobs }
    });

    // Get recent applications (last 7 days)
    const recentApplications = await JobApplication.countDocuments({
      job: { $in: companyJobs },
      appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Format status statistics
    const statusCounts = {};
    statusStats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      totalApplications,
      recentApplications,
      statusCounts: {
        pending: statusCounts.pending || 0,
        under_review: statusCounts.under_review || 0,
        interview_scheduled: statusCounts.interview_scheduled || 0,
        accepted: statusCounts.accepted || 0,
        rejected: statusCounts.rejected || 0,
        withdrawn: statusCounts.withdrawn || 0
      }
    });

  } catch (err) {
    console.error('Get application stats error:', err);
    res.status(500).json({ msg: 'Server error getting application statistics' });
  }
});

module.exports = router;
