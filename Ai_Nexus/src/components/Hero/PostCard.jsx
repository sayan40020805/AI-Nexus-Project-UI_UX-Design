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
  const [liked, setLiked] = React.useState(post.isLiked || false);
  const [likeCount, setLikeCount] = React.useState(post.likes?.length || 0);

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(newLiked ? likeCount + 1 : likeCount - 1);
    if (onLike) onLike(post._id || post.id);
  };

  return (

    <article className="post-card">
      {/* Post Header */}
      <div className="post-card-header">
        <div className="post-card-author-info">
          <div className="post-card-avatar">
            {post.author?.profilePicture ? (
              <img src={post.author.profilePicture} alt={post.author.name} />
            ) : (
              post.authorAvatar || '👤'
            )}
          </div>
          <div className="post-card-meta">
            <h4 className="post-card-name">{post.author?.name || 'Unknown User'}</h4>
            <p className="post-card-time">{timeSince(new Date(post.createdAt).getTime())} ago</p>
          </div>
        </div>
        <button className="post-card-menu" aria-label="More options">
          <span>⋮</span>
        </button>
      </div>

      {/* Post Content */}
      <div className="post-card-content">
        {post.title && <h3 className="post-card-title">{post.title}</h3>}
        <p className="post-card-text">{post.content}</p>
      </div>

      {/* Post Image/Video */}
      {post.media && post.media.length > 0 && (
        <div className="post-card-image-container">
          {post.media[0].type === 'image' ? (
            <img src={post.media[0].url} alt="Post content" className="post-card-image" />
          ) : post.media[0].type === 'video' ? (
            <video src={post.media[0].url} controls className="post-card-video" />
          ) : null}
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
          {post.comments?.length ?? 0} {post.comments?.length === 1 ? 'comment' : 'comments'}
        </span>
        <span className="stat-item">
          <Share2 className="stat-icon" />
          {post.shares?.length ?? 0} {post.shares?.length === 1 ? 'share' : 'shares'}
        </span>
        {post.postType && (
          <span className="stat-item">
            <Eye className="stat-icon" />
            {post.postType}
          </span>
        )}
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
        <button className="action-btn" onClick={() => onComment(post._id || post.id)} aria-label="Comment on post">
          <MessageCircle className="action-icon" />
          <span>Comment</span>
        </button>
        <button className="action-btn" onClick={() => onShare(post._id || post.id)} aria-label="Share post">
          <Share2 className="action-icon" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

export default PostCard;
