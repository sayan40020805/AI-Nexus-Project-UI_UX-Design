const express = require('express');
const zegoService = require('../services/zegoService');
const LiveSession = require('../models/LiveSession');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

/**
 * ZEGOCLOUD Token Generation and Streaming Management
 * These routes handle the secure communication with ZEGOCLOUD
 * All sensitive operations happen on the backend only
 */

// ========================
// GENERATE ZEGOCLOUD TOKEN
// ========================
// POST /api/zego/token
router.post('/token', authMiddleware, async (req, res) => {
  try {
    const { sessionId, role = 'audience' } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }

    // Check if ZEGOCLOUD is configured
    const config = zegoService.getConfig();
    if (!config.enabled) {
      return res.status(503).json({ 
        msg: 'Live streaming is currently unavailable',
        error: config.message,
        zegoConfigured: false
      });
    }

    // Validate user has permission for this action
    if (!zegoService.hasPermission(req.user.role, role === 'host' ? 'host' : 'join')) {
      return res.status(403).json({ msg: 'Insufficient permissions for this action' });
    }

    // Find the live session
    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }

    // Generate unique room ID for ZEGOCLOUD
    const roomId = zegoService.generateRoomId(sessionId);
    
    // Generate ZEGOCLOUD token
    const token = zegoService.generateToken(
      req.user.id, // userId
      roomId,       // roomId
      role,         // role: 'host' or 'audience'
      86400         // 24 hours expiration
    );

    console.log(`Token generated for user ${req.user.id}, session ${sessionId}, role ${role}`);

    res.json({
      success: true,
      token,
      roomId,
      appId: config.appId,
      environment: config.environment,
      session: {
        id: session._id,
        title: session.title,
        status: session.status,
        streamer: session.streamer
      }
    });

  } catch (error) {
    console.error('ZEGOCLOUD token generation error:', error);
    res.status(500).json({ msg: 'Failed to generate streaming token' });
  }
});

// ========================
// GET ZEGOCLOUD CONFIG
// ========================
// GET /api/zego/config
router.get('/config', authMiddleware, async (req, res) => {
  try {
    const config = zegoService.getConfig();
    res.json({
      success: true,
      config: {
        enabled: config.enabled || false,
        appId: config.appId || null,
        environment: config.environment,
        message: config.message
        // Never expose serverSecret
      }
    });
  } catch (error) {
    console.error('ZEGOCLOUD config error:', error);
    res.status(500).json({ msg: 'Failed to get streaming configuration' });
  }
});

// ========================
// START LIVE STREAM (COMPANY ONLY)
// ========================
// POST /api/zego/start-stream
router.post('/start-stream', authMiddleware, async (req, res) => {
  try {
    // Only companies can start streams
    if (req.user.role !== 'company') {
      return res.status(403).json({ msg: 'Only companies can start live streams' });
    }

    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }

    // Check if ZEGOCLOUD is configured
    const config = zegoService.getConfig();
    if (!config.enabled) {
      return res.status(503).json({ 
        msg: 'Live streaming is currently unavailable',
        error: config.message,
        zegoConfigured: false
      });
    }

    // Find and validate the session
    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }

    // Check if user owns this session
    if (session.streamer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'You can only start your own streams' });
    }

    // Generate ZEGOCLOUD token for hosting
    const roomId = zegoService.generateRoomId(sessionId);
    const token = zegoService.generateToken(
      req.user.id,
      roomId,
      'host', // Host role
      86400   // 24 hours
    );

    // Update session status to live if not already
    if (session.status !== 'live') {
      session.status = 'live';
      session.actualStart = new Date();
      await session.save();
    }

    // Broadcast to connected clients that stream started
    const io = req.app.get('io');
    if (io) {
      io.emit('stream-started', {
        sessionId,
        title: session.title,
        streamer: session.streamer
      });
    }

    console.log(`Stream started by company ${req.user.id} for session ${sessionId}`);

    res.json({
      success: true,
      message: 'Live stream started successfully',
      token,
      roomId,
      appId: config.appId,
      environment: config.environment,
      session: {
        id: session._id,
        title: session.title,
        status: session.status,
        streamer: session.streamer
      }
    });

  } catch (error) {
    console.error('Start stream error:', error);
    res.status(500).json({ msg: 'Failed to start live stream' });
  }
});

