import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  Search, 
  Armchair, 
  Calendar as CalendarIcon, 
  Users, 
  Wrench, 
  ShoppingBag, 
  Key, 
  ChevronLeft, 
  ChevronRight,
  MapPin
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(12);

  // Typewriter effect phrases
  const phrases = useMemo(() => [
    'Search spaces, events, faculty, etc...',
    'Search for free classrooms on Floor 2...',
    'Find Dr. Priya Sharma in Computer Science...',
    'Search upcoming tech fests & workshops...',
    'Search textbooks, gadgets on marketplace...',
    'Look for lost ID cards, keys, wallets...'
  ], []);

  const [placeholderText, setPlaceholderText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    let timer: any;

    if (!isDeleting) {
      if (charIndex < currentPhrase.length) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        }, 55);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (charIndex > 0) {
        timer = setTimeout(() => {
          setPlaceholderText(currentPhrase.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        }, 28);
      } else {
        setIsDeleting(false);
        setPhraseIndex(prev => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, phraseIndex, phrases]);

  const quickCards = [
    { id: 'spaces', title: 'Find Spaces', icon: Armchair, bg: 'bg-[#E8EFE9]' },
    { id: 'calendar', title: 'Events & Calendar', icon: CalendarIcon, bg: 'bg-[#FDF3E7]' },
    { id: 'faculty', title: 'Faculty Directory', icon: Users, bg: 'bg-[#EBF3FB]' },
    { id: 'issues', title: 'Report an Issue', icon: Wrench, bg: 'bg-[#FDEBEB]' },
    { id: 'marketplace', title: 'Marketplace', icon: ShoppingBag, bg: 'bg-[#F2EDF9]' },
    { id: 'lostfound', title: 'Lost & Found', icon: Key, bg: 'bg-[#EBF5F0]' },
  ];

  // Specific upcoming events matching screenshot exactly
  const upcomingEvents = [
    {
      id: 'ai-beyond',
      month: 'NOV',
      day: '12',
      title: 'AI & Beyond',
      venue: 'Seminar Hall',
      organizer: 'Tech Club',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'acoustic-evening',
      month: 'NOV',
      day: '15',
      title: 'Acoustic Evening',
      venue: 'Open Air Stage',
      organizer: 'Music Club',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'robo-expo',
      month: 'NOV',
      day: '18',
      title: 'Robo Expo 2026',
      venue: 'Main Ground',
      organizer: 'Robotics Club',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Calendar right-side events list matching screenshot
  const calendarEventList = [
    {
      month: 'NOV',
      day: '12',
      title: 'AI & Beyond',
      subtitle: 'Tech Club • Seminar Hall',
      dotColor: 'bg-[#155137]', // Green dot
    },
    {
      month: 'NOV',
      day: '14',
      title: "Children's Day Holiday",
      subtitle: 'College Holiday',
      dotColor: 'bg-[#D32F2F]', // Red dot
    },
    {
      month: 'NOV',
      day: '15',
      title: 'Acoustic Evening',
      subtitle: 'Music Club • Open Air Stage',
      dotColor: 'bg-[#1976D2]', // Blue dot
    },
    {
      month: 'NOV',
      day: '18',
      title: 'Robo Expo 2026',
      subtitle: 'Robotics Club • Main Ground',
      dotColor: 'bg-[#155137]', // Green dot
    },
  ];

  // November 2026 days layout
  const calendarGrid = [
    [1, 2, 4, 5, 7, 1, 2],
    [2, 3, 4, 5, 7, 8, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 22, 22],
    [23, 24, 25, 26, 27, 28, 29],
    [39, 31, null, null, null, null, null],
  ];

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Title */}
        <div className="lg:col-span-5 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold tracking-wider uppercase text-charcoal/70">
              YOUR CAMPUS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#155137] inline-block"></span>
            <div className="w-20 h-[1px] bg-subtle-border"></div>
          </div>

          <h1 className="font-display text-7xl sm:text-[92px] font-black uppercase tracking-tight text-charcoal leading-[0.88]">
            FIND<br />
            YOUR NEXT<br />
            <span className="text-[#3D775F]">SPOT.</span>
          </h1>
        </div>

        {/* Right Search Input Bar */}
        <div className="lg:col-span-7">
          <div className="flex items-center bg-card rounded-2xl border border-subtle-border p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#155137]/20 focus-within:border-[#155137] transition-all">
            <Search className="w-5 h-5 text-charcoal-muted ml-3 mr-3" />
            <input
              type="text"
              placeholder={placeholderText || 'Search spaces, events, faculty, etc...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onNavigate('spaces');
                }
              }}
              className="w-full bg-transparent text-charcoal text-base placeholder:text-charcoal-muted/60 focus:outline-none py-2"
            />
            <button 
              onClick={() => onNavigate('spaces')}
              className="w-12 h-12 rounded-xl bg-[#155137] hover:bg-[#0E3E2A] text-white flex items-center justify-center transition-colors shadow-sm ml-2 flex-shrink-0"
              aria-label="Submit Search"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {quickCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`${card.bg} rounded-2xl p-4 flex flex-col justify-between h-36 cursor-pointer border border-black/5 hover:shadow-md transition-all group`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-charcoal">
                <IconComponent className="w-6 h-6 stroke-[1.75]" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-charcoal">
                  {card.title}
                </span>
                <div className="w-6 h-6 rounded-full border border-charcoal/20 bg-white/80 flex items-center justify-center text-charcoal group-hover:bg-charcoal group-hover:text-white transition-colors flex-shrink-0">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section: Upcoming Events (Left) + Campus Calendar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upcoming Events */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle-border pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#155137]"></span>
              <h2 className="font-display text-2xl font-black uppercase tracking-wide text-charcoal">
                UPCOMING EVENTS
              </h2>
              <div className="w-10 h-[1px] bg-subtle-border"></div>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-charcoal hover:text-[#155137] flex items-center space-x-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onNavigate('calendar')}
                className="bg-card rounded-2xl overflow-hidden border border-subtle-border hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                {/* Poster image with overlay badge */}
                <div className="relative h-44 bg-charcoal overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  {/* Date Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-white rounded-xl py-1 px-2.5 shadow-sm text-center">
                    <div className="text-[9px] font-bold text-charcoal-muted tracking-wider leading-none">{event.month}</div>
                    <div className="text-base font-black text-charcoal leading-tight mt-0.5">{event.day}</div>
                  </div>
                  {/* Circle Arrow Floating Button */}
                  <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center group-hover:bg-[#155137] transition-colors">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Body details */}
                <div className="p-3.5 space-y-2">
                  <h3 className="font-bold text-sm text-charcoal group-hover:text-[#155137] transition-colors line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-charcoal-muted pt-1">
                    <div className="flex items-center space-x-1 truncate max-w-[50%]">
                      <MapPin className="w-3 h-3 text-charcoal-muted flex-shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center space-x-1 truncate max-w-[50%]">
                      <Users className="w-3 h-3 text-charcoal-muted flex-shrink-0" />
                      <span className="truncate">{event.organizer}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Campus Calendar Widget (Unified Side-by-Side Card) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-subtle-border pb-2.5">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#155137]"></span>
              <h2 className="font-display text-2xl font-black uppercase tracking-wide text-charcoal">
                CAMPUS CALENDAR
              </h2>
              <span className="w-2 h-2 rounded-full bg-[#155137]"></span>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-charcoal hover:text-[#155137] flex items-center space-x-1 transition-colors"
            >
              <span>View calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Unified Card Container with Side-by-Side Layout */}
          <div className="bg-card rounded-2xl border border-subtle-border shadow-sm flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Mini Calendar Grid (~54% width) */}
            <div className="p-4 md:w-[54%] flex flex-col justify-between">
              {/* Month Navigator Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <button className="text-charcoal hover:text-[#155137] transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-xs text-charcoal">
                  November 2026
                </span>
                <button className="text-charcoal hover:text-[#155137] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Initials Row */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-charcoal-muted mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="py-0.5">{day}</div>
                ))}
              </div>

              {/* Calendar Days Matrix */}
              <div className="space-y-1">
                {calendarGrid.map((week, wIdx) => (
                  <div key={wIdx} className="grid grid-cols-7 gap-1 text-center text-[11px]">
                    {week.map((day, dIdx) => {
                      if (day === null) {
                        return <div key={dIdx} className="h-6 w-6" />;
                      }

                      const isSelected = selectedCalendarDay === day;

                      return (
                        <button
                          key={dIdx}
                          onClick={() => setSelectedCalendarDay(day)}
                          className={`h-6 w-6 mx-auto rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#155137] text-white font-bold shadow-sm'
                              : 'text-charcoal/80 hover:bg-canvas'
                          }`}
                        >
                          <span>{day}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Events List with Vertical Divider Line (~46% width) */}
            <div className="border-t md:border-t-0 md:border-l border-subtle-border p-3 md:w-[46%] flex flex-col justify-between divide-y divide-subtle-border">
              {calendarEventList.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => onNavigate('calendar')}
                  className="flex items-center space-x-2.5 py-2 first:pt-0 last:pb-0 hover:bg-canvas/60 rounded-lg px-1 transition-colors cursor-pointer"
                >
                  {/* Date Pill Box */}
                  <div className="bg-canvas border border-subtle-border rounded-lg px-2 py-1 text-center flex-shrink-0 w-11">
                    <div className="text-[8px] font-bold text-charcoal-muted uppercase leading-none">{item.month}</div>
                    <div className="text-xs font-black text-charcoal leading-tight mt-0.5">{item.day}</div>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} flex-shrink-0`} />
                      <span className="font-bold text-[11px] text-charcoal truncate">{item.title}</span>
                    </div>
                    <div className="text-[10px] text-charcoal-muted truncate pl-3">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
