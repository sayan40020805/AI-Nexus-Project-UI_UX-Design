const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All routes require authentication and user role
router.use(authMiddleware);
router.use(roleMiddleware('user'));

// ========================
// GET USER PROFILE
// ========================
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ msg: 'Server error getting user profile' });
  }
});

// ========================
// UPDATE USER PROFILE
// ========================
router.put('/profile', async (req, res) => {
  try {
    const { username } = req.body;
    
    // Update user info
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username: username || req.user.username,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    res.json({ 
      msg: 'User profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update user profile error:', err);
    res.status(500).json({ msg: 'Server error updating user profile' });
  }
});

// ========================
// APPLY TO JOB (USER ONLY)
// ========================
router.post('/apply/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // TODO: Implement job application logic
    // For now, just return success
    res.json({ 
      msg: 'Job application submitted successfully',
      jobId 
    });
  } catch (err) {
    console.error('Job application error:', err);
    res.status(500).json({ msg: 'Server error submitting job application' });
  }
});

// ========================
// GET USER APPLICATIONS
// ========================
router.get('/applications', async (req, res) => {
  try {
    // TODO: Implement job applications listing
    // For now, return empty array
    res.json({ applications: [] });
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ msg: 'Server error getting job applications' });
  }
});

module.exports = router;
