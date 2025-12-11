import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <ThemeInnerProvider>{children}</ThemeInnerProvider>
    </NextThemesProvider>
  );
}

function ThemeInnerProvider({ children }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  const value = useMemo(() => ({ theme, setTheme, resolvedTheme }), [theme, setTheme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}

export default ThemeProvider;