const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========================
// GLOBAL SEARCH (USERS & COMPANIES)
// ========================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { q: query, type, page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    if (query.length < 2) {
      return res.status(400).json({ msg: 'Search query must be at least 2 characters' });
    }
    
    // Create search regex for partial, case-insensitive matching
    const searchRegex = new RegExp(query.trim(), 'i');
    
    let filter = {
      _id: { $ne: req.user.id }, // Exclude current user
      $or: [
        { username: searchRegex },
        { companyName: searchRegex }
      ]
    };
    
    // Filter by type if specified
    if (type && ['user', 'company'].includes(type)) {
      filter.role = type;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Execute search
    const results = await User.find(filter)
      .select('username companyName profilePicture companyLogo role createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Format results
    const formattedResults = results.map(user => {
      if (user.role === 'user') {
        return {
          id: user._id,
          type: 'user',
          name: user.username,
          profilePicture: user.profilePicture,
          createdAt: user.createdAt,
          // Add additional user fields if needed
        };
      } else {
        return {
          id: user._id,
          type: 'company',
          name: user.companyName,
          profilePicture: user.companyLogo,
          createdAt: user.createdAt,
          // Add additional company fields if needed
        };
      }
    });
    
    res.json({
      results: formattedResults,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      },
      query: query.trim(),
      searchType: type || 'all'
    });
    
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ msg: 'Server error during search' });
  }
});

// ========================
// SEARCH SUGGESTIONS (for autocomplete)
// ========================
router.get('/suggestions', authMiddleware, async (req, res) => {
  try {
    const { q: query, limit = 5 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.json({ suggestions: [] });
    }
    
    if (query.length < 1) {
      return res.json({ suggestions: [] });
    }
    
    // Create search regex for partial, case-insensitive matching
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const filter = {
      _id: { $ne: req.user.id }, // Exclude current user
      $or: [
        { username: searchRegex },
        { companyName: searchRegex }
      ]
    };
    
    // Execute search for suggestions
    const results = await User.find(filter)
      .select('username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Format results for suggestions
    const suggestions = results.map(user => {
      if (user.role === 'user') {
        return {
          id: user._id,
          type: 'user',
          name: user.username,
          avatar: user.profilePicture,
          displayText: user.username
        };
      } else {
        return {
          id: user._id,
          type: 'company',
          name: user.companyName,
          avatar: user.companyLogo,
          displayText: user.companyName
        };
      }
    });
    
    res.json({ suggestions });
    
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
    const { q: query, page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    // Create search regex for partial, case-insensitive matching
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const filter = {
      _id: { $ne: req.user.id }, // Exclude current user
      role: 'user',
      username: searchRegex
    };
    
    const skip = (page - 1) * limit;
    
    const results = await User.find(filter)
      .select('username profilePicture createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      results,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
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
    const { q: query, page = 1, limit = 10 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    // Create search regex for partial, case-insensitive matching
    const searchRegex = new RegExp(query.trim(), 'i');
    
    const filter = {
      _id: { $ne: req.user.id }, // Exclude current user
      role: 'company',
      companyName: searchRegex
    };
    
    const skip = (page - 1) * limit;
    
    const results = await User.find(filter)
      .select('companyName companyLogo companyDescription createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      results,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Search companies error:', err);
    res.status(500).json({ msg: 'Server error searching companies' });
  }
});

module.exports = router;
