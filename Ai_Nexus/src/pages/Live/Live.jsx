
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Radio, Users, Eye, MessageCircle, ThumbsUp, Share2, Settings, Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import '../../styles/Live.css';

const liveStreamsData = [
  {
    id: 1,
    title: 'Live: Building AI Chatbots with GPT-4',
    streamer: 'AI Developer Hub',
    streamerAvatar: '🤖',
    viewers: 1247,
    description: 'Live coding session building a production-ready AI chatbot using GPT-4 API',
    category: 'Development',
    isLive: true,
    thumbnail: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjUyNjMwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['GPT-4', 'Chatbots', 'Live Coding', 'API'],
    startTime: '2:30 PM',
    duration: '1h 45m'
  },
  {
    id: 2,
    title: 'AI Research Live: Latest Breakthroughs',
    streamer: 'Research Lab',
    streamerAvatar: '🔬',
    viewers: 856,
    description: 'Discussing recent papers and breakthroughs in AI research',
    category: 'Research',
    isLive: true,
    thumbnail: 'https://images.unsplash.com/photo-1622131815526-eaae1e615381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzY1MjA5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Research', 'Papers', 'Breakthroughs', 'Science'],
    startTime: '1:15 PM',
    duration: '2h 30m'
  },
  {
    id: 3,
    title: 'Machine Learning Q&A Session',
    streamer: 'ML Academy',
    streamerAvatar: '🎓',
    viewers: 634,
    description: 'Interactive Q&A about machine learning concepts and career advice',
    category: 'Education',
    isLive: true,
    thumbnail: 'https://images.unsplash.com/photo-1584291527908-033f4d6542c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMHNjcmVlbnxlbnwxfHx8fDE3NjUyNTk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Q&A', 'Machine Learning', 'Career', 'Education'],
    startTime: '3:00 PM',
    duration: '45m'
  },
  {
    id: 4,
    title: 'AI Ethics Debate: Future of Work',
    streamer: 'Ethics Forum',
    streamerAvatar: '⚖️',
    viewers: 423,
    description: 'Panel discussion on how AI will transform the workplace',
    category: 'Discussion',
    isLive: true,
    thumbnail: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjUyMDk3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Ethics', 'Future', 'Work', 'Debate'],
    startTime: '4:15 PM',
    duration: '1h 15m'
  }
];

const upcomingStreams = [
  {
    id: 5,
    title: 'Deep Learning Workshop: Computer Vision',
    streamer: 'Tech Academy',
    streamerAvatar: '👨‍💻',
    scheduledTime: '6:00 PM',
    description: 'Hands-on workshop covering computer vision techniques',
    category: 'Workshop'
  },
  {
    id: 6,
    title: 'AI Startup Pitch Competition',
    streamer: 'Innovation Hub',
    streamerAvatar: '🚀',
    scheduledTime: '8:30 PM',
    description: 'Watch promising AI startups pitch their ideas',
    category: 'Competition'
  }
];

const chatMessages = [
  {
    id: 1,
    user: 'CodeMaster42',
    message: 'Great explanation! Can you show the API integration?',
    timestamp: '2:45:30',
    type: 'user'
  },
  {
    id: 2,
    user: 'AIEnthusiast',
    message: 'This is exactly what I was looking for 👏',
    timestamp: '2:45:45',
    type: 'user'
  },
  {
    id: 3,
    user: 'StreamerBot',
    message: 'Welcome to everyone joining us! Don\'t forget to subscribe',
    timestamp: '2:46:00',
    type: 'system'
  },
  {
    id: 4,
    user: 'MLStudent',
    message: 'Question: How do we handle API rate limits?',
    timestamp: '2:46:15',
    type: 'user'
  }
];