// ========================
// JOIN LIVE STREAM
// ========================
// POST /api/zego/join-stream
router.post('/join-stream', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }

    // Check if ZEGOCLOUD is configured
    const config = zegoService.getConfig();
    if (!config.enabled) {
      return res.status(503).json({ 
        msg: 'Live streaming is currently unavailable',
        error: config.message,
        zegoConfigured: false
      });
    }

    // Find the session
    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }

    // Check if session is live
    if (session.status !== 'live') {
      return res.status(400).json({ msg: 'Session is not currently live' });
    }

    // Generate token for audience
    const roomId = zegoService.generateRoomId(sessionId);
    const token = zegoService.generateToken(
      req.user.id,
      roomId,
      'audience', // Audience role
      86400       // 24 hours
    );

    // Add user as viewer in the session
    const existingViewer = session.viewers.find(
      viewer => viewer.user.toString() === req.user.id
    );

    if (!existingViewer) {
      session.viewers.push({ user: req.user.id });
      
      // Update max viewers if needed
      if (session.viewers.length > session.maxViewers) {
        session.maxViewers = session.viewers.length;
      }
      
      await session.save();

      // Broadcast viewer count update
      const io = req.app.get('io');
      if (io) {
        io.to(`stream_${sessionId}`).emit('viewer-count-update', {
          sessionId,
          viewerCount: session.viewers.length,
          maxViewers: session.maxViewers
        });
      }
    }

    console.log(`User ${req.user.id} joined stream ${sessionId}`);

    res.json({
      success: true,
      message: 'Joined live stream successfully',
      token,
      roomId,
      appId: config.appId,
      environment: config.environment,
      session: {
        id: session._id,
        title: session.title,
        status: session.status,
        streamer: session.streamer,
        viewerCount: session.viewers.length,
        maxViewers: session.maxViewers
      }
    });

  } catch (error) {
    console.error('Join stream error:', error);
    res.status(500).json({ msg: 'Failed to join live stream' });
  }
});

// ========================
// LEAVE LIVE STREAM
// ========================
// POST /api/zego/leave-stream
router.post('/leave-stream', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }

    // Find the session
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

    // Broadcast viewer count update
    const io = req.app.get('io');
    if (io) {
      io.to(`stream_${sessionId}`).emit('viewer-count-update', {
        sessionId,
        viewerCount: session.viewers.filter(v => !v.leftAt).length,
        maxViewers: session.maxViewers
      });
    }

    console.log(`User ${req.user.id} left stream ${sessionId}`);

    res.json({
      success: true,
      message: 'Left live stream successfully'
    });

  } catch (error) {
    console.error('Leave stream error:', error);
    res.status(500).json({ msg: 'Failed to leave live stream' });
  }
});

// ========================
// END LIVE STREAM (HOST ONLY)
// ========================
// POST /api/zego/end-stream
router.post('/end-stream', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ msg: 'Session ID is required' });
    }

    // Find the session
    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }

    // Check if user is the streamer (host)
    if (session.streamer.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Only the host can end this stream' });
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

    // Broadcast stream ended to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('stream-ended', {
        sessionId,
        endedBy: req.user.id,
        endTime: new Date()
      });
    }

    console.log(`Stream ended by host ${req.user.id} for session ${sessionId}`);

    res.json({
      success: true,
      message: 'Live stream ended successfully'
    });

  } catch (error) {
    console.error('End stream error:', error);
    res.status(500).json({ msg: 'Failed to end live stream' });
  }
});

// ========================
// GET STREAM STATISTICS
// ========================
// GET /api/zego/stats/:sessionId
router.get('/stats/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await LiveSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ msg: 'Live session not found' });
    }

    const currentViewers = session.viewers.filter(v => !v.leftAt).length;
    
    const stats = {
      sessionId,
      title: session.title,
      status: session.status,
      viewerCount: currentViewers,
      maxViewers: session.maxViewers,
      chatMessagesCount: session.chatMessages.length,
      duration: session.actualStart && session.actualEnd 
        ? Math.round((session.actualEnd - session.actualStart) / 1000 / 60) // Duration in minutes
        : session.actualStart && session.status === 'live'
        ? Math.round((new Date() - session.actualStart) / 1000 / 60) // Live duration in minutes
        : 0
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stream stats error:', error);
    res.status(500).json({ msg: 'Failed to get stream statistics' });
  }
});

module.exports = router;
