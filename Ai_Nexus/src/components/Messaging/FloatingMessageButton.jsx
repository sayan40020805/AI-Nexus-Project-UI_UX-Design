import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Messaging.css';

const FloatingMessageButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, token } = useAuth();

  // Fetch conversations
  const fetchConversations = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        
        // Calculate unread count
        const unread = data.conversations.filter(conv => conv.unreadCount > 0)
          .reduce((total, conv) => total + conv.unreadCount, 0);
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Fetch conversations error:', err);
    }
  };

  // Search users/companies
  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search users error:', err);
    }
  };

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId) => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/messages/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  // Send message
  const sendMessage = async (content, recipientId) => {
    if (!token || !content.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: content.trim(), recipient: recipientId })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add message to local state
        if (selectedConversation) {
          setMessages(prev => [...prev, data.message]);
        }
        
        setNewMessage('');
        
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (err) {
      console.error('Send message error:', err);
    }
  };

  // Start new conversation
  const startConversation = (user) => {
    const existingConv = conversations.find(conv => 
      conv.participant._id === user.id || conv.participantId === user.id
    );
    
    if (existingConv) {
      setSelectedConversation(existingConv);
      fetchMessages(existingConv._id);
    } else {
      // Create new conversation object
      const newConv = {
        _id: `temp-${user.id}`,
        participant: user,
        participantId: user.id,
        lastMessage: null,
        unreadCount: 0
      };
      setSelectedConversation(newConv);
      setMessages([]);
    }
    
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    if (isOpen && token) {
      fetchConversations();
    }
  }, [isOpen, token]);

  useEffect(() => {
    if (selectedConversation && selectedConversation._id !== `temp-${selectedConversation.participantId || selectedConversation.participant?.id}`) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (!user || !token) return null;

  return (
    <>
      {/* Floating Button */}
      <div className="floating-message-button" onClick={() => setIsOpen(!isOpen)}>
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="message-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {/* Message Panel */}
      {isOpen && (
        <div className="message-panel">
          <div className="message-panel-header">
            <h3>Messages</h3>
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {!selectedConversation ? (
            // Conversations List
            <div className="conversations-container">
              {/* Search New Users */}
              <div className="message-search">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((result) => (
                      <div
                        key={`${result.type}-${result.id}`}
                        className="search-result-item"
                        onClick={() => startConversation(result)}
                      >
                        <img 
                          src={result.profilePicture || '/default-avatar.png'} 
                          alt={result.name}
                          onError={(e) => { e.target.src = '/default-avatar.png'; }}
                        />
                        <div>
                          <div className="result-name">{result.name}</div>
                          <div className="result-type">{result.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Conversations */}
              <div className="conversations-list">
                {conversations.length === 0 ? (
                  <div className="no-conversations">
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv._id}
                      className={`conversation-item ${conv.unreadCount > 0 ? 'unread' : ''}`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <img 
                        src={conv.participant.profilePicture || '/default-avatar.png'} 
                        alt={conv.participant.username || conv.participant.companyName}
                        onError={(e) => { e.target.src = '/default-avatar.png'; }}
                      />
                      <div className="conversation-info">
                        <div className="conversation-name">
                          {conv.participant.username || conv.participant.companyName}
                        </div>
                        <div className="conversation-preview">
                          {conv.lastMessage?.content || 'No messages yet'}
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="chat-container">
              <div className="chat-header">
                <button onClick={() => setSelectedConversation(null)}>
                  ←
                </button>
                <span>
                  {selectedConversation.participant?.username || selectedConversation.participant?.companyName}
                </span>
              </div>

              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${message.sender === user.id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newMessage.trim()) {
                      sendMessage(newMessage, selectedConversation.participantId || selectedConversation.participant?.id);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (newMessage.trim()) {
                      sendMessage(newMessage, selectedConversation.participantId || selectedConversation.participant?.id);
                    }
                  }}
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingMessageButton;
