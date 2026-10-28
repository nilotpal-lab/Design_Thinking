import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { LostFoundItem } from '../../types/database';
import { 
  Search, 
  Plus, 
  Heart, 
  MapPin, 
  Calendar as CalendarIcon, 
  User, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  X, 
  Check, 
  ShieldCheck, 
  FileText, 
  Eye, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export const LostFoundPage: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSubnav, setActiveSubnav] = useState<'browse' | 'reports'>('browse');

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['all']);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'lost' | 'found'>('all');
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days' | 'custom'>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

  // Accordion toggles
  const [typeOpen, setTypeOpen] = useState<boolean>(true);
  const [statusOpen, setStatusOpen] = useState<boolean>(true);
  const [dateOpen, setDateOpen] = useState<boolean>(true);
  const [locationOpen, setLocationOpen] = useState<boolean>(true);

  // Wishlist / Bookmark state
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  // Modal / Drawer states
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [claimModalOpen, setClaimModalOpen] = useState<boolean>(false);
  const [claimSubmitted, setClaimSubmitted] = useState<boolean>(false);
  const [claimProof, setClaimProof] = useState<string>('');
  const [claimContact, setClaimContact] = useState<string>('+91 98765 43210');

  // Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportType, setReportType] = useState<'lost' | 'found'>('lost');
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportCategory, setReportCategory] = useState<string>('electronics');
  const [reportLocation, setReportLocation] = useState<string>('Central Library');
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportPhotoUrl, setReportPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
  const [hideContact, setHideContact] = useState<boolean>(true);

  // Fetch items from Supabase
  const fetchLostFoundItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lost_found_items')
        .select('*')
        .order('incident_date', { ascending: false });

      if (error) {
        console.error('Error fetching lost and found items:', error);
      } else if (data) {
        setItems(data as LostFoundItem[]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostFoundItems();
  }, []);

  // Filtered items logic
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Type filter
      if (!selectedTypes.includes('all')) {
        if (!selectedTypes.includes(item.item_type)) return false;
      }

      // Status filter (Lost vs Found)
      if (selectedStatus !== 'all') {
        if (item.report_type !== selectedStatus) return false;
      }

      // Location filter
      if (selectedLocation !== 'all') {
        if (!item.location_text.toLowerCase().includes(selectedLocation.toLowerCase())) {
          return false;
        }
      }

      // Date range filter
      if (dateRange !== 'all') {
        const itemDate = new Date(item.incident_date).getTime();
        const now = Date.now();
        if (dateRange === '7days') {
          if (now - itemDate > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateRange === '30days') {
          if (now - itemDate > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchDesc = (item.description || '').toLowerCase().includes(query);
        const matchLoc = (item.location_text || '').toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.incident_date).getTime() - new Date(b.incident_date).getTime();
      }
      return new Date(b.incident_date).getTime() - new Date(a.incident_date).getTime();
    });
  }, [items, selectedTypes, selectedStatus, selectedLocation, dateRange, searchQuery, sortBy]);

  // Type filter toggle handler
  const toggleType = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedTypes(['all']);
      return;
    }

    let next = selectedTypes.filter(t => t !== 'all');
    if (next.includes(typeId)) {
      next = next.filter(t => t !== typeId);
      if (next.length === 0) next = ['all'];
    } else {
      next.push(typeId);
    }
    setSelectedTypes(next);
  };

  // Bookmark toggle
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Submit new report
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;

    const newRecord = {
      report_type: reportType,
      item_type: reportCategory,
      title: reportTitle.trim(),
      description: reportDescription.trim() || 'No additional details provided.',
      location_text: reportLocation,
      incident_date: reportDate,
      status: 'open',
      photo_urls: [reportPhotoUrl],
    };

    const { data, error } = await supabase
      .from('lost_found_items')
      .insert([newRecord])
      .select();

    if (!error && data && data.length > 0) {
      setItems(prev => [data[0] as LostFoundItem, ...prev]);
      setIsReportModalOpen(false);
      setReportTitle('');
      setReportDescription('');
    } else {
      console.error('Error submitting report:', error);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Title */}
          <div>
            <h1 className="font-display text-3xl font-black text-charcoal tracking-tight uppercase">
              Lost &amp; Found
            </h1>
          </div>

          {/* Subnav links */}
          <div className="space-y-1.5">
            <button
              onClick={() => { setActiveSubnav('browse'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                activeSubnav === 'browse'
                  ? 'bg-[#EAF4EE] text-[#155137] font-semibold'
                  : 'text-charcoal hover:bg-black/5'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Browse Items</span>
            </button>

            <button
              onClick={() => { setActiveSubnav('reports'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                activeSubnav === 'reports'
                  ? 'bg-[#EAF4EE] text-[#155137] font-semibold'
                  : 'text-charcoal hover:bg-black/5'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Reports</span>
            </button>
          </div>

          {/* Filters only in Browse Items mode */}
          {activeSubnav === 'browse' && (
            <div className="space-y-6 pt-2">
              
              {/* Filter 1: Item Type */}
              <div className="border-t border-black/10 pt-4">
                <button
                  onClick={() => setTypeOpen(!typeOpen)}
                  className="w-full flex items-center justify-between font-bold text-sm text-charcoal mb-2"
                >
                  <span>Item Type</span>
                  {typeOpen ? <ChevronUp className="w-4 h-4 text-charcoal-muted" /> : <ChevronDown className="w-4 h-4 text-charcoal-muted" />}
                </button>

                {typeOpen && (
                  <div className="space-y-2 mt-3 text-xs">
                    {[
                      { id: 'all', label: 'All Types', count: 42 },
                      { id: 'id_cards', label: 'ID Cards', count: 6 },
                      { id: 'electronics', label: 'Electronics', count: 8 },
                      { id: 'books', label: 'Books & Notes', count: 7 },
                      { id: 'clothing', label: 'Clothing & Accessories', count: 10 },
                      { id: 'keys_cards', label: 'Keys & Cards', count: 5 },
                      { id: 'bags_wallets', label: 'Bags & Wallets', count: 4 },
                      { id: 'other', label: 'Other', count: 2 },
                    ].map(type => {
                      const isChecked = selectedTypes.includes(type.id);
                      return (
                        <label
                          key={type.id}
                          className="flex items-center justify-between cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleType(type.id)}
                              className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest accent-[#155137]"
                            />
                            <span className="text-charcoal font-medium group-hover:text-forest transition-colors">
                              {type.label}
                            </span>
                          </div>
                          <span className="text-charcoal-muted font-mono text-[11px] bg-black/5 px-2 py-0.5 rounded-full">
                            {type.count}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter 2: Status (Lost / Found) */}
              <div className="border-t border-black/10 pt-4">
                <button
                  onClick={() => setStatusOpen(!statusOpen)}
                  className="w-full flex items-center justify-between font-bold text-sm text-charcoal mb-2"
                >
                  <span>Status</span>
                  {statusOpen ? <ChevronUp className="w-4 h-4 text-charcoal-muted" /> : <ChevronDown className="w-4 h-4 text-charcoal-muted" />}
                </button>

                {statusOpen && (
                  <div className="space-y-2.5 mt-3 text-xs">
                    {/* All */}
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedStatus === 'all'}
                          onChange={() => setSelectedStatus('all')}
                          className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest accent-[#155137]"
                        />
                        <span className="text-charcoal font-medium group-hover:text-forest">All</span>
                      </div>
                      <span className="text-charcoal-muted font-mono text-[11px] bg-black/5 px-2 py-0.5 rounded-full">
                        42
                      </span>
                    </label>

                    {/* Lost */}
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedStatus === 'lost'}
                          onChange={() => setSelectedStatus(selectedStatus === 'lost' ? 'all' : 'lost')}
                          className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest accent-[#155137]"
                        />
                        <span className="bg-[#FCE8E6] text-[#C5221F] font-semibold text-xs px-2 py-0.5 rounded">
                          Lost
                        </span>
                      </div>
                      <span className="text-charcoal-muted font-mono text-[11px] bg-black/5 px-2 py-0.5 rounded-full">
                        24
                      </span>
                    </label>

                    {/* Found */}
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedStatus === 'found'}
                          onChange={() => setSelectedStatus(selectedStatus === 'found' ? 'all' : 'found')}
                          className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest accent-[#155137]"
                        />
                        <span className="bg-[#EAF5EE] text-[#137333] font-semibold text-xs px-2 py-0.5 rounded">
                          Found
                        </span>
                      </div>
                      <span className="text-charcoal-muted font-mono text-[11px] bg-black/5 px-2 py-0.5 rounded-full">
                        18
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Filter 3: Date */}
              <div className="border-t border-black/10 pt-4">
                <button
                  onClick={() => setDateOpen(!dateOpen)}
                  className="w-full flex items-center justify-between font-bold text-sm text-charcoal mb-2"
                >
                  <span>Date</span>
                  {dateOpen ? <ChevronUp className="w-4 h-4 text-charcoal-muted" /> : <ChevronDown className="w-4 h-4 text-charcoal-muted" />}
                </button>

                {dateOpen && (
                  <div className="space-y-2 mt-3 text-xs">
                    {[
                      { id: 'all', label: 'All Time' },
                      { id: '7days', label: 'Last 7 Days' },
                      { id: '30days', label: 'Last 30 Days' },
                      { id: 'custom', label: 'Custom Range', hasIcon: true },
                    ].map(d => (
                      <label
                        key={d.id}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="dateFilter"
                            checked={dateRange === d.id}
                            onChange={() => setDateRange(d.id as any)}
                            className="w-4 h-4 text-forest focus:ring-forest accent-[#155137]"
                          />
                          <span className="text-charcoal font-medium group-hover:text-forest">
                            {d.label}
                          </span>
                        </div>
                        {d.hasIcon && <CalendarIcon className="w-3.5 h-3.5 text-charcoal-muted" />}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 4: Location */}
              <div className="border-t border-black/10 pt-4">
                <button
                  onClick={() => setLocationOpen(!locationOpen)}
                  className="w-full flex items-center justify-between font-bold text-sm text-charcoal mb-2"
                >
                  <span>Location</span>
                  {locationOpen ? <ChevronUp className="w-4 h-4 text-charcoal-muted" /> : <ChevronDown className="w-4 h-4 text-charcoal-muted" />}
                </button>

                {locationOpen && (
                  <div className="relative mt-3">
                    <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full appearance-none pl-8 pr-8 py-2 bg-white border border-black/10 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-forest cursor-pointer"
                    >
                      <option value="all">All Locations</option>
                      <option value="Academic Block">Academic Block</option>
                      <option value="Central Library">Central Library</option>
                      <option value="Seminar Hall">Seminar Halls</option>
                      <option value="Main Gate">Main Gate</option>
                      <option value="Sports Complex">Sports Complex</option>
                      <option value="Cafeteria">Cafeteria</option>
                      <option value="Computer Lab">Computer Labs</option>
                      <option value="Hostel Block A">Hostel Block A</option>
                      <option value="Admin Block">Admin Block</option>
                      <option value="Indoor Stadium">Indoor Stadium</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
                  </div>
                )}
              </div>

            </div>
          )}
        </aside>

        {/* ================= RIGHT MAIN CONTENT ================= */}
        <div className="lg:col-span-9 space-y-6">

          {/* Header Banner matching 7) lost and found.jpeg */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold tracking-widest text-[#155137] uppercase">
                  CAMPUS LOST &amp; FOUND •
                </span>
                <span className="w-12 h-0.5 bg-[#3D775F]/30 rounded-full" />
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-black text-charcoal tracking-tight">
                Lost something? <span className="text-[#3D775F]">Found</span> something?
              </h2>
              <p className="text-sm text-charcoal-muted mt-1">
                Help reunite items with their owners and keep our campus community connected.
              </p>
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#155137] hover:bg-[#103E2A] text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Report Lost/Found Item</span>
            </button>
          </div>

          {/* Subnav 1: BROWSE ITEMS */}
          {activeSubnav === 'browse' && (
            <div className="space-y-6">
              
              {/* Search & Sort Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for items (e.g. laptop, ID card, keys, bag...)"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm placeholder:text-charcoal-muted/70 focus:outline-none focus:border-forest shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-muted hover:text-charcoal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="relative shrink-0 w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 bg-white border border-black/10 rounded-xl text-sm font-medium text-charcoal focus:outline-none focus:border-forest shadow-2xs cursor-pointer"
                  >
                    <option value="latest">Latest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted pointer-events-none" />
                </div>
              </div>

              {/* 4-Column Card Grid (Matching 7) lost and found.jpeg) */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-black/5 overflow-hidden animate-pulse h-72" />
                  ))}
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-black/5 space-y-3">
                  <AlertCircle className="w-12 h-12 text-charcoal-muted/50 mx-auto" />
                  <h3 className="font-bold text-lg text-charcoal">No items match your filters</h3>
                  <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                    Try adjusting your item type, location, or search keywords.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredItems.map(item => {
                    const isFav = bookmarked.has(item.id);
                    const photo = item.photo_urls && item.photo_urls[0] 
                      ? item.photo_urls[0] 
                      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

                    return (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedItem(item); setClaimSubmitted(false); }}
                        className="group bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs hover:shadow-md hover:border-black/10 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        {/* Image Header with Badge and Heart */}
                        <div>
                          <div className="relative aspect-4/3 w-full bg-[#EAE8E3] overflow-hidden">
                            <img
                              src={photo}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                            />

                            {/* Badge */}
                            <div className="absolute top-2.5 left-2.5">
                              {item.report_type === 'lost' ? (
                                <span className="bg-[#FCE8E6] text-[#C5221F] text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-2xs">
                                  Lost
                                </span>
                              ) : (
                                <span className="bg-[#EAF5EE] text-[#137333] text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-2xs">
                                  Found
                                </span>
                              )}
                            </div>

                            {/* Wishlist / Bookmark */}
                            <button
                              onClick={(e) => toggleBookmark(item.id, e)}
                              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-charcoal shadow-2xs transition-colors"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : 'text-charcoal'}`} />
                            </button>
                          </div>

                          {/* Body Content */}
                          <div className="p-3.5 space-y-2">
                            <h3 className="font-bold text-sm text-charcoal line-clamp-1 group-hover:text-forest transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-xs text-charcoal-muted line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Footer Meta Rows & Action Arrow */}
                        <div className="px-3.5 pb-3.5 pt-2 border-t border-black/5 flex items-end justify-between gap-2">
                          <div className="space-y-1 text-[11px] text-charcoal-muted truncate">
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0 text-charcoal-muted/70" />
                              <span className="truncate">{item.location_text}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3 h-3 shrink-0 text-charcoal-muted/70" />
                              <span>{formatDate(item.incident_date)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-charcoal-muted/80">
                              <User className="w-3 h-3 shrink-0 text-charcoal-muted/70" />
                              <span>Posted by Student</span>
                            </div>
                          </div>

                          {/* Arrow button */}
                          <div className="w-7 h-7 rounded-full border border-black/10 flex items-center justify-center group-hover:bg-[#155137] group-hover:text-white group-hover:border-[#155137] transition-all shrink-0">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* Subnav 2: MY REPORTS */}
          {activeSubnav === 'reports' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-xl text-charcoal">
                  My Reported Items
                </h3>
                <p className="text-xs text-charcoal-muted mt-1">
                  Track the status of items you have reported lost or found.
                </p>
              </div>

              <div className="space-y-3">
                {items.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-black/5 flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.photo_urls[0]}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-charcoal">{item.title}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            item.report_type === 'lost' ? 'bg-[#FCE8E6] text-[#C5221F]' : 'bg-[#EAF5EE] text-[#137333]'
                          }`}>
                            {item.report_type.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-charcoal-muted mt-0.5">{item.location_text} • {formatDate(item.incident_date)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#137333] bg-[#EAF5EE] px-2.5 py-1 rounded-md">
                        Active Case
                      </span>
                      <button
                        onClick={() => alert(`Marked ${item.title} as reunited!`)}
                        className="px-3 py-1.5 rounded-lg border border-black/15 text-xs font-semibold text-charcoal hover:bg-black/5 transition-colors"
                      >
                        Mark Reunited
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ================= MODAL: ITEM DETAIL / CLAIM DRAWER ================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase ${
                    selectedItem.report_type === 'lost' ? 'bg-[#FCE8E6] text-[#C5221F]' : 'bg-[#EAF5EE] text-[#137333]'
                  }`}>
                    {selectedItem.report_type} Item
                  </span>
                  <span className="text-xs text-charcoal-muted capitalize">
                    {selectedItem.item_type.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-xl text-charcoal">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo preview */}
            <div className="aspect-16/9 w-full bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
              <img
                src={selectedItem.photo_urls[0]}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Meta tags */}
            <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] p-3.5 rounded-2xl border border-black/5 text-xs">
              <div className="flex items-center gap-2 text-charcoal">
                <MapPin className="w-4 h-4 text-forest shrink-0" />
                <span className="truncate">{selectedItem.location_text}</span>
              </div>
              <div className="flex items-center gap-2 text-charcoal">
                <CalendarIcon className="w-4 h-4 text-forest shrink-0" />
                <span>{formatDate(selectedItem.incident_date)}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-charcoal block">Description</span>
              <p className="text-charcoal-muted leading-relaxed text-sm">
                {selectedItem.description}
              </p>
            </div>

            {/* Privacy notice banner */}
            <div className="bg-[#EBF5F0] border border-[#155137]/15 rounded-xl p-3 flex items-start gap-2.5 text-xs text-[#155137]">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Campus Privacy Shield: Personal phone numbers remain protected until you verify ownership details below.
              </span>
            </div>

            {/* Claim / Handover Form */}
            {claimSubmitted ? (
              <div className="bg-[#E6F4EA] border border-[#34A853]/20 rounded-xl p-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-[#137333]">
                  <Check className="w-4 h-4" />
                  <span>Claim Notification Sent!</span>
                </div>
                <p className="text-xs text-[#137333]/80">
                  The reporter has received your verification request. Check your SMS or email for handover confirmation.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Ownership Verification Proof *
                  </label>
                  <textarea
                    rows={2}
                    value={claimProof}
                    onChange={(e) => setClaimProof(e.target.value)}
                    placeholder="Describe unique details (e.g. scratches, internal contents, lock screen photo, or brand markings)..."
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest resize-none"
                  />
                </div>

                <button
                  onClick={() => setClaimSubmitted(true)}
                  disabled={!claimProof.trim()}
                  className="w-full py-3 rounded-xl bg-[#155137] hover:bg-[#103E2A] disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  {selectedItem.report_type === 'found' ? 'Claim This Item (I am the owner)' : 'I Found This Item (Coordinate Return)'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= MODAL: REPORT ITEM ================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl text-charcoal">
                  Report an Item
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Submit a ticket to reunite lost belongings on campus.
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-charcoal-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggle: Lost vs Found */}
            <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-black/5">
              <button
                type="button"
                onClick={() => setReportType('lost')}
                className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                  reportType === 'lost'
                    ? 'bg-[#FCE8E6] text-[#C5221F] shadow-2xs'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                I Lost an Item
              </button>
              <button
                type="button"
                onClick={() => setReportType('found')}
                className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                  reportType === 'found'
                    ? 'bg-[#EAF5EE] text-[#137333] shadow-2xs'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                I Found an Item
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Item Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Hydro Flask Water Bottle"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-sm focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Category *
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
                  >
                    <option value="id_cards">ID Cards</option>
                    <option value="electronics">Electronics</option>
                    <option value="books">Books &amp; Notes</option>
                    <option value="clothing">Clothing &amp; Accessories</option>
                    <option value="keys_cards">Keys &amp; Cards</option>
                    <option value="bags_wallets">Bags &amp; Wallets</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Incident Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Campus Location *
                </label>
                <select
                  value={reportLocation}
                  onChange={(e) => setReportLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs font-medium text-charcoal focus:outline-none focus:border-forest"
                >
                  <option value="Academic Block">Academic Block</option>
                  <option value="Central Library">Central Library</option>
                  <option value="Seminar Hall 2">Seminar Hall 2</option>
                  <option value="Main Gate">Main Gate</option>
                  <option value="Sports Complex">Sports Complex</option>
                  <option value="Cafeteria">Cafeteria</option>
                  <option value="Computer Lab 1">Computer Lab 1</option>
                  <option value="Hostel Block A">Hostel Block A</option>
                  <option value="Admin Block">Admin Block</option>
                  <option value="Indoor Stadium">Indoor Stadium</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={reportPhotoUrl}
                  onChange={(e) => setReportPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Mention distinctive features, color, exact room, or time..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={hideContact}
                  onChange={() => setHideContact(!hideContact)}
                  className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest accent-[#155137]"
                />
                <span className="text-xs text-charcoal-muted">
                  Keep my contact phone number private until claim verification.
                </span>
              </label>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 font-semibold text-xs text-charcoal hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#155137] hover:bg-[#103E2A] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
