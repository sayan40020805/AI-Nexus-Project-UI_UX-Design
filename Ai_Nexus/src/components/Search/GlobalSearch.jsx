import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Search, X, User, Building2, ArrowRight } from 'lucide-react';
import './GlobalSearch.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Search result item component
const SearchResultItem = ({ result, onClick, isActive }) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  const avatar = result.avatar || result.logo || null;
  const name = result.displayName || result.name || (result.type === 'user' ? result.username : result.companyName);
  const displayName = result.displayName || name;
  const icon = result.type === 'user' ? <User size={16} /> : <Building2 size={16} />;

  return (
    <div 
      className={`search-result-item ${isActive ? 'active' : ''}`}
      onClick={() => onClick(result)}
    >
      <div className="result-avatar">
        {avatar ? (
          <img 
            src={avatar.startsWith('http') ? avatar : `${baseUrl}${avatar}`} 
            alt={displayName}
            onError={(e) => {
              e.target.src = '/default-avatar.svg';
            }}
          />
        ) : (
          <div className="avatar-placeholder">
            {icon}
          </div>
        )}
      </div>
      <div className="result-info">
        <div className="result-name">
          {result.verified && (
            <span className="verified-badge">✓</span>
          )}
          <span>{displayName}</span>
        </div>
        <div className="result-meta">
          {result.bio && <span className="result-bio">{result.bio.substring(0, 40)}...</span>}
          <span className="result-type">{result.type === 'user' ? 'User' : 'Company'}</span>
        </div>
      </div>
      {result.isFollowing !== undefined && (
        <div className={`follow-status ${result.isFollowing ? 'following' : ''}`}>
          {result.isFollowing ? 'Following' : 'Follow'}
        </div>
      )}
    </div>
  );
};

// Skeleton loader
const SearchSkeleton = () => (
  <div className="search-skeleton">
    <div className="skeleton-avatar" />
    <div className="skeleton-content">
      <div className="skeleton-line" style={{ width: '60%' }} />
      <div className="skeleton-line" style={{ width: '40%' }} />
    </div>
  </div>
);

