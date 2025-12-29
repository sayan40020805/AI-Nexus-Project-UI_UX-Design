const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile_pic-' + uniqueSuffix + path.extname(file.originalname));
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

// Public routes (authentication required but no role restriction)
router.use(authMiddleware);

// User role restricted routes
router.use(roleMiddleware('user'));

// ========================
// GET ANY USER'S PUBLIC PROFILE BY ID (no role restriction)
// ========================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    // Prefix stored media paths with base URL if present
    const userObj = user.toObject();
    if (userObj.profilePicture) userObj.profilePicture = `${baseUrl}${userObj.profilePicture}`;
    if (userObj.companyLogo) userObj.companyLogo = `${baseUrl}${userObj.companyLogo}`;
    
    res.json(userObj);
  } catch (err) {
    console.error('Get user profile by ID error:', err);
    res.status(500).json({ msg: 'Server error getting user profile' });
  }
});

// ========================
// GET USER PROFILE
// ========================
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

    // Prefix stored media paths with base URL if present
    const userObj = user.toObject();
    if (userObj.profilePicture) userObj.profilePicture = `${baseUrl}${userObj.profilePicture}`;
    if (userObj.companyLogo) userObj.companyLogo = `${baseUrl}${userObj.companyLogo}`;

    res.json({ user: userObj });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ msg: 'Server error getting user profile' });
  }
});

// ========================
// UPDATE USER PROFILE
// ========================
router.put('/profile', upload.single('profilePicture'), async (req, res) => {
  try {
    const { username, bio } = req.body;
    
    const updateData = {
      username: username || req.user.username,
      bio: bio || req.user.bio,
      updatedAt: new Date()
    };
    
    // Add profile picture if uploaded
    if (req.file) {
      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Update user info
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
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
// GET USER'S POSTS
// ========================
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const posts = await Post.find({ author: req.user.id })
      .populate('author', 'username profilePicture role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments({ author: req.user.id });

    // Prefix media paths with base URL and provide mediaList
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const postsWithMedia = posts.map(p => {
      const obj = p.toObject();
      obj.mediaList = [];
      if (obj.media) {
        if (Array.isArray(obj.media.images) && obj.media.images.length) {
          obj.media.images = obj.media.images.map(img => `${baseUrl}${img}`);
          obj.media.images.forEach(img => obj.mediaList.push({ type: 'image', url: img }));
        }
        if (obj.media.video) {
          obj.media.video = `${baseUrl}${obj.media.video}`;
          obj.mediaList.push({ type: 'video', url: obj.media.video });
        }
      }
      return obj;
    });
    
    res.json({
      posts: postsWithMedia,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error('Get user posts error:', err);
    res.status(500).json({ msg: 'Server error getting user posts' });
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
