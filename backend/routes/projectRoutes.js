const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProgress,
  getProjectStats
} = require('../controllers/projectController');

const router = express.Router();

// @route   GET /api/projects/stats/overview
// @desc    Get project statistics overview
// @access  Public
router.get('/stats/overview', getProjectStats);

// @route   GET /api/projects
// @desc    Get all projects with filtering, sorting, and pagination
// @access  Public
// Query parameters:
// - status: Filter by project status
// - priority: Filter by priority level
// - search: Search in name and description
// - sortBy: Sort field and direction (e.g., "name:asc", "createdAt:desc")
// - page: Page number (default: 1)
// - limit: Items per page (default: 10)
router.get('/', getProjects);

// @route   GET /api/projects/:id
// @desc    Get single project by ID
// @access  Public
router.get('/:id', getProject);

// @route   POST /api/projects
// @desc    Create new project
// @access  Public
// Request body: {
//   "name": "Project Name" (required),
//   "description": "Project description",
//   "status": "Pending|In Progress|Completed|On Hold|Cancelled",
//   "priority": "Low|Medium|High|Critical",
//   "tags": ["tag1", "tag2"],
//   "startDate": "2024-01-01",
//   "endDate": "2024-12-31",
//   "progress": 0-100,
//   "createdBy": "Creator name",
//   "teamMembers": [{"name": "Member name", "role": "Role", "email": "email"}]
// }
router.post('/', createProject);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Public
// Same request body as POST, but all fields are optional
router.put('/:id', updateProject);

// @route   PATCH /api/projects/:id/progress
// @desc    Update project progress
// @access  Public
// Request body: { "progress": 0-100 }
router.patch('/:id/progress', updateProgress);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Public
router.delete('/:id', deleteProject);

module.exports = router;
