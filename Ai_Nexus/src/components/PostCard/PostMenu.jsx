
import React, { useState } from 'react';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Flag, 
  Copy, 
  Bookmark,
  Eye,
  EyeOff,
  Users,
  Globe
} from 'lucide-react';
import './PostMenu.css';

/**
 * PostMenu Component
 * 
 * Dropdown menu for post actions with role-based visibility:
 * - Edit post (for authors)
 * - Delete post (for authors)
 * - Save/Bookmark post
 * - Copy post link
 * - Report post (for non-authors)
 * - Change visibility (for authors)
 * - Hide post (for non-authors)
 */
const PostMenu = ({
  post,
  isAuthor,
  canEdit,
  canDelete,
  canModerate,
  onEdit,
  onDelete,
  onReport,
  onHide,
  onShowMenu,
  isVisible
}) => {
  const [showMenu, setShowMenu] = useState(isVisible);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);

  // Handle menu toggle
  const handleMenuToggle = () => {
    setShowMenu(!showMenu);
    if (onShowMenu) {
      onShowMenu();
    }
  };

  // Handle outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.post-menu-container')) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Handle edit click
  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    }
    setShowMenu(false);
  };

  // Handle delete click
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete();
    }
    setShowMenu(false);
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      const postUrl = `${window.location.origin}/post/${post._id}`;
      await navigator.clipboard.writeText(postUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
    setShowMenu(false);
  };

  // Handle save/unsave
  const handleSave = () => {
    // TODO: Implement save/unsave functionality
    console.log('Toggle save for post:', post._id);
    setShowMenu(false);
  };

  // Handle report
  const handleReport = (reason) => {
    if (onReport) {
      onReport(reason);
    }
    setShowReportMenu(false);
    setShowMenu(false);
  };

  // Handle hide post
  const handleHide = () => {
    if (onHide) {
      onHide();
    }
    setShowMenu(false);
  };

  // Handle visibility change
  const handleVisibilityChange = (isPublic) => {
    // TODO: Implement visibility change functionality
    console.log('Change post visibility to:', isPublic);
    setShowVisibilityMenu(false);
    setShowMenu(false);
  };

  return (
    <div className="post-menu-container">
      {/* Menu Trigger Button */}
      <button
        className="post-menu-trigger"
        onClick={handleMenuToggle}
        aria-label="Post options"
      >
        <MoreHorizontal size={16} />
      </button>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="post-menu-dropdown">
          {/* Copy Link */}
          <button onClick={handleCopyLink} className="menu-item">
            <Copy size={16} />
            Copy Link
          </button>

          {/* Save/Bookmark (for all users) */}
          <button onClick={handleSave} className="menu-item">
            <Bookmark size={16} />
            {post.isSaved ? 'Remove Bookmark' : 'Bookmark'}
          </button>

          {/* Divider */}
          <div className="menu-divider" />

          {/* Author Actions */}
          {isAuthor && (
            <>
              {/* Edit Post */}
              {canEdit && (
                <button onClick={handleEditClick} className="menu-item">
                  <Edit size={16} />
                  Edit Post
                </button>
              )}

              {/* Visibility Options */}
              <div className="menu-submenu">
                <button 
                  className="menu-item"
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                >
                  {post.isPublic ? <Globe size={16} /> : <Users size={16} />}
                  {post.isPublic ? 'Public' : 'Followers'}
                </button>
                
                {showVisibilityMenu && (
                  <div className="submenu-dropdown">
                    <button 
                      onClick={() => handleVisibilityChange(true)}
                      className={`submenu-item ${post.isPublic ? 'active' : ''}`}
                    >
                      <Globe size={14} />
                      Public
                    </button>
                    <button 
                      onClick={() => handleVisibilityChange(false)}
                      className={`submenu-item ${!post.isPublic ? 'active' : ''}`}
                    >
                      <Users size={14} />
                      Followers Only
                    </button>
                  </div>
                )}
              </div>

              {/* Delete Post */}
              {canDelete && (
                <button onClick={handleDeleteClick} className="menu-item delete">
                  <Trash2 size={16} />
                  Delete Post
                </button>
              )}
            </>
          )}

          {/* Non-Author Actions */}
          {!isAuthor && (
            <>
              {/* Hide Post */}
              <button onClick={handleHide} className="menu-item">
                <EyeOff size={16} />
                Hide Post
              </button>

              {/* Report Post */}
              <div className="menu-submenu">
                <button 
                  className="menu-item report"
                  onClick={() => setShowReportMenu(!showReportMenu)}
                >
                  <Flag size={16} />
                  Report Post
                </button>
                
                {showReportMenu && (
                  <div className="submenu-dropdown">
                    <button 
                      onClick={() => handleReport('spam')}
                      className="submenu-item"
                    >
                      Spam
                    </button>
                    <button 
                      onClick={() => handleReport('inappropriate')}
                      className="submenu-item"
                    >
                      Inappropriate Content
                    </button>
                    <button 
                      onClick={() => handleReport('harassment')}
                      className="submenu-item"
                    >
                      Harassment
                    </button>
                    <button 
                      onClick={() => handleReport('misinformation')}
                      className="submenu-item"
                    >
                      Misinformation
                    </button>
                    <button 
                      onClick={() => handleReport('other')}
                      className="submenu-item"
                    >
                      Other
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Moderator Actions */}
          {canModerate && !isAuthor && (
            <>
              {/* Divider */}
              <div className="menu-divider" />
              
              {/* Hide Post */}
              <button onClick={handleHide} className="menu-item">
                <EyeOff size={16} />
                Hide Post
              </button>
              
              {/* Remove Post (Moderators only) */}
              <button onClick={handleDeleteClick} className="menu-item delete">
                <Trash2 size={16} />
                Remove Post
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PostMenu;

