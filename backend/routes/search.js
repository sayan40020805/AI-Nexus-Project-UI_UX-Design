const express = require('express');
const User = require('../models/User');
const FollowService = require('../services/followService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Helper to format user/company result
const formatSearchResult = (user, followStatus = null) => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  
  const result = {
    id: user._id,
    type: user.role, // 'user' or 'company'
    name: user.role === 'user' ? user.username : user.companyName,
    displayName: user.displayName || (user.role === 'user' ? user.username : user.companyName),
    bio: user.role === 'user' ? user.bio : user.companyDescription,
    verified: user.verified || false,
    verificationBadge: user.verificationBadge || 'none',
    createdAt: user.createdAt,
    stats: {
      postsCount: user.postsCount || 0,
      followersCount: user.followerCount || 0,
      followingCount: user.followingCount || 0
    }
  };
  
  // Add avatar/logo
  if (user.role === 'user') {
    result.avatar = user.profilePicture 
      ? (user.profilePicture.startsWith('http') ? user.profilePicture : `${baseUrl}${user.profilePicture}`)
      : null;
    result.username = user.username;
  } else {
    result.logo = user.companyLogo 
      ? (user.companyLogo.startsWith('http') ? user.companyLogo : `${baseUrl}${user.companyLogo}`)
      : null;
    result.companyName = user.companyName;
    result.companyIndustry = user.companyIndustry;
    result.companyLocation = user.companyLocation;
  }
  
  // Add follow status if provided
  if (followStatus) {
    result.isFollowing = followStatus.isFollowing;
    result.followId = followStatus.followId;
  }
  
  return result;
};

// ========================
// GLOBAL SEARCH (USERS & COMPANIES)
// ========================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { 
      q: query, 
      type = 'all', // 'all', 'user', 'company'
      cursor = null,
      limit = 20
    } = req.query;
    
    // Validate query
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < 1) {
      return res.status(400).json({ msg: 'Search query must be at least 1 character' });
    }
    
    // Build search filter
    const searchRegex = new RegExp(trimmedQuery, 'i'); // Case-insensitive partial match
    
    const filter = {
      _id: { $ne: req.user.id }, // Exclude current user
      isDeleted: false,
      $or: [
        { username: searchRegex },
        { displayName: searchRegex },
        { companyName: searchRegex }
      ]
    };
    
    // Filter by type if specified
    if (type === 'user') {
      filter.role = 'user';
      delete filter.$or[2]; // Remove companyName from search
    } else if (type === 'company') {
      filter.role = 'company';
      delete filter.$or[0]; // Remove username from search
      delete filter.$or[1]; // Remove displayName from search
    }
    
    // Cursor-based pagination
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }
    
    // Build sort - prioritize exact matches, then by relevance (follower count)
    const sort = { 
      createdAt: -1 
    };
    
    // Execute search
    const users = await User.find(filter)
      .select('username displayName companyName profilePicture companyLogo companyDescription bio role verified verificationBadge followerCount postsCount followingCount createdAt')
      .sort(sort)
      .limit(parseInt(limit) + 1) // Fetch one extra to check for more
      .lean();
    
    // Check if there are more results
    const hasMore = users.length > parseInt(limit);
    const results = hasMore ? users.slice(0, parseInt(limit)) : users;
    
    // Get follow status for all results
    let followStatusMap = {};
    try {
      const userIds = results.map(user => user._id.toString());
      if (userIds.length > 0) {
        followStatusMap = await FollowService.checkMultipleFollowStatus(req.user.id, userIds);
      }
    } catch (followError) {
      console.warn('Follow status check failed:', followError.message);
      // Continue without follow status
    }
    
    // Format results
    const formattedResults = results.map(user => {
      const followStatus = followStatusMap[user._id.toString()] || { isFollowing: false, followId: null };
      return formatSearchResult(user, followStatus);
    });
    
    // Get total count for this query (for display purposes)
    const totalFilter = { ...filter };
    delete totalFilter.createdAt; // Remove cursor filter for count
    const total = await User.countDocuments(totalFilter);
    
    res.json({
      results: formattedResults,
      pagination: {
        nextCursor: hasMore && results.length > 0 ? results[results.length - 1].createdAt : null,
        hasMore,
        total,
        count: formattedResults.length
      },
      query: trimmedQuery,
      searchType: type,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ msg: 'Server error during search' });
  }
});

