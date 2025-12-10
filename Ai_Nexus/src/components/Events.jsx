import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Video, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-center">
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button onClick={() => setSelectedView('calendar')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedView === 'calendar' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
            Calendar View
          </button>
          <button onClick={() => setSelectedView('list')} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${selectedView === 'list' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}>
            List View
          </button>
        </div>
      </div>

      {selectedView === 'calendar' && (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-2">
              <button onClick={previousMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = day === 9; // Assuming today is Dec 9, 2025

              return (
                <div key={day} className={`aspect-square p-2 border-t border-slate-200 dark:border-slate-700 ${isToday ? 'bg-sky-50 dark:bg-sky-900/30' : ''}`}>
                  <div className={`text-sm ${isToday ? 'font-bold text-sky-600 dark:text-sky-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    {day}
                  </div>
                  {dayEvents.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div key={event.id} className="text-xs text-white bg-purple-500 dark:bg-purple-600 rounded px-1 py-0.5 truncate" title={event.title}>
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedView === 'list' && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Events</h3>
          {eventsData.map((event) => (
            <div key={event.id} className="bg-white dark:bg-slate-800/50 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-slate-200 dark:border-slate-700 overflow-hidden md:flex">
                <img src={event.image} alt={event.title} className="w-full md:w-64 h-48 md:h-auto object-cover" />
                <div className="p-6 flex-1">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-purple-900/50 dark:text-purple-300">{event.type}</span>
                    <span className="bg-sky-100 text-sky-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-sky-900/50 dark:text-sky-300">{event.format}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{event.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 clamp-2">{event.description}</p>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{new Date(event.date).toLocaleDateString()}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{event.time}</span></div>
                    <div className="flex items-center gap-2">
                        {event.format === 'Virtual' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" /><span>{event.attendees.toLocaleString()} attendees</span></div>
                  </div>

                  <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Featured Speakers:</p>
                      <div className="flex flex-wrap gap-2">
                        {event.speakers.map((speaker) => (
                          <span key={speaker} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-1 rounded-full">{speaker}</span>
                        ))}
                      </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleRegistration(event.id)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${registeredEvents.has(event.id) ? 'bg-green-600 text-white' : 'bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600'}`}>
                      {registeredEvents.has(event.id) ? 'Registered ✓' : 'Register Now'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors">
                      Details <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
