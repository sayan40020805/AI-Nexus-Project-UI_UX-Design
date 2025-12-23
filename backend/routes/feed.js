const express = require('express');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========================
// GET PERSONALIZED HOME FEED
// ========================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Get list of users/companies that current user follows
    const following = await Follow.find({ follower: req.user.id })
      .select('following')
      .lean();
    
    // Extract just the IDs
    const followingIds = following.map(f => f.following);
    
    // Ensure the feed includes the current user's own posts even if they follow no one
    if (!followingIds.includes(req.user.id)) followingIds.push(req.user.id);

    // Build filter to get posts from followed users (and self)
    const filter = {
      author: { $in: followingIds },
      isPublic: true
    };
    
    const skip = (page - 1) * limit;
    
    // Get posts from followed users, sorted by creation date (latest first)
    const posts = await Post.find(filter)
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip)
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination
    const total = await Post.countDocuments(filter);
    
    // Transform posts to include like/comment counts, user interaction status, and full media URLs
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const enrichedPosts = posts.map(post => {
      const p = {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0,
        sharesCount: post.shares ? post.shares.length : 0,
        isLiked: post.likes ? post.likes.some(like => 
          like.user.toString() === req.user.id
        ) : false,
        isShared: post.shares ? post.shares.some(share => 
          share.user.toString() === req.user.id
        ) : false
      };

      // Add mediaList with full URLs
      p.mediaList = [];
      if (p.media) {
        if (Array.isArray(p.media.images) && p.media.images.length) {
          p.media.images = p.media.images.map(img => `${baseUrl}${img}`);
          p.media.images.forEach(img => p.mediaList.push({ type: 'image', url: img }));
        }
        if (p.media.video) {
          p.media.video = `${baseUrl}${p.media.video}`;
          p.mediaList.push({ type: 'video', url: p.media.video });
        }
      }

      return p;
    });

    res.json({
      posts: enrichedPosts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      followingCount: followingIds.length
    });
    
  } catch (err) {
    console.error('Get home feed error:', err);
    res.status(500).json({ msg: 'Server error getting home feed' });
  }
});

// ========================
// GET TRENDING POSTS (across all users)
// ========================
router.get('/trending', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get posts with highest engagement (likes + comments + shares)
    const posts = await Post.find({ isPublic: true })
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ 
        createdAt: -1, // Primary sort by recent
        likes: -1,     // Secondary sort by likes
        comments: -1,  // Tertiary sort by comments
        shares: -1     // Final sort by shares
      })
      .limit(limit * 1)
      .skip(skip)
      .lean();
    
    const total = await Post.countDocuments({ isPublic: true });
    
    // Enrich posts with engagement metrics and include full media URLs
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const enrichedPosts = posts.map(post => {
      const p = {
        ...post,
        engagementScore: (post.likes ? post.likes.length : 0) + 
                        (post.comments ? post.comments.length : 0) + 
                        (post.shares ? post.shares.length : 0),
        isLiked: post.likes ? post.likes.some(like => 
          like.user.toString() === req.user.id
        ) : false
      };

      p.mediaList = [];
      if (p.media) {
        if (Array.isArray(p.media.images) && p.media.images.length) {
          p.media.images = p.media.images.map(img => `${baseUrl}${img}`);
          p.media.images.forEach(img => p.mediaList.push({ type: 'image', url: img }));
        }
        if (p.media.video) {
          p.media.video = `${baseUrl}${p.media.video}`;
          p.mediaList.push({ type: 'video', url: p.media.video });
        }
      }

      return p;
    });
    
    res.json({
      posts: enrichedPosts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Get trending posts error:', err);
    res.status(500).json({ msg: 'Server error getting trending posts' });
  }
});

