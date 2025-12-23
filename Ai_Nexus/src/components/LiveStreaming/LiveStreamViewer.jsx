import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import zegoService from '../../services/zegoService';
import { Video, VideoOff, Mic, MicOff, Volume2, VolumeX, Users, Clock } from 'lucide-react';

const LiveStreamViewer = ({ sessionId, onError, onDisconnect }) => {
  const { user } = useAuth();
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected
  const [streamDuration, setStreamDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const streamContainerRef = useRef(null);
  const zegoAppRef = useRef(null);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    // Initialize ZEGOCLOUD service
    const initializeZego = async () => {
      try {
        await zegoService.initialize();
      } catch (err) {
        setError('Failed to initialize streaming service');
        onError && onError(err);
      }
    };

    initializeZego();

    // Cleanup on unmount
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (zegoAppRef.current) {
        zegoService.cleanup();
      }
    };
  }, []);

  const joinStream = async () => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    setIsLoading(true);
    setError('');
    setConnectionStatus('connecting');

    try {
      // Join the stream via backend
      const result = await zegoService.joinStream(sessionId);
      
      if (!result.success) {
        throw new Error(result.msg || 'Failed to join stream');
      }

      setStreamData(result);

      // Initialize ZEGOCLOUD with the token data
      const zegoResult = await zegoService.initZegoKit(result, {
        // Viewer-specific options
        turnOnCameraWhenJoining: false, // Viewers don't need camera
        turnOnMicrophoneWhenJoining: false, // Viewers don't need mic by default
        showScreenSharingButton: false,
        showRoomDetailsButton: true,
        layout: 'top',
        themeColor: '#3b82f6',
        brandColor: '#1e40af',
        // Auto-join as audience
        defaultAudioOutputToSpeaker: true,
        enableMultiRoom: false,
        enableMirrorMode: false,
        onUserJoin: (userInfo) => {
          console.log('User joined:', userInfo);
        },
        onUserLeave: (userInfo) => {
          console.log('User left:', userInfo);
        },
        onRoomOnlineUserCountUpdate: (count) => {
          setViewerCount(count);
        },
        onConnectionStateChange: (state) => {
          console.log('Connection state changed:', state);
          setConnectionStatus(state);
        },
        onRoomStateUpdate: (state) => {
          console.log('Room state updated:', state);
        },
        onError: (error) => {
          console.error('ZEGOCLOUD error:', error);
          setError('Streaming error occurred');
          onError && onError(error);
        }
      });

      if (zegoResult && zegoResult.container) {
        // Add the ZEGOCLOUD container to our ref
        if (streamContainerRef.current) {
          streamContainerRef.current.innerHTML = '';
          streamContainerRef.current.appendChild(zegoResult.container);
        }
        
        zegoAppRef.current = zegoResult.app;
      }

      setIsJoined(true);
      setConnectionStatus('connected');
      
      // Start duration counter (if stream start time is available)
      if (result.session?.actualStart) {
        const startTime = new Date(result.session.actualStart).getTime();
        const updateDuration = () => {
          const now = Date.now();
          const duration = Math.floor((now - startTime) / 1000);
          setStreamDuration(duration);
        };
        
        updateDuration();
        durationIntervalRef.current = setInterval(updateDuration, 1000);
      }

      console.log('Successfully joined stream');
      
    } catch (err) {
      console.error('Join stream error:', err);
      setError(err.message || 'Failed to join stream');
      setConnectionStatus('disconnected');
      onError && onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveStream = async () => {
    if (!sessionId || !isJoined) return;

    setIsLoading(true);

    try {
      // Leave the stream via backend
      await zegoService.leaveStream(sessionId);
      
      // Clean up ZEGOCLOUD
      if (zegoAppRef.current) {
        await zegoService.cleanup();
        zegoAppRef.current = null;
      }
      
      // Clear duration counter
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      
      setIsJoined(false);
      setStreamData(null);
      setViewerCount(0);
      setStreamDuration(0);
      setConnectionStatus('disconnected');
      
      // Notify parent component
      onDisconnect && onDisconnect();
      
      console.log('Left stream successfully');
      
    } catch (err) {
      console.error('Leave stream error:', err);
      setError('Failed to leave stream properly');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (zegoAppRef.current) {
      // This would depend on ZEGOCLOUD API - example implementation
      // zegoAppRef.current.setAudioOutputMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (streamContainerRef.current?.requestFullscreen) {
        streamContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-400';
      case 'connecting':
        return 'text-yellow-400';
      default:
        return 'text-red-400';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-black rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Live Stream Viewer</h2>
          {isJoined && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={`text-sm ${getConnectionStatusColor()}`}>
                  {getConnectionStatusText()}
                </span>
              </div>
              
              {streamDuration > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Clock className="w-4 h-4" />
                  {formatDuration(streamDuration)}
                </span>
              )}
              
              <span className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4" />
                {viewerCount}
              </span>
            </div>
          )}
        </div>
        
        {isJoined && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle fullscreen"
            >
              <Video className="w-5 h-5" />
            </button>
            
            <button
              onClick={leaveStream}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Leave
            </button>
          </div>
        )}
      </div>

      {/* Stream Container */}
      <div 
        ref={streamContainerRef}
        className="flex-1 relative bg-black flex items-center justify-center"
      >
        {!isJoined ? (
          <div className="text-center text-white">
            <div className="mb-4">
              <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Join Live Stream</h3>
              <p className="text-gray-300 mb-6">
                Watch live content in real-time with audio and video.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}
            
            <button
              onClick={joinStream}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Joining Stream...
                </div>
              ) : (
                'Join Live Stream'
              )}
            </button>
          </div>
        ) : (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">LIVE</span>
          </div>
        )}
      </div>

      {/* Stream Info Footer */}
      {streamData && (
        <div className="bg-gray-900 text-white p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{streamData.session?.title || 'Live Stream'}</h4>
              <p className="text-sm text-gray-300">
                Streamed by {streamData.session?.streamer?.companyName || streamData.session?.streamer?.username || 'Unknown'}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>{viewerCount} viewers</span>
              {streamDuration > 0 && (
                <span>Duration: {formatDuration(streamDuration)}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamViewer;
