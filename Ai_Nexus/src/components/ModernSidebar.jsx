import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Sparkles, Search, User, X, HelpCircle, BarChart3, Video, Radio, FileText } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ModernSidebar.css';

export function ModernSidebar({ sidebarOpen, setSidebarOpen }) {
  const [localOpen, setLocalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const setOpen = (val) => {
    if (isControlled) {
      if (typeof setSidebarOpen === 'function') setSidebarOpen(val);
    } else {
      setLocalOpen(val);
    }
  };

  const isControlled = typeof sidebarOpen === 'boolean';
  const open = isControlled ? sidebarOpen : localOpen;

  // Get current path for active state
  const getCurrentPath = () => {
    return location.pathname;
  };

  // Search functionality
  const performSearch = async (query) => {
    if (!query.trim() || !token) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSearchResultClick = (result) => {
    // Navigate to user/company profile
    if (result.type === 'user') {
      navigate(`/profile/${result.id}`);
    } else {
      navigate(`/company/${result.id}`);
    }
    setShowSearchResults(false);
    setSearchQuery('');
    setOpen(false);
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow clicking
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  useEffect(() => {
    window.__modernSidebarPresent = true;

    const handler = () => {
      if (!isControlled) setLocalOpen((prev) => !prev);
    };
    window.addEventListener("toggle-modern-sidebar", handler);

    const esc = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", esc);

    return () => {
      window.removeEventListener("toggle-modern-sidebar", handler);
      window.removeEventListener("keydown", esc);
      window.__modernSidebarPresent = false;
    };
  }, [isControlled, setOpen]);

  const sidebarItems = [
    { id: 'tools', label: 'AI Tools', icon: Sparkles, path: '/tools' },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, path: '/quiz' },
    { id: 'ats', label: 'ATS Score', icon: BarChart3, path: '/ats' },
    { id: 'shorts', label: 'AI Shorts', icon: Video, path: '/shorts' },
    { id: 'create-post', label: 'Create Post', icon: FileText, path: '/create-post' },
    { id: 'live', label: 'Live', icon: Radio, path: '/live' },
  ];

  const handleProfileClick = () => {
    navigate('/dashboard');
    setOpen(false);
  };

  const isActivePath = (path) => {
    const current = getCurrentPath();
    if (!path || path === '/') return current === '/';
    return current.startsWith(path);
  };

  return (
    <>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`modern-sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <div className="sidebar-brand">
              <div className="sidebar-brand-icon">
                <Sparkles className="h-8 w-6" />
              </div>
              <div className="sidebar-brand-text">
                <h3>AI Nexus Platform</h3>
              </div>
            </div>

            <button className="sidebar-close-btn" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="sidebar-quick-actions">
          <div className="sidebar-search-bar">
            <Search className="h-4 w-4 search-icon" />
            <input 
              type="text" 
              placeholder="Search users, companies…" 
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
            />
            {isSearching && <div className="search-spinner">...</div>}
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <div className="search-result-avatar">
                    <img 
                      src={result.profilePicture || '/default-avatar.svg'} 
                      alt={result.name}
                      onError={(e) => { e.target.src = '/default-avatar.svg'; }}
                    />
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-name">{result.name}</div>
                    <div className="search-result-type">{result.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {showSearchResults && searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="search-results-dropdown">
              <div className="search-no-results">No results found</div>
            </div>
          )}

          <button className="quick-action-btn profile-btn" onClick={handleProfileClick}>
            <User className="h-4 w-4" />
            <span>Profile</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h4 className="nav-section-title">AI Tools</h4>

            <div className="nav-items">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    <div className="nav-item-icon-wrapper">
                      <Icon className="nav-item-icon" />
                      {isActive && <div className="nav-item-indicator" />}
                    </div>

                    <span className="nav-item-label">{item.label}</span>

                    {isActive && <ChevronRight className="nav-item-arrow" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <p className="sidebar-footer-text">AI Nexus Platform</p>
            <p className="sidebar-footer-version">v1.0.0</p>
          </div>
        </div>
      </aside>
    </>
  );
}
