/**
 * Frontend ZEGOCLOUD Service
 * Handles communication with backend ZEGOCLOUD API endpoints
 * and ZEGOCLOUD SDK initialization
 */

import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

class ZEGOFrontendService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    this.initialized = false;
    this.currentSession = null;
    this.zegoApp = null;
  }

  /**
   * Initialize ZEGOCLOUD with configuration
   */
  async initialize() {
    if (this.initialized) {
      return this.zegoApp;
    }

    try {
      // Get ZEGOCLOUD configuration from backend
      const config = await this.getConfig();
      
      if (!config.success) {
        throw new Error('Failed to get ZEGOCLOUD configuration');
      }

      console.log('ZEGOCLOUD configuration loaded:', config.config);
      this.initialized = true;
      return config.config;
      
    } catch (error) {
      console.error('ZEGOCLOUD initialization error:', error);
      throw new Error('Failed to initialize ZEGOCLOUD service');
    }
  }

  /**
   * Get ZEGOCLOUD configuration from backend
   */
  async getConfig() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/zego/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Get ZEGOCLOUD config error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate token for a live session
   * @param {string} sessionId - Live session ID
   * @param {string} role - 'host' or 'audience'
   */
  async generateToken(sessionId, role = 'audience') {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/zego/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          role
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to generate token');
      }

      const result = await response.json();
      console.log('Token generated successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Generate token error:', error);
      throw new Error(`Failed to generate streaming token: ${error.message}`);
    }
  }

  /**
   * Start a live stream (for hosts)
   * @param {string} sessionId - Live session ID
   */
  async startStream(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/zego/start-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to start stream');
      }

      const result = await response.json();
      console.log('Stream started successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Start stream error:', error);
      throw new Error(`Failed to start stream: ${error.message}`);
    }
  }

  /**
   * Join a live stream (for viewers)
   * @param {string} sessionId - Live session ID
   */
  async joinStream(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/zego/join-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to join stream');
      }

      const result = await response.json();
      console.log('Joined stream successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Join stream error:', error);
      throw new Error(`Failed to join stream: ${error.message}`);
    }
  }

  /**
   * Leave a live stream
   * @param {string} sessionId - Live session ID
   */
  async leaveStream(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/zego/leave-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to leave stream');
      }

      const result = await response.json();
      console.log('Left stream successfully:', result);
      return result;
      
    } catch (error) {
      console.error('Leave stream error:', error);
      throw new Error(`Failed to leave stream: ${error.message}`);
    }
  }

  /**
   * End a live stream (for hosts)
   * @param {string} sessionId - Live session ID
   */
  async endStream(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/zego/end-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to end stream');
      }

      const result = await response.json();
      console.log('Stream ended successfully:', result);
      return result;
      
    } catch (error) {
      console.error('End stream error:', error);
      throw new Error(`Failed to end stream: ${error.message}`);
    }
  }

  /**
   * Get stream statistics
   * @param {string} sessionId - Live session ID
   */
  async getStreamStats(sessionId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/api/zego/stats/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to get stream stats');
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Get stream stats error:', error);
      throw new Error(`Failed to get stream statistics: ${error.message}`);
    }
  }

  /**
   * Initialize ZEGOCLOUD SDK for streaming
   * @param {object} tokenData - Token data from backend
   * @param {object} options - ZEGOCLOUD options
   */
  async initZegoKit(tokenData, options = {}) {
    try {
      // Ensure we have the required data
      if (!tokenData.token || !tokenData.appId || !tokenData.roomId) {
        throw new Error('Missing required token data');
      }

      // Create a temporary element for ZEGOCLOUD
      const container = document.createElement('div');
      container.id = `zego-container-${Date.now()}`;
      container.style.width = '100%';
      container.style.height = '100%';
      
      // Default options for streaming
      const defaultOptions = {
        container,
        appID: tokenData.appId,
        serverSecret: "", // This is handled by ZEGOCLOUD internally
        token: tokenData.token,
        roomID: tokenData.roomId,
        // UI customization
        showScreenSharingButton: false,
        showRoomDetailsButton: false,
        // Audio/Video settings
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: false,
        defaultAudioOutputToSpeaker: true,
        // Quality settings
        videoResolution: options.quality || 'HD',
        videoCodec: options.videoCodec || 'VP8',
        // Branding
        companyName: 'AI Nexus',
        companyLogo: '/default-avatar.svg',
        // Layout settings
        layout: options.layout || 'top',
        // Features
        enableMultiRoom: false,
        enableMirrorMode: true,
        // Performance
        enableFpsStatistics: false,
        enableVideoConfigPanel: true,
        // Accessibility
        enableAccessibility: true,
        // Localization
        locale: navigator.language || 'en-US',
        // Custom styling
        themeColor: options.themeColor || '#3b82f6',
        brandColor: options.brandColor || '#1e40af',
        // Background
        backgroundColor: options.backgroundColor || '#ffffff',
        // Text colors
        textColor: options.textColor || '#000000',
        // Custom callback
        onUserJoin: options.onUserJoin || (() => {}),
        onUserLeave: options.onUserLeave || (() => {}),
        onRoomStateUpdate: options.onRoomStateUpdate || (() => {}),
        onConnectionStateChange: options.onConnectionStateChange || (() => {}),
        onRoomUserUpdate: options.onRoomUserUpdate || (() => {}),
        onRoomOnlineUserCountUpdate: options.onRoomOnlineUserCountUpdate || (() => {}),
        // Error handling
        onError: options.onError || ((error) => {
          console.error('ZEGOCLOUD error:', error);
        })
      };

      // Merge with provided options
      const zegoOptions = { ...defaultOptions, ...options };

      console.log('Initializing ZEGOCLOUD with options:', zegoOptions);

      // Initialize ZEGOCLOUD
      const zegoApp = await ZegoUIKitPrebuilt.create(zegoOptions);
      
      this.zegoApp = zegoApp;
      this.currentSession = tokenData.session;
      
      console.log('ZEGOCLOUD initialized successfully');
      
      return {
        app: zegoApp,
        container: container,
        session: tokenData.session
      };
      
    } catch (error) {
      console.error('ZEGOCLOUD kit initialization error:', error);
      throw new Error(`Failed to initialize ZEGOCLOUD: ${error.message}`);
    }
  }

  /**
   * Clean up ZEGOCLOUD resources
   */
  async cleanup() {
    try {
      if (this.zegoApp) {
        // Disconnect from the current room
        await this.zegoApp.disconnect();
        this.zegoApp = null;
      }
      
      this.currentSession = null;
      console.log('ZEGOCLOUD cleanup completed');
      
    } catch (error) {
      console.error('ZEGOCLOUD cleanup error:', error);
    }
  }

  /**
   * Check if user has permission to perform action
   * @param {string} userRole - User's role ('user' or 'company')
   * @param {string} action - Action to check ('host', 'join')
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
   * Get current ZEGOCLOUD app instance
   */
  getZegoApp() {
    return this.zegoApp;
  }

  /**
   * Get current session data
   */
  getCurrentSession() {
    return this.currentSession;
  }
}

// Export singleton instance
export default new ZEGOFrontendService();
