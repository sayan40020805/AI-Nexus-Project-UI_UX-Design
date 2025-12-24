import React from 'react';
import { User, Building2, UserCheck, UserPlus, Loader2 } from 'lucide-react';
import { useFollow } from '../../context/FollowContext';
import './SearchResultItem.css';

const SearchResultItem = ({ result, onProfileClick }) => {
  const { toggleFollow, getFollowStatus, getFollowLoading } = useFollow();
  
  const isFollowing = getFollowStatus(result.id);
  const isLoading = getFollowLoading(result.id);

  const handleFollowClick = async (e) => {
    e.stopPropagation(); // Prevent profile click
    const result = await toggleFollow(result.id, isFollowing);
    
    if (!result.success) {
      // Could show toast notification here
      console.error('Follow action failed:', result.error);
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation(); // Prevent follow button click
    if (onProfileClick) {
      onProfileClick(result);
    }
  };

  const getAccountTypeIcon = () => {
    if (result.type === 'company') {
      return <Building2 className="h-3 w-3" />;
    }
    return <User className="h-3 w-3" />;
  };

  const getAccountTypeLabel = () => {
    return result.type === 'company' ? 'Company' : 'User';
  };

  const getAccountTypeBadgeClass = () => {
    return `search-result-badge ${result.type}`;
  };

  const getFollowButtonClass = () => {
    let baseClass = 'follow-button';
    
    if (isLoading) {
      baseClass += ' loading';
    } else if (isFollowing) {
      baseClass += ' following';
    } else {
      baseClass += ' not-following';
    }
    
    return baseClass;
  };

  const getFollowButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </>
      );
    }
    
    if (isFollowing) {
      return (
        <>
          <UserCheck className="h-4 w-4" />
          <span>Following</span>
        </>
      );
    }
    
    return (
      <>
        <UserPlus className="h-4 w-4" />
        <span>Follow</span>
      </>
    );
  };

  return (
    <div className="search-result-item" onClick={handleProfileClick}>
      <div className="search-result-avatar">
        <img 
          src={result.profilePicture || '/default-avatar.svg'} 
          alt={result.name}
          onError={(e) => { 
            e.target.src = '/default-avatar.svg';
          }}
        />
      </div>
      
      <div className="search-result-info">
        <div className="search-result-header">
          <h4 className="search-result-name">{result.name}</h4>
          <div className={getAccountTypeBadgeClass()}>
            {getAccountTypeIcon()}
            <span>{getAccountTypeLabel()}</span>
          </div>
        </div>
        
        {result.bio && (
          <p className="search-result-bio">
            {result.bio.length > 100 
              ? `${result.bio.substring(0, 100)}...` 
              : result.bio
            }
          </p>
        )}
        
        <div className="search-result-footer">
          <div className="search-result-meta">
            {result.followerCount !== undefined && (
              <span className="follower-count">
                {result.followerCount} {result.followerCount === 1 ? 'follower' : 'followers'}
              </span>
            )}
          </div>
          
          <button 
            className={getFollowButtonClass()}
            onClick={handleFollowClick}
            disabled={isLoading}
          >
            {getFollowButtonContent()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchResultItem;
