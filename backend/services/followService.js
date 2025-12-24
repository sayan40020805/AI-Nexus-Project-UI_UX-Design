const Follow = require('../models/Follow');
const User = require('../models/User');

/**
 * Follow Service - Centralized follow/unfollow operations
 * Provides optimized methods for follow-related functionality
 */
class FollowService {
  
  /**
   * Follow a user or company
   * @param {string} followerId - ID of the user doing the following
   * @param {string} followingId - ID of the user/company to follow
   * @returns {Object} Follow relationship object
   */
  static async followUser(followerId, followingId) {
    try {
      // Validate inputs
      if (!followerId || !followingId) {
        throw new Error('Follower ID and Following ID are required');
      }

      if (followerId === followingId) {
        throw new Error('You cannot follow yourself');
      }

      // Check if the user to follow exists
      const userToFollow = await User.findById(followingId);
      if (!userToFollow) {
        throw new Error('User not found');
      }

      // Check if already following
      const existingFollow = await Follow.findOne({
        follower: followerId,
        following: followingId
      });

      if (existingFollow) {
        throw new Error('Already following this user');
      }

      // Create follow relationship
      const newFollow = new Follow({
        follower: followerId,
        following: followingId
      });

      await newFollow.save();

      // Populate follower and following information
      await newFollow.populate([
        { path: 'follower', select: 'username companyName profilePicture companyLogo role' },
        { path: 'following', select: 'username companyName profilePicture companyLogo role' }
      ]);

      return {
        success: true,
        follow: newFollow,
        message: `Successfully followed ${userToFollow.role === 'user' ? userToFollow.username : userToFollow.companyName}`
      };

    } catch (error) {
      console.error('FollowService.followUser error:', error);
      throw error;
    }
  }

  /**
   * Unfollow a user or company
   * @param {string} followerId - ID of the user doing the unfollowing
   * @param {string} followingId - ID of the user/company to unfollow
   * @returns {Object} Success response
   */
  static async unfollowUser(followerId, followingId) {
    try {
      // Validate inputs
      if (!followerId || !followingId) {
        throw new Error('Follower ID and Following ID are required');
      }

      // Find and delete the follow relationship
      const follow = await Follow.findOneAndDelete({
        follower: followerId,
        following: followingId
      });

      if (!follow) {
        throw new Error('Follow relationship not found');
      }

      return {
        success: true,
        message: 'Successfully unfollowed user'
      };

    } catch (error) {
      console.error('FollowService.unfollowUser error:', error);
      throw error;
    }
  }

  /**
   * Check if current user is following a target user
   * @param {string} followerId - ID of the current user
   * @param {string} targetId - ID of the target user
   * @returns {Object} Follow status information
   */
  static async checkFollowStatus(followerId, targetId) {
    try {
      if (!followerId || !targetId) {
        return { isFollowing: false, followId: null };
      }

      if (followerId === targetId) {
        return { isFollowing: false, message: 'Cannot follow yourself' };
      }

      const follow = await Follow.findOne({
        follower: followerId,
        following: targetId
      });

      return {
        isFollowing: !!follow,
        followId: follow ? follow._id : null
      };

    } catch (error) {
      console.error('FollowService.checkFollowStatus error:', error);
      return { isFollowing: false, followId: null };
    }
  }

  /**
   * Get follow status for multiple users
   * @param {string} followerId - ID of the current user
   * @param {Array} targetIds - Array of target user IDs
   * @returns {Object} Map of targetId -> follow status
   */
  static async checkMultipleFollowStatus(followerId, targetIds) {
    try {
      if (!followerId || !targetIds || targetIds.length === 0) {
        return {};
      }

      const follows = await Follow.find({
        follower: followerId,
        following: { $in: targetIds }
      }).select('following');

      const followMap = {};
      follows.forEach(follow => {
        followMap[follow.following.toString()] = {
          isFollowing: true,
          followId: follow._id
        };
      });

      // Fill in missing entries as not following
      targetIds.forEach(id => {
        if (!followMap[id]) {
          followMap[id] = { isFollowing: false, followId: null };
        }
      });

      return followMap;

    } catch (error) {
      console.error('FollowService.checkMultipleFollowStatus error:', error);
      return {};
    }
  }

  /**
   * Get follower count for a user
   * @param {string} userId - ID of the user
   * @returns {number} Number of followers
   */
  static async getFollowerCount(userId) {
    try {
      return await Follow.countDocuments({ following: userId });
    } catch (error) {
      console.error('FollowService.getFollowerCount error:', error);
      return 0;
    }
  }

  /**
   * Get following count for a user
   * @param {string} userId - ID of the user
   * @returns {number} Number of users being followed
   */
  static async getFollowingCount(userId) {
    try {
      return await Follow.countDocuments({ follower: userId });
    } catch (error) {
      console.error('FollowService.getFollowingCount error:', error);
      return 0;
    }
  }

  /**
   * Get follow statistics for a user
   * @param {string} userId - ID of the user
   * @param {string} currentUserId - ID of the current logged-in user (for checking if following)
   * @returns {Object} Follow statistics
   */
  static async getFollowStats(userId, currentUserId = null) {
    try {
      const [followersCount, followingCount, followStatus] = await Promise.all([
        this.getFollowerCount(userId),
        this.getFollowingCount(userId),
        currentUserId ? this.checkFollowStatus(currentUserId, userId) : { isFollowing: false }
      ]);

      return {
        followersCount,
        followingCount,
        isFollowing: followStatus.isFollowing,
        followId: followStatus.followId
      };

    } catch (error) {
      console.error('FollowService.getFollowStats error:', error);
      return {
        followersCount: 0,
        followingCount: 0,
        isFollowing: false,
        followId: null
      };
    }
  }

  /**
   * Get mutual followers between two users
   * @param {string} userId1 - ID of first user
   * @param {string} userId2 - ID of second user
   * @returns {Array} Array of mutual followers
   */
  static async getMutualFollowers(userId1, userId2) {
    try {
      if (userId1 === userId2) {
        return [];
      }

      // Get IDs of users that user1 follows
      const user1Following = await Follow.find({ follower: userId1 })
        .select('following')
        .lean();
      const user1FollowingIds = user1Following.map(f => f.following.toString());

      // Get IDs of users that user2 follows
      const user2Following = await Follow.find({ follower: userId2 })
        .select('following')
        .lean();
      const user2FollowingIds = user2Following.map(f => f.following.toString());

      // Find mutual following (intersection)
      const mutualFollowingIds = user1FollowingIds.filter(id => 
        user2FollowingIds.includes(id)
      );

      // Get user details for mutual followers
      const mutualFollowers = await User.find({
        _id: { $in: mutualFollowingIds }
      }).select('username companyName profilePicture companyLogo role');

      return mutualFollowers;

    } catch (error) {
      console.error('FollowService.getMutualFollowers error:', error);
      return [];
    }
  }
}

module.exports = FollowService;