// ========================
// SEARCH SUGGESTIONS (for autocomplete/typeahead)
// Improved: supports exact, prefix, and substring matches with better ranking, type filtering and deduplication
// PUBLIC ENDPOINT - NO AUTH REQUIRED
// ========================
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 8, type = 'all' } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    const trimmedQuery = query.trim();
    // Prepare different regexes for ranking: exact handle, startsWith, contains (case-insensitive)
    const exactRegex = new RegExp(`^${trimmedQuery}$`, 'i');
    const startsWithRegex = new RegExp(`^${trimmedQuery}`, 'i');
    const containsRegex = new RegExp(`${trimmedQuery}`, 'i');

    // Helper to run query for a given role and regex
    const runQuery = async (roleFilter, regex, fields, take) => {
      const filter = {
        isDeleted: false,
        ...(roleFilter ? { role: roleFilter } : {}),
        $or: [
          { username: regex },
          { displayName: regex },
          { companyName: regex }
        ]
      };

      // If user is authenticated, exclude them from suggestions
      if (req.user && req.user.id) {
        filter._id = { $ne: req.user.id };
      }

      return User.find(filter)
        .select(fields)
        .limit(take)
        .lean();
    };

    // We'll collect results in order: exact -> startsWith -> contains
    const maxPerStage = Math.max(1, Math.floor(limit));
    let collected = [];
    const seen = new Set();

    const fields = 'username displayName companyName profilePicture companyLogo role verified followerCount postsCount';

    const rolesToQuery = [];
    if (type === 'user') rolesToQuery.push('user');
    else if (type === 'company') rolesToQuery.push('company');
    else rolesToQuery.push('user', 'company');

    for (const role of rolesToQuery) {
      // exact
      const exactMatches = await runQuery(role, exactRegex, fields, maxPerStage);
      for (const u of exactMatches) {
        const key = `${u.role}:${u._id}`;
        if (!seen.has(key)) {
          seen.add(key);
          collected.push(u);
          if (collected.length >= limit) break;
        }
      }
      if (collected.length >= limit) break;

      // startsWith
      const prefixMatches = await runQuery(role, startsWithRegex, fields, maxPerStage * 2);
      for (const u of prefixMatches) {
        const key = `${u.role}:${u._id}`;
        if (!seen.has(key)) {
          seen.add(key);
          collected.push(u);
          if (collected.length >= limit) break;
        }
      }
      if (collected.length >= limit) break;

      // contains
      const containsMatches = await runQuery(role, containsRegex, fields, maxPerStage * 3);
      for (const u of containsMatches) {
        const key = `${u.role}:${u._id}`;
        if (!seen.has(key)) {
          seen.add(key);
          collected.push(u);
          if (collected.length >= limit) break;
        }
      }
      if (collected.length >= limit) break;
    }

    // Map to suggestion objects and group by type
    const suggestions = collected.slice(0, limit).map(u => ({
      id: u._id,
      type: u.role,
      name: u.role === 'user' ? u.username : u.companyName,
      displayName: u.displayName || (u.role === 'user' ? u.username : u.companyName),
      avatar: u.role === 'user' ? (u.profilePicture || null) : (u.companyLogo || null),
      verified: u.verified || false,
      score: u.followerCount || 0
    }));

    // Split into people & companies in the response for the frontend to render sections separately
    const people = suggestions.filter(s => s.type === 'user');
    const companies = suggestions.filter(s => s.type === 'company');

    res.json({ suggestions: { people, companies } });

  } catch (err) {
    console.error('Search suggestions error:', err);
    res.status(500).json({ msg: 'Server error getting search suggestions' });
  }
});

