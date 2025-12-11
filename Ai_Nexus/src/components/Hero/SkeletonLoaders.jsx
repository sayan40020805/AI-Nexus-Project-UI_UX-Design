import React from 'react';

export function PostSkeleton() {
  return (
    <div className="post-card post-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-avatar" />
        <div className="skeleton-meta">
          <div className="skeleton-line short" />
          <div className="skeleton-line" />
        </div>
      </div>
      <div className="skeleton-content">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
      <div className="skeleton-image" />
    </div>
  );
}

export function LiveVideoSkeleton() {
  return (
    <div className="live-video-card live-skeleton">
      <div className="skeleton-thumbnail" />
      <div className="skeleton-info">
        <div className="skeleton-line" />
        <div className="skeleton-line short" />
      </div>
    </div>
  );
}

export default PostSkeleton;
