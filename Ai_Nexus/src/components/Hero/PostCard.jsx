import React from 'react';
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';

function timeSince(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function PostCard({ post, onLike, onComment, onShare }) {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(post.likes ?? 0);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post.id);
  };

  return (
    <article className="post-card">
      {/* Post Header */}
      <div className="post-card-header">
        <div className="post-card-author-info">
          <div className="post-card-avatar">{post.authorAvatar || '👤'}</div>
          <div className="post-card-meta">
            <h4 className="post-card-name">{post.author}</h4>
            <p className="post-card-time">{timeSince(post.timestamp)} ago</p>
          </div>
        </div>
        <button className="post-card-menu" aria-label="More options">
          <span>⋮</span>
        </button>
      </div>

      {/* Post Content */}
      <p className="post-card-content">{post.content}</p>

      {/* Post Image */}
      {post.image && (
        <div className="post-card-image-container">
          <img src={post.image} alt="Post content" className="post-card-image" />
        </div>
      )}

      {/* Post Stats */}
      <div className="post-card-stats">
        <span className="stat-item">
          <Heart className="stat-icon" />
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </span>
        <span className="stat-item">
          <MessageCircle className="stat-icon" />
          {post.comments ?? 0} {post.comments === 1 ? 'comment' : 'comments'}
        </span>
        <span className="stat-item">
          <Share2 className="stat-icon" />
          {post.shares ?? 0} {post.shares === 1 ? 'share' : 'shares'}
        </span>
      </div>

      {/* Post Actions */}
      <div className="post-card-actions">
        <button
          className={`action-btn ${liked ? 'liked' : ''}`}
          onClick={handleLike}
          aria-label={liked ? 'Unlike post' : 'Like post'}
        >
          <Heart className={`action-icon ${liked ? 'filled' : ''}`} />
          <span>Like</span>
        </button>
        <button className="action-btn" onClick={onComment} aria-label="Comment on post">
          <MessageCircle className="action-icon" />
          <span>Comment</span>
        </button>
        <button className="action-btn" onClick={onShare} aria-label="Share post">
          <Share2 className="action-icon" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

export default PostCard;
