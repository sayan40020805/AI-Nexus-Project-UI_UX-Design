const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for company logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/companies/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'company_logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

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
router.put('/profile', upload.single('companyLogo'), async (req, res) => {
  try {
    const { companyName, companyDescription } = req.body;
    
    const updateData = {
      companyName: companyName || req.user.companyName,
      companyDescription: companyDescription || req.user.companyDescription,
      updatedAt: new Date()
    };
    
    // Add company logo if uploaded
    if (req.file) {
      updateData.companyLogo = `/uploads/companies/${req.file.filename}`;
    }
    
    // Update company info
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
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
// GET COMPANY'S POSTS
// ========================
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'companyName companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments({ author: req.user.id });
    
    res.json({
      posts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error('Get company posts error:', err);
    res.status(500).json({ msg: 'Server error getting company posts' });
  }
});

// ========================
// GET COMPANY ANALYTICS
// ========================
router.get('/analytics', async (req, res) => {
  try {
    // Get company posts count
    const totalPosts = await Post.countDocuments({ author: req.user.id });
    
    // Get total likes across all posts
    const postsWithLikes = await Post.find({ author: req.user.id }, 'likes');
    const totalLikes = postsWithLikes.reduce((sum, post) => sum + post.likes.length, 0);
    
    // Get total comments across all posts
    const postsWithComments = await Post.find({ author: req.user.id }, 'comments');
    const totalComments = postsWithComments.reduce((sum, post) => sum + post.comments.length, 0);
    
    // Calculate engagement rate (likes + comments / posts)
    const engagement = totalPosts > 0 ? ((totalLikes + totalComments) / totalPosts).toFixed(1) : 0;
    
    // TODO: Get follower count when follow system is implemented
    // TODO: Get views when analytics tracking is implemented
    const analytics = {
      totalPosts,
      followers: 0, // TODO: Implement when follow system is ready
      totalLikes,
      totalComments,
      engagement: parseFloat(engagement),
      views: 0 // TODO: Implement when analytics are tracked
    };

    res.json({ analytics });
  } catch (err) {
    console.error('Get company analytics error:', err);
    res.status(500).json({ msg: 'Server error getting company analytics' });
  }
});

module.exports = router;
