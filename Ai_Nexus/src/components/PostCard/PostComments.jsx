import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Send, 
  Heart, 
  MoreHorizontal, 
  Reply,
  Edit,
  Trash2
} from 'lucide-react';
import './PostComments.css';

/**
 * PostComments Component
 * 
 * Handles the comments section with:
 * - Comment display with threading support
 * - Add new comments
 * - Like comments
 * - Edit/delete own comments
 * - Reply to comments
 * - Real-time updates
 */
const PostComments = ({ post, onComment, isLoading }) => {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const commentsEndRef = useRef(null);

  // Initialize comments from post data
  useEffect(() => {
    if (post?.comments) {
      setComments(post.comments);
    }
  }, [post]);

  // Scroll to bottom when new comments are added
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle new comment submission
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim() || isLoading) return;

    try {
      const commentData = {
        content: newComment.trim(),
        postId: post._id
      };

      const newCommentObj = await onComment(commentData);
      
      // Add to local state
      setComments(prev => [...prev, newCommentObj]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Handle reply to comment
  const handleReply = async (commentId) => {
    if (!replyText.trim() || isLoading) return;

    try {
      // TODO: Implement reply functionality
      // This would need backend support for threaded comments
      console.log('Reply to comment:', commentId, replyText);
      
      // For now, just clear the reply state
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to reply to comment:', err);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId) => {
    if (!editText.trim() || isLoading) return;

    try {
      // TODO: Implement edit comment functionality
      console.log('Edit comment:', commentId, editText);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, content: editText, edited: true }
          : comment
      ));
      
      setEditingComment(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      // TODO: Implement delete comment functionality
      console.log('Delete comment:', commentId);
      
      // Update local state
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId) => {
    try {
      // TODO: Implement like comment functionality
      console.log('Like comment:', commentId);
      
      // Update local state (optimistic)
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { 
              ...comment, 
              likes: comment.likes || [],
              isLiked: !comment.isLiked 
            }
          : comment
      ));
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  // Format comment timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const commentTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - commentTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return commentTime.toLocaleDateString();
  };

  // Get visible comments (show all or just first few)
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <div className="post-comments">
      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="add-comment-form">
        <div className="comment-input-container">
          <img 
            src={user?.profilePicture || '/default-avatar.svg'}
            alt="Your avatar"
            className="comment-user-avatar"
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
          <div className="comment-input-wrapper">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              rows="1"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!newComment.trim() || isLoading}
              className="comment-submit-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {visibleComments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <div className="comment-avatar">
              <img 
                src={comment.user?.profilePicture || '/default-avatar.svg'}
                alt={comment.user?.username}
                onError={(e) => {
                  e.target.src = '/default-avatar.svg';
                }}
              />
            </div>
            
            <div className="comment-content">
              <div className="comment-header">
                <span className="comment-author">
                  {comment.user?.username || 'Anonymous'}
                </span>
                <span className="comment-timestamp">
                  {formatTimestamp(comment.createdAt)}
                  {comment.edited && <span className="edited-indicator">(edited)</span>}
                </span>
              </div>
              
              {editingComment === comment._id ? (
                <div className="comment-edit-form">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="comment-edit-input"
                    rows="2"
                  />
                  <div className="comment-edit-actions">
                    <button onClick={() => setEditingComment(null)} className="cancel-btn">
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleEditComment(comment._id)}
                      disabled={!editText.trim()}
                      className="save-btn"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-text">
                  {comment.content}
                </div>
              )}
              
              <div className="comment-actions">
                <button 
                  onClick={() => handleLikeComment(comment._id)}
                  className={`comment-action-btn ${comment.isLiked ? 'liked' : ''}`}
                >
                  <Heart size={14} className={comment.isLiked ? 'filled' : ''} />
                  {comment.likes?.length > 0 && (
                    <span>{comment.likes.length}</span>
                  )}
                </button>
                
                <button 
                  onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  className="comment-action-btn"
                >
                  <Reply size={14} />
                  Reply
                </button>
                
                {/* Show edit/delete buttons for own comments */}
                {user?._id === comment.user?._id && (
                  <>
                    <button 
                      onClick={() => {
                        setEditingComment(comment._id);
                        setEditText(comment.content);
                      }}
                      className="comment-action-btn"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => handleDeleteComment(comment._id)}
                      className="comment-action-btn delete"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment._id && (
                <div className="reply-form">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="reply-input"
                    rows="2"
                  />
                  <div className="reply-actions">
                    <button 
                      onClick={() => setReplyingTo(null)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleReply(comment._id)}
                      disabled={!replyText.trim()}
                      className="reply-btn"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Show more comments button */}
        {comments.length > 3 && !showAllComments && (
          <button 
            onClick={() => setShowAllComments(true)}
            className="show-more-comments-btn"
          >
            Show {comments.length - 3} more comments
          </button>
        )}
        
        {/* Show less comments button */}
        {showAllComments && comments.length > 3 && (
          <button 
            onClick={() => setShowAllComments(false)}
            className="show-less-comments-btn"
          >
            Show less
          </button>
        )}
        
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
};

export default PostComments;
