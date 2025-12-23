const crypto = require('crypto');

/**
 * ZEGOCLOUD Service for token generation and streaming management
 * This service handles the secure communication with ZEGOCLOUD API
 * ServerSecret must NEVER be exposed to frontend
 */

class ZEGOService {
  constructor() {
    this.appId = process.env.ZEGO_APP_ID;
    this.serverSecret = process.env.ZEGO_SERVER_SECRET;
    
    if (!this.appId || !this.serverSecret) {
      throw new Error('ZEGOCLOUD credentials not found in environment variables');
    }
  }

  /**
   * Generate ZEGOCLOUD token for user authentication
   * @param {string} userId - Unique user identifier
   * @param {string} roomId - Unique room identifier for the streaming session
   * @param {string} role - 'host' for streamers, 'audience' for viewers
   * @param {number} expireTime - Token expiration time in seconds (default 24 hours)
   * @returns {string} ZEGOCLOUD token
   */
  generateToken(userId, roomId, role = 'audience', expireTime = 86400) {
    try {
      // Generate timestamp for token
      const timestamp = Math.floor(Date.now() / 1000);
      const expireTimeStamp = timestamp + expireTime;

      // Create the token payload
      const payload = {
        app_id: parseInt(this.appId),
        room_id: roomId,
        user_id: userId,
        privilege: {
          1: role === 'host' ? 1 : 0, // Publish privilege (1=allowed, 0=not allowed)
          2: 1 // Subscribe privilege (always allowed)
        },
        expire_time: expireTimeStamp
      };

      // Convert payload to JSON string and encode
      const payloadStr = JSON.stringify(payload);
      const encodedPayload = Buffer.from(payloadStr).toString('base64');

      // Create signature
      const message = encodedPayload + this.serverSecret;
      const signature = crypto
        .createHash('sha256')
        .update(message)
        .digest('hex');

      // Combine to create final token
      const token = `${encodedPayload}.${signature}`;
      
      console.log(`ZEGOCLOUD token generated for user ${userId}, room ${roomId}, role: ${role}`);
      return token;

    } catch (error) {
      console.error('ZEGOCLOUD token generation error:', error);
      throw new Error('Failed to generate ZEGOCLOUD token');
    }
  }

  /**
   * Validate token before use
   * @param {string} token - ZEGOCLOUD token to validate
   * @returns {boolean} True if token is valid
   */
  validateToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) {
        return false;
      }

      const [encodedPayload, signature] = parts;
      const message = encodedPayload + this.serverSecret;
      const expectedSignature = crypto
        .createHash('sha256')
        .update(message)
        .digest('hex');

      // Verify signature
      if (signature !== expectedSignature) {
        return false;
      }

      // Decode and check payload
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64').toString());
      
      // Check expiration
      if (payload.expire_time && payload.expire_time < Math.floor(Date.now() / 1000)) {
        return false;
      }

      return true;

    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Generate unique room ID for live streaming session
   * @param {string} sessionId - MongoDB session ID
   * @returns {string} ZEGOCLOUD room ID
   */
  generateRoomId(sessionId) {
    // Use the MongoDB session ID as the base, prefixed with 'zego_'
    return `zego_${sessionId}`;
  }

  /**
   * Get ZEGOCLOUD configuration
   * @returns {object} Configuration for frontend
   */
  getConfig() {
    return {
      appId: this.appId,
      // Never expose serverSecret to frontend
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Check if user has permission to perform action
   * @param {string} userRole - User's role ('user' or 'company')
   * @param {string} action - Action to check ('host', 'join')
   * @returns {boolean} True if user has permission
   */
  hasPermission(userRole, action) {
    switch (action) {
      case 'host':
        return userRole === 'company';
      case 'join':
        return true; // All authenticated users can join
      default:
        return false;
    }
  }

  /**
   * Create room configuration for ZEGOCLOUD
   * @param {object} sessionData - Live session data
   * @returns {object} Room configuration
   */
  createRoomConfig(sessionData) {
    return {
      roomID: this.generateRoomId(sessionData._id),
      roomName: sessionData.title,
      config: {
        maxUserCount: 1000, // Maximum concurrent users
        enableCamera: true,
        enableMicrophone: true,
        enableScreenShare: sessionData.quality === 'hd',
        enableChat: true,
        enableBeauty: false,
        enableWatermark: false
      }
    };
  }
}

module.exports = new ZEGOService();
