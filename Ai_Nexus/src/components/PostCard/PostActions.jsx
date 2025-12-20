import React from 'react';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Copy,
  Download,
  Flag
} from 'lucide-react';
import './PostActions.css';

/**
 * PostActions Component
 * 
 * Handles all post interaction buttons:
 * - Like/Unlike with animation
 * - Comment toggle
 * - Share functionality
 * - Save/Bookmark
 * - Additional options menu
 */
const PostActions = ({
  isLiked,
  likesCount,
  commentsCount,
  sharesCount,
  isSaved,
  isLoading,
  onLike,
  onComment,
  onShare,
  onSave,
  showLabels = true,
  compact = false
}) => {
  const [showMoreOptions, setShowMoreOptions] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  // Handle like button click
  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onLike();
    }
  };

  // Handle comment button click
  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onComment();
    }
  };

  // Handle share button click
  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onShare();
      setShowShareMenu(!showShareMenu);
    }
  };

  // Handle save button click
  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      onSave();
    }
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${'post._id'}`; // TODO: get actual post URL
      await navigator.clipboard.writeText(postUrl);
      alert('Link copied to clipboard!');
      setShowShareMenu(false);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  // Handle download media
  const handleDownloadMedia = () => {
    // TODO: Implement download functionality
    console.log('Download media');
    setShowMoreOptions(false);
  };

  // Handle report post
  const handleReportPost = () => {
    // TODO: Implement report functionality
    console.log('Report post');
    setShowMoreOptions(false);
  };

  // Format count display
  const formatCount = (count) => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className={`post-actions ${compact ? 'compact' : ''}`}>
      {/* Action Buttons */}
      <div className="post-action-buttons">
        {/* Like Button */}
        <button
          className={`post-action-btn like-btn ${isLiked ? 'liked' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleLikeClick}
          disabled={isLoading}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart 
            className={`action-icon ${isLiked ? 'filled' : ''}`}
            size={compact ? 16 : 20}
          />
          {showLabels && likesCount > 0 && (
            <span className="action-count">{formatCount(likesCount)}</span>
          )}
        </button>

        {/* Comment Button */}
        <button
          className={`post-action-btn comment-btn ${isLoading ? 'loading' : ''}`}
          onClick={handleCommentClick}
          disabled={isLoading}
          title="Comment"
        >
          <MessageCircle 
            className="action-icon"
            size={compact ? 16 : 20}
          />
          {showLabels && commentsCount > 0 && (
            <span className="action-count">{formatCount(commentsCount)}</span>
          )}
        </button>

        {/* Share Button */}
        <div className="share-container">
          <button
            className={`post-action-btn share-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleShareClick}
            disabled={isLoading}
            title="Share"
          >
            <Share2 
              className="action-icon"
              size={compact ? 16 : 20}
            />
            {showLabels && sharesCount > 0 && (
              <span className="action-count">{formatCount(sharesCount)}</span>
            )}
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="share-menu">
              <button onClick={handleCopyLink} className="share-option">
                <Copy size={16} />
                Copy Link
              </button>
              {/* Add more share options like social media platforms */}
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          className={`post-action-btn save-btn ${isSaved ? 'saved' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={handleSaveClick}
          disabled={isLoading}
          title={isSaved ? 'Unsave' : 'Save'}
        >
          <Bookmark 
            className={`action-icon ${isSaved ? 'filled' : ''}`}
            size={compact ? 16 : 20}
          />
        </button>

        {/* More Options Button */}
        <div className="more-options-container">
          <button
            className="post-action-btn more-btn"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            title="More options"
          >
            <MoreHorizontal size={compact ? 16 : 20} />
          </button>

          {/* More Options Menu */}
          {showMoreOptions && (
            <div className="more-options-menu">
              <button onClick={handleDownloadMedia} className="more-option">
                <Download size={16} />
                Download Media
              </button>
              <button onClick={handleReportPost} className="more-option report">
                <Flag size={16} />
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menus */}
      {(showShareMenu || showMoreOptions) && (
        <div 
          className="menu-overlay"
          onClick={() => {
            setShowShareMenu(false);
            setShowMoreOptions(false);
          }}
        />
      )}
    </div>
  );
};

export default PostActions;
