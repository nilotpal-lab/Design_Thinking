import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  Sun, 
  Zap, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Calendar,
  Clock,
  Layers,
  X,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Room, RoomScheduleSlot } from '../../types/database';
import { getCurrentPeriodAndDay, PERIODS } from '../../lib/timetableEngine';

export const SpacesPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<RoomScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'free_now' | 'occupied'>('all');
  const [floorFilter, setFloorFilter] = useState<number | 'all' | 'ground'>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [filterAc, setFilterAc] = useState(false);
  const [filterCharging, setFilterCharging] = useState(false);
  const [sortBy, setSortBy] = useState<'room_asc' | 'room_desc' | 'capacity_desc'>('room_asc');

  // Selected Room for Right Detail Drawer
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [showFullScheduleModal, setShowFullScheduleModal] = useState(false);

  // Simulated / Current Period
  const activePeriodInfo = useMemo(() => getCurrentPeriodAndDay(), []);

  // Fetch Rooms and Schedule Slots from Supabase
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [roomsRes, slotsRes] = await Promise.all([
        supabase.from('rooms').select('*').order('room_code', { ascending: true }),
        supabase.from('room_schedule_slots').select('*'),
      ]);

      if (roomsRes.data) {
        setRooms(roomsRes.data as Room[]);
        if (roomsRes.data.length > 0) {
          setSelectedRoomId(roomsRes.data[0].id);
        }
      }
      if (slotsRes.data) {
        setScheduleSlots(slotsRes.data as RoomScheduleSlot[]);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Helper to check room's current availability status
  const getRoomLiveStatus = (roomId: string): { isFree: boolean; label: string; currentClass?: string } => {
    // If college hours are inactive or Sunday, fallback to general scheduled check
    const currentDay = activePeriodInfo.dayOfWeek || 1; // Default Monday if Sunday for preview
    const currentPeriod = activePeriodInfo.periodNumber || 1; // Default Period 1 if outside hours

    const slot = scheduleSlots.find(
      (s) => s.room_id === roomId && s.day_of_week === currentDay && s.period_number === currentPeriod
    );

    if (!slot) {
      return { isFree: false, label: 'No Data' };
    }

    if (slot.is_scheduled_free) {
      return { isFree: true, label: 'Available' };
    } else {
      return { 
        isFree: false, 
        label: 'Occupied', 
        currentClass: slot.scheduled_label || slot.slot_type.toUpperCase() 
      };
    }
  };

  // Filter & Sort Logic
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((room) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = room.room_code.toLowerCase().includes(q);
          const matchName = room.display_name.toLowerCase().includes(q);
          const matchType = room.room_type.toLowerCase().includes(q);
          if (!matchCode && !matchName && !matchType) return false;
        }

        // Floor Filter
        if (floorFilter === 'ground') {
          if (room.floor_number !== 0) return false;
        } else if (floorFilter !== 'all') {
          if (room.floor_number !== floorFilter) return false;
        }

        // Amenities
        if (filterAc && !room.has_ac) return false;
        if (filterCharging && !room.has_charging_points) return false;

        // Room Type
        if (selectedTypes.length > 0 && !selectedTypes.includes(room.room_type)) {
          return false;
        }

        // Availability Filter
        if (availabilityFilter !== 'all') {
          const status = getRoomLiveStatus(room.id);
          if (availabilityFilter === 'free_now' && !status.isFree) return false;
          if (availabilityFilter === 'occupied' && status.isFree) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'room_asc') return a.room_code.localeCompare(b.room_code, undefined, { numeric: true });
        if (sortBy === 'room_desc') return b.room_code.localeCompare(a.room_code, undefined, { numeric: true });
        if (sortBy === 'capacity_desc') return (b.seating_capacity || 0) - (a.seating_capacity || 0);
        return 0;
      });
  }, [rooms, searchQuery, floorFilter, filterAc, filterCharging, selectedTypes, availabilityFilter, sortBy, scheduleSlots]);

  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0] || null;
  }, [rooms, selectedRoomId]);

  const selectedRoomStatus = selectedRoom ? getRoomLiveStatus(selectedRoom.id) : null;

  // Clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setAvailabilityFilter('all');
    setFloorFilter('all');
    setSelectedTypes([]);
    setFilterAc(false);
    setFilterCharging(false);
    setSortBy('room_asc');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold tracking-widest uppercase text-charcoal-muted">
                CAMPUS SPACES
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest"></span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-black uppercase tracking-tight text-charcoal leading-none">
              FIND YOUR <span className="text-forest">SPACE.</span>
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold tracking-widest text-charcoal-muted uppercase">
              STUDY. COLLABORATE. RELAX.
            </span>
          </div>
        </div>

        {/* Search Bar matching screenshot */}
        <div className="flex items-center bg-card rounded-2xl border border-subtle-border p-2 shadow-sm focus-within:ring-2 focus-within:ring-forest/20 focus-within:border-forest transition-all">
          <Search className="w-5 h-5 text-charcoal-muted ml-3 mr-3" />
          <input
            type="text"
            placeholder="Search by room number, name or type (e.g. 101, 204, Class...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-charcoal text-base placeholder:text-charcoal-muted/60 focus:outline-none py-1.5"
          />
          <button 
            className="w-11 h-11 rounded-xl bg-forest hover:bg-forest-dark text-white flex items-center justify-center transition-colors shadow-sm ml-2 flex-shrink-0"
            aria-label="Search Rooms"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Left Filter Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-6 bg-card rounded-2xl border border-subtle-border p-5">
          {/* Availability Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Availability
            </label>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setAvailabilityFilter('all')}
                className={`py-2 px-3 text-xs font-bold rounded-lg text-left transition-all ${
                  availabilityFilter === 'all'
                    ? 'bg-forest text-white'
                    : 'bg-canvas text-charcoal hover:bg-forest-tint'
                }`}
              >
                All Rooms
              </button>
              <button
                onClick={() => setAvailabilityFilter('free_now')}
                className={`py-2 px-3 text-xs font-bold rounded-lg text-left transition-all ${
                  availabilityFilter === 'free_now'
                    ? 'bg-forest text-white'
                    : 'bg-canvas text-charcoal hover:bg-forest-tint'
                }`}
              >
                Free Rooms Now
              </button>
              <button
                onClick={() => setAvailabilityFilter('occupied')}
                className={`py-2 px-3 text-xs font-bold rounded-lg text-left transition-all ${
                  availabilityFilter === 'occupied'
                    ? 'bg-forest text-white'
                    : 'bg-canvas text-charcoal hover:bg-forest-tint'
                }`}
              >
                Occupied / In Use
              </button>
            </div>
          </div>

          <hr className="border-subtle-border" />

          {/* Floor Filter */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Floor
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFloorFilter('all')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                    floorFilter === 'all'
                      ? 'bg-forest text-white'
                      : 'bg-canvas text-charcoal hover:bg-forest-tint'
                  }`}
                >
                  All Floors
                </button>
                <button
                  onClick={() => setFloorFilter('ground')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                    floorFilter === 'ground'
                      ? 'bg-forest text-white'
                      : 'bg-canvas text-charcoal hover:bg-forest-tint'
                  }`}
                >
                  Ground Floor
                </button>
              </div>

              {/* Floor Numbers 1, 2, 3, 4 */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setFloorFilter(num)}
                    className={`py-2 text-xs font-bold rounded-lg text-center transition-all ${
                      floorFilter === num
                        ? 'bg-forest text-white'
                        : 'bg-canvas text-charcoal hover:bg-forest-tint'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-subtle-border" />

          {/* Room Type Checkboxes */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Room Type
            </label>
            <div className="space-y-2 text-xs">
              {[
                { id: 'classroom', label: 'Classroom' },
                { id: 'study_room', label: 'Study Room' },
                { id: 'library', label: 'Library' },
                { id: 'lab', label: 'Lab' },
                { id: 'seminar_hall', label: 'Seminar Hall' },
                { id: 'common_area', label: 'Common Area' },
              ].map((type) => (
                <label key={type.id} className="flex items-center space-x-2.5 cursor-pointer text-charcoal">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTypes([...selectedTypes, type.id]);
                      } else {
                        setSelectedTypes(selectedTypes.filter((t) => t !== type.id));
                      }
                    }}
                    className="w-4 h-4 rounded border-subtle-border text-forest focus:ring-forest"
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-subtle-border" />

          {/* Amenities Checkboxes */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Amenities
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-center space-x-2.5 cursor-pointer text-charcoal">
                <input
                  type="checkbox"
                  checked={filterAc}
                  onChange={(e) => setFilterAc(e.target.checked)}
                  className="w-4 h-4 rounded border-subtle-border text-forest focus:ring-forest"
                />
                <span>AC</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer text-charcoal">
                <input
                  type="checkbox"
                  checked={filterCharging}
                  onChange={(e) => setFilterCharging(e.target.checked)}
                  className="w-4 h-4 rounded border-subtle-border text-forest focus:ring-forest"
                />
                <span>Charging Points</span>
              </label>
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

        {/* Column 2: Center Room List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold uppercase tracking-wide text-charcoal">
              {filteredRooms.length} ROOMS FOUND
            </span>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-charcoal-muted">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card border border-subtle-border rounded-lg px-2.5 py-1 font-semibold text-charcoal focus:outline-none focus:border-forest"
              >
                <option value="room_asc">Room Number (A - Z)</option>
                <option value="room_desc">Room Number (Z - A)</option>
                <option value="capacity_desc">Capacity (High to Low)</option>
              </select>
            </div>
          </div>

          {/* Room Items List */}
          {loading ? (
            <div className="bg-card rounded-2xl border border-subtle-border p-12 text-center text-charcoal-muted">
              Loading rooms from campus database...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-card rounded-2xl border border-subtle-border p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-charcoal-muted mx-auto" />
              <div className="text-sm font-bold text-charcoal">No classrooms matched your filter</div>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                {floorFilter === 'ground' 
                  ? "The campus inventory contains no regular classrooms on the Ground Floor."
                  : "Try clearing some filters or searching for a different room number."}
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-1.5 bg-forest text-white text-xs font-bold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRooms.map((room) => {
                const status = getRoomLiveStatus(room.id);
                const isSelected = selectedRoomId === room.id;

                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`bg-card rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-forest ring-1 ring-forest shadow-md'
                        : 'border-subtle-border hover:border-charcoal-muted hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      {/* Room Code Badge */}
                      <div className="w-14 h-12 rounded-xl bg-canvas border border-subtle-border flex items-center justify-center flex-shrink-0">
                        <span className="font-display font-black text-lg text-charcoal">
                          {room.room_code}
                        </span>
                      </div>

                      {/* Room Info */}
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-bold text-sm text-charcoal truncate">
                          {room.display_name}
                        </h3>
                        <div className="text-[11px] text-charcoal-muted flex items-center space-x-2">
                          <span className="capitalize">{room.room_type}</span>
                          <span>•</span>
                          <span>Floor {room.floor_number}</span>
                          {room.seating_capacity && (
                            <>
                              <span>•</span>
                              <span>{room.seating_capacity} seats</span>
                            </>
                          )}
                        </div>

                        {/* Amenities icons */}
                        <div className="flex items-center space-x-3 text-[11px] text-charcoal-muted pt-0.5">
                          {room.has_ac && (
                            <span className="flex items-center space-x-1">
                              <Sun className="w-3 h-3 text-amber-600" />
                              <span>AC</span>
                            </span>
                          )}
                          {room.has_charging_points && (
                            <span className="flex items-center space-x-1">
                              <Zap className="w-3 h-3 text-emerald-600" />
                              <span>Charging</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Status Badge & Arrow */}
                    <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          status.isFree
                            ? 'bg-badge-green text-badge-green-text'
                            : 'bg-badge-red text-badge-red-text'
                        }`}
                      >
                        {status.label}
                      </span>
                      <div className="w-7 h-7 rounded-full border border-subtle-border flex items-center justify-center text-charcoal hover:bg-forest hover:text-white transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 3: Right Room Detail Drawer (4 cols) */}
        <div className="lg:col-span-4 sticky top-28 space-y-5">
          {selectedRoom ? (
            <div className="bg-card rounded-2xl border border-subtle-border p-6 shadow-sm space-y-6">
              {/* Header Title + Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-display text-4xl font-black text-charcoal tracking-tight block">
                    {selectedRoom.room_code}
                  </span>
                  <h2 className="font-bold text-xl text-charcoal">
                    {selectedRoom.display_name}
                  </h2>
                  <div className="text-xs text-charcoal-muted mt-1">
                    <span className="capitalize">{selectedRoom.room_type}</span> | Floor {selectedRoom.floor_number}
                  </div>
                </div>

                {selectedRoomStatus && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                      selectedRoomStatus.isFree
                        ? 'bg-badge-green text-badge-green-text'
                        : 'bg-badge-red text-badge-red-text'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedRoomStatus.isFree ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    <span>{selectedRoomStatus.label}</span>
                  </span>
                )}
              </div>

              {/* Amenity Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-canvas border border-subtle-border rounded-xl p-3 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-charcoal">
                    <Sun className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-charcoal-muted">AC</div>
                    <div className="text-xs font-bold text-charcoal">
                      {selectedRoom.has_ac ? 'Available' : 'None'}
                    </div>
                  </div>
                </div>

                <div className="bg-canvas border border-subtle-border rounded-xl p-3 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-charcoal">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-charcoal-muted">Charging</div>
                    <div className="text-xs font-bold text-charcoal">
                      {selectedRoom.has_charging_points ? 'Available' : 'None'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Specifications */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Description & Capacity
                </h4>
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  Regular academic classroom equipped with teaching podium, whiteboard, and {selectedRoom.seating_capacity || 60} fixed student seats. Standard lecture and discussion configuration.
                </p>
              </div>

              {/* Floor Information Card */}
              <div className="bg-canvas border border-subtle-border rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-charcoal">Floor {selectedRoom.floor_number}</div>
                  <div className="text-[11px] text-charcoal-muted">Main Academic Wing</div>
                </div>
                <ChevronRight className="w-4 h-4 text-charcoal-muted" />
              </div>

              {/* Check Availability CTA Button */}
              <button
                onClick={() => setShowFullScheduleModal(true)}
                className="w-full py-3.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <span>Check Availability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Full Weekly Timetable Schedule Modal */}
      {showFullScheduleModal && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl rounded-3xl border border-subtle-border p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-subtle-border pb-4">
              <div>
                <span className="text-xs font-bold text-forest uppercase tracking-wider">
                  Weekly Class Schedule
                </span>
                <h3 className="font-display text-3xl font-black text-charcoal">
                  {selectedRoom.display_name}
                </h3>
              </div>
              <button
                onClick={() => setShowFullScheduleModal(false)}
                className="w-9 h-9 rounded-full bg-canvas border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Timetable Matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-subtle-border bg-canvas">
                    <th className="py-2.5 px-3 font-bold text-charcoal">Day</th>
                    {PERIODS.map((p) => (
                      <th key={p.period_number} className="py-2.5 px-3 font-bold text-charcoal text-center">
                        <div>P{p.period_number}</div>
                        <div className="text-[10px] text-charcoal-muted font-normal">{p.start_time} - {p.end_time}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-border">
                  {[
                    { dow: 1, label: 'Mon' },
                    { dow: 2, label: 'Tue' },
                    { dow: 3, label: 'Wed' },
                    { dow: 4, label: 'Thu' },
                    { dow: 5, label: 'Fri' },
                    { dow: 6, label: 'Sat' },
                  ].map((day) => (
                    <tr key={day.dow} className="hover:bg-canvas/50">
                      <td className="py-3 px-3 font-bold text-charcoal">{day.label}</td>
                      {PERIODS.map((p) => {
                        const slot = scheduleSlots.find(
                          (s) => s.room_id === selectedRoom.id && s.day_of_week === day.dow && s.period_number === p.period_number
                        );

                        if (!slot) {
                          return (
                            <td key={p.period_number} className="p-2 text-center text-charcoal-muted/40">
                              -
                            </td>
                          );
                        }

                        if (slot.is_scheduled_free) {
                          return (
                            <td key={p.period_number} className="p-1.5 text-center">
                              <span className="inline-block py-1 px-2 rounded-md bg-badge-green text-badge-green-text font-bold text-[10px]">
                                FREE
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={p.period_number} className="p-1.5 text-center">
                            <div className="py-1 px-1.5 rounded-md bg-canvas border border-subtle-border">
                              <div className="font-bold text-[10px] text-charcoal truncate max-w-[90px]" title={slot.scheduled_label || slot.slot_type}>
                                {slot.scheduled_label || slot.slot_type.toUpperCase()}
                              </div>
                              <div className="text-[9px] text-charcoal-muted capitalize">
                                {slot.slot_type}
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-subtle-border text-xs text-charcoal-muted">
              <span>* Data snapshot verified from official college timetable.</span>
              <button
                onClick={() => setShowFullScheduleModal(false)}
                className="px-5 py-2 bg-charcoal text-white font-bold rounded-xl hover:bg-forest transition-colors"
              >
                Close Timetable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
