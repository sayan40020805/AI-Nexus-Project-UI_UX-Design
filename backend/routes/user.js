const express = require('express');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const { uploadFlexible, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Public routes (authentication required but no role restriction)
router.use(authMiddleware);

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
    if (userObj.coverPhoto) userObj.coverPhoto = `${baseUrl}${userObj.coverPhoto}`;

    res.json({ user: userObj });
  } catch (err) {
    console.error('Get user profile error:', err);
    res.status(500).json({ msg: 'Server error getting user profile' });
  }
});

// ========================
// UPDATE USER PROFILE
// ========================
router.put('/profile', uploadFlexible, handleUploadError, async (req, res) => {
  try {
    const { username, bio } = req.body;
    
    const updateData = {
      username: username || req.user.username,
      bio: bio || req.user.bio,
      updatedAt: new Date()
    };
    
    // Add profile picture if uploaded
    // Handle both single-file (req.file) and flexible fields (req.files)
    if (req.file) {
      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    } else if (req.files) {
      const profileFile = req.files['profile-pic']?.[0] || req.files['profilePicture']?.[0];
      if (profileFile) {
        // If middleware stored it under uploads/profiles via upload middleware
        updateData.profilePicture = `/uploads/profiles/${profileFile.filename}`;
      }
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
    const { page = 1, limit = 50 } = req.query;
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    // Get ALL posts by user (including private posts) - show all on own dashboard
    // Exclude soft-deleted posts (isDeleted: true)
    const posts = await Post.find({ 
      author: req.user.id,
      isDeleted: { $ne: true }
    })
      .populate('author', 'username profilePicture role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Post.countDocuments({ 
      author: req.user.id,
      isDeleted: { $ne: true }
    });

    // Format posts for PostCard compatibility
    const postsWithMedia = posts.map(p => {
      const obj = p.toObject();
      
      // Create author object with all needed fields
      obj.author = {
        _id: obj.author._id,
        id: obj.author._id,
        username: obj.author.username,
        displayName: obj.author.username,
        profilePicture: obj.author.profilePicture ? 
          (obj.author.profilePicture.startsWith('http') ? obj.author.profilePicture : `${baseUrl}${obj.author.profilePicture}`) : 
          null,
        role: obj.author.role
      };
      
      // Provide mediaList for gallery views
      obj.mediaList = [];
      
      // Format post media with full URLs
      if (obj.media) {
        if (Array.isArray(obj.media.images) && obj.media.images.length) {
          obj.media.images = obj.media.images.map(img => 
            img.startsWith('http') ? img : `${baseUrl}${img}`
          );
          obj.media.images.forEach(img => obj.mediaList.push({ type: 'image', url: img }));
        }
        if (obj.media.video) {
          obj.media.video = obj.media.video.startsWith('http') ? 
            obj.media.video : `${baseUrl}${obj.media.video}`;
          obj.mediaList.push({ type: 'video', url: obj.media.video });
        }
        if (obj.media.document) {
          obj.media.document = obj.media.document.startsWith('http') ? 
            obj.media.document : `${baseUrl}${obj.media.document}`;
          obj.mediaList.push({ type: 'document', url: obj.media.document });
        }
      }
      
      // Add interaction counts and flags for PostCard
      obj.likesCount = obj.likes ? obj.likes.length : 0;
      obj.commentsCount = obj.comments ? obj.comments.length : 0;
      obj.sharesCount = obj.shares ? obj.shares.length : 0;
      obj.isLiked = false;
      obj.isOwner = true;
      obj.isPublic = obj.isPublic !== false;
      
      // Add isAuthor flag for PostCard
      obj.isAuthor = true;
      
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

// ========================
// GET ANY USER'S PUBLIC PROFILE BY ID (no role restriction)
// NOTE: Placed at end to avoid matching fixed paths earlier
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
