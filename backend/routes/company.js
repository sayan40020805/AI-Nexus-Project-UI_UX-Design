const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// All routes require authentication and company role
router.use(authMiddleware);
router.use(roleMiddleware('company'));

// ========================
// GET COMPANY PROFILE
// ========================
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    console.error('Get company profile error:', err);
    res.status(500).json({ msg: 'Server error getting company profile' });
  }
});

// ========================
// UPDATE COMPANY PROFILE
// ========================
router.put('/profile', async (req, res) => {
  try {
    const { companyName, companyDescription } = req.body;
    
    // Update company info
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        companyName: companyName || req.user.companyName,
        companyDescription: companyDescription || req.user.companyDescription,
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    res.json({ 
      msg: 'Company profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update company profile error:', err);
    res.status(500).json({ msg: 'Server error updating company profile' });
  }
});

// ========================
// GET COMPANY ANALYTICS
// ========================
router.get('/analytics', async (req, res) => {
  try {
    // This would typically query posts, followers, etc.
    // For now, return basic stats
    const analytics = {
      totalPosts: 0, // TODO: Implement when post system is ready
      followers: 0, // TODO: Implement when follow system is ready
      views: 0, // TODO: Implement when analytics are tracked
      engagement: 0
    };

    res.json({ analytics });
  } catch (err) {
    console.error('Get company analytics error:', err);
    res.status(500).json({ msg: 'Server error getting company analytics' });
  }
});

module.exports = router;
