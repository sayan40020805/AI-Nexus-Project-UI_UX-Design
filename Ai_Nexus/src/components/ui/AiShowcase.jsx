import React from "react";
import "../../styles/AiShowcase.css";

const AiShowcase = () => {
  const showcaseItems = [
    {
      id: 1,
      title: "AI Model One",
      description: "This is a description for the first AI model. It's very powerful.",
      imageUrl: "https://placehold.co/600x400/d1d5db/374151?text=AI+Model+1",
    },
    {
      id: 2,
      title: "AI Model Two",
      description: "This is a description for the second AI model. It specializes in language.",
      imageUrl: "https://placehold.co/600x400/e5e7eb/4b5563?text=AI+Model+2",
    },
    {
      id: 3,
      title: "AI Model Three",
      description: "This is a description for the third AI model. It generates amazing images.",
      imageUrl: "https://placehold.co/600x400/9ca3af/1f2937?text=AI+Model+3",
    },
  ];

  return (
    <div className="ai-showcase-container p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">AI Showcase</h1>
      <div className="ai-showcase-grid">
        {showcaseItems.map((item) => (
          <div key={item.id} className="ai-showcase-card">
            <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiShowcase;