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
    <SidebarProvider>
      <div className="app">
        <Header activeSection={activeSection} onNavigate={handleNavigate} />

        <main>
          <section id="home">
            <Hero onExploreModels={handleExploreModels} onJoinCommunity={handleJoinCommunity} />
          </section>

          <div className="app-main">
            <section id="news">
              <h2 className="section-title">Latest AI News</h2>
              <NewsFeed />
            </section>

            <section id="showcase">
              <h2 className="section-title">AI Showcase</h2>
              <AIShowcase />
            </section>

            <section id="models">
              <h2 className="section-title">AI Models & Tools</h2>
              <ModelDirectory />
            </section>

            <section id="career">
              <h2 className="section-title">Career Opportunities</h2>
              <JobBoard />
            </section>

            <section id="events">
              <h2 className="section-title">Upcoming Events</h2>
              <Events />
            </section>

            <section id="community">
              <h2 className="section-title">Community</h2>
              <Community />
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </SidebarProvider>
  );
}

export default App;
