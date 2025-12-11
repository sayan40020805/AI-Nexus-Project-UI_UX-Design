import React, { useState, useEffect } from 'react';

// Import CSS
import './styles.css';

// Import Components
import Live from './components/Live';
import Quizee from './components/Quizee';
import Post from './components/Post';
import Ats from './components/Ats';
import AiShorts from './components/AiShorts';

function App() {
  const [theme, setTheme] = useState('dark'); // 'dark' is the default theme

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>My Application Dashboard</h1>
        <button onClick={toggleTheme} style={{ position: 'absolute', top: '20px', right: '20px' }}>
          Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
        </button>
      </header>
      <main className="main-content">
        <Live />
        <Quizee />
        <Post />
        <Ats />
        <AiShorts />
      </main>
    </div>
  );
}

export default App;