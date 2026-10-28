import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  X, 
  Users, 
  ArrowRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CampusEvent } from '../../types/database';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // View state: Month, Year, List
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'list'>('month');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // 0-indexed: 10 = Nov
  const [selectedDay, setSelectedDay] = useState<number>(5);

  // Category filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'academic',
    'club',
    'seminar',
    'cultural',
    'administrative',
    'holiday',
  ]);

  // Selected event for right inspector drawer
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      const { data, error } = await supabase.from('events').select('*').order('start_datetime', { ascending: true });
      if (!error && data) {
        setEvents(data as CampusEvent[]);
        if (data.length > 0) {
          setSelectedEventId(data[0].id);
        }
      }
      setLoading(false);
    }
    loadEvents();
  }, []);

  const categoryMeta: Record<string, { label: string; color: string; dot: string; bg: string; text: string }> = {
    academic: { label: 'Academic', color: '#155137', dot: 'bg-[#155137]', bg: 'bg-[#E8F5E9]', text: 'text-[#1B5E20]' },
    club: { label: 'Club Event', color: '#1976D2', dot: 'bg-[#1976D2]', bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]' },
    seminar: { label: 'Seminar / Workshop', color: '#7B1FA2', dot: 'bg-[#7B1FA2]', bg: 'bg-[#F3E5F5]', text: 'text-[#6A1B9A]' },
    cultural: { label: 'Cultural', color: '#D32F2F', dot: 'bg-[#D32F2F]', bg: 'bg-[#FFEBEE]', text: 'text-[#C62828]' },
    administrative: { label: 'Administrative', color: '#F57C00', dot: 'bg-[#F57C00]', bg: 'bg-[#FFF3E0]', text: 'text-[#B76E00]' },
    holiday: { label: 'Holiday', color: '#F06292', dot: 'bg-[#F06292]', bg: 'bg-[#FCE4EC]', text: 'text-[#C2185B]' },
  };

  // Toggle category
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategories(['academic', 'club', 'seminar', 'cultural', 'administrative', 'holiday']);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => selectedCategories.includes(ev.category));
  }, [events, selectedCategories]);

  // November 2026 Calendar Grid (Starts Sunday 1 Nov)
  // Total 30 days
  const monthDays = useMemo(() => {
    const days: { day: number; dateStr: string; events: CampusEvent[] }[] = [];
    for (let d = 1; d <= 30; d++) {
      const dateStr = `2026-11-${String(d).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((ev) => ev.start_datetime.startsWith(dateStr));
      days.push({ day: d, dateStr, events: dayEvents });
    }
    return days;
  }, [filteredEvents]);

  // Events on the currently selected day
  const eventsOnSelectedDay = useMemo(() => {
    const dateStr = `2026-11-${String(selectedDay).padStart(2, '0')}`;
    return filteredEvents.filter((ev) => ev.start_datetime.startsWith(dateStr));
  }, [filteredEvents, selectedDay]);

  const selectedEvent = useMemo(() => {
    return events.find((ev) => ev.id === selectedEventId) || eventsOnSelectedDay[0] || events[0] || null;
  }, [events, selectedEventId, eventsOnSelectedDay]);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header matching 3) Calendar.jpeg */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-subtle-border pb-5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold tracking-widest uppercase text-charcoal-muted">
              CAMPUS CALENDAR
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#155137]"></span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-black uppercase tracking-tight text-charcoal leading-none">
            CAMPUS <span className="text-[#3D775F]">EVENTS.</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-bold tracking-widest text-charcoal-muted uppercase hidden sm:block">
            DISCOVER. PARTICIPATE. STAY INFORMED.
          </span>

          {/* Segmented View Switcher */}
          <div className="flex items-center bg-card border border-subtle-border rounded-xl p-1 shadow-sm">
            {(['month', 'year', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-[#155137] text-white shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-card border border-subtle-border rounded-xl px-3 py-2 text-xs font-bold text-charcoal focus:outline-none focus:border-[#155137] shadow-sm"
          >
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Filter Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-6 bg-card rounded-2xl border border-subtle-border p-5 shadow-sm">
          {/* View Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              View
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-canvas border border-subtle-border rounded-xl p-1">
              {(['month', 'year', 'list'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`py-1.5 text-xs font-bold rounded-lg capitalize text-center transition-all ${
                    viewMode === mode
                      ? 'bg-[#155137] text-white shadow-sm'
                      : 'text-charcoal-muted hover:text-charcoal'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-subtle-border" />

          {/* Date Picker Select */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full bg-canvas border border-subtle-border rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-charcoal focus:outline-none focus:border-[#155137]"
              >
                <option value={10}>November 2026</option>
                <option value={11}>December 2026</option>
                <option value={9}>October 2026</option>
              </select>
            </div>
          </div>

          <hr className="border-subtle-border" />

          {/* Event Type Checkboxes with Colors */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Event Type
            </label>
            <div className="space-y-2 text-xs">
              {Object.entries(categoryMeta).map(([key, meta]) => {
                const isChecked = selectedCategories.includes(key);
                return (
                  <label
                    key={key}
                    className="flex items-center space-x-2.5 cursor-pointer text-charcoal hover:text-black transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(key)}
                      className="w-4 h-4 rounded border-subtle-border text-[#155137] focus:ring-[#155137]"
                    />
                    <span className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      <span className="font-medium">{meta.label}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <hr className="border-subtle-border" />

          {/* Reset Filters */}
          <button
            onClick={handleClearFilters}
            className="w-full py-2.5 border border-subtle-border rounded-xl text-xs font-bold text-charcoal hover:bg-canvas flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-charcoal-muted" />
            <span>Clear Filters</span>
          </button>
        </div>

        {/* Center Calendar Area (5 or 6 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {viewMode === 'month' && (
            <div className="bg-card rounded-2xl border border-subtle-border p-5 shadow-sm space-y-5">
              {/* Header Navigator & Legend */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-subtle-border pb-4">
                <div className="flex items-center space-x-3">
                  <button className="w-7 h-7 rounded-full border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:border-charcoal transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm text-charcoal">
                    November 2026
                  </span>
                  <button
                    onClick={() => setSelectedDay(5)}
                    className="px-2.5 py-0.5 rounded-md border border-subtle-border text-[11px] font-bold text-charcoal hover:bg-canvas"
                  >
                    Today
                  </button>
                  <button className="w-7 h-7 rounded-full border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:border-charcoal transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Category Dots Legend */}
                <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-charcoal-muted">
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#155137]" />
                    <span>Academic</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1976D2]" />
                    <span>Club</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7B1FA2]" />
                    <span>Seminar</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F]" />
                    <span>Cultural</span>
                  </span>
                </div>
              </div>

              {/* Weekdays Row */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-charcoal-muted">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Month Day Cells */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {monthDays.map(({ day, events: dayEvents }) => {
                  const isSelected = selectedDay === day;
                  const hasEvents = dayEvents.length > 0;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                        isSelected
                          ? 'bg-[#155137] text-white font-bold shadow-md'
                          : 'hover:bg-canvas text-charcoal font-medium'
                      }`}
                    >
                      <span className="text-xs">{day}</span>
                      {/* Dots row */}
                      {hasEvents && (
                        <div className="flex items-center space-x-1 mt-0.5">
                          {dayEvents.slice(0, 3).map((ev, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : categoryMeta[ev.category]?.dot || 'bg-[#155137]'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-card rounded-2xl border border-subtle-border p-5 shadow-sm space-y-3">
              <h3 className="font-display text-xl font-bold uppercase text-charcoal">
                All Campus Events (November 2026)
              </h3>
              <div className="divide-y divide-subtle-border">
                {filteredEvents.map((ev) => {
                  const date = new Date(ev.start_datetime);
                  const meta = categoryMeta[ev.category] || categoryMeta.academic;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className="py-3 flex items-center justify-between hover:bg-canvas rounded-lg px-2 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 text-center bg-canvas border border-subtle-border rounded-lg py-1">
                          <div className="text-[9px] font-bold text-charcoal-muted uppercase">NOV</div>
                          <div className="text-sm font-black text-charcoal">{date.getDate()}</div>
                        </div>
                        <div>
                          <div className="font-bold text-sm text-charcoal">{ev.title}</div>
                          <div className="text-xs text-charcoal-muted">{ev.venue_text}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Year View */}
          {viewMode === 'year' && (
            <div className="bg-card rounded-2xl border border-subtle-border p-5 shadow-sm space-y-4">
              <h3 className="font-display text-xl font-bold uppercase text-charcoal">
                Academic Year 2026 - 2027
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  'July', 'August', 'September', 'October', 'November', 'December',
                  'January', 'February', 'March', 'April', 'May', 'June'
                ].map((m) => (
                  <div key={m} className="p-3 bg-canvas rounded-xl border border-subtle-border text-center">
                    <div className="font-bold text-xs text-charcoal">{m}</div>
                    <div className="text-[10px] text-charcoal-muted mt-1">
                      {m === 'November' ? `${filteredEvents.length} events` : 'Scheduled'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events on Selected Day (matching bottom of screenshot) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-charcoal">
                Events on Thu, {selectedDay} Nov 2026
              </h3>
              <span className="text-xs font-semibold text-charcoal-muted">
                {eventsOnSelectedDay.length} {eventsOnSelectedDay.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {eventsOnSelectedDay.length === 0 ? (
              <div className="bg-card rounded-2xl border border-subtle-border p-6 text-center text-xs text-charcoal-muted">
                No events scheduled for this day under selected filters.
              </div>
            ) : (
              <div className="space-y-3">
                {eventsOnSelectedDay.map((ev) => {
                  const meta = categoryMeta[ev.category] || categoryMeta.academic;
                  const isSelected = selectedEventId === ev.id;
                  const startTime = new Date(ev.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`bg-card rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#155137] ring-1 ring-[#155137] shadow-sm'
                          : 'border-subtle-border hover:border-charcoal-muted'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Time Box */}
                        <div className="w-16 text-center py-1.5 px-2 bg-canvas border border-subtle-border rounded-xl flex-shrink-0">
                          <div className="text-xs font-black text-charcoal">{startTime}</div>
                        </div>

                        {/* Title and Venue */}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-charcoal truncate">
                            {ev.title}
                          </h4>
                          <div className="text-xs text-charcoal-muted truncate">
                            {ev.venue_text}
                          </div>
                        </div>
                      </div>

                      {/* Right Category Badge & Arrow */}
                      <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                          {meta.label}
                        </span>
                        <div className="w-7 h-7 rounded-full border border-subtle-border flex items-center justify-center text-charcoal hover:bg-[#155137] hover:text-white transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Panel / Drawer (4 cols) matching screenshot */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          {selectedEvent ? (
            <div className="bg-card rounded-2xl border border-subtle-border p-6 shadow-sm space-y-5">
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    categoryMeta[selectedEvent.category]?.bg || 'bg-badge-green'
                  } ${categoryMeta[selectedEvent.category]?.text || 'text-badge-green-text'}`}
                >
                  {categoryMeta[selectedEvent.category]?.label || 'Event'}
                </span>
                <button 
                  onClick={() => setSelectedEventId(null)}
                  className="w-7 h-7 rounded-full bg-canvas border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Event Title */}
              <div>
                <h2 className="font-display text-3xl font-black text-charcoal leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>

              {/* Date, Time, Venue with Icons */}
              <div className="space-y-2.5 text-xs text-charcoal">
                <div className="flex items-center space-x-2.5">
                  <CalendarIcon className="w-4 h-4 text-charcoal-muted flex-shrink-0" />
                  <span>
                    {new Date(selectedEvent.start_datetime).toLocaleDateString('en-US', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-charcoal-muted flex-shrink-0" />
                  <span>
                    {new Date(selectedEvent.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(selectedEvent.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-charcoal-muted flex-shrink-0" />
                  <span>{selectedEvent.venue_text}</span>
                </div>
              </div>

              <hr className="border-subtle-border" />

              {/* About */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  About
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  {selectedEvent.description || 'No detailed description provided for this campus event.'}
                </p>
              </div>

              {/* Organized by */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Organized by
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-[#155137] text-white font-black text-sm flex items-center justify-center">
                    {(selectedEvent.organizer_club || selectedEvent.organizer_department || 'C').charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-charcoal">
                      {selectedEvent.organizer_club || selectedEvent.organizer_department || 'Campus Council'}
                    </div>
                    <div className="text-[10px] text-charcoal-muted capitalize">
                      {selectedEvent.category} Event
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-subtle-border" />

              {/* Event Details Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                  Event Details
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-subtle-border/50">
                    <span className="text-charcoal-muted">Date</span>
                    <span className="font-semibold text-charcoal">
                      {new Date(selectedEvent.start_datetime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-subtle-border/50">
                    <span className="text-charcoal-muted">Time</span>
                    <span className="font-semibold text-charcoal">
                      {new Date(selectedEvent.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-subtle-border/50">
                    <span className="text-charcoal-muted">Venue</span>
                    <span className="font-semibold text-charcoal">{selectedEvent.venue_text}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-subtle-border/50">
                    <span className="text-charcoal-muted">Category</span>
                    <span className="font-semibold text-charcoal capitalize">{selectedEvent.category}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-charcoal-muted">Open to</span>
                    <span className="font-semibold text-charcoal">{selectedEvent.open_to || 'All Students'}</span>
                  </div>
                </div>
              </div>

              {/* Optional Registration Link */}
              {selectedEvent.registration_url && (
                <a
                  href={selectedEvent.registration_url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-[#155137] hover:bg-[#0E3E2A] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm block text-center"
                >
                  <span>Register for Event</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-subtle-border p-8 text-center text-xs text-charcoal-muted">
              Select an event to view complete details, venue, and organizer information.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
