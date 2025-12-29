import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeContext } from './theme-provider';
import '../styles/ThemeSwitcher.css';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    
    // Add a subtle animation class to the body for theme transition
    document.body.classList.add('theme-changing');
    setTimeout(() => {
      document.body.classList.remove('theme-changing');
    }, 600);
  };

  return (
    <div className="theme-switcher">
      <div className="theme-switcher-container">
        {themes.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleThemeChange(value)}
            className={`theme-switcher-button ${
              theme === value ? 'active' : ''
            }`}
            title={`Switch to ${label} mode`}
          >
            <Icon size={16} />
            <span className="theme-switcher-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
