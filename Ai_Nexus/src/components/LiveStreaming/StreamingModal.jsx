import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import zegoService from '../../services/zegoService';
import LiveStreamHost from './LiveStreamHost';
import LiveStreamViewer from './LiveStreamViewer';
import { X, Users, Calendar, Clock } from 'lucide-react';

const StreamingModal = ({ 
  isOpen, 
  onClose, 
  sessionId, 
  sessionData,
  onStreamEnd 
}) => {
  const { user } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Handle escape key to close modal
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleStreamEnd = () => {
    setConnectionStatus('disconnected');
    onStreamEnd && onStreamEnd();
  };

  const handleError = (error) => {
    console.error('Streaming error:', error);
    setError(error.message || 'An error occurred');
  };

  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
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

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Determine if user can host based on role
  const canHost = user?.role === 'company';
  const isHost = canHost && sessionData?.streamer?._id === user?.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full h-full bg-gray-900 ${
        isFullscreen ? 'max-w-none max-h-none' : 'max-w-7xl max-h-[90vh] m-4'
      } rounded-lg overflow-hidden shadow-2xl`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {isHost ? 'Live Stream Host' : 'Live Stream Viewer'}
              </h2>
              {sessionData && (
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {sessionData.title || 'Untitled Stream'}
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {sessionData.viewers?.length || 0} viewers
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {sessionData.status || 'offline'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-600 bg-opacity-20 border border-red-600 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-200">{error}</p>
              <button
                onClick={() => setError('')}
                className="text-red-200 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Stream Content */}
        <div className="flex-1 overflow-hidden">
          {canHost && isHost ? (
            // Host Component
            <LiveStreamHost
              sessionId={sessionId}
              onStreamEnd={handleStreamEnd}
              onError={handleError}
            />
          ) : (
            // Viewer Component (for all users)
            <LiveStreamViewer
              sessionId={sessionId}
              onError={handleError}
              onDisconnect={handleDisconnect}
            />
          )}
        </div>

        {/* Footer Info */}
        {sessionData && (
          <div className="p-4 bg-gray-800 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <div>
                <span className="font-medium">
                  Streamed by {sessionData.streamer?.companyName || sessionData.streamer?.username || 'Unknown'}
                </span>
                {sessionData.description && (
                  <p className="mt-1 text-gray-400">{sessionData.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span>Powered by ZEGOCLOUD</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  sessionData.status === 'live' 
                    ? 'bg-red-600 text-white' 
                    : sessionData.status === 'scheduled'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {sessionData.status?.toUpperCase() || 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingModal;
