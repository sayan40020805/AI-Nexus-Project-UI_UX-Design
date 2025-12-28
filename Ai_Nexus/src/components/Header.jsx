import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Sun, Moon, LogOut, User, Building, Radio } from 'lucide-react';
import { useThemeContext } from './theme-provider';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    return user.role === 'company' ? '/dashboard?tab=company' : '/dashboard?tab=user';
  };

  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'shorts', label: 'Shorts', path: '/shorts' },
    // { id: 'news', label: 'AI News', path: '/news' },
    { id: 'showcase', label: 'Showcase', path: '/showcase' },
    { id: 'models', label: 'Models', path: '/models' },
    { id: 'career', label: 'Career', path: '/career' },
    { id: 'events', label: 'Events', path: '/events' },
    { id: 'live', label: 'Live', path: '/live' },
  ];

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDark = mounted && resolvedTheme === 'dark';

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const toggleSidebar = () => {
    window.dispatchEvent(new Event("toggle-modern-sidebar"));
  };

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-flex">
          <div className="header-left">
            {/* Sidebar Toggle Button */}
            <button
              className="header-icon-button header-sidebar-toggle"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              <Menu className="header-icon" />
            </button>

            {/* Logo */}
            <Link
              to="/"
              onClick={handleNavClick}
              className="header-logo"
            >
              <div className="header-logo-bg">
                <Sparkles className="header-logo-icon" />
              </div>
              <span className="header-title">AI Nexus</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-nav">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleNavClick}
                className={
                  isActivePath(item.path)
                    ? 'header-nav-item active'
                    : 'header-nav-item inactive'
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="header-right">
            {user ? (
              // Authenticated user UI
              <>
                {/* Start Live button - Company only */}
                {user.role === 'company' && (
                  <Link 
                    to="/live?action=start" 
                    className="header-auth-button header-live-button"
                    title="Start Live Stream"
                  >
                    <Radio className="header-icon" size={16} />
                    Go Live
                  </Link>
                )}
                
                <Link to={getDashboardLink()} className="header-auth-button">
                  {user.role === 'company' ? (
                    <>
                      <Building className="header-icon" size={16} />
                      Company Dashboard
                    </>
                  ) : (
                    <>
                      <User className="header-icon" size={16} />
                      My Dashboard
                    </>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="header-auth-button header-logout-button"
                  title="Logout"
                >
                  <LogOut className="header-icon" size={16} />
                  Logout
                </button>
              </>
            ) : (
              // Guest user UI
              <>
                <Link to="/login" className="header-auth-button">Login</Link>
                <Link to="/register" className="header-auth-button">Register</Link>
              </>
            )}
            
            <button
              className="header-icon-button"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="header-icon" /> : <Moon className="header-icon" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="header-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="header-mobile-icon" /> : <Menu className="header-mobile-icon" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="header-mobile-menu open">
            <div className="header-mobile-nav">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`header-mobile-nav-item ${
                    isActivePath(item.path) ? 'active' : 'inactive'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                // Authenticated user UI for mobile
                <>
                  {/* Start Live button - Company only */}
                  {user.role === 'company' && (
                    <Link 
                      to="/live?action=start" 
                      className="header-mobile-nav-item header-mobile-live"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Radio className="header-icon" size={16} />
                      Go Live
                    </Link>
                  )}
                  
                  <Link 
                    to={getDashboardLink()} 
                    className="header-mobile-nav-item" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {user.role === 'company' ? (
                      <>
                        <Building className="header-icon" size={16} />
                        Company Dashboard
                      </>
                    ) : (
                      <>
                        <User className="header-icon" size={16} />
                        My Dashboard
                      </>
                    )}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="header-mobile-nav-item header-mobile-logout"
                  >
                    <LogOut className="header-icon" size={16} />
                    Logout
                  </button>
                </>
              ) : (
                // Guest user UI for mobile
                <>
                  <Link to="/login" className="header-mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="header-mobile-nav-item" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
