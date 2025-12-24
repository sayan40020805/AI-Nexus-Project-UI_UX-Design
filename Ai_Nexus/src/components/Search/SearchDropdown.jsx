import React from 'react';
import { Search, Loader2, Users, Building2 } from 'lucide-react';
import SearchResultItem from './SearchResultItem';
import './SearchDropdown.css';

const SearchDropdown = ({ 
  isOpen, 
  results, 
  isLoading, 
  query, 
  onResultClick,
  onClose 
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const renderNoResults = () => (
    <div className="search-dropdown-empty">
      <div className="empty-icon">
        <Search className="h-8 w-8" />
      </div>
      <h3 className="empty-title">
        {query ? `No results for "${query}"` : 'Start typing to search'}
      </h3>
      <p className="empty-description">
        {query 
          ? 'Try different keywords or check your spelling'
          : 'Search for users and companies by name'
        }
      </p>
    </div>
  );

  const renderLoading = () => (
    <div className="search-dropdown-loading">
      <Loader2 className="h-6 w-6 animate-spin" />
      <span>Searching...</span>
    </div>
  );

  const renderResults = () => (
    <>
      <div className="search-dropdown-header">
        <div className="header-icon">
          <Search className="h-4 w-4" />
        </div>
        <div className="header-content">
          <span className="header-title">
            Search Results
          </span>
          <span className="header-count">
            {results.length} {results.length === 1 ? 'result' : 'results'} for "{query}"
          </span>
        </div>
      </div>
      
      <div className="search-results-list">
        {results.map((result, index) => (
          <SearchResultItem
            key={`${result.type}-${result.id}`}
            result={result}
            onProfileClick={onResultClick}
          />
        ))}
      </div>
      
      {results.length > 0 && (
        <div className="search-dropdown-footer">
          <div className="footer-content">
            <div className="footer-stats">
              <div className="stat-item">
                <Users className="h-4 w-4" />
                <span>
                  {results.filter(r => r.type === 'user').length} Users
                </span>
              </div>
              <div className="stat-item">
                <Building2 className="h-4 w-4" />
                <span>
                  {results.filter(r => r.type === 'company').length} Companies
                </span>
              </div>
            </div>
            <button className="view-all-btn" onClick={onClose}>
              View All Results
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Backdrop */}
      <div 
        className="search-dropdown-backdrop"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      />
      
      {/* Dropdown */}
      <div className="search-dropdown">
        <div className="search-dropdown-content">
          {isLoading && renderLoading()}
          {!isLoading && results.length === 0 && renderNoResults()}
          {!isLoading && results.length > 0 && renderResults()}
        </div>
      </div>
    </>
  );
};

export default SearchDropdown;
