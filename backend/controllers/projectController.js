const Project = require('../models/Project');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    // Build query
    let query = {};

    // Filtering
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Sorting
    let sortBy = {};
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      sortBy[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    } else {
      sortBy = { createdAt: -1 }; // Default sort by createdAt descending
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Execute query
    const projects = await Project.find(query)
      .sort(sortBy)
      .limit(limit * 1)
      .skip(startIndex)
      .lean();

    // Get total count for pagination
    const total = await Project.countDocuments(query);

    // Get statistics
    const stats = await Project.getStats();

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      stats,
      data: projects
    });

  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error in getProject:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Public
const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      status,
      priority,
      tags,
      startDate,
      endDate,
      progress,
      createdBy,
      teamMembers
    } = req.body;

    // Validation
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    // Create project
    const project = await Project.create({
      name: name.trim(),
      description: description?.trim(),
      status: status || 'Pending',
      priority: priority || 'Medium',
      tags: tags || [],
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      progress: progress || 0,
      createdBy: createdBy?.trim(),
      teamMembers: teamMembers || []
    });

    res.status(201).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error in createProject:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: message.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Public
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Allow updates to all fields except _id and createdAt
    const allowedUpdates = [
      'name', 'description', 'status', 'priority', 'tags', 
      'startDate', 'endDate', 'progress', 'createdBy', 'teamMembers'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Handle date conversions
    if (updates.startDate) {
      updates.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updates.endDate = new Date(updates.endDate);
    }

    // Update progress and auto-update status if needed
    if (updates.progress !== undefined) {
      project.progress = Math.max(0, Math.min(100, updates.progress));
      
      if (project.progress === 100) {
        updates.status = 'Completed';
      } else if (project.progress > 0 && project.status === 'Pending') {
        updates.status = 'In Progress';
      }
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error in updateProject:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: message.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Public
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error in deleteProject:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Update project progress
// @route   PATCH /api/projects/:id/progress
// @access  Public
const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        error: 'Progress must be between 0 and 100'
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    await project.updateProgress(progress);

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Error in updateProgress:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/stats/overview
// @access  Public
const getProjectStats = async (req, res) => {
  try {
    const stats = await Project.getStats();
    
    // Additional statistics
    const totalProjects = await Project.countDocuments();
    const overdueProjects = await Project.countDocuments({
      endDate: { $lt: new Date() },
      status: { $ne: 'Completed' }
    });

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        totalProjects,
        overdueProjects
      }
    });

  } catch (error) {
    console.error('Error in getProjectStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: error.message
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProgress,
  getProjectStats
};
