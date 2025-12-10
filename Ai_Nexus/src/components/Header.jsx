import { Menu, X, Sparkles, Sun, Moon, Sidebar } from 'lucide-react';
import { useState } from 'react';
import { SidebarTrigger } from './ui/sidebar';
import '../styles/Header.css';

export function Header({ activeSection, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'news', label: 'News' },
    { id: 'showcase', label: 'Showcase' },
    { id: 'models', label: 'Models & Tools' },
    { id: 'career', label: 'Career' },
    { id: 'events', label: 'Events' },
    { id: 'community', label: 'Community' },
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-flex">
          <div className="header-left">
            {/* <SidebarTrigger /> */}
            <button
              onClick={() => handleNavClick('home')}
              className="header-logo"
            >
              <div className="header-logo-bg">
                <Sparkles className="header-logo-icon" />
              </div>
              <span className="header-title">AI Nexus</span>
            </button>
          </div>

          <nav className="header-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`header-nav-item ${
                  activeSection === item.id ? 'active' : 'inactive'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="header-right">
            <button
              className="header-icon-button"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Moon className="header-icon" />
              ) : (
                <Sun className="header-icon" />
              )}
            </button>

            <button
              className="header-icon-button"
              onClick={toggleSidebar}
              title="Toggle Sidebar"
            >
              <Sidebar className="header-icon" />
            </button>
          </div>

          <button
            className="header-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="header-mobile-icon" />
            ) : (
              <Menu className="header-mobile-icon" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="header-mobile-menu open">
            <div className="header-mobile-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`header-mobile-nav-item ${
                    activeSection === item.id ? 'active' : 'inactive'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
