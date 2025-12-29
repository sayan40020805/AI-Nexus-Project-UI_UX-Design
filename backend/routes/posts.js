const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Helper: transform post media into an array with full URLs
const transformPostMedia = (post, baseUrl) => {
  const obj = post.toObject ? post.toObject() : JSON.parse(JSON.stringify(post));
  const mediaList = [];

  if (obj.media) {
    if (Array.isArray(obj.media.images) && obj.media.images.length) {
      // Prefix images that are stored locally with base URL and add to mediaList
      obj.media.images = obj.media.images.map(img => {
        if (typeof img === 'string' && (img.startsWith('/uploads') || img.startsWith('uploads/'))) {
          return `${baseUrl}${img}`;
        }
        return img; // assume already a full URL
      });
      obj.media.images.forEach(img => {
        mediaList.push({ type: 'image', url: img });
      });
    }
    if (obj.media.video) {
      if (typeof obj.media.video === 'string' && (obj.media.video.startsWith('/uploads') || obj.media.video.startsWith('uploads/'))) {
        obj.media.video = `${baseUrl}${obj.media.video}`;
      }
      mediaList.push({ type: 'video', url: obj.media.video });
    }
  }

  obj.mediaList = mediaList; // non-breaking addition
  return obj;
};

// ========================
// GET POSTS (with filtering)
// ========================
router.get('/', async (req, res) => {
  try {
    const { postType, page = 1, limit = 20, author } = req.query;
    
    // Build filter object
    const filter = {};
    if (postType) {
      filter.postType = postType;
    }
    if (author) {
      filter.author = author;
    }
    
    // Execute query with pagination
    const posts = await Post.find(filter)
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Get total count for pagination
    const total = await Post.countDocuments(filter);

    // Include mediaList with full URLs for each post
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const postsWithMedia = posts.map(p => transformPostMedia(p, baseUrl));
    
    res.json({
      posts: postsWithMedia,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ msg: 'Server error getting posts' });
  }
});

