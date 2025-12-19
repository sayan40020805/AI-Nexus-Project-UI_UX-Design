const express = require('express');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/auth');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

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
    
    res.json({
      posts,
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
// CREATE NEW POST
// ========================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, postType, media } = req.body;
    
    // Validate post type and role restrictions
    const userRole = req.user.role;
    const restrictedTypes = ['news', 'career', 'event'];
    
    if (restrictedTypes.includes(postType) && userRole !== 'company') {
      return res.status(403).json({ 
        msg: 'Only companies can create news, career, and event posts' 
      });
    }
    
    if (postType === 'live' && userRole !== 'company') {
      return res.status(403).json({ 
        msg: 'Only companies can create live posts' 
      });
    }

    // Create new post
    const newPost = new Post({
      content,
      postType,
      media: media || {},
      author: req.user.id
    });

    await newPost.save();
    
    // Populate author information
    await newPost.populate('author', 'username companyName profilePicture companyLogo role');
    
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ msg: 'Server error creating post' });
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
    
    res.json(post);
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
    
    res.json(post);
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
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ msg: 'Server error deleting post' });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      isLiked: post.likes.some(like => like.user.toString() === req.user.id),
      isShared: post.shares.some(share => share.user.toString() === req.user.id)
    };
    
    res.json(stats);
  } catch (err) {
    console.error('Get post stats error:', err);
    res.status(500).json({ msg: 'Server error getting post statistics' });
  }
});

module.exports = router;
