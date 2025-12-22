const express = require('express');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
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
router.post('/', authMiddleware, roleMiddleware('company'), async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      location,
      jobType,
      experienceLevel,
      salary,
      techStack,
      isUrgent,
      applicationDeadline
    } = req.body;

    // Validate required fields
    if (!title || !description || !requirements || !location || !jobType || !experienceLevel || !salary) {
      return res.status(400).json({ msg: 'All required fields must be provided' });
    }

    // Create new job
    const newJob = new Job({
      title,
      description,
      requirements,
      location,
      jobType,
      experienceLevel,
      salary,
      techStack: techStack || [],
      company: req.user.id,
      isUrgent: isUrgent || false,
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null
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
router.put('/:id', authMiddleware, roleMiddleware('company'), async (req, res) => {
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
      title,
      description,
      requirements,
      location,
      jobType,
      experienceLevel,
      salary,
      techStack,
      status,
      isUrgent,
      applicationDeadline
    } = req.body;

    // Update fields
    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements;
    if (location) job.location = location;
    if (jobType) job.jobType = jobType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (salary) job.salary = salary;
    if (techStack) job.techStack = techStack;
    if (status) job.status = status;
    if (isUrgent !== undefined) job.isUrgent = isUrgent;
    if (applicationDeadline !== undefined) {
      job.applicationDeadline = applicationDeadline ? new Date(applicationDeadline) : null;
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
router.delete('/:id', authMiddleware, roleMiddleware('company'), async (req, res) => {
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
router.get('/company/my-jobs', authMiddleware, roleMiddleware('company'), async (req, res) => {
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
router.get('/company/stats', authMiddleware, roleMiddleware('company'), async (req, res) => {
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

module.exports = router;