// ========================
// CREATE NEW POST (accepts files)
// ========================
router.post('/', authMiddleware, upload.any(), async (req, res) => {
  try {
    const { 
      content, 
      postType, 
      // Normal post fields
      feeling,
      location,
      tags,
      privacy,
      // AI Models fields
      modelName,
      modelType,
      capabilities,
      useCases,
      pricing,
      performance,
      limitations,
      githubUrl,
      demoUrl,
      paperUrl,
      category,
      releaseDate,
      company,
      license,
      title
    } = req.body;
    
    // Map frontend post types to backend post types
    const postTypeMap = {
      'normal': 'normal',           // Normal posts show on home page
      'ai_news': 'ai_news',
      'ai_short': 'ai_short',       // AI Shorts
      'ai_shorts': 'ai_short',      // plural form normalization
      'ai_models': 'ai_models',     // Models
      'ai_showcase': 'ai_showcase'  // Showcase
    };
    
    const backendPostType = postTypeMap[postType] || postType;
    
    console.log('Creating post:', { content, postType, backendPostType, files: req.files && req.files.length });
    console.log('Request body fields:', Object.keys(req.body));
    console.log('User info:', { id: req.user.id, role: req.user.role });
    
    // CRITICAL: Validate required fields based on post type
    if (!content || content.trim().length === 0) {
      console.error('Validation failed: content field is required');
      return res.status(400).json({ 
        msg: 'Content field is required for all posts',
        field: 'content'
      });
    }
    
    // Validate required fields for ai_models posts
    if (backendPostType === 'ai_models') {
      const requiredModelFields = ['modelName'];
      const missingFields = [];
      
      requiredModelFields.forEach(field => {
        if (!req.body[field] || req.body[field].toString().trim().length === 0) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.error('Validation failed for ai_models post:', { missingFields, received: Object.keys(req.body) });
        return res.status(400).json({ 
          msg: 'Required fields missing for model post',
          missingFields,
          requiredFields: ['modelName']
        });
      }
    }
    
    // Validate post type and role restrictions
    const userRole = req.user.role;
    const restrictedTypes = ['ai_news', 'career', 'event'];
    
    if (restrictedTypes.includes(backendPostType) && userRole !== 'company') {
      console.log('Role restriction triggered:', { backendPostType, userRole });
      return res.status(403).json({ 
        msg: 'Only companies can create news, career, and event posts' 
      });
    }

    // Process uploaded files into media structure
    const images = [];
    let video = '';

    // Support externally hosted video URLs (e.g., YouTube) from forms that allow URL input
    if (req.body.videoSource === 'url' && req.body.videoUrl) {
      // Use the provided URL directly (no base URL prefix applied)
      video = req.body.videoUrl;
    }

    if (req.files && req.files.length) {
      const maxShortSize = 50 * 1024 * 1024; // 50 MB for shorts
      const maxShowcaseSize = 200 * 1024 * 1024; // 200 MB for showcase videos

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        if (file.mimetype.startsWith('image/')) {
          // images are stored in uploads/posts/images
          images.push(`/uploads/posts/images/${file.filename}`);
        } else if (file.mimetype.startsWith('video/')) {
          // Validate file size by post type
          if (backendPostType === 'ai_short' && file.size > maxShortSize) {
            return res.status(400).json({ msg: 'Shorts must be <= 50MB' });
          }
          if (backendPostType === 'ai_showcase' && file.size > maxShowcaseSize) {
            return res.status(400).json({ msg: 'Showcase videos must be <= 200MB' });
          }

          video = `/uploads/posts/videos/${file.filename}`;
        } else if (file.mimetype.startsWith('audio/')) {
          // store audio under posts/audio
          video = `/uploads/posts/audio/${file.filename}`;
        } else {
          // fallback to general uploads
          images.push(`/uploads/posts/general/${file.filename}`);
        }
      }
    }

    // Create new post with all fields
    const newPost = new Post({
      content,
      title,
      postType: backendPostType,
      media: {
        images,
        video: video || ''
      },
      author: req.user.id,
      
      // Normal post fields
      feeling,
      location,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []),
      privacy: privacy || 'public',
      
      // AI Models fields
      modelName,
      modelType,
      capabilities: Array.isArray(capabilities) ? capabilities : (capabilities ? capabilities.split(',').map(c => c.trim()).filter(c => c) : []),
      useCases: Array.isArray(useCases) ? useCases : (useCases ? useCases.split(',').map(u => u.trim()).filter(u => u) : []),
      pricing,
      performance,
      limitations,
      githubUrl,
      demoUrl,
      paperUrl,
      category,
      releaseDate: releaseDate ? new Date(releaseDate) : null,
      company,
      license
    });

    await newPost.save();
    
    // Populate author information
    await newPost.populate('author', 'username companyName profilePicture companyLogo role');

    // Transform media URLs to include base URL for client
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const result = transformPostMedia(newPost, baseUrl);
    
    // Return in { post } envelope for backward compatibility with existing client code
    res.status(201).json({ post: result });
  } catch (err) {
    console.error('Create post error:', err);
    
    // Enhanced error logging with more details
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      name: err.name,
      stack: err.stack,
      requestBody: req.body ? Object.keys(req.body) : 'No body',
      postType: req.body ? req.body.postType : 'No postType',
      user: req.user ? { id: req.user.id, role: req.user.role } : 'No user'
    });
    
    // Check for specific error types
    if (err.name === 'ValidationError') {
      console.error('Mongoose validation error:', err.errors);
      const validationErrors = Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      
      return res.status(400).json({
        msg: 'Validation error creating post',
        validationErrors,
        originalError: err.message
      });
    }
    
    if (err.name === 'MongoError' && err.code === 11000) {
      console.error('Duplicate key error:', err);
      return res.status(409).json({
        msg: 'Duplicate post or conflict error',
        originalError: err.message
      });
    }
    
    res.status(500).json({ 
      msg: 'Server error creating post',
      errorType: err.name,
      originalError: err.message
    });
  }
});

