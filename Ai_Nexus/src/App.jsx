import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { ModernSidebar } from './components/ModernSidebar';
import { Hero } from './components/Hero';
import { AIShowcase } from './components/AIShowcase';
import AIShowcasePage from './pages/AIShowcase/AIShowcase';
import { Community } from './components/Community';
import Events from './components/Events';
import { JobBoard } from './components/JobBoard';
import { ModelDirectory } from './components/ModelDirectory';
import { NewsFeed } from './components/NewsFeed';
import { Footer } from './components/Footer';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Live from './pages/Live/Live';
import { Quiz } from './pages/Quiz/Quiz';
import Post from './pages/Post/Post';
import ATSScore from './pages/ATSScore/ATSScore';
import AiShorts from './pages/AIShorts/AiShorts';
import './App.css';
import './styles/globals.css';
import './styles/Live.css';
import './styles/Quiz.css';
import './styles/Post.css';
import './styles/ATSScore.css';
import './styles/AIShorts.css';

const MainApp = () => {
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigate = (section) => {
    setActiveSection(section);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Hero onExploreModels={() => handleNavigate('models')} onJoinCommunity={() => handleNavigate('community')} />;
      case 'news':
        return <NewsFeed />;
      case 'showcase':
        return <AIShowcase />;
      case 'models':
        return <ModelDirectory />;
      case 'career':
        return <JobBoard />;
      case 'events':
        return <Events />;
      case 'community':
        return <Community />;
      case 'live':
        return <Live />;
      case 'quiz':
        return <Quiz />;
      case 'post':
        return <Post />;
      case 'ats':
        return <ATSScore />;
      case 'shorts':
        return <AiShorts />;
      case 'about':
        return (
          <div className="app-main" style={{ padding: '4rem 2rem' }}>
            <section className="app-section">
              <div className="app-section-header">
                <h2 className="section-title">About AI Nexus</h2>
                <div className="section-underline" />
              </div>
              <div className="app-section-content">
                <p style={{ color: 'var(--text-muted)', maxWidth: 820 }}>
                  AI Nexus is a community-driven hub for models, tools, and resources in AI. This About page is a placeholder — replace with real content when ready.
                </p>
              </div>
            </section>
          </div>
        );
      default:
        return <Hero onExploreModels={() => handleNavigate('models')} onJoinCommunity={() => handleNavigate('community')} />;
    }
  }

  return (
    <div className="app-layout">
      <Header activeSection={activeSection} onNavigate={handleNavigate} />
      <div className="app-main-content">
        <ModernSidebar activeSection={activeSection} onNavigate={handleNavigate} />
        <main className="app-content">
          <section className="app-content-wrapper">{renderSection()}</section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route
          path="/login"
          element={
            <div className="page-with-header">
              <Header />
              <Login />
              <Footer />
            </div>
          }
        />
        <Route
          path="/register"
          element={
            <div className="page-with-header">
              <Header />
              <Register />
              <Footer />
            </div>
          }
        />
        <Route
          path="/dashboard"
          element={
            <div className="page-with-header">
              <Header />
              <Dashboard />
              <Footer />
            </div>
          }
        />
        <Route
          path="/live"
          element={
            <div className="page-with-header">
              <Header />
              <Live />
              <Footer />
            </div>
          }
        />
        <Route
          path="/quiz"
          element={
            <div className="page-with-header">
              <Header />
              <Quiz />
              <Footer />
            </div>
          }
        />
        <Route
          path="/post"
          element={
            <div className="page-with-header">
              <Header />
              <Post />
              <Footer />
            </div>
          }
        />
        <Route
          path="/ats"
          element={
            <div className="page-with-header">
              <Header />
              <ATSScore />
              <Footer />
            </div>
          }
        />
        <Route
          path="/shorts"
          element={
            <div className="page-with-header">
              <Header />
              <AiShorts />
              <Footer />
            </div>
          }
        />
        <Route
          path="/showcase"
          element={
            <div className="page-with-header">
              <Header />
              <AIShowcasePage />
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;