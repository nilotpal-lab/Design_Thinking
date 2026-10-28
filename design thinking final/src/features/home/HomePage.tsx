import React, { useState, useEffect } from 'react';
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
  MapPin,
  Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CampusEvent } from '../../types/database';

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(12);

  useEffect(() => {
    async function loadEvents() {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_datetime', { ascending: true })
        .limit(10);
      if (!error && data) {
        setEvents(data as CampusEvent[]);
      }
    }
    loadEvents();
  }, []);

  const quickCards = [
    { id: 'spaces', title: 'Find Spaces', icon: Armchair, bg: 'bg-[#E8EFE9]', text: 'text-charcoal' },
    { id: 'calendar', title: 'Events & Calendar', icon: CalendarIcon, bg: 'bg-[#FDF3E7]', text: 'text-charcoal' },
    { id: 'faculty', title: 'Faculty Directory', icon: Users, bg: 'bg-[#EBF3FB]', text: 'text-charcoal' },
    { id: 'issues', title: 'Report an Issue', icon: Wrench, bg: 'bg-[#FDEBEB]', text: 'text-charcoal' },
    { id: 'marketplace', title: 'Marketplace', icon: ShoppingBag, bg: 'bg-[#F2EDF9]', text: 'text-charcoal' },
    { id: 'lostfound', title: 'Lost & Found', icon: Key, bg: 'bg-[#EBF5F0]', text: 'text-charcoal' },
  ];

  const featuredCards = events.slice(0, 3);

  // November 2026 calendar days
  // 1 Nov 2026 is Sunday (30 days total)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Hero Title */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold tracking-widest uppercase text-charcoal-muted">
              YOUR CAMPUS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
          </div>

          <h1 className="font-display text-7xl sm:text-8xl font-black uppercase tracking-tight text-charcoal leading-[0.88]">
            FIND<br />
            YOUR NEXT<br />
            <span className="text-forest">SPOT.</span>
          </h1>
        </div>

        {/* Right Search Input Bar */}
        <div className="lg:col-span-7">
          <div className="flex items-center bg-card rounded-2xl border border-subtle-border p-2 shadow-sm focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest transition-all">
            <Search className="w-5 h-5 text-charcoal-muted ml-3 mr-3" />
            <input
              type="text"
              placeholder="Search spaces, events, faculty, etc..."
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
              className="w-12 h-12 rounded-xl bg-forest hover:bg-forest-dark text-white flex items-center justify-center transition-colors shadow-sm ml-2 flex-shrink-0"
              aria-label="Submit Search"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Quick Access Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`${card.bg} rounded-2xl p-5 flex flex-col justify-between h-40 cursor-pointer border border-black/5 hover:border-black/15 hover:shadow-md transition-all group`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center text-charcoal group-hover:scale-110 transition-transform">
                <IconComponent className="w-5 h-5 text-charcoal" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-charcoal pr-2">
                  {card.title}
                </span>
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-charcoal group-hover:bg-charcoal group-hover:text-white transition-colors flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: Upcoming Events + Campus Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upcoming Events */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-subtle-border pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-forest"></span>
              <h2 className="font-display text-2xl font-black uppercase tracking-wide text-charcoal">
                UPCOMING EVENTS
              </h2>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-charcoal hover:text-forest flex items-center space-x-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredCards.map((event, idx) => {
              const date = new Date(event.start_datetime);
              const dayNum = date.getDate();
              const monthStr = date.toLocaleString('default', { month: 'short' }).toUpperCase();

              return (
                <div
                  key={event.id || idx}
                  onClick={() => onNavigate('calendar')}
                  className="bg-card rounded-2xl overflow-hidden border border-subtle-border hover:shadow-lg transition-all group cursor-pointer flex flex-col justify-between"
                >
                  {/* Poster image with overlay badge */}
                  <div className="relative h-44 bg-charcoal overflow-hidden">
                    <img 
                      src={event.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80'} 
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    {/* Date Badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl py-1.5 px-3 shadow-md text-center">
                      <div className="text-[10px] font-bold text-charcoal-muted tracking-wider">{monthStr}</div>
                      <div className="text-lg font-black text-charcoal leading-none">{dayNum}</div>
                    </div>
                    {/* Circle Arrow Floating Button */}
                    <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm group-hover:bg-forest transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="p-4 space-y-3">
                    <h3 className="font-bold text-base text-charcoal group-hover:text-forest transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <div className="flex flex-col space-y-1.5 text-xs text-charcoal-muted">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-forest flex-shrink-0" />
                        <span className="truncate">{event.venue_text}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-charcoal-muted flex-shrink-0" />
                        <span className="truncate">{event.organizer_club || 'Campus'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Campus Calendar Widget */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-subtle-border pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-forest"></span>
              <h2 className="font-display text-2xl font-black uppercase tracking-wide text-charcoal">
                CAMPUS CALENDAR
              </h2>
              <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
            </div>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-charcoal hover:text-forest flex items-center space-x-1 transition-colors"
            >
              <span>View calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-subtle-border p-5 shadow-sm space-y-5">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button className="w-7 h-7 rounded-full border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:border-charcoal transition-all">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-charcoal">November 2026</span>
                <button className="w-7 h-7 rounded-full border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:border-charcoal transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekdays Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-charcoal-muted">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                <div key={idx} className="py-1">{day}</div>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((day) => {
                const isSelected = selectedCalendarDay === day;
                const hasEvent = [5, 12, 14, 15, 18].includes(day);

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedCalendarDay(day)}
                    className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-forest text-white font-bold shadow-sm'
                        : hasEvent
                        ? 'font-bold text-charcoal hover:bg-forest-tint'
                        : 'text-charcoal-muted hover:bg-canvas'
                    }`}
                  >
                    <span>{day}</span>
                    {hasEvent && !isSelected && (
                      <span className="w-1 h-1 rounded-full bg-forest mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mini Event Items List */}
            <div className="border-t border-subtle-border pt-4 space-y-2.5">
              {events.map((ev) => {
                const date = new Date(ev.start_datetime);
                const dayNum = date.getDate();
                const monthStr = date.toLocaleString('default', { month: 'short' }).toUpperCase();
                const dotColor = ev.is_holiday 
                  ? 'bg-red-500' 
                  : ev.category === 'academic' 
                  ? 'bg-emerald-600' 
                  : 'bg-blue-600';

                return (
                  <div
                    key={ev.id}
                    onClick={() => onNavigate('calendar')}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-canvas transition-colors cursor-pointer"
                  >
                    <div className="bg-canvas border border-subtle-border rounded-lg px-2 py-1 text-center flex-shrink-0">
                      <div className="text-[9px] font-bold text-charcoal-muted leading-tight">{monthStr}</div>
                      <div className="text-sm font-black text-charcoal leading-tight">{dayNum}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                        <span className="font-bold text-xs text-charcoal truncate">{ev.title}</span>
                      </div>
                      <div className="text-[11px] text-charcoal-muted truncate ml-3.5">
                        {ev.organizer_club ? `${ev.organizer_club} • ` : ''}{ev.venue_text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
