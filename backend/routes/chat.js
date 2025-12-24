const express = require('express');
const ChatService = require('../services/chatService');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * All chat routes require authentication
 */
router.use(authMiddleware);

/**
 * @route GET /api/chat/search
 * @desc Search for users and companies for chat
 * @access Private
 */
router.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    const userId = req.user.id;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }

    if (query.length < 2) {
      return res.status(400).json({ msg: 'Search query must be at least 2 characters' });
    }

    const results = await ChatService.searchForChat(query, userId);

    res.json({
      results,
      query: query.trim(),
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Chat search error:', err);
    res.status(500).json({ msg: 'Server error during chat search' });
  }
});

/**
 * @route GET /api/chat/conversations
 * @desc Get user's conversations list
 * @access Private
 */
router.get('/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const result = await ChatService.getUserConversations(userId, page, limit);

    res.json({
      ...result,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ msg: 'Server error fetching conversations' });
  }
});

/**
 * @route GET /api/chat/:conversationId
 * @desc Get conversation messages with pagination
 * @access Private
 */
router.get('/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ msg: 'Conversation ID is required' });
    }

    const result = await ChatService.getConversationMessages(conversationId, userId, page, limit);

    res.json({
      ...result,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Get messages error:', err);
    
    if (err.message === 'Conversation not found or access denied') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    res.status(500).json({ msg: 'Server error fetching messages' });
  }
});

/**
 * @route POST /api/chat/send
 * @desc Send a message
 * @access Private
 */
router.post('/send', async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({ msg: 'Receiver ID and content are required' });
    }

    if (!content.trim()) {
      return res.status(400).json({ msg: 'Message content cannot be empty' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ msg: 'Message cannot exceed 1000 characters' });
    }

    const result = await ChatService.sendMessage(senderId, receiverId, content, messageType);

    // Emit socket event for real-time delivery
    if (req.io) {
      req.io.to(`user_${receiverId}`).emit('newMessage', {
        message: result.message,
        conversation: result.conversation
      });
    }

    res.status(201).json({
      success: true,
      message: result.message,
      conversation: result.conversation,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Send message error:', err);
    
    if (err.message === 'Cannot create conversation with yourself') {
      return res.status(400).json({ msg: 'Cannot send message to yourself' });
    }
    
    if (err.message === 'Sender or receiver not found') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).json({ msg: 'Server error sending message' });
  }
});

/**
 * @route PUT /api/chat/read/:conversationId
 * @desc Mark messages as read
 * @access Private
 */
router.put('/read/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageId } = req.body;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ msg: 'Conversation ID is required' });
    }

    const result = await ChatService.markMessagesAsRead(conversationId, userId, messageId);

    // Emit socket event for read receipt
    if (req.io && messageId) {
      req.io.to(`conversation_${conversationId}`).emit('messageRead', {
        messageId,
        readBy: userId,
        readAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Mark as read error:', err);
    
    if (err.message === 'Conversation not found or access denied') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    res.status(500).json({ msg: 'Server error marking messages as read' });
  }
});

/**
 * @route DELETE /api/chat/message/:messageId
 * @desc Delete a message (soft delete)
 * @access Private
 */
router.delete('/message/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    if (!messageId) {
      return res.status(400).json({ msg: 'Message ID is required' });
    }

    const result = await ChatService.deleteMessage(messageId, userId);

    // Emit socket event for message deletion
    if (req.io) {
      req.io.to(`user_${userId}`).emit('messageDeleted', {
        messageId,
        deletedBy: userId,
        deletedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Delete message error:', err);
    
    if (err.message === 'Message not found') {
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    if (err.message === 'Not authorized to delete this message') {
      return res.status(403).json({ msg: 'Not authorized to delete this message' });
    }
    
    res.status(500).json({ msg: 'Server error deleting message' });
  }
});

/**
 * @route PUT /api/chat/archive/:conversationId
 * @desc Archive a conversation
 * @access Private
 */
router.put('/archive/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ msg: 'Conversation ID is required' });
    }

    const result = await ChatService.archiveConversation(conversationId, userId);

    // Emit socket event for conversation archive
    if (req.io) {
      req.io.to(`conversation_${conversationId}`).emit('conversationArchived', {
        conversationId,
        archivedBy: userId,
        archivedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Archive conversation error:', err);
    
    if (err.message === 'Conversation not found or access denied') {
      return res.status(404).json({ msg: 'Conversation not found' });
    }
    
    res.status(500).json({ msg: 'Server error archiving conversation' });
  }
});

/**
 * @route GET /api/chat/unread-count
 * @desc Get total unread message count for user
 * @access Private
 */
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await ChatService.getUnreadCount(userId);

    res.json({
      unreadCount,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ msg: 'Server error fetching unread count' });
  }
});

module.exports = router;
