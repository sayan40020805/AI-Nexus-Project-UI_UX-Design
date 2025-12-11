import React from 'react';
import { Eye, Radio } from 'lucide-react';

export function LiveVideoCard({ liveStream, onWatch }) {
  return (
    <div className="live-video-card">
      <div className="live-video-thumbnail">
        <img src={liveStream.thumbnail} alt={liveStream.title} />
        <div className="live-badge">
          <Radio className="live-badge-icon" />
          <span>LIVE</span>
        </div>
      </div>
      <div className="live-video-content">
        <h4 className="live-video-title">{liveStream.title}</h4>
        <p className="live-video-streamer">{liveStream.streamer}</p>
        <div className="live-video-viewers">
          <Eye className="viewer-icon" />
          <span>{liveStream.viewers} watching</span>
        </div>
      </div>
      <button className="live-video-watch-btn" onClick={onWatch}>
        Watch Now
      </button>
    </div>
  );
}

export default LiveVideoCard;