// ========================
// GET SINGLE POST
// ========================
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username companyName profilePicture companyLogo role')
      .populate('comments.user', 'username profilePicture')
      .populate('likes.user', 'username profilePicture');
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const postWithMedia = transformPostMedia(post, baseUrl);
    
    res.json(postWithMedia);
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ msg: 'Server error getting post' });
  }
});

// ========================
// UPDATE POST
// ========================
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this post' });
    }
    
    const { content, media } = req.body;
    
    if (content) post.content = content;
    if (media) post.media = media;
    
    await post.save();
    await post.populate('author', 'username companyName profilePicture companyLogo role');

    // Transform media URLs for client
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const transformed = transformPostMedia(post, baseUrl);
    
    res.json(transformed);
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ msg: 'Server error updating post' });
  }
});

// ========================
// DELETE POST
// ========================
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    console.log('🗑️ DELETE POST - Request started');
    console.log('🗑️ DELETE POST - Post ID:', req.params.id);
    console.log('🗑️ DELETE POST - User ID:', req.user.id);
    console.log('🗑️ DELETE POST - User role:', req.user.role);
    
    // Validate post ID format
    const postId = req.params.id;
    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      console.log('🗑️ DELETE POST - Invalid post ID format:', postId);
      return res.status(400).json({ 
        msg: 'Invalid post ID format',
        postId: postId 
      });
    }
    
    console.log('🗑️ DELETE POST - Post ID validation passed');
    
    // Find post with author populated for comparison
    const post = await Post.findById(postId).populate('author', '_id role');
    
    if (!post) {
      console.log('🗑️ DELETE POST - Post not found:', postId);
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    console.log('🗑️ DELETE POST - Post found:', { 
      postId: post._id, 
      authorId: post.author._id,
      authorRole: post.author.role,
      postType: post.postType 
    });
    
    // Check if user is the author or has admin role
    const isAuthor = post.author._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isCompanyModerator = req.user.role === 'company' && post.author.role !== 'company';
    
    if (!isAuthor && !isAdmin && !isCompanyModerator) {
      console.log('🗑️ DELETE POST - Authorization failed:', {
        isAuthor,
        isAdmin,
        isCompanyModerator,
        userId: req.user.id,
        postAuthorId: post.author._id
      });
      return res.status(403).json({ 
        msg: 'Not authorized to delete this post',
        requiredRole: 'author',
        userRole: req.user.role,
        isAuthor,
        isAdmin
      });
    }
    
    console.log('🗑️ DELETE POST - Authorization passed');
    
    // Delete the post
    const deleteResult = await Post.findByIdAndDelete(postId);
    
    if (!deleteResult) {
      console.log('🗑️ DELETE POST - Delete operation failed');
      return res.status(500).json({ msg: 'Failed to delete post' });
    }
    
    console.log('🗑️ DELETE POST - Post deleted successfully:', postId);
    
    // Return success response
    res.json({ 
      msg: 'Post deleted successfully',
      deletedPostId: postId,
      deletedAt: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('🗑️ DELETE POST - Error details:', {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
      postId: req.params.id,
      userId: req.user?.id,
      requestBody: req.body
    });
    
    // Handle specific MongoDB errors
    if (err.name === 'CastError') {
      console.log('🗑️ DELETE POST - Invalid ObjectId format');
      return res.status(400).json({ 
        msg: 'Invalid post ID format',
        error: 'CastError',
        value: err.value
      });
    }
    
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      console.log('🗑️ DELETE POST - MongoDB error:', err.code);
      return res.status(500).json({ 
        msg: 'Database error deleting post',
        error: err.name,
        code: err.code
      });
    }
    
    // Generic server error
    res.status(500).json({ 
      msg: 'Server error deleting post',
      errorType: err.name,
      errorMessage: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ========================
// LIKE/UNLIKE POST
// ========================
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if user already liked this post
    const existingLike = post.likes.find(
      like => like.user.toString() === req.user.id
    );
    
    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user.id
      );
    } else {
      // Like the post
      post.likes.push({ user: req.user.id });
    }
    
    await post.save();
    await post.populate('author', 'username companyName profilePicture companyLogo role');
    await post.populate('likes.user', 'username profilePicture');
    
    res.json({
      post,
      isLiked: !existingLike,
      likesCount: post.likes.length
    });
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ msg: 'Server error liking post' });
  }
});