const GlobalSearch = ({ 
  isOpen, 
  onClose, 
  onSelect,
  placeholder = 'Search users and companies...',
  showTrigger = true
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // flat list used for keyboard indexing
  const [groupedSuggestions, setGroupedSuggestions] = useState({ people: [], companies: [] }); // for rendering sections
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showResults, setShowResults] = useState(false);
  const [pagination, setPagination] = useState({ hasMore: false, nextCursor: null });
  
  const inputRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);
  const abortControllerRef = useRef(null);

  // Get token from localStorage
  const getToken = useCallback(() => {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
  }, []);

  // Fetch suggestions (for typeahead) - allow 1+ chars and handle grouped response
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSuggestions([]);
      setGroupedSuggestions({ people: [], companies: [] });
      return;
    }

    try {
      const token = getToken();

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(
        `${API_BASE}/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`,
        {
          headers
        }
      );

      if (response.ok) {
        const data = await response.json();
        const people = (data.suggestions && data.suggestions.people) || [];
        const companies = (data.suggestions && data.suggestions.companies) || [];
        // Flat list for indexing (people first, then companies)
        setSuggestions([...people, ...companies]);
        setGroupedSuggestions({ people, companies });
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, [getToken]);

  // Fetch full search results
  const fetchSearchResults = useCallback(async (searchQuery, cursor = null) => {
    if (!searchQuery || searchQuery.length < 1) {
      setResults([]);
      setPagination({ hasMore: false, nextCursor: null });
      return;
    }

    setIsSearching(true);
    setIsLoading(true);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const token = getToken();

      let url = `${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&limit=20`;
      if (cursor) {
        url += `&cursor=${encodeURIComponent(cursor)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: abortControllerRef.current.signal
      });

      if (response.ok) {
        const data = await response.json();
        
        if (cursor) {
          // Append new results to existing ones (for load more)
          setResults(prev => [...prev, ...data.results]);
        } else {
          setResults(data.results || []);
        }
        setPagination({
          hasMore: data.pagination?.hasMore || false,
          nextCursor: data.pagination?.nextCursor || null
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error);
      }
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  }, [getToken]);

  // Effect for debounced query (start suggestions at 1+ chars)
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length >= 1) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
      setGroupedSuggestions({ people: [], companies: [] });
    }
  }, [debouncedQuery, fetchSuggestions]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);
    
    if (value.length >= 1) {
      setShowResults(true);
    } else {
      setShowResults(false);
      setResults([]);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (query.trim()) {
      setShowResults(true);
      fetchSearchResults(query.trim());
    }
  };

  // Handle key down
  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + results.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, totalItems - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          if (activeIndex < suggestions.length) {
            handleSelect(suggestions[activeIndex]);
          } else {
            handleSelect(results[activeIndex - suggestions.length]);
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        e.preventDefault();
        handleClose();
        break;
    }
  };

  // Handle result selection
  const handleSelect = (result) => {
    if (onSelect) {
      onSelect(result);
    }
    handleClose();
  };

  // Close and reset
  const handleClose = () => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setShowResults(false);
    setActiveIndex(-1);
    if (onClose) {
      onClose();
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Load more results
  const loadMore = () => {
    if (pagination.nextCursor) {
      fetchSearchResults(query.trim(), pagination.nextCursor);
    }
  };

  if (!isOpen) {
    if (showTrigger) {
      return (
        <button className="search-trigger" onClick={() => {}}>
          <Search size={18} />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
      );
    }
    return null;
  }

  return (
    <div className="global-search-overlay" onClick={handleClose}>
      <div className="global-search-container" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="search-input"
          />
          {query && (
            <button className="clear-button" onClick={() => setQuery('')}>
              <X size={18} />
            </button>
          )}
          <button className="close-button" onClick={handleClose}>
            ESC
          </button>
        </div>

        {/* Results Dropdown */}
        {showResults && (
          <div className="search-results-dropdown">
            {/* Suggestions (grouped into People & Companies) */}
            {suggestions.length > 0 && (
              <div className="search-section">
                {groupedSuggestions.people.length > 0 && (
                  <>
                    <div className="section-header">
                      <span>People</span>
                    </div>
                    {groupedSuggestions.people.map((item, i) => {
                      const index = i; // people are first in the flat suggestions array
                      return (
                        <SearchResultItem
                          key={`person-${item.id}`}
                          result={item}
                          onClick={handleSelect}
                          isActive={activeIndex === index}
                        />
                      );
                    })}
                  </>
                )}

                {groupedSuggestions.companies.length > 0 && (
                  <>
                    <div className="section-header">
                      <span>Companies</span>
                    </div>
                    {groupedSuggestions.companies.map((item, i) => {
                      const index = groupedSuggestions.people.length + i; // companies come after people
                      return (
                        <SearchResultItem
                          key={`company-${item.id}`}
                          result={item}
                          onClick={handleSelect}
                          isActive={activeIndex === index}
                        />
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="search-section">
                <div className="section-header">
                  <span>Results</span>
                  <span className="result-count">{results.length} found</span>
                </div>
                {results.map((item, index) => (
                  <SearchResultItem
                    key={item.id}
                    result={item}
                    onClick={handleSelect}
                    isActive={activeIndex === suggestions.length + index}
                  />
                ))}
                {pagination.hasMore && (
                  <button className="load-more-button" onClick={loadMore} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </div>
            )}

            {/* Loading State */}
            {isSearching && isLoading && (
              <div className="search-loading">
                <SearchSkeleton />
                <SearchSkeleton />
                <SearchSkeleton />
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length >= 2 && results.length === 0 && suggestions.length === 0 && (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <p>No results found for "{query}"</p>
                <span>Try searching for a different name</span>
              </div>
            )}

            {/* Footer */}
            <div className="search-footer">
              <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
              <span><kbd>Enter</kbd> to select</span>
              <span><kbd>Esc</kbd> to close</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;

