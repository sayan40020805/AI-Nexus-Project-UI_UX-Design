import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FeedContext } from '../../context/FeedContext';
import PostContent from './PostContent';
import PostActions from './PostActions';
import PostComments from './PostComments';
import PostEditModal from './PostEditModal';
import PostMenu from './PostMenu';
import './PostCard.css';

/**
 * PostCard Component
 * 
 * Comprehensive post display component with all interactions:
 * - Content rendering with media support
 * - Like, comment, share, save actions
 * - Edit/delete functionality (for authors)
 * - Comment system with threading
 * - Role-based access control
 * - Optimistic updates and loading states
 * - Error handling
 */
const PostCard = ({ 
  post, 
  onPostUpdate, 
  onPostDelete, 
  showComments = false,
  compact = false 
}) => {
  const { user, token } = useAuth();
  const { likePost, commentOnPost, sharePost } = React.useContext(FeedContext);
  
  // Component state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showCommentsSection, setShowCommentsSection] = useState(showComments);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize state from post data
  useEffect(() => {
    if (post) {
      setIsLiked(post.isLiked || false);
      setLikesCount(post.likes?.length || 0);
      setCommentsCount(post.comments?.length || 0);
      setSharesCount(post.shares?.length || 0);
      setIsBookmarked(post.isBookmarked || false);
      setIsSaved(post.isSaved || false);
    }
  }, [post]);

  // Check if current user is the author
  const isAuthor = user && post?.author?._id === user._id;
  const canEdit = isAuthor;
  const canDelete = isAuthor;
  const canModerate = user?.role === 'company' || user?.role === 'admin';

  // Handle like/unlike
  const handleLike = async () => {
    if (!token || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Optimistic update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);
      
      await likePost(post._id);
    } catch (err) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      setError('Failed to update like. Please try again.');
      console.error('Like error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle comment
  const handleComment = async (content) => {
    if (!token || !content.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const newComment = await commentOnPost(post._id, content.trim());
      
      // Update local state
      setCommentsCount(prev => prev + 1);
      
      // Notify parent component
      if (onPostUpdate) {
        onPostUpdate({
          ...post,
          comments: [...(post.comments || []), newComment]
        });
      }
      
      return newComment;
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error('Comment error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!token || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Optimistic update
      if (!sharesCount) {
        setSharesCount(1);
      }
      
      await sharePost(post._id);
    } catch (err) {
      setSharesCount(prev => prev > 0 ? prev - 1 : 0);
      setError('Failed to share post. Please try again.');
      console.error('Share error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle save/bookmark
  const handleSave = async () => {
    if (!token || isLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Optimistic update
      setIsSaved(!isSaved);
      
      // TODO: Implement save/bookmark API call
      // await savePost(post._id);
      
    } catch (err) {
      // Revert optimistic update
      setIsSaved(!isSaved);
      setError('Failed to save post. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit
  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!token || !window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        if (onPostDelete) {
          onPostDelete(post._id);
        }
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (err) {
      setError('Failed to delete post. Please try again.');
      console.error('Delete error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle post update from edit modal
  const handlePostUpdate = (updatedPost) => {
    if (onPostUpdate) {
      onPostUpdate(updatedPost);
    }
    setShowEditModal(false);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return postTime.toLocaleDateString();
  };

  if (!post) {
    return null;
  }

  return (
    <div className={`post-card ${compact ? 'compact' : ''} ${isLoading ? 'loading' : ''}`}>
      {/* Error Banner */}
      {error && (
        <div className="post-error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Post Header */}
      <div className="post-header">
        <div className="post-author">
          <img 
            src={post.author?.profilePicture || post.author?.companyLogo || '/default-avatar.svg'}
            alt={post.author?.username || post.author?.companyName}
            className="post-author-avatar"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
          <div className="post-author-info">
            <div className="post-author-name">
              {post.author?.username || post.author?.companyName}
              {post.author?.role === 'company' && (
                <span className="verified-badge">✓</span>
              )}
            </div>
            <div className="post-meta">
              <span className="post-timestamp">{formatTimestamp(post.createdAt)}</span>
              <span className="post-privacy">
                • {post.isPublic ? 'Public' : 'Followers'}
              </span>
              {post.postType && (
                <span className="post-type">• {post.postType}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Post Menu */}
        <div className="post-menu-container">
          <PostMenu
            post={post}
            isAuthor={isAuthor}
            canEdit={canEdit}
            canDelete={canDelete}
            canModerate={canModerate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShowMenu={() => setShowMenu(!showMenu)}
            isVisible={showMenu}
          />
        </div>
      </div>

      {/* Post Content */}
      <PostContent 
        post={post}
        compact={compact}
      />

      {/* Post Actions */}
      <PostActions
        isLiked={isLiked}
        likesCount={likesCount}
        commentsCount={commentsCount}
        sharesCount={sharesCount}
        isSaved={isSaved}
        isLoading={isLoading}
        onLike={handleLike}
        onComment={() => setShowCommentsSection(!showCommentsSection)}
        onShare={handleShare}
        onSave={handleSave}
      />

      {/* Comments Section */}
      {showCommentsSection && (
        <PostComments
          post={post}
          onComment={handleComment}
          isLoading={isLoading}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <PostEditModal
          post={post}
          onClose={() => setShowEditModal(false)}
          onUpdate={handlePostUpdate}
        />
      )}
    </div>
  );
};

export default PostCard;
