import React from 'react';
import EventCard from './EventCard';

const EventsList = ({ events, registeredEvents, onToggleRegistration, showEmpty = true }) => {
  if (!events || events.length === 0) {
    return (
      showEmpty && (
        <div className="events-list-wrapper">
          <h3 className="events-list-title">Upcoming Events</h3>
          <div className="events-empty-state">
            <div className="events-empty-icon">📭</div>
            <h4 className="events-empty-title">No Events Found</h4>
            <p className="events-empty-message">
              Check back later for more events or explore other months in the calendar.
            </p>
          </div>
        </div>
      )
    );
  }

  return (
    <div className="events-list-wrapper">
      <h3 className="events-list-title">
        Upcoming Events ({events.length})
      </h3>
      <div className="events-list">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={registeredEvents.has(event.id)}
            onToggleRegistration={onToggleRegistration}
          />
        ))}
      </div>
    </div>
  );
};

export default EventsList;
