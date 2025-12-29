import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SearchResultItem from '../../components/Search/SearchResultItem';
import '../../styles/SearchResults.css';
import { 
  Search, 
  User, 
  Building2, 
  Users, 
  MessageCircle,
  MapPin,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Video,
  Zap
} from 'lucide-react';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState('all');
  const [totalResults, setTotalResults] = useState(0);

  // Get search query from URL params
  const params = new URLSearchParams(location.search);
  const query = params.get('q') || '';

  useEffect(() => {
    setSearchTerm(query);
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query, token]);

  const performSearch = async (searchQuery) => {
    if (!token || !searchQuery.trim()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        q: searchQuery.trim(),
        type: filterBy === 'all' ? undefined : filterBy,
        page: '1',
        limit: '20'
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setTotalResults(data.pagination?.total || 0);
      } else {
        throw new Error('Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleResultClick = (result) => {
    // Navigate to user/company profile based on type
    if (result.type === 'company') {
      navigate(`/company/${result.id}`);
    } else {
      navigate(`/profile/${result.id}`);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'user':
        return <User size={20} />;
      case 'company':
        return <Building2 size={20} />;
      default:
        return <User size={20} />;
    }
  };

  const getResultTypeLabel = (type) => {
    switch (type) {
      case 'user':
        return 'User';
      case 'company':
        return 'Company';
      default:
        return 'User';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) return 'Today';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  // Filter and sort results
  const filteredAndSortedResults = results
    .filter(result => {
      if (filterBy === 'all') return true;
      return result.type === filterBy;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'relevance':
        default:
          // Simple relevance scoring based on name match position
          const aIndex = a.name.toLowerCase().indexOf(searchTerm.toLowerCase());
          const bIndex = b.name.toLowerCase().indexOf(searchTerm.toLowerCase());
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
      }
    });

  return (
    <div className="search-results-page page-with-header">
      <div className="search-header">
        <div className="search-title-section">
          <Search className="search-icon" size={24} />
          <h1>Search Results</h1>
          {query && (
            <p className="search-subtitle">
              Results for "{query}" ({totalResults} {totalResults === 1 ? 'result' : 'results'})
            </p>
          )}
        </div>
      </div>

      {/* Search Form */}
      <div className="search-form-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-input-icon" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for users and companies..."
              className="search-input"
            />
            <button type="submit" className="search-submit-btn">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filters and Sort */}
      {results.length > 0 && (
        <div className="search-controls">
          <div className="filter-section">
            <Filter size={16} />
            <label>Filter:</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Results</option>
              <option value="user">Users Only</option>
              <option value="company">Companies Only</option>
            </select>
          </div>

          <div className="sort-section">
            {sortBy === 'asc' || sortBy === 'desc' ? (
              <SortAsc size={16} />
            ) : (
              <SortDesc size={16} />
            )}
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="relevance">Relevance</option>
              <option value="name">Name</option>
              <option value="date">Date Joined</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Content */}
      <div className="search-results-content">
        {loading ? (
          <div className="search-loading">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : error ? (
          <div className="search-error">
            <p>{error}</p>
            <button onClick={() => performSearch(query)} className="retry-button">
              Try Again
            </button>
          </div>
        ) : !query ? (
          <div className="search-empty">
            <Search size={48} className="empty-icon" />
            <h3>Start Your Search</h3>
            <p>Enter a name or company to find users and organizations</p>
          </div>
        ) : filteredAndSortedResults.length === 0 ? (
          <div className="no-results">
            <Search size={48} className="no-results-icon" />
            <h3>No results found</h3>
            <p>
              No users or companies found for "{query}".
              Try adjusting your search terms or filters.
            </p>
            <div className="search-suggestions">
              <p>Search suggestions:</p>
              <ul>
                <li>Check your spelling</li>
                <li>Try more general terms</li>
                <li>Search for partial names</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="results-list">
            {filteredAndSortedResults.map((result) => (
              <SearchResultItem
                key={result.id}
                result={result}
                onProfileClick={handleResultClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search Stats */}
      {filteredAndSortedResults.length > 0 && (
        <div className="search-stats">
          <div className="stats-item">
            <span className="stats-number">{filteredAndSortedResults.length}</span>
            <span className="stats-label">
              {filterBy === 'all' ? 'Results' : 
               filterBy === 'user' ? 'Users' : 'Companies'}
            </span>
          </div>
          <div className="stats-item">
            <span className="stats-number">
              {filteredAndSortedResults.filter(r => r.type === 'user').length}
            </span>
            <span className="stats-label">Users</span>
          </div>
          <div className="stats-item">
            <span className="stats-number">
              {filteredAndSortedResults.filter(r => r.type === 'company').length}
            </span>
            <span className="stats-label">Companies</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
