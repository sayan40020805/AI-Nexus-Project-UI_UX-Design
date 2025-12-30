import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ModernSidebar } from './components/ModernSidebar';
import { Hero } from './components/Hero';
import Home from './pages/Home/Home';
import AIShowcasePage from './pages/AIShowcase/AIShowcase';
import AINews from './pages/AINews/AINews';
import AIModels from './pages/AIModels/AIModels';
import { JobBoard } from './components/JobBoard';
import Events from './components/Events';
import PostForm from './components/PostCreation/PostForm';
import Live from './pages/Live/Live';
import { Quiz } from './pages/Quiz/Quiz';
import Post from './pages/Post/Post';
import ATSScore from './pages/ATSScore/ATSScore';
import AiShorts from './pages/AIShorts/AiShorts';
import ProfilePage from './pages/Profile/ProfilePage';
import UserProfile from './pages/Profile/UserProfile';
import CompanyPage from './pages/Company/CompanyPage';
import ToolsPage from './pages/Tools/ToolsPage';
import SearchResults from './pages/Search/SearchResults';
import { Footer } from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { FeedProvider } from './context/FeedContext';
import { FollowProvider } from './context/FollowContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import FloatingMessageButton from './components/Messaging/FloatingMessageButton';
import GlobalSearch from './components/Search/GlobalSearch';
import CreateEvent from './pages/CreateEvent/CreateEvent';
import CreateJob from './pages/CreateJob/CreateJob';
import './App.css';
import './styles/globals.css';
import './styles/Live.css';
import './styles/Quiz.css';
import './styles/Post.css';
import './styles/ATSScore.css';
import './styles/AIShorts.css';
import './styles/Messaging.css';

// Layout for main app with sidebar and header
const MainLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-main-content">
        <ModernSidebar />
        <main className="app-content">
          <section className="app-content-wrapper">{children}</section>
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Layout wrapper for pages with header and footer only
const PageLayout = ({ children }) => {
  return (
    <div className="page-with-header">
      <Header />
      {children}
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

function App() {
  return (
    <AuthProvider>
      <FollowProvider>
        <Router>
          <GlobalLayout>
            <Routes>
              {/* Home route with main layout */}
              <Route 
                path="/" 
                element={
                  <FeedLayout>
                    <MainLayout>
                      <Home />
                    </MainLayout>
                  </FeedLayout>
                } 
              />
              
              {/* Main app routes with sidebar */}
              <Route
                path="/news"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <AINews />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/showcase"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <AIShowcasePage />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/models"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <AIModels />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/career"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <JobBoard />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/events"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <Events />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              {/* Protected route for creating events - company only */}
              <Route
                path="/create-event"
                element={
                  <ProtectedRoute allowedRoles={['company']}>
                    <FeedLayout>
                      <MainLayout>
                        <CreateEvent />
                      </MainLayout>
                    </FeedLayout>
                  </ProtectedRoute>
                }
              />
              {/* Protected route for creating jobs - company only */}
              <Route
                path="/create-job"
                element={
                  <ProtectedRoute allowedRoles={['company']}>
                    <FeedLayout>
                      <MainLayout>
                        <CreateJob />
                      </MainLayout>
                    </FeedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-post"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <PostForm />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/live"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <Live />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/quiz"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <Quiz />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/post"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <Post />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/ats"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <ATSScore />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/shorts"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <AiShorts />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/tools"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <ToolsPage />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/profile/:id"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <UserProfile />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              {/* Route for viewing own profile */}
              <Route
                path="/profile"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <UserProfile />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/company/:id"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <CompanyPage />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              <Route
                path="/search"
                element={
                  <FeedLayout>
                    <MainLayout>
                      <SearchResults />
                    </MainLayout>
                  </FeedLayout>
                }
              />
              
              {/* Auth routes */}
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
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <FeedLayout>
                      <PageLayout>
                        <Dashboard />
                      </PageLayout>
                    </FeedLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </GlobalLayout>
        </Router>
      </FollowProvider>
    </AuthProvider>
  );
}


// Global layout that includes FloatingMessageButton and GlobalSearch for all pages
const GlobalLayout = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(false);

  // Listen for search open event
  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener('openSearch', handleOpenSearch);
    return () => window.removeEventListener('openSearch', handleOpenSearch);
  }, []);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="global-layout-container">
      {children}
      <div className="content-relative-messaging">
        <FloatingMessageButton />
      </div>
      <GlobalSearch 
        isOpen={searchOpen} 
        onClose={() => setSearchOpen(false)}
        onSelect={(result) => {
          // Navigate to the selected profile using existing routes
          if (!result) return;
          const type = result.type || (result.role === 'company' ? 'company' : 'user');
          if (type === 'company') {
            window.location.href = `/company/${result.id}`;
          } else {
            window.location.href = `/profile/${result.id}`;
          }
        }}
        showTrigger={false}
      />
    </div>
  );
};

export default App;

