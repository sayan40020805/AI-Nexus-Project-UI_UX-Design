import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('posts');

  const user = {
    name: 'Astral Nomad',
    username: '@astral_nomad',
    profilePic: 'https://cdn.pixabay.com/photo/2023/12/04/10/44/man-8429407_1280.png', // Replace with an actual profile picture
    coverPhoto: 'https://cdn.pixabay.com/photo/2023/07/26/16/09/ai-generated-8151978_1280.png', // Replace with an actual cover photo
    bio: 'Exploring the cosmos of AI and quantum computing. Enthusiast of generative art and neural networks. Always learning, always creating.',
    location: 'Cyber City, Xylos',
    joinDate: 'Joined January 2023',
    followers: 1245,
    following: 321,
    socialLinks: {
      github: 'astral-nomad-dev',
      twitter: 'astral_nomad_ai',
      linkedin: 'astral-nomad-linkedin',
    },
    skills: ['Machine Learning', 'Deep Learning', 'Generative AI', 'React', 'Node.js', 'Python', 'Quantum Computing'],
  };

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: user.name,
      authorPic: user.profilePic,
      content: 'Just deployed a new federated learning model! The privacy-preserving capabilities are truly astounding. #AI #FederatedLearning',
      timestamp: '2 hours ago',
      image: 'https://cdn.pixabay.com/photo/2024/02/20/12/46/ai-generated-8585489_1280.jpg',
      likes: 42,
      comments: [
        { id: 101, author: 'Data Weaver', text: 'Amazing work! How did you handle model aggregation?', timestamp: '1 hour ago' },
      ],
    },
    {
      id: 2,
      author: user.name,
      authorPic: user.profilePic,
      content: 'Dive deep into the latest advancements in quantum machine learning. The future is now! 🚀 #QuantumAI #MachineLearning',
      timestamp: '1 day ago',
      image: '',
      likes: 89,
      comments: [
        { id: 102, author: 'Quantum Thinker', text: 'Fascinating! Any good resources you recommend for beginners?', timestamp: '23 hours ago' },
        { id: 103, author: 'AI Explorer', text: 'I\'d love to collaborate on a project related to this!', timestamp: '20 hours ago' },
      ],
    },
    {
      id: 3,
      author: user.name,
      authorPic: user.profilePic,
      content: 'Generated this stunning piece of digital art using a custom GAN. What do you think? #GenerativeArt #GAN',
      timestamp: '3 days ago',
      image: 'https://cdn.pixabay.com/photo/2024/02/19/08/42/ai-generated-8582531_1280.jpg',
      likes: 156,
      comments: [],
    },
  ]);

  const handlePostSubmit = (event) => {
    event.preventDefault();
    const newPostContent = event.target.elements.postContent.value;
    if (newPostContent.trim()) {
      const newPost = {
        id: posts.length + 1,
        author: user.name,
        authorPic: user.profilePic,
        content: newPostContent,
        timestamp: 'Just now',
        image: '',
        likes: 0,
        comments: [],
      };
      setPosts([newPost, ...posts]);
      event.target.elements.postContent.value = '';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="cover-photo" style={{ backgroundImage: `url(${user.coverPhoto})` }}>
        <img src={user.profilePic} alt="Profile" className="profile-pic-large" />
      </div>

      <div className="dashboard-header">
        <h1 className="user-name">{user.name}</h1>
        <p className="username">{user.username}</p>
        <p className="user-bio">{user.bio}</p>
        <div className="user-stats">
          <span>{user.followers} Followers</span>
          <span>{user.following} Following</span>
        </div>
        <div className="profile-actions">
          <button className="follow-button">Follow</button>
          <button className="message-button">Message</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          About
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'posts' && (
          <div className="posts-section">
            <div className="post-creator-card">
              <form onSubmit={handlePostSubmit}>
                <textarea
                  name="postContent"
                  placeholder="What's new in your AI journey?"
                  rows="3"
                ></textarea>
                <button type="submit" className="create-post-button">Post Update</button>
              </form>
            </div>
            <div className="post-feed">
              {posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-author-info">
                    <img src={post.authorPic} alt="Author" className="post-author-pic" />
                    <div>
                      <span className="post-author-name">{post.author}</span>
                      <span className="post-timestamp">{post.timestamp}</span>
                    </div>
                  </div>
                  <p className="post-content-text">{post.content}</p>
                  {post.image && <img src={post.image} alt="Post" className="post-image" />}
                  <div className="post-actions">
                    <button>Like ({post.likes})</button>
                    <button>Comment ({post.comments.length})</button>
                  </div>
                  {post.comments.length > 0 && (
                    <div className="post-comments">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <strong>{comment.author}:</strong> {comment.text}
                          <span className="comment-timestamp">{comment.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="about-section">
            <div className="about-card">
              <h3>About {user.name}</h3>
              <p><strong>Location:</strong> {user.location}</p>
              <p><strong>Joined:</strong> {user.joinDate}</p>
              <h4>Skills:</h4>
              <ul className="skills-list">
                {user.skills.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
              <h4>Social Links:</h4>
              <ul className="social-links-list">
                {Object.entries(user.socialLinks).map(([platform, handle]) => (
                  <li key={platform}>
                    <a href={`https://${platform}.com/${handle}`} target="_blank" rel="noopener noreferrer">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}: {handle}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
