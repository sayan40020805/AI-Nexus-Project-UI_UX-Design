const express = require('express');
const Follow = require('../models/Follow');
const User = require('../models/User');
const FollowService = require('../services/followService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========================
// FOLLOW USER/COMPANY
// ========================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { followingId } = req.body;
    
    if (!followingId) {
      return res.status(400).json({ msg: 'Following ID is required' });
    }
    
    if (followingId === req.user.id) {
      return res.status(400).json({ msg: 'You cannot follow yourself' });
    }
    
    // Check if the user to follow exists
    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user.id,
      following: followingId
    });
    
    if (existingFollow) {
      return res.status(400).json({ msg: 'Already following this user' });
    }
    
    // Create follow relationship
    const newFollow = new Follow({
      follower: req.user.id,
      following: followingId
    });
    
    await newFollow.save();
    
    // Populate follower and following information
    await newFollow.populate('follower', 'username companyName profilePicture companyLogo role');
    await newFollow.populate('following', 'username companyName profilePicture companyLogo role');
    
    res.status(201).json({
      message: 'Successfully followed user',
      follow: newFollow
    });
    
  } catch (err) {
    console.error('Follow error:', err);
    
    // Handle duplicate key error (already following)
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Already following this user' });
    }
    
    res.status(500).json({ msg: 'Server error following user' });
  }
});

// ========================
// UNFOLLOW USER/COMPANY
// ========================
router.delete('/:followingId', authMiddleware, async (req, res) => {
  try {
    const { followingId } = req.params;
    
    // Find and delete the follow relationship
    const follow = await Follow.findOneAndDelete({
      follower: req.user.id,
      following: followingId
    });
    
    if (!follow) {
      return res.status(404).json({ msg: 'Follow relationship not found' });
    }
    
    res.json({ message: 'Successfully unfollowed user' });
    
  } catch (err) {
    console.error('Unfollow error:', err);
    res.status(500).json({ msg: 'Server error unfollowing user' });
  }
});

// ========================
// GET FOLLOWERS OF A USER
// ========================
router.get('/followers/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const skip = (page - 1) * limit;
    
    // Get followers with pagination
    const followers = await Follow.find({ following: userId })
      .populate('follower', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    const total = await Follow.countDocuments({ following: userId });
    
    res.json({
      followers: followers.map(f => f.follower),
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
// GET FOLLOWING OF A USER
// ========================
router.get('/following/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const skip = (page - 1) * limit;
    
    // Get following with pagination
    const following = await Follow.find({ follower: userId })
      .populate('following', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    const total = await Follow.countDocuments({ follower: userId });
    
    res.json({
      following: following.map(f => f.following),
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

// ========================
// GET FOLLOWING LIST (IDs only - for feed filtering)
// ========================
router.get('/following-ids/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow users to get their own following IDs
    if (userId !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to get this data' });
    }
    
    // Get following IDs
    const following = await Follow.find({ follower: userId })
      .select('following')
      .lean();
    
    const followingIds = following.map(f => f.following);
    
    res.json({ followingIds });
    
  } catch (err) {
    console.error('Get following IDs error:', err);
    res.status(500).json({ msg: 'Server error getting following IDs' });
  }
});

// ========================
// CHECK FOLLOW STATUS
// ========================
router.get('/status/:targetId', authMiddleware, async (req, res) => {
  try {
    const { targetId } = req.params;
    
    if (targetId === req.user.id) {
      return res.json({ isFollowing: false, message: 'Cannot follow yourself' });
    }
    
    // Check if currently following
    const follow = await Follow.findOne({
      follower: req.user.id,
      following: targetId
    });
    
    res.json({
      isFollowing: !!follow,
      followId: follow ? follow._id : null
    });
    
  } catch (err) {
    console.error('Check follow status error:', err);
    res.status(500).json({ msg: 'Server error checking follow status' });
  }
});

// ========================
// GET FOLLOW STATISTICS
// ========================
router.get('/stats/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get followers and following counts
    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });
    
    // Check if current user is following this user
    const isFollowing = await Follow.findOne({
      follower: req.user.id,
      following: userId
    });
    
    res.json({
      followersCount,
      followingCount,
      isFollowing: !!isFollowing
    });
    
  } catch (err) {
    console.error('Get follow stats error:', err);
    res.status(500).json({ msg: 'Server error getting follow statistics' });
  }
});

// ========================
// GET MUTUAL FOLLOWERS
// ========================
router.get('/mutual/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user.id) {
      return res.json({ mutualFollowers: [] });
    }
    
    // Get IDs of users that current user follows
    const currentUserFollowing = await Follow.find({ follower: req.user.id })
      .select('following')
      .lean();
    const currentFollowingIds = currentUserFollowing.map(f => f.following);
    
    // Get IDs of users that target user follows
    const targetUserFollowing = await Follow.find({ follower: userId })
      .select('following')
      .lean();
    const targetFollowingIds = targetUserFollowing.map(f => f.following);
    
    // Find mutual following (intersection)
    const mutualFollowingIds = currentFollowingIds.filter(id => 
      targetFollowingIds.includes(id.toString())
    );
    
    // Get user details for mutual followers
    const mutualFollowers = await User.find({
      _id: { $in: mutualFollowingIds }
    }).select('username companyName profilePicture companyLogo role');
    
    res.json({ mutualFollowers });
    
  } catch (err) {
    console.error('Get mutual followers error:', err);
    res.status(500).json({ msg: 'Server error getting mutual followers' });
  }
});

module.exports = router;
