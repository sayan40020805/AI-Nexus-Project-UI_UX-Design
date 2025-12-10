import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AIShowcase } from './components/AIShowcase';
import { Community } from './components/Community';
import { Events } from './components/Events';
import { JobBoard } from './components/JobBoard';
import { ModelDirectory } from './components/ModelDirectory';
import { NewsFeed } from './components/NewsFeed';
import { Footer } from './components/Footer';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from './components/ui/sidebar';
import { Home, Newspaper, Sparkles, Cpu, Briefcase, Calendar, Users, Search, User } from 'lucide-react';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigate = (section) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreModels = () => {
    handleNavigate('models');
  };

  const handleJoinCommunity = () => {
    handleNavigate('community');
  };

  const sidebarItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'showcase', label: 'Showcase', icon: Sparkles },
    { id: 'models', label: 'Models & Tools', icon: Cpu },
    { id: 'career', label: 'Career', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'community', label: 'Community', icon: Users },
  ];

  return (
    <>
      {/* Header Navigation */}
      <Header activeSection={activeSection} onNavigate={handleNavigate} />

      {/* Main Content */}
      <main className="app">
        {/* Hero Section */}
        <section id="home" className="app-section app-section-hero">
          <Hero onExploreModels={handleExploreModels} onJoinCommunity={handleJoinCommunity} />
        </section>

        {/* Main Content Area */}
        <div className="app-main">
          {/* News Section */}
          <section id="news" className="app-section">
            <div className="app-section-header">
              <h2 className="section-title">Latest AI News</h2>
              <div className="section-underline"></div>
            </div>
            <div className="app-section-content">
              <NewsFeed />
            </div>
          </section>

          {/* AI Showcase Section */}
          <section id="showcase" className="app-section">
            <div className="app-section-header">
              <h2 className="section-title">AI Showcase</h2>
              <div className="section-underline"></div>
            </div>
            <div className="app-section-content">
              <AIShowcase />
            </div>
          </section>

          {/* Models & Tools Section */}
          <section id="models" className="app-section">
            <div className="app-section-header">
              <h2 className="section-title">AI Models & Tools</h2>
              <div className="section-underline"></div>
            </div>
            <div className="app-section-content">
              <ModelDirectory />
            </div>
          </section>

          {/* Career Section */}
          <section id="career" className="app-section">
            <div className="app-section-header">
              <h2 className="section-title">Career Opportunities</h2>
              <div className="section-underline"></div>
            </div>
            <div className="app-section-content">
              <JobBoard />
            </div>
          </section>

          {/* Events Section */}
          <section id="events" className="app-section">
            <div className="app-section-header">
              <h2 className="section-title">Upcoming Events</h2>
              <div className="section-underline"></div>
            </div>
            <div className="app-section-content">
              <Events />
            </div>
          </section>

          {/* Community Section */}
          <section id="community" className="app-section">
            <div className="app-section-header">
              <h2 className="section-title">Community</h2>
              <div className="section-underline"></div>
            </div>
            <div className="app-section-content">
              <Community />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default App;