export function Live() {
  const [liveStreams, setLiveStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isPhoneOn, setIsPhoneOn] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const { user, token } = useAuth();

  // Fetch live streams
  const fetchLiveStreams = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/live`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLiveStreams(data.sessions || []);
        
        // Set first stream as selected if none selected
        if (data.sessions && data.sessions.length > 0 && !selectedStream) {
          setSelectedStream(data.sessions[0]);
        }
      }
    } catch (err) {
      console.error('Fetch live streams error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new live session (companies only)
  const createLiveSession = async (sessionData) => {
    if (!token || user?.role !== 'company') {
      alert('Only companies can create live sessions');
      return;
    }

    try {
      setIsCreatingSession(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/live`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const newSession = await response.json();
        setLiveStreams(prev => [newSession, ...prev]);
        setSelectedStream(newSession);
        alert('Live session created successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Failed to create session');
      }
    } catch (err) {
      console.error('Create live session error:', err);
      alert(`Error creating session: ${err.message}`);
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Join live session
  const joinLiveSession = async (sessionId) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/live/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Joined live session:', data);
      }
    } catch (err) {
      console.error('Join live session error:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedStream) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/live/${selectedStream._id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: chatMessage.trim() })
      });

      if (response.ok) {
        setChatMessage('');
        // Refresh chat messages
        // TODO: Implement real-time chat updates
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  useEffect(() => {
    fetchLiveStreams();
  }, [token]);

  // Auto-join first stream if user is viewer
  useEffect(() => {
    if (selectedStream && token && user?.role === 'user') {
      joinLiveSession(selectedStream._id);
    }
  }, [selectedStream, token, user]);

  return (
    <div className="live-container">
      <div className="live-header">
        <div className="live-title">
          <Radio className="w-6 h-6" />
          <h1>Live Streams</h1>
          <span className="live-status">
            <span className="live-indicator"></span>
            {liveStreamsData.length} live now
          </span>
        </div>

        <div className="live-actions">
          {user?.role === 'company' && (
            <button 
              className="live-action-btn"
              onClick={() => {
                const title = prompt('Enter live session title:');
                if (title) {
                  createLiveSession({ title, description: '' });
                }
              }}
              disabled={isCreatingSession}
            >
              <Radio className="w-4 h-4" />
              {isCreatingSession ? 'Creating...' : 'Start Live'}
            </button>
          )}
          <button className="live-action-btn">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      <div className="live-main">
        <div className="live-video-section">
          <div className="live-video-container">
            <img 
              src={selectedStream.thumbnail} 
              alt={selectedStream.title}
              className="live-video"
            />
            <div className="live-video-overlay">
              <div className="live-video-info">
                <div className="live-streamer-info">
                  <div className="live-avatar">{selectedStream.streamerAvatar}</div>
                  <div className="live-streamer-details">
                    <h3 className="live-streamer-name">{selectedStream.streamer}</h3>
                    <span className="live-category">{selectedStream.category}</span>
                  </div>
                </div>
                <div className="live-viewers">
                  <Eye className="w-4 h-4" />
                  <span>{selectedStream.viewers.toLocaleString()} watching</span>
                </div>
              </div>
              
              <div className="live-controls">
                <button 
                  onClick={() => setIsMicOn(!isMicOn)}
                  className={`live-control-btn ${!isMicOn ? 'inactive' : ''}`}
                >
                  {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsVideoOn(!isVideoOn)}
                  className={`live-control-btn ${!isVideoOn ? 'inactive' : ''}`}
                >
                  {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsPhoneOn(!isPhoneOn)}
                  className={`live-control-btn ${!isPhoneOn ? 'inactive' : ''}`}
                >
                  {isPhoneOn ? <Phone className="w-5 h-5" /> : <PhoneOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="live-badges">
              <span className="live-badge live">LIVE</span>
              <span className="live-badge category">{selectedStream.category}</span>
              <span className="live-badge duration">{selectedStream.duration}</span>
            </div>
          </div>

          <div className="live-stream-info">
            <h2 className="live-stream-title">{selectedStream.title}</h2>
            <p className="live-stream-description">{selectedStream.description}</p>
            
            <div className="live-tags">
              {selectedStream.tags.map((tag) => (
                <span key={tag} className="live-tag">#{tag}</span>
              ))}
            </div>

            <div className="live-stream-actions">
              <button className="live-action-button like-btn">
                <ThumbsUp className="w-4 h-4" />
                Like
              </button>
              <button className="live-action-button share-btn">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        <div className="live-chat-section">
          <div className="live-chat-header">
            <h3>Live Chat</h3>
            <button 
              onClick={() => setShowChat(!showChat)}
              className="live-chat-toggle"
            >
              {showChat ? 'Hide' : 'Show'}
            </button>
          </div>

          {showChat && (
            <>
              <div className="live-chat-messages">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`live-chat-message ${msg.type}`}>
                    <span className="live-chat-user">{msg.user}:</span>
                    <span className="live-chat-text">{msg.message}</span>
                    <span className="live-chat-time">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
              
              <div className="live-chat-input">
                <input
                  type="text"
                  placeholder="Say something..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button onClick={handleSendMessage} className="live-chat-send">
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="live-sidebar">
        <div className="live-streams-section">
          <h3>Live Now</h3>
          <div className="live-streams-list">
            {liveStreamsData.map((stream) => (
              <div 
                key={stream.id}
                onClick={() => setSelectedStream(stream)}
                className={`live-stream-item ${selectedStream.id === stream.id ? 'active' : ''}`}
              >
                <div className="live-stream-thumbnail">
                  <img src={stream.thumbnail} alt={stream.title} />
                  <span className="live-stream-indicator">🔴</span>
                </div>
                <div className="live-stream-details">
                  <h4 className="live-stream-title">{stream.title}</h4>
                  <div className="live-stream-meta">
                    <span className="live-streamer">{stream.streamer}</span>
                    <div className="live-stream-stats">
                      <span className="live-viewer-count">
                        <Users className="w-3 h-3" />
                        {stream.viewers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="live-upcoming-section">
          <h3>Upcoming</h3>
          <div className="live-upcoming-list">
            {upcomingStreams.map((stream) => (
              <div key={stream.id} className="live-upcoming-item">
                <div className="live-upcoming-info">
                  <h4 className="live-upcoming-title">{stream.title}</h4>
                  <div className="live-upcoming-meta">
                    <span className="live-upcoming-streamer">{stream.streamer}</span>
                    <span className="live-upcoming-time">{stream.scheduledTime}</span>
                  </div>
                  <span className="live-upcoming-category">{stream.category}</span>
                </div>
                <button className="live-remind-btn">Remind Me</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Live;
