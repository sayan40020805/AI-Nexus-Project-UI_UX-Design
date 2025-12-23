import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import zegoService from '../../services/zegoService';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Settings } from 'lucide-react';

const LiveStreamHost = ({ sessionId, onStreamEnd, onError }) => {
  const { user } = useAuth();
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamData, setStreamData] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [error, setError] = useState('');
  const [streamDuration, setStreamDuration] = useState(0);
  
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

  const startStream = async () => {
    if (!sessionId) {
      setError('No session ID provided');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Start the stream via backend
      const result = await zegoService.startStream(sessionId);
      
      if (!result.success) {
        throw new Error(result.msg || 'Failed to start stream');
      }

      setStreamData(result);

      // Initialize ZEGOCLOUD with the token data
      const zegoResult = await zegoService.initZegoKit(result, {
        // Host-specific options
        turnOnCameraWhenJoining: false, // Let user choose
        turnOnMicrophoneWhenJoining: false, // Let user choose
        showScreenSharingButton: true,
        showRoomDetailsButton: true,
        layout: 'top',
        themeColor: '#3b82f6',
        brandColor: '#1e40af',
        onUserJoin: (userInfo) => {
          console.log('Viewer joined:', userInfo);
          setViewerCount(prev => prev + 1);
        },
        onUserLeave: (userInfo) => {
          console.log('Viewer left:', userInfo);
          setViewerCount(prev => Math.max(0, prev - 1));
        },
        onRoomOnlineUserCountUpdate: (count) => {
          setViewerCount(count);
        },
        onConnectionStateChange: (state) => {
          console.log('Connection state changed:', state);
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

      setIsStreaming(true);
      
      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);

      console.log('Stream started successfully');
      
    } catch (err) {
      console.error('Start stream error:', err);
      setError(err.message || 'Failed to start stream');
      onError && onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const endStream = async () => {
    if (!sessionId) return;

    setIsLoading(true);

    try {
      // End the stream via backend
      await zegoService.endStream(sessionId);
      
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
      
      setIsStreaming(false);
      setStreamData(null);
      setViewerCount(0);
      setStreamDuration(0);
      
      // Notify parent component
      onStreamEnd && onStreamEnd();
      
      console.log('Stream ended successfully');
      
    } catch (err) {
      console.error('End stream error:', err);
      setError('Failed to end stream properly');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCamera = () => {
    if (zegoAppRef.current) {
      // This would depend on ZEGOCLOUD API - example implementation
      // zegoAppRef.current.turnCameraOnOrOff(!isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  const toggleMicrophone = () => {
    if (zegoAppRef.current) {
      // This would depend on ZEGOCLOUD API - example implementation
      // zegoAppRef.current.turnMicrophoneOnOrOff(!isMicOn);
      setIsMicOn(!isMicOn);
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

  // Check if user has permission to host
  if (user.role !== 'company') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Company Account Required
          </h3>
          <p className="text-gray-600">
            Only company accounts can start live streams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Live Stream Host</h2>
          {isStreaming && (
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </span>
              <span className="text-sm">
                Duration: {formatDuration(streamDuration)}
              </span>
              <span className="text-sm">
                Viewers: {viewerCount}
              </span>
            </div>
          )}
        </div>
        
        {isStreaming && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCamera}
              className={`p-2 rounded-lg transition-colors ${
                isCameraOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={toggleMicrophone}
              className={`p-2 rounded-lg transition-colors ${
                isMicOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            
            <button
              onClick={endStream}
              disabled={isLoading}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              title="End stream"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Stream Container */}
      <div 
        ref={streamContainerRef}
        className="flex-1 relative bg-black flex items-center justify-center"
      >
        {!isStreaming ? (
          <div className="text-center text-white">
            <div className="mb-4">
              <Video className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Go Live?</h3>
              <p className="text-gray-300 mb-6">
                Start your live stream to engage with your audience in real-time.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-4 mb-6">
                <p className="text-red-200">{error}</p>
              </div>
            )}
            
            <button
              onClick={startStream}
              disabled={isLoading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Starting Stream...
                </div>
              ) : (
                'Start Live Stream'
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
        <div className="bg-gray-800 text-white p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">{streamData.session?.title || 'Live Stream'}</h4>
              <p className="text-sm text-gray-300">
                Hosted by {user.role === 'company' ? user.companyName : user.username}
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span>{viewerCount} viewers</span>
              <span>Duration: {formatDuration(streamDuration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamHost;
