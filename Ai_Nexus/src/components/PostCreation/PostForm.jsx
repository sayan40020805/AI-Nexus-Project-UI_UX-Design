import React, { useState } from 'react';
import PostTypeSelector from './PostTypeSelector';
import AiNewsForm from './forms/AiNewsForm';
import AiShortsForm from './forms/AiShortsForm';
import AiModelsForm from './forms/AiModelsForm';
import AiShowcaseForm from './forms/AiShowcaseForm';
import NormalPostForm from './forms/NormalPostForm';
import PostTypeAnimation from './PostTypeAnimation';
import './PostCreation.css';

const PostForm = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    setFormSubmitted(false);
  };

  const handleFormSubmit = (data) => {
    console.log('Form submitted:', data);
    setFormSubmitted(true);

    // Simulate success feedback
    setTimeout(() => {
      alert(`Post created successfully!\n\nType: ${data.type}\n${JSON.stringify(data, null, 2)}`);
      setSelectedType(null);
      setFormSubmitted(false);
    }, 1500);
  };

  const renderForm = () => {
    const formProps = { onSubmit: handleFormSubmit };

    switch (selectedType) {
      case 'ai_news':
        return <AiNewsForm {...formProps} />;
      case 'ai_shorts':
        return <AiShortsForm {...formProps} />;
      case 'ai_models':
        return <AiModelsForm {...formProps} />;
      case 'ai_showcase':
        return <AiShowcaseForm {...formProps} />;
      case 'normal_post':
        return <NormalPostForm {...formProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="post-form-container">
      <div className="post-form-header">
        <h1>Create a Post</h1>
        <p>Share your thoughts and content with the community</p>
      </div>

      <div className="post-form-layout">
        <div className="post-form-left">
          <PostTypeSelector selectedType={selectedType} onTypeChange={handleTypeChange} />

          {selectedType && (
            <div className={`form-wrapper ${formSubmitted ? 'submitting' : ''}`}>
              {renderForm()}
            </div>
          )}
        </div>

        <div className="post-form-right">
          <PostTypeAnimation selectedType={selectedType} />
        </div>
      </div>
    </div>
  );
};

export default PostForm;
