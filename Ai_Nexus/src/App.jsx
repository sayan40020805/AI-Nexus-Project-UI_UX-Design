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
import { AuthProvider } from './context/AuthContext';
import { FeedProvider } from './context/FeedContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Live from './pages/Live/Live';
import { Quiz } from './pages/Quiz/Quiz';
import Post from './pages/Post/Post';
import ATSScore from './pages/ATSScore/ATSScore';
import AiShorts from './pages/AIShorts/AiShorts';
import FloatingMessageButton from './components/Messaging/FloatingMessageButton';
import './App.css';
import './styles/globals.css';
import './styles/Live.css';
import './styles/Quiz.css';
import './styles/Post.css';
import './styles/ATSScore.css';
import './styles/AIShorts.css';
import './styles/Messaging.css';
import { PostForm } from './components/PostCreation';

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
      case 'create-post':
        return <PostForm />;
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
  };

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

// Layout component that wraps content with FeedProvider (needs to be within AuthProvider)
const FeedLayout = ({ children }) => {
  return (
    <FeedProvider>
      {children}
    </FeedProvider>
  );
};

// Layout wrapper for pages with header and footer
const PageLayout = ({ children }) => {
  return (
    <div className="page-with-header">
      <Header />
      {children}
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalLayout>
          <Routes>
            <Route 
              path="/" 
              element={
                <FeedLayout>
                  <MainApp />
                </FeedLayout>
              } 
            />
            <Route
              path="/login"
              element={
                <PageLayout>
                  <Login />
                </PageLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PageLayout>
                  <Register />
                </PageLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <Dashboard />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/live"
              element={
                <PageLayout>
                  <Live />
                </PageLayout>
              }
            />
            <Route
              path="/quiz"
              element={
                <PageLayout>
                  <Quiz />
                </PageLayout>
              }
            />
            <Route
              path="/post"
              element={
                <PageLayout>
                  <Post />
                </PageLayout>
              }
            />
            <Route
              path="/ats"
              element={
                <PageLayout>
                  <ATSScore />
                </PageLayout>
              }
            />
            <Route
              path="/shorts"
              element={
                <PageLayout>
                  <AiShorts />
                </PageLayout>
              }
            />
            <Route
              path="/showcase"
              element={
                <PageLayout>
                  <AIShowcasePage />
                </PageLayout>
              }
            />
            <Route
              path="/create-post"
              element={
                <PageLayout>
                  <PostForm />
                </PageLayout>
              }
            />
          </Routes>
        </GlobalLayout>
      </Router>
    </AuthProvider>
  );
}


// Global layout that includes FloatingMessageButton for all pages
const GlobalLayout = ({ children }) => {
  return (
    <div className="global-layout-container">
      {children}
      <div className="content-relative-messaging">
        <FloatingMessageButton />
      </div>
    </div>
  );
};

export default App;

