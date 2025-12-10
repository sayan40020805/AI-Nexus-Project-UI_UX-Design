import { useState } from 'react';
import { MessageSquare, Users, TrendingUp, Send, Heart, MessageCircle, Share2, Search, Filter } from 'lucide-react';
import '../styles/Community.css';

const forumTopics = [
  {
    id: 1,
    title: 'Best practices for fine-tuning large language models',
    category: 'NLP',
    author: 'Sarah Chen',
    avatar: '👩‍💻',
    replies: 47,
    views: 1240,
    likes: 89,
    lastActivity: '2 hours ago',
    excerpt: 'Looking for insights on optimal hyperparameters and training strategies for LLM fine-tuning...',
  },
  {
    id: 2,
    title: 'Breakthrough in computer vision for medical imaging',
    category: 'Healthcare AI',
    author: 'Dr. James Wilson',
    avatar: '👨‍⚕️',
    replies: 32,
    views: 890,
    likes: 124,
    lastActivity: '5 hours ago',
    excerpt: 'Our team achieved 97% accuracy in detecting early-stage cancer using a novel CNN architecture...',
  },
  {
    id: 3,
    title: 'Ethical considerations in AI deployment',
    category: 'Ethics',
    author: 'Maya Patel',
    avatar: '👩‍🔬',
    replies: 68,
    views: 2100,
    likes: 156,
    lastActivity: '1 day ago',
    excerpt: 'Starting a discussion about responsible AI development and deployment practices...',
  },
  {
    id: 4,
    title: 'Comparing PyTorch vs TensorFlow in 2025',
    category: 'Tools',
    author: 'Alex Kim',
    avatar: '👨‍💼',
    replies: 91,
    views: 3200,
    likes: 203,
    lastActivity: '3 hours ago',
    excerpt: 'What are your preferences and why? Let\'s discuss the pros and cons of each framework...',
  },
];

const communityMembers = [
  {
    id: 1,
    name: 'Emily Rodriguez',
    avatar: '👩‍🚀',
    title: 'AI Research Scientist',
    company: 'OpenAI',
    expertise: ['NLP', 'Reinforcement Learning', 'AI Safety'],
    connections: 1240,
    posts: 89,
  },
  {
    id: 2,
    name: 'Michael Chang',
    avatar: '👨‍🎓',
    title: 'ML Engineer',
    company: 'Google DeepMind',
    expertise: ['Computer Vision', 'Deep Learning', 'MLOps'],
    connections: 890,
    posts: 67,
  },
  {
    id: 3,
    name: 'Sophia Martinez',
    avatar: '👩‍💼',
    title: 'AI Product Manager',
    company: 'Microsoft',
    expertise: ['AI Strategy', 'Product Development', 'Ethics'],
    connections: 1560,
    posts: 124,
  },
  {
    id: 4,
    name: 'David Lee',
    avatar: '👨‍🔧',
    title: 'Data Scientist',
    company: 'Meta',
    expertise: ['Machine Learning', 'Statistics', 'Python'],
    connections: 670,
    posts: 45,
  },
];

