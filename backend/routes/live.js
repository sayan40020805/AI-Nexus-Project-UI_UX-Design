const express = require('express');
const LiveSession = require('../models/LiveSession');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========================
// GET ACTIVE LIVE SESSIONS
// ========================
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Get live and scheduled sessions
    const sessions = await LiveSession.find({
      status: { $in: ['live', 'scheduled'] }
    })
      .populate('streamer', 'username companyName profilePicture companyLogo role')
      .sort({ scheduledStart: 1 }) // Sort by scheduled time
      .limit(limit * 1)
      .skip(skip);
    
    const total = await LiveSession.countDocuments({
      status: { $in: ['live', 'scheduled'] }
    });
    
    res.json({
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Get live sessions error:', err);
    res.status(500).json({ msg: 'Server error getting live sessions' });
  }
});

// ========================
// CREATE NEW LIVE SESSION (COMPANIES ONLY)
// ========================
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Check if user is a company
    if (req.user.role !== 'company') {
      return res.status(403).json({ msg: 'Only companies can start live sessions' });
    }
    
    const { title, description, scheduledStart, category, quality } = req.body;
    
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }
    
    // If no scheduled start time provided, start immediately
    const startTime = scheduledStart ? new Date(scheduledStart) : new Date();
    
    // Create new live session
    const newSession = new LiveSession({
      streamer: req.user.id,
      title,
      description,
      scheduledStart: startTime,
      actualStart: startTime,
      status: startTime <= new Date() ? 'live' : 'scheduled',
      category: category || 'general',
      quality: quality || 'medium'
    });
    
    await newSession.save();
    
    // Populate streamer information
    await newSession.populate('streamer', 'username companyName profilePicture companyLogo role');
    
    res.status(201).json(newSession);
    
  } catch (err) {
    console.error('Create live session error:', err);
    res.status(500).json({ msg: 'Server error creating live session' });
  }
});

// ========================
// GET SPECIFIC LIVE SESSION
// ========================
router.get('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await LiveSession.findById(sessionId)
      .populate('streamer', 'username companyName profilePicture companyLogo role')
      .populate('viewers.user', 'username profilePicture');
    
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }
    
    res.json(session);
    
  } catch (err) {
    console.error('Get live session error:', err);
    res.status(500).json({ msg: 'Server error getting live session' });
  }
});

// ========================
// JOIN LIVE SESSION (VIEWER)
// ========================
router.post('/:sessionId/join', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await LiveSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }
    
    if (session.status !== 'live') {
      return res.status(400).json({ msg: 'Session is not currently live' });
    }
    
    // Check if user is already a viewer
    const existingViewer = session.viewers.find(
      viewer => viewer.user.toString() === req.user.id
    );
    
    if (!existingViewer) {
      // Add user as viewer
      session.viewers.push({ user: req.user.id });
      
      // Update max viewers if needed
      if (session.viewers.length > session.maxViewers) {
        session.maxViewers = session.viewers.length;
      }
      
      await session.save();
    }
    
    res.json({
      message: 'Joined live session successfully',
      sessionId,
      viewerCount: session.viewers.length
    });
    
  } catch (err) {
    console.error('Join live session error:', err);
    res.status(500).json({ msg: 'Server error joining live session' });
  }
});

// ========================
// LEAVE LIVE SESSION
// ========================
router.post('/:sessionId/leave', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await LiveSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }
    
    // Remove user from viewers
    session.viewers = session.viewers.filter(
      viewer => viewer.user.toString() !== req.user.id
    );
    
    // Set leftAt timestamp for the viewer who left
    const leftViewer = session.viewers.find(
      viewer => viewer.user.toString() === req.user.id
    );
    if (leftViewer) {
      leftViewer.leftAt = new Date();
    }
    
    await session.save();
    
    res.json({
      message: 'Left live session successfully',
      sessionId
    });
    
  } catch (err) {
    console.error('Leave live session error:', err);
    res.status(500).json({ msg: 'Server error leaving live session' });
  }
});

// ========================
// END LIVE SESSION (STREAMER ONLY)
// ========================
router.delete('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await LiveSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }
    
    // Check if user is the streamer
    if (session.streamer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the streamer can end this session' });
    }
    
    // Update session status
    session.status = 'ended';
    session.actualEnd = new Date();
    
    // Set leftAt for all current viewers
    session.viewers.forEach(viewer => {
      if (!viewer.leftAt) {
        viewer.leftAt = new Date();
      }
    });
    
    await session.save();
    
    res.json({ message: 'Live session ended successfully' });
    
  } catch (err) {
    console.error('End live session error:', err);
    res.status(500).json({ msg: 'Server error ending live session' });
  }
});

// ========================
// ADD CHAT MESSAGE TO LIVE SESSION
// ========================
router.post('/:sessionId/chat', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ msg: 'Chat message content is required' });
    }
    
    if (content.length > 200) {
      return res.status(400).json({ msg: 'Chat message cannot exceed 200 characters' });
    }
    
    const session = await LiveSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }
    
    if (session.status !== 'live') {
      return res.status(400).json({ msg: 'Cannot send messages to non-live session' });
    }
    
    // Add chat message
    session.chatMessages.push({
      user: req.user.id,
      content: content.trim()
    });
    
    await session.save();
    
    // Get the latest chat message with user info
    const latestMessage = session.chatMessages[session.chatMessages.length - 1];
    await latestMessage.populate('user', 'username profilePicture');
    
    res.status(201).json(latestMessage);
    
  } catch (err) {
    console.error('Add chat message error:', err);
    res.status(500).json({ msg: 'Server error adding chat message' });
  }
});

// ========================
// GET CHAT MESSAGES FOR LIVE SESSION
// ========================
router.get('/:sessionId/chat', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const session = await LiveSession.findById(sessionId)
      .populate('chatMessages.user', 'username profilePicture');
    
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }
    
    const skip = (page - 1) * limit;
    const chatMessages = session.chatMessages
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(skip, skip + limit)
      .reverse(); // Return in chronological order
    
    res.json({
      messages: chatMessages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(session.chatMessages.length / limit),
        total: session.chatMessages.length
      }
    });
    
  } catch (err) {
    console.error('Get chat messages error:', err);
    res.status(500).json({ msg: 'Server error getting chat messages' });
  }
});

// ========================
// GET LIVE SESSION STATISTICS
// ========================
router.get('/:sessionId/stats', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await LiveSession.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }
    
    const stats = {
      totalViewers: session.viewers.length,
      currentViewers: session.viewers.filter(v => !v.leftAt).length,
      maxViewers: session.maxViewers,
      chatMessagesCount: session.chatMessages.length,
      duration: session.actualStart && session.actualEnd 
        ? Math.round((session.actualEnd - session.actualStart) / 1000 / 60) // Duration in minutes
        : session.actualStart && session.status === 'live'
        ? Math.round((new Date() - session.actualStart) / 1000 / 60) // Live duration in minutes
        : 0
    };
    
    res.json(stats);
    
  } catch (err) {
    console.error('Get session stats error:', err);
    res.status(500).json({ msg: 'Server error getting session statistics' });
  }
});

// ========================
// GET USER'S LIVE SESSIONS (for streamer dashboard)
// ========================
router.get('/user/my-sessions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const sessions = await LiveSession.find({
      streamer: req.user.id
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    const total = await LiveSession.countDocuments({
      streamer: req.user.id
    });
    
    res.json({
      sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Get user sessions error:', err);
    res.status(500).json({ msg: 'Server error getting user sessions' });
  }
});

module.exports = router;
