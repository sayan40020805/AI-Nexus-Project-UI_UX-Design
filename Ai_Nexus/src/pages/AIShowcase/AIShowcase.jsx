import React from 'react';
import '../../styles/AIShowcase.css';
import { AIShowcase as ShowcaseComponent } from '../../components/AIShowcase';

export default function AIShowcasePage() {
  return (
    <div className="ai-showcase-page page-with-header">
      <div className="app-main">
        <section className="app-section">
          <div className="app-section-header">
            <h2 className="section-title">AI Showcase</h2>
            <div className="section-underline" />
          </div>

          <div className="app-section-content">
            <ShowcaseComponent />
          </div>
        </section>
      </div>
    </div>
  );
}
