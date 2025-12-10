import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Video, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import '../styles/Events.css';

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
    image: 'https://images.unsplash.com/photo-1625314887424-9f190599bd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHJvYm90JTIwZnV0dXJpc3RpY3xlbnwxfHx8fDE3NjUyNjMwODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    speakers: ['Carla Gomes', 'David Rolnick'],
    attendees: 950,
    description: 'Leveraging AI to address climate change and environmental challenges.',
    image: 'https://images.unsplash.com/photo-1584291527908-033f4d6542c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwdmlzdWFsaXphdGlvbiUyMHNjcmVlbnxlbnwxfHx8fDE3NjUyNTk4MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    registered: false,
  },
];

export function Events() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // December 2025
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [selectedView, setSelectedView] = useState('calendar');

  const toggleRegistration = (id) => {
    setRegisteredEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const getEventsForDay = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventsData.filter((event) => event.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="events-container">
      <div className="events-header">
        <div className="events-view-buttons">
          <button
            onClick={() => setSelectedView('calendar')}
            className={selectedView === 'calendar' ? 'events-button events-button-active' : 'events-button events-button-inactive'}
          >
            Calendar View
          </button>
          <button
            onClick={() => setSelectedView('list')}
            className={selectedView === 'list' ? 'events-button events-button-active' : 'events-button events-button-inactive'}
          >
            List View
          </button>
        </div>
      </div>

      {selectedView === 'calendar' && (
        <div className="events-calendar">
          <div className="events-calendar-header">
            <h3>
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="events-calendar-nav">
              <button
                onClick={previousMonth}
                className="events-nav-button"
              >
                <ChevronLeft className="events-nav-icon" />
              </button>
              <button
                onClick={nextMonth}
                className="events-nav-button"
              >
                <ChevronRight className="events-nav-icon" />
              </button>
            </div>
          </div>

          <div className="events-calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="events-day-header">
                {day}
              </div>
            ))}

            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="events-day" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === 9; // December 9, 2025

              return (
                <div
                  key={day}
                  className={isToday ? 'events-day events-day-today' : 'events-day'}
                >
                  <div className={isToday ? 'events-day-number events-day-number-today' : 'events-day-number events-day-number-normal'}>
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="events-day-events">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="events-day-event"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="events-day-more">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="events-list">
        <h3 className="events-list-title">Upcoming Events</h3>
        {eventsData.map((event) => (
          <div
            key={event.id}
            className="events-event-card"
          >
            <div className="events-event-content">
              <img
                src={event.image}
                alt={event.title}
                className="events-event-image"
              />
              <div className="events-event-details">
                <div className="events-event-header">
                  <div className="events-event-info">
                    <div className="events-event-badges">
                      <span className="events-event-badge events-event-badge-type">
                        {event.type}
                      </span>
                      <span className="events-event-badge events-event-badge-format">
                        {event.format}
                      </span>
                    </div>
                    <h3 className="events-event-title">{event.title}</h3>
                    <p className="events-event-description">{event.description}</p>
                  </div>
                </div>

                <div className="events-event-meta">
                  <div className="events-event-meta-item">
                    <Calendar className="events-event-meta-icon" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="events-event-meta-item">
                    <Clock className="events-event-meta-icon" />
                    <span>{event.time}</span>
                  </div>
                  <div className="events-event-meta-item">
                    {event.format === 'Virtual' ? (
                      <Video className="events-event-meta-icon" />
                    ) : (
                      <MapPin className="events-event-meta-icon" />
                    )}
                    <span>{event.location}</span>
                  </div>
                  <div className="events-event-meta-item">
                    <Users className="events-event-meta-icon" />
                    <span>{event.attendees.toLocaleString()} attendees</span>
                  </div>
                </div>

                <div className="events-speakers">
                  <div className="events-speakers-label">Featured Speakers:</div>
                  <div className="events-speakers-list">
                    {event.speakers.map((speaker) => (
                      <span
                        key={speaker}
                        className="events-speaker"
                      >
                        {speaker}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="events-actions">
                  <button
                    onClick={() => toggleRegistration(event.id)}
                    className={registeredEvents.has(event.id) ? 'events-register-button events-register-button-active' : 'events-register-button events-register-button-inactive'}
                  >
                    {registeredEvents.has(event.id) ? 'Registered ✓' : 'Register Now'}
                  </button>
                  <button className="events-details-button">
                    Details
                    <ExternalLink className="events-event-meta-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
