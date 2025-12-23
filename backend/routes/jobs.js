const express = require('express');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { authMiddleware, roleMiddleware, allowCompanyOnly } = require('../middleware/auth');
const router = express.Router();

// ========================
// GET ALL JOBS (with filtering)
// ========================
router.get('/', async (req, res) => {
  try {
    const {
      search,
      jobType,
      experienceLevel,
      location,
      company,
      status = 'active',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status };
    
    if (jobType) filter.jobType = jobType;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (company) filter.company = company;
    
    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get jobs with company information
    const jobs = await Job.find(filter)
      .populate('company', 'companyName companyLogo companyDescription')
      .populate('applicants', '_id') // Just get the count of applicants
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / parseInt(limit));

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ msg: 'Server error getting jobs' });
  }
});

// ========================
// GET SINGLE JOB
// ========================
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'companyName companyLogo companyDescription')
      .populate({
        path: 'applicants',
        populate: {
          path: 'applicant',
          select: 'username profilePicture email'
        }
      });

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    res.json({ job });

  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({ msg: 'Server error getting job' });
  }
});

// ========================
// CREATE JOB (Company Only)
// ========================
router.post('/', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      skillsRequired,
      location,
      jobType,
      applyDeadline
    } = req.body;

    // Validate required fields
    if (!jobTitle || !jobDescription || !skillsRequired || !location || !jobType || !applyDeadline) {
      return res.status(400).json({ msg: 'All required fields must be provided' });
    }

    // Validate apply deadline is in the future
    const deadline = new Date(applyDeadline);
    if (deadline <= new Date()) {
      return res.status(400).json({ msg: 'Application deadline must be in the future' });
    }

    // Create new job
    const newJob = new Job({
      jobTitle,
      jobDescription,
      skillsRequired,
      location,
      jobType,
      applyDeadline: deadline,
      company: req.user.id
    });

    await newJob.save();
    
    // Populate company information
    await newJob.populate('company', 'companyName companyLogo companyDescription');

    res.status(201).json({
      msg: 'Job created successfully',
      job: newJob
    });

  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ msg: 'Server error creating job' });
  }
});

// ========================
// UPDATE JOB (Company Only, Own Jobs)
// ========================
router.put('/:id', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if user owns this job
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this job' });
    }

    const {
      jobTitle,
      jobDescription,
      skillsRequired,
      location,
      jobType,
      applyDeadline,
      status
    } = req.body;

    // Update fields
    if (jobTitle) job.jobTitle = jobTitle;
    if (jobDescription) job.jobDescription = jobDescription;
    if (skillsRequired) job.skillsRequired = skillsRequired;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (status) job.status = status;
    if (applyDeadline !== undefined) {
      const deadline = new Date(applyDeadline);
      if (deadline <= new Date()) {
        return res.status(400).json({ msg: 'Application deadline must be in the future' });
      }
      job.applyDeadline = deadline;
    }

    await job.save();
    await job.populate('company', 'companyName companyLogo companyDescription');

    res.json({
      msg: 'Job updated successfully',
      job
    });

  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({ msg: 'Server error updating job' });
  }
});

// ========================
// DELETE JOB (Company Only, Own Jobs)
// ========================
router.delete('/:id', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if user owns this job
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this job' });
    }

    // Delete all applications for this job first
    await JobApplication.deleteMany({ job: job._id });

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Job deleted successfully' });

  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({ msg: 'Server error deleting job' });
  }
});

// ========================
// GET COMPANY'S JOBS (Company Only)
// ========================
router.get('/company/my-jobs', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.user.id })
      .populate('applicants', '_id')
      .sort({ createdAt: -1 });

    res.json({ jobs });

  } catch (err) {
    console.error('Get company jobs error:', err);
    res.status(500).json({ msg: 'Server error getting company jobs' });
  }
});

