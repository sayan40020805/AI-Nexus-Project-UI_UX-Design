import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = ({ currentMonth, setCurrentMonth, getEventsForDay }) => {
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

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  const isCurrentMonth = 
    today.getFullYear() === currentMonth.getFullYear() && 
    today.getMonth() === currentMonth.getMonth();

  return (
    <div className="events-calendar-wrapper">
      {/* Calendar Header */}
      <div className="events-calendar-header">
        <h3 className="events-calendar-title">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="events-calendar-nav">
          <button 
            onClick={previousMonth} 
            className="events-nav-btn"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth} 
            className="events-nav-btn"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="events-calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="events-day-header">
            {day}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="events-days-grid">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="events-day-cell empty"></div>
        ))}

        {/* Actual days of the month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dayEvents = getEventsForDay(day);
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <div 
              key={day} 
              className={`events-day-cell ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
            >
              <div className="events-day-number">{day}</div>
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
                    <div className="events-day-more">
                      +{dayEvents.length - 2}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
