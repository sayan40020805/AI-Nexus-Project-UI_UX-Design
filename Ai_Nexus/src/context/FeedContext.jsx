import React, { createContext, useState, useEffect } from 'react';

export const FeedContext = createContext(null);

const initialPosts = [
  // sample global posts (read-only samples)
  {
    id: 1,
    author: 'AI Researcher',
    authorAvatar: '🤖',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    content:
      "Just published our latest paper on multimodal AI systems! The results are promising.",
    image: null,
    likes: 127,
    comments: 23,
  },
  {
    id: 2,
    author: 'ML Engineer',
    authorAvatar: '💻',
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    content:
      'Building a real-time sentiment analysis system for social media. Any optimization tips?',
    image: null,
    likes: 89,
    comments: 34,
  },
];

const sampleLive = [
  {
    id: 'l1',
    title: 'Live: Building AI Chatbots with GPT-4',
    streamer: 'AI Developer Hub',
    thumbnail:
      'https://images.unsplash.com/photo-1625314887424-9f190599bd56?auto=format&fit=crop&w=1200&q=60',
    viewers: 1247,
    isLive: true,
  },
  {
    id: 'l2',
    title: 'Machine Learning Q&A Session',
    streamer: 'ML Academy',
    thumbnail:
      'https://images.unsplash.com/photo-1584291527908-033f4d6542c8?auto=format&fit=crop&w=1200&q=60',
    viewers: 634,
    isLive: true,
  },
];

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState(initialPosts);
  const [liveStreams, setLiveStreams] = useState(sampleLive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // placeholder for fetching remote feed if needed
    // currently using sample data; setLoading can simulate delay
    let mounted = true;
    setLoading(true);
    const t = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 600);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, []);

  const addPost = (post) => {
    // post should include timestamp (ms) and author fields
    setPosts((prev) => [{ ...post, id: Date.now() }, ...prev]);
  };

  const addLive = (live) => {
    setLiveStreams((prev) => [{ ...live, id: `l-${Date.now()}` }, ...prev]);
  };

  return (
    <FeedContext.Provider value={{ posts, liveStreams, addPost, addLive, loading, error }}>
      {children}
    </FeedContext.Provider>
  );
}

export default FeedContext;
