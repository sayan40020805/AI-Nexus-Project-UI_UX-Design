import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ThemeContext = createContext(null);

// Available themes
const THEMES = {
  light: 'light',
  dark: 'dark',
  system: 'system'
};

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(THEMES.system);
  const [resolvedTheme, setResolvedTheme] = useState(THEMES.dark);

  // Detect system preference
  const getSystemTheme = () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.dark : THEMES.light;
    }
    return THEMES.light;
  };

  // Update resolved theme based on current theme setting
  useEffect(() => {
    let newResolvedTheme;
    
    if (theme === THEMES.system) {
      newResolvedTheme = getSystemTheme();
    } else {
      newResolvedTheme = theme;
    }
    
    setResolvedTheme(newResolvedTheme);
    
    // Apply theme to document
    const root = document.documentElement;
    root.setAttribute('data-theme', newResolvedTheme);
    
    // Also set class for compatibility
    if (newResolvedTheme === THEMES.dark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === THEMES.system) {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Load theme from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('ai-nexus-theme');
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        setThemeState(savedTheme);
      }
    }
  }, []);

  // Save theme to localStorage when it changes
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai-nexus-theme', newTheme);
    }
  };

  const value = useMemo(() => ({
    theme,
    setTheme,
    resolvedTheme
  }), [theme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return ctx;
}

export { THEMES };
export default ThemeProvider;
