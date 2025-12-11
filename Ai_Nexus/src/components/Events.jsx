import React, { useState } from 'react';
import Calendar from './Events/Calendar';
import EventsList from './Events/EventsList';
import '../styles/Events.css';

const Events = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // December 2025
  const [registeredEvents, setRegisteredEvents] = useState(new Set());

  // Sample events data with event details
  const eventsData = [
    {
      id: 1,
      title: 'AI Safety & Alignment Summit 2025',
      date: '2025-12-15',
      time: '09:00 AM - 05:00 PM PST',
      location: 'San Francisco, CA',
      type: 'Conference',
      format: 'Hybrid',
      speakers: ['Yoshua Bengio', 'Demis Hassabis', 'Fei-Fei Li'],
      attendees: 1250,
      description: 'Join leading researchers and practitioners discussing the future of AI safety and alignment.',
      image: 'https://images.unsplash.com/photo-1582192904915-d89c7250b235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNoJTIwY29uZmVyZW5jZSUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NjUyMDk3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      registered: false,
    },
    {
      id: 2,
      title: 'Advanced Deep Learning Workshop',
      date: '2025-12-12',
      time: '02:00 PM - 04:00 PM EST',
      location: 'Online',
      type: 'Workshop',
      format: 'Virtual',
      speakers: ['Andrew Ng', 'Ian Goodfellow'],
      attendees: 3500,
      description: 'Hands-on workshop covering latest deep learning techniques and best practices.',
      image: 'https://images.unsplash.com/photo-1622131815526-eaae1e615381?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBsYXB0b3B8ZW58MXx8fHwxNzY1MjA5NzcwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      registered: false,
    },
    {
      id: 3,
      title: 'Healthcare AI Innovation Forum',
      date: '2025-12-18',
      time: '10:00 AM - 06:00 PM GMT',
      location: 'London, UK',
      type: 'Forum',
      format: 'In-person',
      speakers: ['Eric Topol', 'Regina Barzilay'],
      attendees: 800,
      description: 'Exploring AI applications transforming healthcare and medical research.',
      image: 'https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjUyMzE2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      registered: false,
    },
    {
      id: 4,
      title: 'Generative AI Masterclass',
      date: '2025-12-20',
      time: '11:00 AM - 01:00 PM PST',
      location: 'Online',
      type: 'Webinar',
      format: 'Virtual',
      speakers: ['Andrej Karpathy', 'Oriol Vinyals'],
      attendees: 5200,
      description: 'Deep dive into generative models, from GANs to diffusion models and transformers.',
      image: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMCByb2JvdCUyMGZ1dHVyaXN0aWN8ZW58MXx8fHwxNzY1MjYzMDg2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      registered: false,
    },
    {
      id: 5,
      title: 'AI in Climate Tech Symposium',
      date: '2025-12-22',
      time: '09:00 AM - 05:00 PM CET',
      location: 'Berlin, Germany',
      type: 'Symposium',
      format: 'Hybrid',
      speakers: ['Yann LeCun', 'Jeremy Howard'],
      attendees: 2100,
      description: 'Exploring how AI can accelerate solutions to climate change and sustainability challenges.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwdGVjaHxlbnwxfHx8fDE3NjUyNjMxNzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      registered: false,
    },
  ];

  // Get events for specific day
  const getEventsForDay = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventsData.filter((event) => event.date === dateStr);
  };

  // Toggle registration for event
  const toggleRegistration = (eventId) => {
    const newRegistered = new Set(registeredEvents);
    if (newRegistered.has(eventId)) {
      newRegistered.delete(eventId);
    } else {
      newRegistered.add(eventId);
    }
    setRegisteredEvents(newRegistered);
  };

  return (
    <div className="events-page">
      <div className="events-container">
        {/* Page Header */}
        <div className="events-page-header">
          <h1 className="events-page-title">Events & Conferences</h1>
          <p className="events-page-subtitle">
            Discover and register for the latest AI, tech, and networking events
          </p>
        </div>

        {/* 2-Column Layout: Calendar + Events List */}
        <div className="events-layout">
          {/* Left: Calendar */}
          <div className="events-calendar-section">
            <Calendar 
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              getEventsForDay={getEventsForDay}
            />
          </div>

          {/* Right: Events List */}
          <div className="events-list-section">
            <EventsList 
              events={eventsData}
              registeredEvents={registeredEvents}
              onToggleRegistration={toggleRegistration}
              showEmpty={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
