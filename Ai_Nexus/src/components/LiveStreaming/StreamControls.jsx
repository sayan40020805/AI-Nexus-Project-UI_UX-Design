import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Users, 
  Share, 
  Download,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react';

const StreamControls = ({ 
  isStreaming, 
  isLoading, 
  viewerCount, 
  streamDuration, 
  onStartStream, 
  onEndStream,
  onToggleCamera,
  onToggleMicrophone,
  onToggleMute,
  onShareStream,
  onSettings,
  streamTitle,
  streamDescription,
  className = ""
}) => {
  const { user } = useAuth();
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Check if user has permission to start streams
  const canStartStream = user?.role === 'company';

  return (
    <div className={`bg-gray-900 text-white ${className}`}>
      {/* Stream Info Bar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="font-semibold">
              {isStreaming ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
          
          {isStreaming && streamDuration > 0 && (
            <span className="text-sm text-gray-300">
              {formatDuration(streamDuration)}
            </span>
          )}
          
          {viewerCount > 0 && (
            <span className="flex items-center gap-1 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              {viewerCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {streamTitle && (
            <span className="text-sm font-medium">{streamTitle}</span>
          )}
          
          <button
            onClick={() => setShowControls(!showControls)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title={showControls ? 'Hide controls' : 'Show controls'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Controls */}
      {showControls && (
        <div className="p-4">
          {/* Stream Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            {!isStreaming ? (
              // Start Stream Button (Company only)
              canStartStream ? (
                <button
                  onClick={onStartStream}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Start Live Stream
                    </>
                  )}
                </button>
              ) : (
                // No permission message for regular users
                <div className="text-center text-gray-400">
                  <p className="text-sm">Only company accounts can start live streams</p>
                </div>
              )
            ) : (
              // End Stream Button
              <button
                onClick={onEndStream}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ending...
                  </>
                ) : (
                  <>
                    <Square className="w-5 h-5" />
                    End Stream
                  </>
                )}
              </button>
            )}
          </div>

          {/* Stream Details */}
          {streamTitle && (
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-lg mb-2">{streamTitle}</h3>
              {streamDescription && (
                <p className="text-gray-300 text-sm">{streamDescription}</p>
              )}
            </div>
          )}

          {/* Secondary Controls */}
          {isStreaming && (
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onToggleCamera}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Toggle camera"
                >
                  <Video className="w-5 h-5" />
                </button>
                
                <button
                  onClick={onToggleMicrophone}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Toggle microphone"
                >
                  <Mic className="w-5 h-5" />
                </button>
                
                <button
                  onClick={onToggleMute}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Toggle mute"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={onShareStream}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Share stream"
                >
                  <Share className="w-5 h-5" />
                </button>
                
                <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Toggle fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </button>
                
                <button
                  onClick={onSettings}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Stream Statistics */}
          {isStreaming && viewerCount > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-400">{viewerCount}</div>
                <div className="text-xs text-gray-400">Current Viewers</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {formatDuration(streamDuration)}
                </div>
                <div className="text-xs text-gray-400">Duration</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-400">
                  {user?.role === 'company' ? 'Host' : 'Viewer'}
                </div>
                <div className="text-xs text-gray-400">Role</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">HD</div>
                <div className="text-xs text-gray-400">Quality</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamControls;