// ========================
// GET JOB STATISTICS (Company Only)
// ========================
router.get('/company/stats', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ company: req.user.id });
    const activeJobs = await Job.countDocuments({ company: req.user.id, status: 'active' });
    const closedJobs = await Job.countDocuments({ company: req.user.id, status: 'closed' });
    
    // Total applications across all company jobs
    const totalApplications = await JobApplication.countDocuments({
      job: { $in: await Job.find({ company: req.user.id }).distinct('_id') }
    });

    // Recent applications
    const recentApplications = await JobApplication.countDocuments({
      job: { $in: await Job.find({ company: req.user.id }).distinct('_id') },
      appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    res.json({
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplications,
      recentApplications
    });

  } catch (err) {
    console.error('Get job stats error:', err);
    res.status(500).json({ msg: 'Server error getting job statistics' });
  }
});

// ========================
// APPLY FOR JOB (User Only)
// ========================
router.post('/:id/apply', authMiddleware, roleMiddleware('user'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company', 'companyName');
    
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if job is active and accepting applications
    if (job.status !== 'active') {
      return res.status(400).json({ msg: 'This job is no longer accepting applications' });
    }

    // Check if application deadline has passed
    if (job.applyDeadline && new Date() > job.applyDeadline) {
      return res.status(400).json({ msg: 'Application deadline has passed' });
    }

    // Check if user has already applied
    const existingApplication = await JobApplication.findOne({
      job: job._id,
      applicant: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ msg: 'You have already applied for this job' });
    }

    // Create job application
    const application = new JobApplication({
      job: job._id,
      applicant: req.user.id,
      status: 'pending',
      appliedAt: new Date()
    });

    await application.save();

    // Update job applicant count
    await Job.findByIdAndUpdate(job._id, {
      $inc: { applicantCount: 1 },
      $push: { applicants: application._id }
    });

    res.status(201).json({
      msg: 'Application submitted successfully',
      application: {
        id: application._id,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (err) {
    console.error('Apply for job error:', err);
    res.status(500).json({ msg: 'Server error submitting application' });
  }
});

// ========================
// GET JOB APPLICANTS (Company Only, Own Jobs)
// ========================
router.get('/:id/applicants', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if user owns this job
    if (job.company.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to view applicants for this job' });
    }

    // Get all applications for this job with applicant details
    const applications = await JobApplication.find({ job: job._id })
      .populate('applicant', 'username email profilePicture bio')
      .sort({ appliedAt: -1 });

    res.json({
      job: {
        id: job._id,
        jobTitle: job.jobTitle,
        companyName: job.companyName
      },
      applications
    });

  } catch (err) {
    console.error('Get job applicants error:', err);
    res.status(500).json({ msg: 'Server error getting job applicants' });
  }
});

// ========================
// GET USER'S APPLICATIONS (User Only)
// ========================
router.get('/my/applications', authMiddleware, roleMiddleware('user'), async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user.id })
      .populate({
        path: 'job',
        populate: {
          path: 'company',
          select: 'companyName companyLogo companyDescription'
        }
      })
      .sort({ appliedAt: -1 });

    res.json({ applications });

  } catch (err) {
    console.error('Get user applications error:', err);
    res.status(500).json({ msg: 'Server error getting applications' });
  }
});

// ========================
// UPDATE APPLICATION STATUS (Company Only, Own Jobs)
// ========================
router.put('/applications/:id/status', authMiddleware, allowCompanyOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'reviewed', 'interview', 'rejected', 'hired'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const application = await JobApplication.findById(req.params.id)
      .populate('job', 'company');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if user owns the job this application is for
    if (application.job.company.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this application' });
    }

    application.status = status;
    if (status === 'reviewed' || status === 'interview' || status === 'hired') {
      application.responseDate = new Date();
    }

    await application.save();

    res.json({
      msg: 'Application status updated successfully',
      application
    });

  } catch (err) {
    console.error('Update application status error:', err);
    res.status(500).json({ msg: 'Server error updating application status' });
  }
});

module.exports = router;
