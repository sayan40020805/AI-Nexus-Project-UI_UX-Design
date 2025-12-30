const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const FollowService = require('../services/followService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========================
// GET PUBLIC PROFILE BY ID
// ========================
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { includeCounts = false } = req.query;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    // Find user
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if user is deleted
    if (user.isDeleted) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const currentUserId = req.user.id;
    const isOwner = currentUserId === id;
    
    // Check privacy and visibility
    const isPrivate = user.settings?.privacy === 'private';
    const canViewFullProfile = isOwner || !isPrivate;
    
    // Check if following (for private profiles)
    let isFollowing = false;
    let followId = null;
    if (isPrivate && !isOwner) {
      const followStatus = await FollowService.checkFollowStatus(currentUserId, id);
      isFollowing = followStatus.isFollowing;
      followId = followStatus.followId;
    }
    
    // Build basic profile info
    const profile = {
      id: user._id,
      role: user.role,
      username: user.username,
      displayName: user.displayName || user.username,
      profilePicture: user.profilePicture 
        ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${baseUrl}${user.profilePicture}`)
        : null,
      verified: user.verified || false,
      verificationBadge: user.verificationBadge || 'none',
      createdAt: user.createdAt
    };
    
    // Add user-specific fields
    if (user.role === 'user') {
      profile.bio = user.bio;
      profile.location = user.location;
      profile.website = user.website;
    }
    
    // Add company-specific fields
    if (user.role === 'company') {
      profile.companyName = user.companyName;
      profile.companyLogo = user.companyLogo 
        ? (user.companyLogo.startsWith('http') ? user.companyLogo : `${baseUrl}${user.companyLogo}`)
        : null;
      profile.companyDescription = user.companyDescription;
      profile.companyWebsite = user.companyWebsite;
      profile.companyIndustry = user.companyIndustry;
      profile.companyLocation = user.companyLocation;
      profile.companySize = user.companySize;
    }
    
    // Add cover photo
    if (user.coverPhoto) {
      profile.coverPhoto = user.coverPhoto.startsWith('http') 
        ? user.coverPhoto 
        : `${baseUrl}${user.coverPhoto}`;
    }
    
    // Add full info if allowed
    if (canViewFullProfile) {
      profile.bio = user.bio;
      profile.location = user.location;
      profile.website = user.website;
      profile.settings = user.settings;
      profile.isPrivate = false;
    } else if (isPrivate) {
      profile.bio = (user.bio || '').substring(0, 120) + '...';
      profile.isPrivate = true;
      profile.isFollowing = isFollowing;
    }
    
    // Get follow stats
    const followStats = await FollowService.getFollowStats(id, currentUserId);
    
    // Add counts
    profile.stats = {
      postsCount: user.postsCount || 0,
      followersCount: followStats.followersCount,
      followingCount: followStats.followingCount,
      likesCount: user.likesCount || 0
    };
    
    // Add follow status for current user
    profile.isFollowing = followStats.isFollowing;
    profile.followId = followStats.followId;
    
    // Add mutual followers count if viewing someone else's profile
    if (!isOwner && currentUserId) {
      const mutualFollowers = await FollowService.getMutualFollowers(currentUserId, id);
      profile.mutualFollowersCount = mutualFollowers.length;
    }
    
    // Check if viewing own profile
    profile.isOwnProfile = isOwner;
    
    res.json(profile);
    
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ msg: 'Server error getting profile' });
  }
});

// ========================
// GET USER'S POSTS (with tabs support)
// ========================
router.get('/:id/posts', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      cursor = null, 
      limit = 20,
      tab = 'posts', // 'posts', 'media', 'likes', 'activity'
      mediaType = 'all' // 'all', 'images', 'videos'
    } = req.query;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    // Check if target user exists
    const targetUser = await User.findById(id).select('settings role');
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const currentUserId = req.user.id;
    const isOwner = currentUserId === id;
    
    // Check privacy for posts
    const isPrivate = targetUser.settings?.privacy === 'private';
    const canViewPosts = isOwner || !isPrivate;
    
    if (!canViewPosts) {
      // Check if following
      const followStatus = await FollowService.checkFollowStatus(currentUserId, id);
      if (!followStatus.isFollowing) {
        return res.status(403).json({ 
          msg: 'This profile is private. Follow to see their posts.',
          isPrivate: true,
          isFollowing: false
        });
      }
    }
    
    // Get posts based on tab
    let posts;
    let pagination;
    
    switch (tab) {
      case 'media':
        // Get posts with media only
        ({ posts, pagination } = await Post.getWithMedia(id, {
          cursor: cursor || null,
          limit: parseInt(limit),
          mediaType
        }));
        break;
        
      case 'likes':
        // Get posts user has liked
        ({ posts, pagination } = await Post.getLikedByUser(id, {
          cursor: cursor || null,
          limit: parseInt(limit)
        }));
        break;
        
      case 'activity':
        // Get activity (comments and shares)
        // For now, return empty - would need Activity model
        posts = [];
        pagination = { nextCursor: null, hasMore: false, total: 0 };
        break;
        
      case 'posts':
      default:
        // Get all posts by user
        ({ posts, pagination } = await Post.getByAuthor(id, {
          cursor: cursor || null,
          limit: parseInt(limit)
        }));
        break;
    }
    
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    
    // Enrich posts with interaction status and format URLs
    const enrichedPosts = posts.map(post => {
      let enriched = post.enrichWithInteraction ? 
        post.enrichWithInteraction(currentUserId) : 
        { ...post.toObject() };
      
      // Add isOwner flag
      enriched.isOwner = post.author._id.toString() === currentUserId;
      
      // Format author object with full URLs
      if (enriched.author) {
        enriched.author = {
          _id: enriched.author._id,
          id: enriched.author._id,
          username: enriched.author.username || enriched.author.companyName,
          displayName: enriched.author.displayName || enriched.author.username || enriched.author.companyName,
          profilePicture: enriched.author.profilePicture 
            ? (enriched.author.profilePicture.startsWith('http') ? enriched.author.profilePicture : `${baseUrl}${enriched.author.profilePicture}`)
            : (enriched.author.companyLogo 
                ? (enriched.author.companyLogo.startsWith('http') ? enriched.author.companyLogo : `${baseUrl}${enriched.author.companyLogo}`)
                : null),
          companyLogo: enriched.author.companyLogo 
            ? (enriched.author.companyLogo.startsWith('http') ? enriched.author.companyLogo : `${baseUrl}${enriched.author.companyLogo}`)
            : null,
          companyName: enriched.author.companyName,
          role: enriched.author.role,
          type: enriched.author.role === 'company' ? 'company' : 'user'
        };
      }
      
      // Format media URLs with full paths
      if (enriched.media) {
        if (enriched.media.images && Array.isArray(enriched.media.images)) {
          enriched.media.images = enriched.media.images.map(img => 
            img.startsWith('http') ? img : `${baseUrl}${img}`
          );
        }
        if (enriched.media.video) {
          enriched.media.video = enriched.media.video.startsWith('http') 
            ? enriched.media.video 
            : `${baseUrl}${enriched.media.video}`;
        }
        if (enriched.media.document) {
          enriched.media.document = enriched.media.document.startsWith('http') 
            ? enriched.media.document 
            : `${baseUrl}${enriched.media.document}`;
        }
      }
      
      // Build mediaList for gallery views
      enriched.mediaList = [];
      if (enriched.media?.images) {
        enriched.media.images.forEach(img => enriched.mediaList.push({ type: 'image', url: img }));
      }
      if (enriched.media?.video) {
        enriched.mediaList.push({ type: 'video', url: enriched.media.video });
      }
      if (enriched.media?.document) {
        enriched.mediaList.push({ type: 'document', url: enriched.media.document });
      }
      
      // Ensure counts are present
      enriched.likesCount = enriched.likesCount || enriched.likes?.length || 0;
      enriched.commentsCount = enriched.commentsCount || enriched.comments?.length || 0;
      enriched.sharesCount = enriched.sharesCount || enriched.shares?.length || 0;
      
      return enriched;
    });
    
    res.json({
      posts: enrichedPosts,
      pagination,
      tab,
      mediaType
    });
    
  } catch (err) {
    console.error('Get user posts error:', err);
    res.status(500).json({ msg: 'Server error getting user posts' });
  }
});

// ========================
// GET USER'S MEDIA (images & videos only)
// ========================
router.get('/:id/media', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { cursor = null, limit = 20, type = 'all' } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    const targetUser = await User.findById(id).select('settings');
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const currentUserId = req.user.id;
    const isOwner = currentUserId === id;
    const isPrivate = targetUser.settings?.privacy === 'private';
    const canView = isOwner || !isPrivate;
    
    if (!canView) {
      const followStatus = await FollowService.checkFollowStatus(currentUserId, id);
      if (!followStatus.isFollowing) {
        return res.status(403).json({ msg: 'This profile is private' });
      }
    }
    
    const { posts, pagination } = await Post.getWithMedia(id, {
      cursor: cursor || null,
      limit: parseInt(limit),
      mediaType: type
    });
    
    res.json({ posts, pagination });
    
  } catch (err) {
    console.error('Get user media error:', err);
    res.status(500).json({ msg: 'Server error getting user media' });
  }
});

// ========================
// GET POSTS USER HAS LIKED
// ========================
router.get('/:id/likes', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { cursor = null, limit = 20 } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    const targetUser = await User.findById(id).select('settings');
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const currentUserId = req.user.id;
    const isOwner = currentUserId === id;
    const isPrivate = targetUser.settings?.privacy === 'private';
    const canView = isOwner || !isPrivate;
    
    if (!canView) {
      const followStatus = await FollowService.checkFollowStatus(currentUserId, id);
      if (!followStatus.isFollowing) {
        return res.status(403).json({ msg: 'This profile is private' });
      }
    }
    
    const { posts, pagination } = await Post.getLikedByUser(id, {
      cursor: cursor || null,
      limit: parseInt(limit)
    });
    
    // Enrich posts
    const enrichedPosts = posts.map(post => ({
      ...post.toObject(),
      isLiked: true, // These are posts they liked
      isOwner: post.author._id.toString() === currentUserId
    }));
    
    res.json({ posts: enrichedPosts, pagination });
    
  } catch (err) {
    console.error('Get user likes error:', err);
    res.status(500).json({ msg: 'Server error getting user likes' });
  }
});

// ========================
// GET USER'S ACTIVITY (comments & shares)
// ========================
router.get('/:id/activity', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { cursor = null, limit = 20, type = 'all' } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    const targetUser = await User.findById(id).select('settings');
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const currentUserId = req.user.id;
    const isOwner = currentUserId === id;
    const isPrivate = targetUser.settings?.privacy === 'private';
    const canView = isOwner || !isPrivate;
    
    if (!canView) {
      const followStatus = await FollowService.checkFollowStatus(currentUserId, id);
      if (!followStatus.isFollowing) {
        return res.status(403).json({ msg: 'This profile is private' });
      }
    }
    
    // For now, return empty activity
    // In production, would query Activity model or Post.shares
    res.json({
      activity: [],
      pagination: { nextCursor: null, hasMore: false, total: 0 },
      message: 'Activity feed coming soon'
    });
    
  } catch (err) {
    console.error('Get user activity error:', err);
    res.status(500).json({ msg: 'Server error getting user activity' });
  }
});

// ========================
// GET FOLLOWERS
// ========================
router.get('/:id/followers', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    const targetUser = await User.findById(id).select('settings');
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const skip = (page - 1) * limit;
    
    const followers = await Follow.find({ following: id })
      .populate('follower', 'username displayName profilePicture companyName companyLogo role verified followerCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Follow.countDocuments({ following: id });
    
    // Get follow status for current user
    const currentUserId = req.user.id;
    const followerIds = followers.map(f => f.follower._id.toString());
    const followStatusMap = await FollowService.checkMultipleFollowStatus(currentUserId, followerIds);
    
    const formattedFollowers = followers.map(f => {
      const follower = f.follower;
      const status = followStatusMap[follower._id.toString()] || { isFollowing: false };
      
      return {
        id: follower._id,
        username: follower.username,
        displayName: follower.displayName || follower.username,
        profilePicture: follower.profilePicture,
        role: follower.role,
        verified: follower.verified,
        isFollowing: status.isFollowing,
        followedAt: f.createdAt
      };
    });
    
    res.json({
      followers: formattedFollowers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Get followers error:', err);
    res.status(500).json({ msg: 'Server error getting followers' });
  }
});

// ========================
// GET FOLLOWING
// ========================
router.get('/:id/following', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid user ID format' });
    }
    
    const targetUser = await User.findById(id).select('settings');
    if (!targetUser || targetUser.isDeleted) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check privacy - can only see following if:
    // 1. Viewing own profile
    // 2. Profile is public
    // 3. Profile is private but user is following
    const currentUserId = req.user.id;
    const isOwner = currentUserId === id;
    const isPrivate = targetUser.settings?.privacy === 'private';
    
    if (isPrivate && !isOwner) {
      const followStatus = await FollowService.checkFollowStatus(currentUserId, id);
      if (!followStatus.isFollowing) {
        return res.status(403).json({ msg: 'This profile is private' });
      }
    }
    
    const skip = (page - 1) * limit;
    
    const following = await Follow.find({ follower: id })
      .populate('following', 'username displayName profilePicture companyName companyLogo role verified followerCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Follow.countDocuments({ follower: id });
    
    // Get follow status for current user
    const followingIds = following.map(f => f.following._id.toString());
    const followStatusMap = await FollowService.checkMultipleFollowStatus(currentUserId, followingIds);
    
    const formattedFollowing = following.map(f => {
      const followed = f.following;
      const status = followStatusMap[followed._id.toString()] || { isFollowing: false };
      
      return {
        id: followed._id,
        username: followed.username,
        displayName: followed.displayName || followed.username,
        profilePicture: followed.profilePicture,
        role: followed.role,
        verified: followed.verified,
        isFollowing: status.isFollowing,
        followedAt: f.createdAt
      };
    });
    
    res.json({
      following: formattedFollowing,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Get following error:', err);
    res.status(500).json({ msg: 'Server error getting following' });
  }
});

module.exports = router;

