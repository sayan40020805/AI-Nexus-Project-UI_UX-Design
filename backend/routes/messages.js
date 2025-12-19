const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ========================
// GET CONVERSATIONS (LIST OF CHATS)
// ========================
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    // Get all messages where current user is a participant
    const messages = await Message.find({
      participants: req.user.id
    })
      .populate('sender', 'username companyName profilePicture companyLogo role')
      .populate('recipient', 'username companyName profilePicture companyLogo role')
      .sort({ updatedAt: -1 });
    
    // Group messages by conversation (sender-recipient pair)
    const conversationMap = new Map();
    
    messages.forEach(message => {
      const otherUserId = message.sender._id.toString() === req.user.id 
        ? message.recipient._id.toString() 
        : message.sender._id.toString();
      
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          user: message.sender._id.toString() === req.user.id ? message.recipient : message.sender,
          lastMessage: message,
          unreadCount: 0
        });
      }
    });
    
    // Get unread count for each conversation
    const conversations = Array.from(conversationMap.values());
    
    for (let conv of conversations) {
      const unreadCount = await Message.countDocuments({
        participants: [req.user.id, conv.user._id],
        'readBy.user': { $ne: req.user.id },
        sender: { $ne: req.user.id }
      });
      conv.unreadCount = unreadCount;
    }
    
    res.json({ conversations });
    
  } catch (err) {
    console.error('Get conversations error:', err);
    res.status(500).json({ msg: 'Server error getting conversations' });
  }
});

// ========================
// GET MESSAGES WITH SPECIFIC USER
// ========================
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Check if the other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const skip = (page - 1) * limit;
    
    // Get messages between current user and specified user
    const messages = await Message.find({
      participants: { $all: [req.user.id, userId] }
    })
      .populate('sender', 'username companyName profilePicture companyLogo role')
      .populate('recipient', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    // Mark messages as read
    await Message.updateMany(
      {
        participants: { $all: [req.user.id, userId] },
        sender: userId,
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      }
    );
    
    // Get total count for pagination
    const total = await Message.countDocuments({
      participants: { $all: [req.user.id, userId] }
    });
    
    res.json({
      messages: messages.reverse(), // Return in chronological order
      otherUser,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Get messages error:', err);
    res.status(500).json({ msg: 'Server error getting messages' });
  }
});

// ========================
// SEND MESSAGE
// ========================
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientId, content, type = 'text', attachments } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ msg: 'Recipient ID and content are required' });
    }
    
    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ msg: 'Recipient not found' });
    }
    
    // Prevent sending message to self
    if (recipientId === req.user.id) {
      return res.status(400).json({ msg: 'Cannot send message to yourself' });
    }
    
    // Create new message
    const newMessage = new Message({
      participants: [req.user.id, recipientId],
      content,
      sender: req.user.id,
      recipient: recipientId,
      type,
      attachments: attachments || []
    });
    
    await newMessage.save();
    
    // Populate sender and recipient information
    await newMessage.populate('sender', 'username companyName profilePicture companyLogo role');
    await newMessage.populate('recipient', 'username companyName profilePicture companyLogo role');
    
    res.status(201).json(newMessage);
    
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ msg: 'Server error sending message' });
  }
});

// ========================
// MARK MESSAGES AS READ
// ========================
router.put('/read/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Message.updateMany(
      {
        participants: { $all: [req.user.id, userId] },
        sender: userId,
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: {
          readBy: {
            user: req.user.id,
            readAt: new Date()
          }
        }
      }
    );
    
    res.json({ message: 'Messages marked as read' });
    
  } catch (err) {
    console.error('Mark messages as read error:', err);
    res.status(500).json({ msg: 'Server error marking messages as read' });
  }
});

// ========================
// GET UNREAD MESSAGE COUNT
// ========================
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      participants: req.user.id,
      'readBy.user': { $ne: req.user.id },
      sender: { $ne: req.user.id }
    });
    
    res.json({ unreadCount });
    
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ msg: 'Server error getting unread count' });
  }
});

// ========================
// DELETE MESSAGE (Soft delete - only for sender)
// ========================
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    
    // Only sender can delete their own message
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this message' });
    }
    
    // Soft delete by clearing content
    message.content = '[Message deleted]';
    message.type = 'system';
    await message.save();
    
    res.json({ message: 'Message deleted successfully' });
    
  } catch (err) {
    console.error('Delete message error:', err);
    res.status(500).json({ msg: 'Server error deleting message' });
  }
});

// ========================
// SEARCH MESSAGES
// ========================
router.get('/search/:query', authMiddleware, async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const skip = (page - 1) * limit;
    const searchRegex = new RegExp(query.trim(), 'i');
    
    // Search messages where current user is a participant
    const messages = await Message.find({
      participants: req.user.id,
      content: searchRegex,
      type: { $ne: 'system' } // Exclude deleted messages
    })
      .populate('sender', 'username companyName profilePicture companyLogo role')
      .populate('recipient', 'username companyName profilePicture companyLogo role')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);
    
    const total = await Message.countDocuments({
      participants: req.user.id,
      content: searchRegex,
      type: { $ne: 'system' }
    });
    
    res.json({
      messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
    
  } catch (err) {
    console.error('Search messages error:', err);
    res.status(500).json({ msg: 'Server error searching messages' });
  }
});

module.exports = router;