export function Community() {
  const [activeTab, setActiveTab] = useState('forums');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [likedTopics, setLikedTopics] = useState(new Set());

  const categories = ['All', 'NLP', 'Computer Vision', 'Healthcare AI', 'Ethics', 'Tools', 'General'];

  const toggleLike = (id) => {
    setLikedTopics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredTopics = forumTopics.filter(
    (topic) =>
      (selectedCategory === 'All' || topic.category === selectedCategory) &&
      (searchTerm === '' ||
        topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredMembers = communityMembers.filter(
    (member) =>
      searchTerm === '' ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.expertise.some((exp) => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="community-container">
      <div className="community-stats-grid">
        <div className="community-stat-card">
          <Users className="community-stat-card-icon" />
          <div className="community-stat-number">10,247</div>
          <div className="community-stat-label">Active Members</div>
        </div>
        <div className="community-stat-card" style={{background: 'linear-gradient(to bottom right, #7c3aed, #5b21b6)'}}>
          <MessageSquare className="community-stat-card-icon" />
          <div className="community-stat-number">2,891</div>
          <div className="community-stat-label" style={{color: '#e9d5ff'}}>Discussion Threads</div>
        </div>
        <div className="community-stat-card" style={{background: 'linear-gradient(to bottom right, #059669, #047857)'}}>
          <TrendingUp className="community-stat-card-icon" />
          <div className="community-stat-number">45k+</div>
          <div className="community-stat-label" style={{color: '#d1fae5'}}>Monthly Interactions</div>
        </div>
      </div>

      <div className="community-main-card">
        <div className="community-header">
          <div className="community-tabs">
            <button
              onClick={() => setActiveTab('forums')}
              className={`community-tab-button ${activeTab === 'forums' ? 'active' : ''}`}
            >
              <MessageSquare className="community-tab-icon" />
              Forums
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`community-tab-button ${activeTab === 'members' ? 'active' : ''}`}
            >
              <Users className="community-tab-icon" />
              Members
            </button>
          </div>
          <div className="community-search-container">
            <Search className="community-search-icon" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="community-search-input"
            />
          </div>
        </div>

        {activeTab === 'forums' && (
          <>
            <div className="community-categories">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`community-category-button ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="community-forums-list">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  className="community-forum-item"
                >
                  <div className="community-forum-content">
                    <div className="community-forum-avatar">{topic.avatar}</div>
                    <div className="community-forum-details">
                      <div className="community-forum-header">
                        <div className="community-forum-header-content">
                          <h4 className="community-forum-title">{topic.title}</h4>
                          <div className="community-forum-meta">
                            <span>{topic.author}</span>
                            <span>•</span>
                            <span>{topic.lastActivity}</span>
                            <span className="community-forum-category">
                              {topic.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="community-forum-excerpt">{topic.excerpt}</p>
                      <div className="community-forum-stats">
                        <button
                          onClick={() => toggleLike(topic.id)}
                          className={`community-forum-stat ${likedTopics.has(topic.id) ? 'liked' : ''}`}
                        >
                          <Heart
                            className={`community-forum-stat-icon ${likedTopics.has(topic.id) ? 'liked' : ''}`}
                          />
                          <span>{topic.likes}</span>
                        </button>
                        <div className="community-forum-stat">
                          <MessageCircle className="community-forum-stat-icon" />
                          <span>{topic.replies} replies</span>
                        </div>
                        <div className="community-forum-stat">
                          <TrendingUp className="community-forum-stat-icon" />
                          <span>{topic.views} views</span>
                        </div>
                        <button className="community-forum-share">
                          <Share2 className="community-forum-stat-icon" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="community-new-post">
              <div className="community-new-post-content">
                <div className="community-new-post-icon">💬</div>
                <div className="community-new-post-input-container">
                  <input
                    type="text"
                    placeholder="Start a new discussion..."
                    className="community-new-post-input"
                  />
                  <div className="community-new-post-actions">
                    <button className="community-new-post-button">
                      <Send className="community-new-post-button-icon" />
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'members' && (
          <div className="community-members-grid">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="community-member-card"
              >
                <div className="community-member-content">
                  <div className="community-member-avatar">{member.avatar}</div>
                  <div className="community-member-details">
                    <h4 className="community-member-name">{member.name}</h4>
                    <p className="community-member-title">{member.title}</p>
                    <p className="community-member-company">{member.company}</p>
                    <div className="community-member-skills">
                      {member.expertise.map((skill) => (
                        <span
                          key={skill}
                          className="community-member-skill"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="community-member-stats">
                      <span>{member.connections} connections</span>
                      <span>{member.posts} posts</span>
                    </div>
                    <div className="community-member-actions">
                      <button className="community-member-connect">
                        Connect
                      </button>
                      <button className="community-member-message">
                        Message
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