// ========================
// GET COMPANY POSTS (for company feeds)
// ========================
router.get('/companies', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    

    // Get posts from company accounts only
    const posts = await Post.find({ 
      isPublic: true,
      'author.role': 'company'
    })
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip)
      .lean();
    
    const total = await Post.countDocuments({ 
      isPublic: true,
      'author.role': 'company'
    });
    
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const enrichedPosts = posts.map(post => {
      const p = {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0,
        sharesCount: post.shares ? post.shares.length : 0,
        isLiked: post.likes ? post.likes.some(like => 
          like.user.toString() === req.user.id
        ) : false
      };

      p.mediaList = [];
      if (p.media) {
        if (Array.isArray(p.media.images) && p.media.images.length) {
          p.media.images = p.media.images.map(img => `${baseUrl}${img}`);
          p.media.images.forEach(img => p.mediaList.push({ type: 'image', url: img }));
        }
        if (p.media.video) {
          p.media.video = `${baseUrl}${p.media.video}`;
          p.mediaList.push({ type: 'video', url: p.media.video });
        }
      }

      return p;
    });
    
    res.json({
      posts: enrichedPosts,
      pagination: {
        current: parseInt(page),
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
// GET POSTS BY POST TYPE (for specific pages)
// ========================
router.get('/by-type/:postType', authMiddleware, async (req, res) => {
  try {
    console.log('📋 Feed by-type - Request started');
    console.log('📋 Feed by-type - Request URL:', req.originalUrl);
    console.log('📋 Feed by-type - User authenticated:', !!req.user);
    console.log('📋 Feed by-type - User ID:', req.user ? req.user.id : 'none');
    
    const { postType: rawPostType } = req.params;
    console.log('📋 Feed by-type - Raw post type:', rawPostType);
    
    const postType = rawPostType.trim();
    console.log('📋 Feed by-type - Trimmed post type:', postType);
    
    const { page = 1, limit = 20 } = req.query;
    console.log('📋 Feed by-type - Query params:', { page, limit });
    console.log('📋 Feed by-type - Query params types:', { 
      pageType: typeof page, 
      limitType: typeof limit 
    });
    
    // Validate post type - support both frontend and backend post types
    const validPostTypes = [
      'normal', 
      'shorts', 
      'ai_short',
      'news', 
      'ai_news',
      'model', 
      'ai_models',
      'career', 
      'event',
      'ai_showcase',
      'showcase'
    ];
    
    console.log('📋 Feed by-type - Valid post types:', validPostTypes);
    console.log('📋 Feed by-type - Is post type valid:', validPostTypes.includes(postType));
    
    if (!validPostTypes.includes(postType)) {
      console.log('📋 Feed by-type - Invalid post type error:', {
        received: postType,
        validTypes: validPostTypes,
        postTypeLength: postType.length,
        postTypeTrimmed: postType === rawPostType.trim()
      });
      return res.status(400).json({ 
        msg: 'Invalid post type',
        received: postType,
        validTypes: validPostTypes,
        debug: {
          originalLength: rawPostType.length,
          trimmedLength: postType.length,
          isEqual: postType === rawPostType
        }
      });
    }
    
    const skip = (page - 1) * limit;
    console.log('📋 Feed by-type - Calculated skip:', skip);
    
    console.log('📋 Feed by-type - Starting database query...');
    
    // Get posts filtered by type
    const posts = await Post.find({ 
      postType,
      isPublic: true
    })
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip)
      .lean();
    
    console.log('📋 Feed by-type - Database query completed, posts found:', posts.length);
    
    const total = await Post.countDocuments({ 
      postType,
      isPublic: true
    });
    
    console.log('📋 Feed by-type - Total count query completed, total posts:', total);
    
    const enrichedPosts = posts.map(post => ({
      ...post,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.comments ? post.comments.length : 0,
      sharesCount: post.shares ? post.shares.length : 0,
      isLiked: post.likes ? post.likes.some(like => 
        like.user.toString() === req.user.id
      ) : false
    }));
    
    console.log('📋 Feed by-type - Response prepared successfully');
    
    res.json({
      posts: enrichedPosts,
      postType,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('📋 Feed by-type - Error details:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      postType: req.params ? req.params.postType : 'unknown',
      query: req.query
    });
    res.status(500).json({ 
      msg: 'Server error getting posts by type',
      error: err.message,
      debug: {
        postType: req.params ? req.params.postType : 'unknown',
        query: req.query
      }
    });
  }
});

// ========================
// GET USER'S OWN POSTS (for profile page)
// ========================
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if user exists
    const user = await require('../models/User').findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const skip = (page - 1) * limit;
    
    // Get posts by specific user
    const posts = await Post.find({ 
      author: userId,
      isPublic: true
    })
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip)
      .lean();
    
    const total = await Post.countDocuments({ 
      author: userId,
      isPublic: true
    });
    
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const enrichedPosts = posts.map(post => {
      const p = {
        ...post,
        likesCount: post.likes ? post.likes.length : 0,
        commentsCount: post.comments ? post.comments.length : 0,
        sharesCount: post.shares ? post.shares.length : 0,
        isLiked: post.likes ? post.likes.some(like => 
          like.user.toString() === req.user.id
        ) : false,
        isOwner: post.author._id.toString() === req.user.id
      };

      p.mediaList = [];
      if (p.media) {
        if (Array.isArray(p.media.images) && p.media.images.length) {
          p.media.images = p.media.images.map(img => `${baseUrl}${img}`);
          p.media.images.forEach(img => p.mediaList.push({ type: 'image', url: img }));
        }
        if (p.media.video) {
          p.media.video = `${baseUrl}${p.media.video}`;
          p.mediaList.push({ type: 'video', url: p.media.video });
        }
      }

      return p;
    });
    
    res.json({
      posts: enrichedPosts,
      user: {
        id: user._id,
        username: user.username,
        companyName: user.companyName,
        role: user.role
      },
      pagination: {
        current: parseInt(page),
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
// REFRESH FEED (get latest posts since last fetch)
// ========================
router.get('/refresh/:lastPostId', authMiddleware, async (req, res) => {
  try {
    const { lastPostId } = req.params;
    
    // Get list of users/companies that current user follows
    const following = await Follow.find({ follower: req.user.id })
      .select('following')
      .lean();
    const followingIds = following.map(f => f.following);
    
    if (followingIds.length === 0) {
      return res.json({ posts: [], message: 'No new posts' });
    }
    
    // Get posts created after the last post
    const lastPost = await Post.findById(lastPostId);
    if (!lastPost) {
      return res.status(404).json({ msg: 'Last post not found' });
    }
    
    const posts = await Post.find({
      author: { $in: followingIds },
      isPublic: true,
      createdAt: { $gt: lastPost.createdAt }
    })
      .populate('author', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .lean();
    
    const enrichedPosts = posts.map(post => ({
      ...post,
      likesCount: post.likes ? post.likes.length : 0,
      commentsCount: post.comments ? post.comments.length : 0,
      sharesCount: post.shares ? post.shares.length : 0,
      isLiked: post.likes ? post.likes.some(like => 
        like.user.toString() === req.user.id
      ) : false
    }));
    
    res.json({
      posts: enrichedPosts,
      newPostsCount: posts.length
    });
    
  } catch (err) {
    console.error('Refresh feed error:', err);
    res.status(500).json({ msg: 'Server error refreshing feed' });
  }
});

module.exports = router;