// ========================
// SEARCH USERS ONLY
// ========================
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const { q: query, cursor = null, limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const trimmedQuery = query.trim();
    const searchRegex = new RegExp(trimmedQuery, 'i');
    
    const filter = {
      _id: { $ne: req.user.id },
      role: 'user',
      isDeleted: false,
      $or: [
        { username: searchRegex },
        { displayName: searchRegex }
      ]
    };
    
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }
    
    const users = await User.find(filter)
      .select('username displayName profilePicture bio verified followerCount postsCount createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .lean();
    
    const hasMore = users.length > parseInt(limit);
    const results = hasMore ? users.slice(0, parseInt(limit)) : users;
    
    // Get follow status
    let followStatusMap = {};
    try {
      const userIds = results.map(user => user._id.toString());
      if (userIds.length > 0) {
        followStatusMap = await FollowService.checkMultipleFollowStatus(req.user.id, userIds);
      }
    } catch (e) {
      // Continue without follow status
    }
    
    const formattedResults = results.map(user => {
      const followStatus = followStatusMap[user._id.toString()] || { isFollowing: false, followId: null };
      return formatSearchResult(user, followStatus);
    });
    
    res.json({
      results: formattedResults,
      pagination: {
        nextCursor: hasMore && results.length > 0 ? results[results.length - 1].createdAt : null,
        hasMore
      }
    });
    
  } catch (err) {
    console.error('Search users error:', err);
    res.status(500).json({ msg: 'Server error searching users' });
  }
});

// ========================
// SEARCH COMPANIES ONLY
// ========================
router.get('/companies', authMiddleware, async (req, res) => {
  try {
    const { q: query, cursor = null, limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const trimmedQuery = query.trim();
    const searchRegex = new RegExp(trimmedQuery, 'i');
    
    const filter = {
      role: 'company',
      isDeleted: false,
      companyName: searchRegex
    };
    
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }
    
    const companies = await User.find(filter)
      .select('companyName companyLogo companyDescription companyIndustry companyLocation verified followerCount postsCount createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1)
      .lean();
    
    const hasMore = companies.length > parseInt(limit);
    const results = hasMore ? companies.slice(0, parseInt(limit)) : companies;
    
    // Get follow status
    let followStatusMap = {};
    try {
      const companyIds = results.map(c => c._id.toString());
      if (companyIds.length > 0) {
        followStatusMap = await FollowService.checkMultipleFollowStatus(req.user.id, companyIds);
      }
    } catch (e) {
      // Continue without follow status
    }
    
    const formattedResults = results.map(company => {
      const followStatus = followStatusMap[company._id.toString()] || { isFollowing: false, followId: null };
      return formatSearchResult(company, followStatus);
    });
    
    res.json({
      results: formattedResults,
      pagination: {
        nextCursor: hasMore && results.length > 0 ? results[results.length - 1].createdAt : null,
        hasMore
      }
    });
    
  } catch (err) {
    console.error('Search companies error:', err);
    res.status(500).json({ msg: 'Server error searching companies' });
  }
});

// ========================
// GET TRENDING USERS/COMPANIES
// ========================
router.get('/trending', authMiddleware, async (req, res) => {
  try {
    const { type = 'all', limit = 10 } = req.query;
    
    const filter = {
      _id: { $ne: req.user.id },
      isDeleted: false
    };
    
    if (type === 'user') {
      filter.role = 'user';
    } else if (type === 'company') {
      filter.role = 'company';
    }
    
    const trending = await User.find(filter)
      .select('username displayName companyName profilePicture companyLogo companyDescription role verified followerCount postsCount')
      .sort({ followerCount: -1, postsCount: -1 })
      .limit(parseInt(limit))
      .lean();
    
    // Get follow status
    let followStatusMap = {};
    try {
      const ids = trending.map(u => u._id.toString());
      if (ids.length > 0) {
        followStatusMap = await FollowService.checkMultipleFollowStatus(req.user.id, ids);
      }
    } catch (e) {
      // Continue without follow status
    }
    
    const formattedResults = trending.map(user => {
      const followStatus = followStatusMap[user._id.toString()] || { isFollowing: false, followId: null };
      return formatSearchResult(user, followStatus);
    });
    
    res.json({
      results: formattedResults,
      type
    });
    
  } catch (err) {
    console.error('Get trending error:', err);
    res.status(500).json({ msg: 'Server error getting trending' });
  }
});

// ========================
// GET RECENT SEARCHES (for current user)
// ========================
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    // In production, this would come from Redis/localStorage
    // For now, return empty array
    res.json({ recentSearches: [] });
    
  } catch (err) {
    console.error('Get recent searches error:', err);
    res.status(500).json({ msg: 'Server error getting recent searches' });
  }
});

module.exports = router;

