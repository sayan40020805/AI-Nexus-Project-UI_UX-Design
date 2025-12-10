import { Menu, X, Sparkles, Sun, Moon, Sidebar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

export function Header({ activeSection, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isDark = mounted && resolvedTheme === 'dark';

  const toggleDarkMode = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2"
            >
              <div className="bg-sky-500 dark:bg-sky-400 p-2 rounded-full">
                <Sparkles className="text-white h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-white">AI Nexus</span>
            </button>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={toggleDarkMode}
              title="Toggle Dark Mode"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <div className="hidden md:flex">
              <button
                className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Sidebar"
              >
                <Sidebar className="h-5 w-5" />
              </button>
            </div>
            <div className="md:hidden">
                <button
                    className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden pt-2 pb-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-md text-base font-medium transition-colors text-left ${
                    activeSection === item.id
                    ? 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
