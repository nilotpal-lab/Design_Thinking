import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  Sun, 
  Zap, 
  RotateCcw, 
  X, 
  ChevronRight,
  AlertCircle
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

  // Active / Simulated Period
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
    const currentDay = activePeriodInfo.dayOfWeek || 1;
    const currentPeriod = activePeriodInfo.periodNumber || 1;

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
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 3-Column Integrated Grid matching 2) Spaces.jpeg */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Column 1: Left Title + Compact Non-Scrolling Filter Sidebar (~22% width = col-span-3) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Top Title directly above filters */}
          <div>
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal/70">
                CAMPUS SPACES
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#155137]"></span>
            </div>
            <h1 className="font-display text-5xl font-black uppercase tracking-tight text-charcoal leading-[0.9]">
              FIND YOUR<br />
              <span className="text-[#3D775F]">SPACE.</span>
            </h1>
          </div>

          {/* Compact Sidebar Filters (no card border, fits on screen) */}
          <div className="space-y-4 text-xs">
            {/* Availability */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                Availability
              </label>
              <div className="space-y-1">
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => setAvailabilityFilter('all')}
                    className={`flex-1 py-1 px-2.5 text-[11px] font-semibold rounded-md transition-all ${
                      availabilityFilter === 'all'
                        ? 'bg-[#155137] text-white shadow-sm'
                        : 'bg-card border border-subtle-border text-charcoal hover:bg-canvas'
                    }`}
                  >
                    All Rooms
                  </button>
                  <button
                    onClick={() => setAvailabilityFilter('free_now')}
                    className={`flex-1 py-1 px-2.5 text-[11px] font-semibold rounded-md transition-all ${
                      availabilityFilter === 'free_now'
                        ? 'bg-[#155137] text-white shadow-sm'
                        : 'bg-card border border-subtle-border text-charcoal hover:bg-canvas'
                    }`}
                  >
                    Free Rooms Now
                  </button>
                </div>
                <button
                  onClick={() => setAvailabilityFilter('occupied')}
                  className={`w-full py-1 px-2.5 text-[11px] font-semibold rounded-md text-left transition-all ${
                    availabilityFilter === 'occupied'
                      ? 'bg-[#155137] text-white shadow-sm'
                      : 'bg-card border border-subtle-border text-charcoal hover:bg-canvas'
                  }`}
                >
                  Occupied / In Use
                </button>
              </div>
            </div>

            {/* Floor */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                Floor
              </label>
              <div className="space-y-1">
                <div className="flex space-x-1.5">
                  <button
                    onClick={() => setFloorFilter('all')}
                    className={`flex-1 py-1 px-2.5 text-[11px] font-semibold rounded-md transition-all ${
                      floorFilter === 'all'
                        ? 'bg-[#155137] text-white shadow-sm'
                        : 'bg-card border border-subtle-border text-charcoal hover:bg-canvas'
                    }`}
                  >
                    All Floors
                  </button>
                  <button
                    onClick={() => setFloorFilter('ground')}
                    className={`flex-1 py-1 px-2.5 text-[11px] font-semibold rounded-md transition-all ${
                      floorFilter === 'ground'
                        ? 'bg-[#155137] text-white shadow-sm'
                        : 'bg-card border border-subtle-border text-charcoal hover:bg-canvas'
                    }`}
                  >
                    Ground Floor
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => setFloorFilter(num)}
                      className={`py-1 text-[11px] font-semibold rounded-md text-center transition-all ${
                        floorFilter === num
                          ? 'bg-[#155137] text-white shadow-sm'
                          : 'bg-card border border-subtle-border text-charcoal hover:bg-canvas'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                Room Type
              </label>
              <div className="space-y-1 text-[11px]">
                {[
                  { id: 'classroom', label: 'Classroom' },
                  { id: 'study_room', label: 'Study Room' },
                  { id: 'library', label: 'Library' },
                  { id: 'lab', label: 'Lab' },
                  { id: 'seminar_hall', label: 'Seminar Hall' },
                  { id: 'common_area', label: 'Common Area' },
                ].map((type) => (
                  <label key={type.id} className="flex items-center space-x-2 cursor-pointer text-charcoal">
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
                      className="w-3.5 h-3.5 rounded border-subtle-border text-[#155137] focus:ring-[#155137]"
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-charcoal uppercase tracking-wider block">
                Amenities
              </label>
              <div className="space-y-1 text-[11px]">
                <label className="flex items-center space-x-2 cursor-pointer text-charcoal">
                  <input
                    type="checkbox"
                    checked={filterAc}
                    onChange={(e) => setFilterAc(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-subtle-border text-[#155137] focus:ring-[#155137]"
                  />
                  <span>AC</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer text-charcoal">
                  <input
                    type="checkbox"
                    checked={filterCharging}
                    onChange={(e) => setFilterCharging(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-subtle-border text-[#155137] focus:ring-[#155137]"
                  />
                  <span>Charging Points</span>
                </label>
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

        {/* Right Section (Center Room List + Detail Drawer = col-span-9) */}
        <div className="lg:col-span-9 space-y-5">
          {/* Top Search Bar & Tagline Row matching 2) Spaces.jpeg */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Tagline */}
            <div className="md:col-span-3 text-xs font-bold tracking-wider text-charcoal/70 uppercase leading-relaxed">
              STUDY.<br />
              COLLABORATE.<br />
              RELAX.
            </div>

            {/* Wide Search Bar with Green Arrow Button */}
            <div className="md:col-span-9">
              <div className="flex items-center bg-card rounded-2xl border border-subtle-border p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-[#155137]/20 focus-within:border-[#155137] transition-all">
                <Search className="w-4 h-4 text-charcoal-muted ml-3 mr-2" />
                <input
                  type="text"
                  placeholder="Search by room number, name or type (e.g. C-201, Library, Lab...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-charcoal text-sm placeholder:text-charcoal-muted/60 focus:outline-none py-1.5"
                />
                <button 
                  className="w-10 h-10 rounded-xl bg-[#155137] hover:bg-[#0E3E2A] text-white flex items-center justify-center transition-colors shadow-sm ml-2 flex-shrink-0"
                  aria-label="Search Rooms"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-grid: Center Rooms List (7 cols) + Right Detail Drawer (5 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Center: Rooms List (col-span-7) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="font-display text-base font-bold uppercase tracking-wide text-charcoal">
                  {filteredRooms.length} ROOMS FOUND
                </span>
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-charcoal-muted">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-card border border-subtle-border rounded-lg px-2 py-0.5 font-semibold text-xs text-charcoal focus:outline-none focus:border-[#155137]"
                  >
                    <option value="room_asc">Room Number (A - Z)</option>
                    <option value="room_desc">Room Number (Z - A)</option>
                    <option value="capacity_desc">Capacity (High to Low)</option>
                  </select>
                </div>
              </div>

              {/* Room Cards List */}
              {loading ? (
                <div className="bg-card rounded-2xl border border-subtle-border p-10 text-center text-xs text-charcoal-muted">
                  Loading rooms...
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="bg-card rounded-2xl border border-subtle-border p-6 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-charcoal-muted mx-auto" />
                  <div className="text-xs font-bold text-charcoal">No classrooms matched your filter</div>
                  <p className="text-[11px] text-charcoal-muted">
                    {floorFilter === 'ground' 
                      ? "The campus inventory contains no regular classrooms on the Ground Floor."
                      : "Try clearing some filters to see all available spaces."}
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1 bg-[#155137] text-white text-xs font-bold rounded-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                  {filteredRooms.map((room) => {
                    const status = getRoomLiveStatus(room.id);
                    const isSelected = selectedRoomId === room.id;

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`bg-card rounded-xl p-3 border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#155137] ring-1 ring-[#155137] shadow-sm'
                            : 'border-subtle-border hover:border-charcoal-muted'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Room Code Badge */}
                          <div className="w-12 h-10 rounded-lg bg-canvas border border-subtle-border flex items-center justify-center flex-shrink-0">
                            <span className="font-display font-black text-base text-charcoal">
                              {room.room_code}
                            </span>
                          </div>

                          {/* Room Details */}
                          <div className="min-w-0 space-y-0.5">
                            <h3 className="font-bold text-xs text-charcoal truncate">
                              {room.display_name}
                            </h3>
                            <div className="text-[10px] text-charcoal-muted flex items-center space-x-1.5">
                              <span className="capitalize">{room.room_type}</span>
                              <span>|</span>
                              <span>Floor {room.floor_number}</span>
                            </div>

                            {/* Amenity icons */}
                            <div className="flex items-center space-x-2.5 text-[10px] text-charcoal-muted pt-0.5">
                              {room.has_ac && (
                                <span className="flex items-center space-x-0.5">
                                  <Sun className="w-3 h-3 text-amber-600" />
                                  <span>AC</span>
                                </span>
                              )}
                              {room.has_charging_points && (
                                <span className="flex items-center space-x-0.5">
                                  <Zap className="w-3 h-3 text-emerald-600" />
                                  <span>Charging Points</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Badge & Arrow */}
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              status.isFree
                                ? 'bg-badge-green text-badge-green-text'
                                : 'bg-badge-red text-badge-red-text'
                            }`}
                          >
                            {status.label}
                          </span>
                          <div className="w-6 h-6 rounded-full border border-subtle-border flex items-center justify-center text-charcoal group-hover:bg-[#155137] group-hover:text-white transition-colors">
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Room Detail Inspector (col-span-5) */}
            <div className="md:col-span-5 sticky top-24 space-y-4">
              {selectedRoom ? (
                <div className="bg-card rounded-2xl border border-subtle-border p-5 shadow-sm space-y-5">
                  {/* Top Code & Status */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-display text-4xl font-black text-charcoal tracking-tight block">
                        {selectedRoom.room_code}
                      </span>
                      <h2 className="font-bold text-lg text-charcoal leading-tight">
                        {selectedRoom.display_name}
                      </h2>
                      <div className="text-xs text-charcoal-muted mt-0.5">
                        <span className="capitalize">{selectedRoom.room_type}</span> | Floor {selectedRoom.floor_number}
                      </div>
                    </div>

                    {selectedRoomStatus && (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 ${
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

                  {/* Amenity Boxes */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-canvas border border-subtle-border rounded-xl p-2.5 flex items-center space-x-2.5">
                      <Sun className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="text-[9px] uppercase font-bold text-charcoal-muted">AC</div>
                        <div className="text-xs font-bold text-charcoal">
                          {selectedRoom.has_ac ? 'Available' : 'None'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-canvas border border-subtle-border rounded-xl p-2.5 flex items-center space-x-2.5">
                      <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="text-[9px] uppercase font-bold text-charcoal-muted">Charging Points</div>
                        <div className="text-xs font-bold text-charcoal">
                          {selectedRoom.has_charging_points ? 'Available' : 'None'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                      Description
                    </h4>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Spacious environment equipped with whiteboard, teaching podium, and {selectedRoom.seating_capacity || 60} fixed student seats. Suitable for lecture and discussion sessions.
                    </p>
                  </div>

                  {/* Floor Information Card */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                      Floor Information
                    </h4>
                    <div className="bg-canvas border border-subtle-border rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-charcoal">Floor {selectedRoom.floor_number}</div>
                        <div className="text-[10px] text-charcoal-muted">Main Academic Block</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-charcoal-muted" />
                    </div>
                  </div>

                  {/* Check Availability CTA Button */}
                  <button
                    onClick={() => setShowFullScheduleModal(true)}
                    className="w-full py-3 bg-[#155137] hover:bg-[#0E3E2A] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-colors shadow-sm"
                  >
                    <span>Check Availability</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule Modal */}
      {showFullScheduleModal && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-4xl rounded-3xl border border-subtle-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-subtle-border pb-3">
              <div>
                <span className="text-xs font-bold text-[#155137] uppercase tracking-wider">
                  Weekly Class Schedule
                </span>
                <h3 className="font-display text-3xl font-black text-charcoal">
                  {selectedRoom.display_name}
                </h3>
              </div>
              <button
                onClick={() => setShowFullScheduleModal(false)}
                className="w-8 h-8 rounded-full bg-canvas border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-subtle-border bg-canvas">
                    <th className="py-2.5 px-3 font-bold text-charcoal">Day</th>
                    {PERIODS.map((p) => (
                      <th key={p.period_number} className="py-2 px-2 font-bold text-charcoal text-center">
                        <div>P{p.period_number}</div>
                        <div className="text-[9px] text-charcoal-muted font-normal">{p.start_time}-{p.end_time}</div>
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
                      <td className="py-2.5 px-3 font-bold text-charcoal">{day.label}</td>
                      {PERIODS.map((p) => {
                        const slot = scheduleSlots.find(
                          (s) => s.room_id === selectedRoom.id && s.day_of_week === day.dow && s.period_number === p.period_number
                        );

                        if (!slot) {
                          return <td key={p.period_number} className="p-1.5 text-center text-charcoal-muted/40">-</td>;
                        }

                        if (slot.is_scheduled_free) {
                          return (
                            <td key={p.period_number} className="p-1 text-center">
                              <span className="inline-block py-0.5 px-1.5 rounded bg-badge-green text-badge-green-text font-bold text-[9px]">
                                FREE
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={p.period_number} className="p-1 text-center">
                            <div className="py-1 px-1 rounded bg-canvas border border-subtle-border">
                              <div className="font-bold text-[9px] text-charcoal truncate max-w-[85px]" title={slot.scheduled_label || slot.slot_type}>
                                {slot.scheduled_label || slot.slot_type.toUpperCase()}
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

            <div className="flex justify-end pt-2 border-t border-subtle-border">
              <button
                onClick={() => setShowFullScheduleModal(false)}
                className="px-4 py-1.5 bg-charcoal text-white font-bold text-xs rounded-xl hover:bg-[#155137] transition-colors"
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
