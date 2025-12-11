import React, { useContext, useEffect, useState } from 'react';
import '../styles/Hero.css';
import { FeedContext } from '../context/FeedContext';
import PostCard from './Hero/PostCard';
import LiveVideoCard from './Hero/LiveVideoCard';
import { PostSkeleton, LiveVideoSkeleton } from './Hero/SkeletonLoaders';
import { LeftPanel, CenterPanel, RightPanel, FeedWelcome } from './Hero/FeedLayout';

export function Hero({ onExploreModels, onJoinCommunity }) {
  const { posts, liveStreams, loading, error } = useContext(FeedContext);

  const handlePostLike = (postId) => {
    console.log('Liked post:', postId);
  };

  const handlePostComment = (postId) => {
    console.log('Comment on post:', postId);
  };

  const handlePostShare = (postId) => {
    console.log('Share post:', postId);
  };

  const handleWatchLive = (liveId) => {
    console.log('Watching live:', liveId);
  };

  return (
    <div className="hero">
      <div className="hero-inner">
        <div className="hero-layout">
          {/* Left Panel - Profile & Trending */}
          <LeftPanel />

          {/* Center Panel - Main Feed */}
          <CenterPanel>
            <FeedWelcome onExploreModels={onExploreModels} onJoinCommunity={onJoinCommunity} />

            <section className="posts-feed">
              {loading ? (
                <>
                  <PostSkeleton />
                  <PostSkeleton />
                  <PostSkeleton />
                </>
              ) : error ? (
                <div className="feed-error">
                  <p>Unable to load posts. Please try again later.</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="feed-empty">
                  <p>No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={() => handlePostLike(post.id)}
                    onComment={() => handlePostComment(post.id)}
                    onShare={() => handlePostShare(post.id)}
                  />
                ))
              )}
            </section>
          </CenterPanel>

          {/* Right Panel - Live Videos */}
          <RightPanel>
            <div className="live-videos-panel">
              <div className="panel-header">
                <h3 className="panel-title">Live Now</h3>
                <span className="live-indicator">🔴</span>
              </div>

              <div className="live-videos-list">
                {loading ? (
                  <>
                    <LiveVideoSkeleton />
                    <LiveVideoSkeleton />
                  </>
                ) : error ? (
                  <div className="panel-error">
                    <p>Unable to load live streams</p>
                  </div>
                ) : liveStreams.length === 0 ? (
                  <div className="panel-empty">
                    <p>No live streams at the moment</p>
                  </div>
                ) : (
                  liveStreams.map((live) => (
                    <LiveVideoCard
                      key={live.id}
                      liveStream={live}
                      onWatch={() => handleWatchLive(live.id)}
                    />
                  ))
                )}
              </div>
            </div>
          </RightPanel>
        </div>
      </div>
    </div>
  );
}

export default Hero;
