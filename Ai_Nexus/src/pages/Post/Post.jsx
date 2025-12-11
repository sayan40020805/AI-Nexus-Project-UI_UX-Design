import { useState } from 'react';
import { FileText, Image, Link, Tag, Send, Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Calendar, MapPin, Users } from 'lucide-react';
import '../../styles/Post.css';

const postsData = [
  {
    id: 1,
    author: 'AI Researcher',
    authorAvatar: '🤖',
    timestamp: '2 hours ago',
    content: 'Just published our latest paper on multimodal AI systems! The results are incredibly promising. We\'ve achieved a 15% improvement in cross-modal understanding compared to previous methods. What are your thoughts on the implications for real-world applications?',
    image: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjUyNjMwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['AI Research', 'Multimodal', 'Paper', 'Innovation'],
    likes: 127,
    comments: 23,
    shares: 15,
    isLiked: false,
    isSaved: false
  },
  {
    id: 2,
    author: 'ML Engineer',
    authorAvatar: '💻',
    timestamp: '4 hours ago',
    content: 'Building a real-time sentiment analysis system for social media. The challenge is processing millions of posts per second while maintaining accuracy. Any recommendations for optimization strategies?',
    image: null,
    tags: ['Machine Learning', 'Sentiment Analysis', 'Real-time', 'Optimization'],
    likes: 89,
    comments: 34,
    shares: 12,
    isLiked: true,
    isSaved: false
  },
  {
    id: 3,
    author: 'AI Student',
    authorAvatar: '🎓',
    timestamp: '6 hours ago',
    content: 'Just completed my first neural network from scratch without using TensorFlow or PyTorch! It took weeks but the learning experience was incredible. Now I truly understand the math behind backpropagation.',
    image: 'https://images.unsplash.com/photo-1622131815526-eaae1e615381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzY1MjA5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    tags: ['Learning', 'Neural Networks', 'From Scratch', 'Achievement'],
    likes: 203,
    comments: 45,
    shares: 28,
    isLiked: false,
    isSaved: true
  }
];

const suggestedTopics = [
  'AI Ethics',
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'AI Tools',
  'Research Papers',
  'Career Advice',
  'Industry News',
  'Tutorials'
];

export function Post() {
  const [posts, setPosts] = useState(postsData);
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCreatePost = () => {
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        author: 'You',
        authorAvatar: '👤',
        timestamp: 'Just now',
        content: newPost,
        image: selectedImage,
        tags: selectedTags,
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isSaved: false
      };
      
      setPosts([post, ...posts]);
      setNewPost('');
      setSelectedTags([]);
      setSelectedImage(null);
      setShowTagInput(false);
    }
  };

  const handleAddTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const handleSavePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
  };

  return (
    <div className="post-container">
      <div className="post-header">
        <div className="post-title">
          <FileText className="w-6 h-6" />
          <h1>Create Post</h1>
        </div>
        <p>Share your AI insights, research, or thoughts with the community</p>
      </div>

      {/* Create Post Section */}
      <div className="post-create-section">
        <div className="post-create-card">
          <div className="post-create-header">
            <div className="post-user-info">
              <div className="post-user-avatar">👤</div>
              <div className="post-user-details">
                <h3>Share your thoughts</h3>
                <span>AI Nexus Community</span>
              </div>
            </div>
          </div>

          <div className="post-create-content">
            <textarea
              placeholder="What\'s on your mind about AI?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="post-textarea"
              rows="4"
            />
            
            {selectedImage && (
              <div className="post-image-preview">
                <img src={selectedImage} alt="Preview" />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="post-remove-image"
                >
                  ×
                </button>
              </div>
            )}

            <div className="post-tags-section">
              <div className="post-selected-tags">
                {selectedTags.map((tag) => (
                  <span key={tag} className="post-tag">
                    #{tag}
                    <button onClick={() => handleRemoveTag(tag)}>×</button>
                  </span>
                ))}
              </div>
              
              {showTagInput ? (
                <div className="post-tag-input">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag(tagInput);
                      }
                    }}
                    autoFocus
                  />
                  <div className="post-suggested-tags">
                    {suggestedTopics
                      .filter(topic => 
                        topic.toLowerCase().includes(tagInput.toLowerCase()) &&
                        !selectedTags.includes(topic)
                      )
                      .slice(0, 5)
                      .map((topic) => (
                        <button
                          key={topic}
                          onClick={() => handleAddTag(topic)}
                          className="post-suggested-tag"
                        >
                          #{topic}
                        </button>
                      ))}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="post-add-tag-btn"
                >
                  <Tag className="w-4 h-4" />
                  Add tags
                </button>
              )}
            </div>

            <div className="post-actions">
              <div className="post-action-buttons">
                <label className="post-action-btn">
                  <Image className="w-4 h-4" />
                  <span>Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setSelectedImage(e.target.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
                
                <button className="post-action-btn">
                  <Link className="w-4 h-4" />
                  <span>Link</span>
                </button>
              </div>
              
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="post-publish-btn"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="post-feed">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div className="post-author">
                <div className="post-avatar">{post.authorAvatar}</div>
                <div className="post-author-info">
                  <h4 className="post-author-name">{post.author}</h4>
                  <div className="post-meta">
                    <span className="post-timestamp">{post.timestamp}</span>
                    <span className="post-privacy">• Public</span>
                  </div>
                </div>
              </div>
              <button className="post-more-btn">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            <div className="post-content">
              <p className="post-text">{post.content}</p>
              
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt="Post content" />
                </div>
              )}

              {post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag) => (
                    <span key={tag} className="post-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="post-stats">
              <div className="post-stat">
                <span className="post-stat-number">{post.likes}</span>
                <span className="post-stat-label">likes</span>
              </div>
              <div className="post-stat">
                <span className="post-stat-number">{post.comments}</span>
                <span className="post-stat-label">comments</span>
              </div>
              <div className="post-stat">
                <span className="post-stat-number">{post.shares}</span>
                <span className="post-stat-label">shares</span>
              </div>
            </div>

            <div className="post-actions-bar">
              <button
                onClick={() => handleLikePost(post.id)}
                className={`post-action ${post.isLiked ? 'liked' : ''}`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>Like</span>
              </button>
              
              <button className="post-action">
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>
              
              <button className="post-action">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              <button
                onClick={() => handleSavePost(post.id)}
                className={`post-action ${post.isSaved ? 'saved' : ''}`}
              >
                <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
                <span>Save</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Topics for New Users */}
      <div className="post-suggestions">
        <h3>Suggested Topics</h3>
        <div className="post-suggestions-grid">
          {suggestedTopics.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setNewPost(`What are your thoughts on ${topic.toLowerCase()}? `);
                setShowTagInput(true);
                handleAddTag(topic);
              }}
              className="post-suggestion"
            >
              <Tag className="w-4 h-4" />
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
