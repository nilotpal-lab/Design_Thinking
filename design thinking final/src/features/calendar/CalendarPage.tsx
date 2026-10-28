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
  ExternalLink
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

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => selectedCategories.includes(ev.category));
  }, [events, selectedCategories]);

  // November 2026 Calendar Grid (Starts Sunday 1 Nov)
  const monthDays = useMemo(() => {
    const days: { day: number; dateStr: string; events: CampusEvent[] }[] = [];
    for (let d = 1; d <= 30; d++) {
      const dateStr = `2026-11-${String(d).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter((ev) => ev.start_datetime.startsWith(dateStr));
      days.push({ day: d, dateStr, events: dayEvents });
    }
    return days;
  }, [filteredEvents]);

  const eventsOnSelectedDay = useMemo(() => {
    const dateStr = `2026-11-${String(selectedDay).padStart(2, '0')}`;
    return filteredEvents.filter((ev) => ev.start_datetime.startsWith(dateStr));
  }, [filteredEvents, selectedDay]);

  const selectedEvent = useMemo(() => {
    return events.find((ev) => ev.id === selectedEventId) || eventsOnSelectedDay[0] || events[0] || null;
  }, [events, selectedEventId, eventsOnSelectedDay]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 3-Column Integrated Grid matching 3) Calendar.jpeg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Column 1: Left Title + Compact Sidebar Filter (~22% = col-span-3) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Top Title directly above filters */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal/70">
                CAMPUS CALENDAR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#155137]"></span>
            </div>
            <h1 className="font-display text-5xl font-black uppercase tracking-tight text-charcoal leading-[0.9]">
              CAMPUS<br />
              <span className="text-[#3D775F]">EVENTS.</span>
            </h1>
          </div>

          {/* Compact Filter Stack (no card border, fits on screen) */}
          <div className="space-y-4 text-xs">
            {/* View Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                View
              </label>
              <div className="grid grid-cols-3 gap-1 bg-card border border-subtle-border rounded-xl p-1">
                {(['month', 'year', 'list'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`py-1 text-[11px] font-semibold rounded-lg capitalize text-center transition-all ${
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

            {/* Date Select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                Date
              </label>
              <div className="relative">
                <CalendarIcon className="w-3.5 h-3.5 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-card border border-subtle-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-charcoal focus:outline-none focus:border-[#155137]"
                >
                  <option value={10}>November 2026</option>
                  <option value={11}>December 2026</option>
                  <option value={9}>October 2026</option>
                </select>
              </div>
            </div>

            {/* Event Type Checkboxes */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                Event Type
              </label>
              <div className="space-y-1.5 text-[11px]">
                {Object.entries(categoryMeta).map(([key, meta]) => {
                  const isChecked = selectedCategories.includes(key);
                  return (
                    <label
                      key={key}
                      className="flex items-center space-x-2 cursor-pointer text-charcoal hover:text-black transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(key)}
                        className="w-3.5 h-3.5 rounded border-subtle-border text-[#155137] focus:ring-[#155137]"
                      />
                      <span className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                        <span>{meta.label}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={handleClearFilters}
              className="w-full py-2 border border-subtle-border bg-card/60 hover:bg-card rounded-xl text-xs font-semibold text-charcoal flex items-center justify-center space-x-1.5 transition-colors shadow-2xs mt-2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-charcoal-muted" />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        {/* Right Section (Center Calendar + Detail Drawer = col-span-9) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Top Header Row matching 3) Calendar.jpeg */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-bold tracking-wider text-charcoal/70 uppercase">
              DISCOVER. PARTICIPATE. STAY INFORMED.
            </div>

            <div className="flex items-center space-x-3">
              {/* Segmented View Switcher */}
              <div className="flex items-center bg-card border border-subtle-border rounded-xl p-1 shadow-sm">
                {(['month', 'year', 'list'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all ${
                      viewMode === mode
                        ? 'bg-[#155137] text-white shadow-sm'
                        : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Year Dropdown */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-card border border-subtle-border rounded-xl px-2.5 py-1 text-xs font-bold text-charcoal focus:outline-none focus:border-[#155137] shadow-sm"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          {/* Sub-grid: Center Calendar (7 cols) + Right Detail Drawer (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Center: Calendar Matrix (col-span-7) */}
            <div className="md:col-span-7 space-y-5">
              {viewMode === 'month' && (
                <div className="bg-card rounded-2xl border border-subtle-border p-4 shadow-sm space-y-4">
                  {/* Navigator & Legend */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle-border pb-3">
                    <div className="flex items-center space-x-2">
                      <button className="w-6 h-6 rounded-full border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal">
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-xs text-charcoal">
                        November 2026
                      </span>
                      <button
                        onClick={() => setSelectedDay(5)}
                        className="px-2 py-0.5 rounded border border-subtle-border text-[10px] font-bold text-charcoal hover:bg-canvas"
                      >
                        Today
                      </button>
                      <button className="w-6 h-6 rounded-full border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Dots Legend */}
                    <div className="flex flex-wrap items-center gap-2 text-[9px] text-charcoal-muted">
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
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-charcoal-muted">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                      <div key={d} className="py-0.5">{d}</div>
                    ))}
                  </div>

                  {/* Month Day Cells */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {monthDays.map(({ day, events: dayEvents }) => {
                      const isSelected = selectedDay === day;
                      const hasEvents = dayEvents.length > 0;

                      return (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`h-9 rounded-lg flex flex-col items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-[#155137] text-white font-bold shadow-sm'
                              : 'hover:bg-canvas text-charcoal font-medium'
                          }`}
                        >
                          <span className="text-[11px]">{day}</span>
                          {hasEvents && (
                            <div className="flex items-center space-x-0.5 mt-0.5">
                              {dayEvents.slice(0, 3).map((ev, i) => (
                                <span
                                  key={i}
                                  className={`w-1 h-1 rounded-full ${
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

              {/* Events on Selected Day List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-0.5">
                  <h3 className="font-bold text-xs text-charcoal">
                    Events on Thu, {selectedDay} Nov 2026
                  </h3>
                  <span className="text-[10px] font-semibold text-charcoal-muted">
                    {eventsOnSelectedDay.length} {eventsOnSelectedDay.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {eventsOnSelectedDay.length === 0 ? (
                  <div className="bg-card rounded-2xl border border-subtle-border p-5 text-center text-xs text-charcoal-muted">
                    No events scheduled for this day under selected filters.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eventsOnSelectedDay.map((ev) => {
                      const meta = categoryMeta[ev.category] || categoryMeta.academic;
                      const isSelected = selectedEventId === ev.id;
                      const startTime = new Date(ev.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={`bg-card rounded-xl p-3 border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-[#155137] ring-1 ring-[#155137] shadow-2xs'
                              : 'border-subtle-border hover:border-charcoal-muted'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            {/* Time Box */}
                            <div className="w-14 text-center py-1 px-1.5 bg-canvas border border-subtle-border rounded-lg flex-shrink-0">
                              <div className="text-[11px] font-black text-charcoal">{startTime}</div>
                            </div>

                            {/* Title & Venue */}
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-charcoal truncate">
                                {ev.title}
                              </h4>
                              <div className="text-[10px] text-charcoal-muted truncate">
                                {ev.venue_text}
                              </div>
                            </div>
                          </div>

                          {/* Category Badge & Arrow */}
                          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                              {meta.label}
                            </span>
                            <div className="w-6 h-6 rounded-full border border-subtle-border flex items-center justify-center text-charcoal hover:bg-[#155137] hover:text-white transition-colors">
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Event Detail Drawer (col-span-5) */}
            <div className="md:col-span-5 sticky top-24 space-y-4">
              {selectedEvent ? (
                <div className="bg-card rounded-2xl border border-subtle-border p-5 shadow-sm space-y-4">
                  {/* Category Pill & Close */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        categoryMeta[selectedEvent.category]?.bg || 'bg-badge-green'
                      } ${categoryMeta[selectedEvent.category]?.text || 'text-badge-green-text'}`}
                    >
                      {categoryMeta[selectedEvent.category]?.label || 'Event'}
                    </span>
                    <button 
                      onClick={() => setSelectedEventId(null)}
                      className="w-6 h-6 rounded-full bg-canvas border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-2xl font-black text-charcoal leading-tight">
                    {selectedEvent.title}
                  </h2>

                  {/* Metadata Rows */}
                  <div className="space-y-2 text-xs text-charcoal">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-charcoal-muted flex-shrink-0" />
                      <span>
                        {new Date(selectedEvent.start_datetime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-charcoal-muted flex-shrink-0" />
                      <span>
                        {new Date(selectedEvent.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(selectedEvent.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-charcoal-muted flex-shrink-0" />
                      <span>{selectedEvent.venue_text}</span>
                    </div>
                  </div>

                  <hr className="border-subtle-border" />

                  {/* About */}
                  <div className="space-y-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal">
                      About
                    </h4>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      {selectedEvent.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  {/* Organized by */}
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal">
                      Organized by
                    </h4>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#155137] text-white font-black text-xs flex items-center justify-center">
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
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal mb-1">
                      Event Details
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-0.5 border-b border-subtle-border/50">
                        <span className="text-charcoal-muted">Date</span>
                        <span className="font-semibold text-charcoal">
                          {new Date(selectedEvent.start_datetime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-subtle-border/50">
                        <span className="text-charcoal-muted">Time</span>
                        <span className="font-semibold text-charcoal">
                          {new Date(selectedEvent.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-subtle-border/50">
                        <span className="text-charcoal-muted">Venue</span>
                        <span className="font-semibold text-charcoal">{selectedEvent.venue_text}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-charcoal-muted">Open to</span>
                        <span className="font-semibold text-charcoal">{selectedEvent.open_to || 'All Students'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedEvent.registration_url && (
                    <a
                      href={selectedEvent.registration_url}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 bg-[#155137] hover:bg-[#0E3E2A] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm block text-center"
                    >
                      <span>Register for Event</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
