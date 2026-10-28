import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Calendar, 
  User, 
  AlertCircle, 
  ShoppingBag, 
  Key, 
  ArrowRight, 
  Sparkles, 
  Clock 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, meta?: any) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [marketplace, setMarketplace] = useState<any[]>([]);
  const [lostFound, setLostFound] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      fetchAllData();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Parent triggers open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch quick index
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [r, ev, f, m, lf] = await Promise.all([
        supabase.from('rooms').select('id, room_code, display_name, room_type, floor_number').limit(40),
        supabase.from('events').select('id, title, category, venue_text, start_datetime').limit(15),
        supabase.from('faculty').select('id, name, designation, department, cabin_location').limit(20),
        supabase.from('marketplace_items').select('id, title, price, category, status').limit(15),
        supabase.from('lost_found_items').select('id, title, report_type, location_text, incident_date').limit(15),
      ]);

      if (r.data) setRooms(r.data);
      if (ev.data) setEvents(ev.data);
      if (f.data) setFaculty(f.data);
      if (m.data) setMarketplace(m.data);
      if (lf.data) setLostFound(lf.data);
    } catch (e) {
      console.error('CommandPalette index error:', e);
    } finally {
      setLoading(false);
    }
  };

  const results = useMemo(() => {
    if (!query.trim()) return { rooms: [], events: [], faculty: [], marketplace: [], lostFound: [] };
    const q = query.toLowerCase();

    return {
      rooms: rooms.filter(r => 
        (r.room_code && r.room_code.toLowerCase().includes(q)) || 
        (r.display_name && r.display_name.toLowerCase().includes(q)) ||
        (r.room_type && r.room_type.toLowerCase().includes(q))
      ).slice(0, 4),
      events: events.filter(e => 
        (e.title && e.title.toLowerCase().includes(q)) || 
        (e.venue_text && e.venue_text.toLowerCase().includes(q))
      ).slice(0, 3),
      faculty: faculty.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) || 
        (f.department && f.department.toLowerCase().includes(q)) ||
        (f.cabin_location && f.cabin_location.toLowerCase().includes(q))
      ).slice(0, 3),
      marketplace: marketplace.filter(m => 
        (m.title && m.title.toLowerCase().includes(q)) || 
        (m.category && m.category.toLowerCase().includes(q))
      ).slice(0, 3),
      lostFound: lostFound.filter(lf => 
        (lf.title && lf.title.toLowerCase().includes(q)) || 
        (lf.location_text && lf.location_text.toLowerCase().includes(q))
      ).slice(0, 3),
    };
  }, [query, rooms, events, faculty, marketplace, lostFound]);

  const totalResults = 
    results.rooms.length + 
    results.events.length + 
    results.faculty.length + 
    results.marketplace.length + 
    results.lostFound.length;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-black/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10 bg-[#FAF8F5]">
          <Search className="w-5 h-5 text-forest shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search classrooms, events, faculty, marketplace, lost items..."
            className="w-full bg-transparent text-charcoal placeholder:text-charcoal-muted/70 text-base focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-mono text-charcoal-muted bg-white px-2 py-0.5 rounded border border-black/10 shadow-2xs">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-8 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EAF4EE] text-[#155137] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-charcoal">Quick Campus Finder</p>
              <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                Type a room number (e.g. <strong>101</strong>, <strong>304</strong>), professor's name, campus event, or lost item.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Free Rooms', 'Floor 2', 'AI and Beyond', 'Dr. Priya', 'MacBook', 'Wallet'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="text-xs bg-black/5 hover:bg-forest/10 hover:text-forest px-3 py-1 rounded-full text-charcoal transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-charcoal-muted space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto text-charcoal-muted/60" />
              <p className="text-sm font-semibold text-charcoal">No campus records found for "{query}"</p>
              <p className="text-xs">Try searching by room number (e.g. "201"), subject, or category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Rooms Section */}
              {results.rooms.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-2 px-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-forest" />
                    <span>Spaces &amp; Classrooms ({results.rooms.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.rooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => {
                          onNavigate('spaces', { roomCode: room.room_code });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#EAF4EE] text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-sm text-forest bg-white px-2 py-0.5 rounded border border-black/10">
                            {room.room_code}
                          </span>
                          <div>
                            <div className="font-semibold text-xs text-charcoal group-hover:text-forest">
                              {room.display_name}
                            </div>
                            <div className="text-[11px] text-charcoal-muted">
                              Floor {room.floor_number} • {room.room_type}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-2 px-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#3D775F]" />
                    <span>Events &amp; Schedule ({results.events.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.events.map(ev => (
                      <button
                        key={ev.id}
                        onClick={() => {
                          onNavigate('calendar', { eventId: ev.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left transition-colors group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-charcoal group-hover:text-forest">
                            {ev.title}
                          </div>
                          <div className="text-[11px] text-charcoal-muted">
                            {ev.venue_text} • {ev.category}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Faculty Section */}
              {results.faculty.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-2 px-2 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-forest" />
                    <span>Faculty Members ({results.faculty.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.faculty.map(f => (
                      <button
                        key={f.id}
                        onClick={() => {
                          onNavigate('faculty', { facultyName: f.name });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left transition-colors group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-charcoal group-hover:text-forest">
                            {f.name}
                          </div>
                          <div className="text-[11px] text-charcoal-muted">
                            {f.designation} • Cabin: {f.cabin_location}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Marketplace Section */}
              {results.marketplace.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-2 px-2 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#3D775F]" />
                    <span>Marketplace Listings ({results.marketplace.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.marketplace.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onNavigate('marketplace', { itemId: m.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left transition-colors group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-charcoal group-hover:text-forest">
                            {m.title}
                          </div>
                          <div className="text-[11px] text-charcoal-muted">
                            ₹{m.price} • {m.category} • <span className="capitalize">{m.status}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lost & Found Section */}
              {results.lostFound.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-2 px-2 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#C5221F]" />
                    <span>Lost &amp; Found ({results.lostFound.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.lostFound.map(lf => (
                      <button
                        key={lf.id}
                        onClick={() => {
                          onNavigate('lostfound', { itemId: lf.id });
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAF8F5] text-left transition-colors group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-charcoal group-hover:text-forest">
                            {lf.title}
                          </div>
                          <div className="text-[11px] text-charcoal-muted">
                            <span className="uppercase font-semibold">{lf.report_type}</span> at {lf.location_text}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-[#FAF8F5] border-t border-black/5 flex items-center justify-between text-[11px] text-charcoal-muted">
          <span>Navigate with mouse or keyboard</span>
          <span>Press <strong>ESC</strong> to dismiss</span>
        </div>

      </div>
    </div>
  );
};