// ========================
// ADD COMMENT TO POST
// ========================
router.post('/:id/comment', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Add comment to post
    post.comments.push({
      user: req.user.id,
      content
    });
    
    await post.save();
    await post.populate('author', 'username companyName profilePicture companyLogo role');
    await post.populate('comments.user', 'username profilePicture');
    
    const newComment = post.comments[post.comments.length - 1];
    
    res.status(201).json(newComment);
  } catch (err) {
    console.error('Comment post error:', err);
    res.status(500).json({ msg: 'Server error commenting on post' });
  }
});

// ========================
// SHARE/REPOST
// ========================
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if user already shared this post
    const existingShare = post.shares.find(
      share => share.user.toString() === req.user.id
    );
    
    if (!existingShare) {
      // Add share
      post.shares.push({ user: req.user.id });
      await post.save();
    }
    
    res.json({
      post,
      sharesCount: post.shares.length
    });
  } catch (err) {
    console.error('Share post error:', err);
    res.status(500).json({ msg: 'Server error sharing post' });
  }
});

// ========================
// SAVE/UNSAVE POST
// ========================
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if user already saved this post
    const existingSave = post.savedBy.find(
      save => save.user.toString() === req.user.id
    );
    
    if (existingSave) {
      // Unsave the post
      post.savedBy = post.savedBy.filter(
        save => save.user.toString() !== req.user.id
      );
    } else {
      // Save the post
      post.savedBy.push({ user: req.user.id });
    }
    
    await post.save();
    await post.populate('author', 'username companyName profilePicture companyLogo role');
    
    res.json({
      post,
      isSaved: !existingSave,
      savedCount: post.savedBy.length
    });
  } catch (err) {
    console.error('Save post error:', err);
    res.status(500).json({ msg: 'Server error saving post' });
  }
});

// ========================
// REPORT POST
// ========================
router.post('/:id/report', authMiddleware, async (req, res) => {
  try {
    const { reason, description } = req.body;
    
    if (!reason) {
      return res.status(400).json({ msg: 'Report reason is required' });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if user already reported this post
    const existingReport = post.reports.find(
      report => report.user.toString() === req.user.id
    );
    
    if (existingReport) {
      return res.status(400).json({ msg: 'You have already reported this post' });
    }
    
    // Add report
    post.reports.push({
      user: req.user.id,
      reason,
      description: description || ''
    });
    
    await post.save();
    
    res.json({ msg: 'Post reported successfully' });
  } catch (err) {
    console.error('Report post error:', err);
    res.status(500).json({ msg: 'Server error reporting post' });
  }
});

// ========================
// GET POST STATISTICS
// ========================
router.get('/:id/stats', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const stats = {
      likes: post.likes.length,
      comments: post.comments.length,
      shares: post.shares.length,
      saves: post.savedBy.length,
      reports: post.reports.length,
      isLiked: post.likes.some(like => like.user.toString() === req.user.id),
      isShared: post.shares.some(share => share.user.toString() === req.user.id),
      isSaved: post.savedBy.some(save => save.user.toString() === req.user.id),
      isReported: post.reports.some(report => report.user.toString() === req.user.id)
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Get post stats error:', err);
    res.status(500).json({ msg: 'Server error getting post statistics' });
  }
});

module.exports = router;
