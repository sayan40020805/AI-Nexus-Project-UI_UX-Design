const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

/**
 * ChatService - Centralized chat operations
 * Provides methods for message handling, conversation management, and search
 */
class ChatService {

  /**
   * Search for users and companies for chat
   * @param {string} query - Search query
   * @param {string} currentUserId - ID of current user
   * @returns {Array} Array of users/companies for chat
   */
  static async searchForChat(query, currentUserId) {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      // Create search regex for partial, case-insensitive matching
      const searchRegex = new RegExp(query.trim(), 'i');
      
      // Search for users and companies, excluding current user
      const users = await User.find({
        _id: { $ne: currentUserId },
        $or: [
          { username: searchRegex },
          { companyName: searchRegex }
        ]
      })
      .select('username companyName profilePicture companyLogo role bio')
      .limit(10)
      .sort({ createdAt: -1 });

      // Format results for chat search
      return users.map(user => {
        if (user.role === 'user') {
          return {
            id: user._id,
            type: 'user',
            name: user.username,
            displayName: user.username,
            profilePicture: user.profilePicture,
            bio: user.bio || 'AI enthusiast',
            isOnline: false, // Will be populated by socket status
            lastSeen: null,
            unreadCount: 0
          };
        } else {
          return {
            id: user._id,
            type: 'company',
            name: user.companyName,
            displayName: user.companyName,
            profilePicture: user.companyLogo,
            bio: user.companyDescription || 'AI company',
            isOnline: false, // Will be populated by socket status
            lastSeen: null,
            unreadCount: 0
          };
        }
      });

    } catch (error) {
      console.error('ChatService.searchForChat error:', error);
      throw new Error('Failed to search for chat users');
    }
  }

  /**
   * Find or create conversation between two users
   * @param {string} userId1 - First user ID
   * @param {string} userId2 - Second user ID
   * @returns {Object} Conversation object with populated participants
   */
  static async findOrCreateConversation(userId1, userId2) {
    try {
      if (!userId1 || !userId2) {
        throw new Error('Both user IDs are required');
      }

      if (userId1 === userId2) {
        throw new Error('Cannot create conversation with yourself');
      }

      // Check if both users exist
      const [user1, user2] = await Promise.all([
        User.findById(userId1),
        User.findById(userId2)
      ]);

      if (!user1 || !user2) {
        throw new Error('One or both users not found');
      }

      // Find or create conversation
      const conversation = await Conversation.findOrCreateConversation(userId1, userId2);
      
      return conversation;

    } catch (error) {
      console.error('ChatService.findOrCreateConversation error:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages with pagination
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   * @param {number} page - Page number
   * @param {number} limit - Messages per page
   * @returns {Object} Messages with pagination info
   */
  static async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    try {
      // Find conversation and verify user participation
      const conversation = await Conversation.findOne({ 
        conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Get messages between the two participants
      const messages = await Message.find({
        $or: [
          { sender: userId, receiver: { $in: conversation.participants.filter(p => p.toString() !== userId) } },
          { receiver: userId, sender: { $in: conversation.participants.filter(p => p.toString() !== userId) } }
        ],
        deletedBy: { $ne: { user: userId } }
      })
      .populate('sender', 'username companyName profilePicture companyLogo role')
      .populate('receiver', 'username companyName profilePicture companyLogo role')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

      // Get total count for pagination
      const total = await Message.countDocuments({
        $or: [
          { sender: userId, receiver: { $in: conversation.participants.filter(p => p.toString() !== userId) } },
          { receiver: userId, sender: { $in: conversation.participants.filter(p => p.toString() !== userId) } }
        ],
        deletedBy: { $ne: { user: userId } }
      });

      // Mark messages as read for current user
      await Message.updateMany(
        {
          receiver: userId,
          sender: { $in: conversation.participants.filter(p => p.toString() !== userId) },
          readAt: null
        },
        { readAt: new Date(), status: 'read' }
      );

      // Reset unread count for current user
      await conversation.markAsRead(userId);

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        conversation: {
          id: conversation.conversationId,
          participants: conversation.participants,
          lastActivity: conversation.lastActivity
        }
      };

    } catch (error) {
      console.error('ChatService.getConversationMessages error:', error);
      throw error;
    }
  }

  /**
   * Send a message
   * @param {string} senderId - Sender user ID
   * @param {string} receiverId - Receiver user ID
   * @param {string} content - Message content
   * @param {string} messageType - Message type (text, image, file)
   * @returns {Object} Created message
   */
  static async sendMessage(senderId, receiverId, content, messageType = 'text') {
    try {
      if (!senderId || !receiverId || !content) {
        throw new Error('Sender ID, receiver ID, and content are required');
      }

      // Check if users exist
      const [sender, receiver] = await Promise.all([
        User.findById(senderId),
        User.findById(receiverId)
      ]);

      if (!sender || !receiver) {
        throw new Error('Sender or receiver not found');
      }

      // Find or create conversation
      const conversation = await Conversation.findOrCreateConversation(senderId, receiverId);

      // Create message
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content: content.trim(),
        messageType
      });

      await message.save();

      // Populate message
      await message.populate([
        { path: 'sender', select: 'username companyName profilePicture companyLogo role' },
        { path: 'receiver', select: 'username companyName profilePicture companyLogo role' }
      ]);

      // Update conversation with last message and increment unread count
      conversation.lastMessage = message._id;
      await conversation.updateLastActivity();
      await conversation.incrementUnreadCount(receiverId);
      await conversation.save();

      return {
        message,
        conversation
      };

    } catch (error) {
      console.error('ChatService.sendMessage error:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   * @param {string} messageId - Specific message ID (optional)
   * @returns {Object} Update result
   */
  static async markMessagesAsRead(conversationId, userId, messageId = null) {
    try {
      const conversation = await Conversation.findOne({ 
        conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      let updateQuery;
      if (messageId) {
        // Mark specific message as read
        updateQuery = {
          _id: messageId,
          receiver: userId,
          readAt: null
        };
      } else {
        // Mark all unread messages as read
        const otherParticipant = conversation.getOtherParticipant(userId);
        updateQuery = {
          receiver: userId,
          sender: otherParticipant._id,
          readAt: null
        };
      }

      const result = await Message.updateMany(updateQuery, {
        readAt: new Date(),
        status: 'read'
      });

      // Reset unread count
      await conversation.markAsRead(userId);

      return {
        success: true,
        updatedCount: result.modifiedCount
      };

    } catch (error) {
      console.error('ChatService.markMessagesAsRead error:', error);
      throw error;
    }
  }

  /**
   * Get user's conversations list
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Conversations per page
   * @returns {Object} Conversations with pagination
   */
  static async getUserConversations(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const conversations = await Conversation.find({
        participants: { $in: [userId] },
        'settings.isArchived': { $ne: true }
      })
      .populate('participants', 'username companyName profilePicture companyLogo role')
      .populate('lastMessage')
      .sort({ lastActivity: -1 })
      .limit(limit)
      .skip(skip);

      // Get total count
      const total = await Conversation.countDocuments({
        participants: { $in: [userId] },
        'settings.isArchived': { $ne: true }
      });

      // Format conversations for frontend
      const formattedConversations = conversations.map(conv => {
        const otherParticipant = conv.getOtherParticipant(userId);
        const unreadCount = conv.unreadCounts.get(userId.toString()) || 0;

        return {
          id: conv.conversationId,
          participant: otherParticipant,
          lastMessage: conv.lastMessage ? {
            id: conv.lastMessage._id,
            content: conv.lastMessage.content,
            sender: conv.lastMessage.sender._id,
            createdAt: conv.lastMessage.createdAt,
            status: conv.lastMessage.status,
            readAt: conv.lastMessage.readAt
          } : null,
          unreadCount,
          isOnline: conv.onlineStatus.get(otherParticipant._id.toString())?.isOnline || false,
          lastSeen: conv.onlineStatus.get(otherParticipant._id.toString())?.lastSeen || null,
          lastActivity: conv.lastActivity,
          messageCount: conv.messageCount,
          isTyping: conv.typingStatus.get(otherParticipant._id.toString())?.isTyping || false
        };
      });

      return {
        conversations: formattedConversations,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('ChatService.getUserConversations error:', error);
      throw error;
    }
  }

  /**
   * Delete a message (soft delete)
   * @param {string} messageId - Message ID
   * @param {string} userId - Current user ID
   * @returns {Object} Deletion result
   */
  static async deleteMessage(messageId, userId) {
    try {
      const message = await Message.findById(messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      // Check if user can delete this message (sender or receiver)
      if (message.sender.toString() !== userId.toString() && 
          message.receiver.toString() !== userId.toString()) {
        throw new Error('Not authorized to delete this message');
      }

      // Add user to deletedBy array if not already there
      const alreadyDeleted = message.deletedBy.some(del => del.user.toString() === userId.toString());
      if (!alreadyDeleted) {
        message.deletedBy.push({
          user: userId,
          deletedAt: new Date()
        });
        await message.save();
      }

      return { success: true, message: 'Message deleted successfully' };

    } catch (error) {
      console.error('ChatService.deleteMessage error:', error);
      throw error;
    }
  }

  /**
   * Archive a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID
   * @returns {Object} Archive result
   */
  static async archiveConversation(conversationId, userId) {
    try {
      const conversation = await Conversation.findOne({ 
        conversationId,
        participants: { $in: [userId] }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      await conversation.archive(userId);

      return { success: true, message: 'Conversation archived successfully' };

    } catch (error) {
      console.error('ChatService.archiveConversation error:', error);
      throw error;
    }
  }

  /**
   * Get unread message count for user
   * @param {string} userId - User ID
   * @returns {number} Total unread count
   */
  static async getUnreadCount(userId) {
    try {
      const conversations = await Conversation.find({
        participants: { $in: [userId] }
      });

      let totalUnread = 0;
      conversations.forEach(conv => {
        totalUnread += conv.unreadCounts.get(userId.toString()) || 0;
      });

      return totalUnread;

    } catch (error) {
      console.error('ChatService.getUnreadCount error:', error);
      return 0;
    }
  }
}

module.exports = ChatService;
