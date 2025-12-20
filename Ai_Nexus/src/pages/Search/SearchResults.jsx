import React from 'react';
import { useLocation } from 'react-router-dom';

const SearchResults = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';

  return (
    <div className="search-results-page page-with-header">
      <div className="app-section-header">
        <h1>Search Results</h1>
        <p>Results for "{q}" (placeholder). Integrate with backend search API for users/companies.</p>
      </div>
      <div className="search-results">
        <p>No results to show yet — implement search results rendering here.</p>
      </div>
    </div>
  );
};

export default SearchResults;
