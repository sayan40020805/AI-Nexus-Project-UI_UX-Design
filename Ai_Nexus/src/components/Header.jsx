
import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Sun, Moon, LogOut, User, Building } from 'lucide-react';
import { useThemeContext } from './theme-provider';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';


export function Header({ activeSection, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useThemeContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    { id: 'home', label: 'Home' },
    { id: 'news', label: 'AI News' },
    { id: 'showcase', label: 'Showcase' },
    { id: 'models', label: 'Models' },
    { id: 'career', label: 'Career' },
    { id: 'events', label: 'Events' },
  ];

  const handleNavClick = (id) => {
    if (onNavigate) {
      onNavigate(id);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDark = mounted && resolvedTheme === 'dark';

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // 👉 FIXED — This triggers ModernSidebar toggle
  const toggleSidebar = () => {
    window.dispatchEvent(new Event("toggle-modern-sidebar"));
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
              onClick={() => handleNavClick('home')}
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
                to="/"
                onClick={() => handleNavClick(item.id)}
                className={
                  activeSection === item.id
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
                  to="/"
                  onClick={() => handleNavClick(item.id)}
                  className={`header-mobile-nav-item ${
                    activeSection === item.id ? 'active' : 'inactive'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user ? (
                // Authenticated user UI for mobile
                <>
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
