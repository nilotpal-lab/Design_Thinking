import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  ArrowRight, 
  MapPin, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  Upload, 
  Building2, 
  Wrench, 
  Wifi, 
  Trash2, 
  BookOpen, 
  Bed, 
  ShieldCheck, 
  Bus, 
  MoreHorizontal,
  ChevronRight,
  Filter,
  Download,
  RotateCcw,
  UserCheck,
  Search,
  Eye,
  Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CampusIssue } from '../../types/database';
import { UserSession } from '../../components/AuthModal';

interface IssuesPageProps {
  currentUser?: UserSession | null;
  onRequireAuth?: () => void;
}

export const IssuesPage: React.FC<IssuesPageProps> = ({ currentUser, onRequireAuth }) => {
  const isAdmin = currentUser?.role === 'staff_admin' || currentUser?.role === 'head_admin';

  // Mode switcher: Default to 'admin' for staff/head admins, strictly 'user' for students
  const [viewMode, setViewMode] = useState<'user' | 'admin'>(() => {
    return isAdmin ? 'admin' : 'user';
  });

  // Keep viewMode synced with user role
  useEffect(() => {
    if (isAdmin) {
      setViewMode('admin');
    } else {
      setViewMode('user');
    }
  }, [isAdmin]);

  // Issues data from Supabase
  const [issues, setIssues] = useState<CampusIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Normal User Filters
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'registered' | 'in_progress' | 'resolved'>('all');
  const [userSortOrder, setUserSortOrder] = useState<'latest' | 'oldest'>('latest');

  // Slide-in Report Drawer State
  const [showReportDrawer, setShowReportDrawer] = useState(false);
  const [newCategory, setNewCategory] = useState<string>('infrastructure');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Admin Workspace State
  const [adminNavTab, setAdminNavTab] = useState<'all' | 'new' | 'in_progress' | 'resolved' | 'assigned' | 'overdue'>('all');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [adminLocationFilter, setAdminLocationFilter] = useState('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Load issues from Supabase
  useEffect(() => {
    async function loadIssues() {
      setLoading(true);
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setIssues(data as CampusIssue[]);
        if (data.length > 0) {
          setSelectedIssueId(data[0].id);
        }
      }
      setLoading(false);
    }
    loadIssues();
  }, []);

  // Category Icons & Metadata
  const categoriesList = [
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
    { id: 'facilities', label: 'Facilities', icon: Wrench },
    { id: 'wifi', label: 'Wi-Fi & Network', icon: Wifi },
    { id: 'cleanliness', label: 'Cleanliness', icon: Trash2 },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'hostel', label: 'Hostel', icon: Bed },
    { id: 'safety', label: 'Safety & Security', icon: ShieldCheck },
    { id: 'transport', label: 'Transport', icon: Bus },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
  ];

  const locationsList = [
    'Hostel Road',
    'Central Lawn',
    'Seminar Hall 2',
    'Library',
    'Academic Block, 3rd Floor',
    'Computer Lab 1',
    'Hostel Block B',
    'Cafeteria',
    'Admin Block',
    'Main Gate',
    'Sports Complex',
  ];

  // Submit Issue Handler
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocation) return;

    setSubmitting(true);
    const newTicketNum = `#0${240 + issues.length + 1}`;
    const newIssue = {
      ticket_number: newTicketNum,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Reported via student portal.',
      category: newCategory,
      location_text: newLocation,
      status: 'registered',
      photo_urls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'],
    };

    const { data, error } = await supabase.from('issues').insert([newIssue]).select();

    if (!error && data) {
      setIssues([data[0] as CampusIssue, ...issues]);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowReportDrawer(false);
        setNewTitle('');
        setNewDescription('');
        setNewLocation('');
      }, 1200);
    }
    setSubmitting(false);
  };

  // Update Status in Admin Mode
  const handleUpdateStatus = async (issueId: string, nextStatus: 'registered' | 'in_progress' | 'resolved') => {
    const { error } = await supabase.from('issues').update({ status: nextStatus }).eq('id', issueId);
    if (!error) {
      setIssues(issues.map((it) => (it.id === issueId ? { ...it, status: nextStatus } : it)));
    }
  };

  // Filtered Issues for Normal User
  const userFilteredIssues = useMemo(() => {
    return issues.filter((it) => {
      if (userStatusFilter !== 'all' && it.status !== userStatusFilter) return false;
      return true;
    });
  }, [issues, userStatusFilter]);

  // Filtered Issues for Admin
  const adminFilteredIssues = useMemo(() => {
    return issues.filter((it) => {
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase();
        const matchTitle = it.title.toLowerCase().includes(q);
        const matchLoc = it.location_text.toLowerCase().includes(q);
        const matchId = it.ticket_number.toLowerCase().includes(q);
        if (!matchTitle && !matchLoc && !matchId) return false;
      }
      if (adminCategoryFilter !== 'all' && it.category !== adminCategoryFilter) return false;
      if (adminLocationFilter !== 'all' && it.location_text !== adminLocationFilter) return false;
      if (adminStatusFilter !== 'all' && it.status !== adminStatusFilter) return false;
      if (adminNavTab === 'new' && it.status !== 'registered') return false;
      if (adminNavTab === 'in_progress' && it.status !== 'in_progress') return false;
      if (adminNavTab === 'resolved' && it.status !== 'resolved') return false;
      return true;
    });
  }, [issues, adminSearch, adminCategoryFilter, adminLocationFilter, adminStatusFilter, adminNavTab]);

  const selectedIssue = useMemo(() => {
    return issues.find((it) => it.id === selectedIssueId) || issues[0] || null;
  }, [issues, selectedIssueId]);

  // Counts
  const counts = {
    total: issues.length,
    new: issues.filter((i) => i.status === 'registered').length,
    in_progress: issues.filter((i) => i.status === 'in_progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar Switcher: Strictly ONLY visible to authorized Maintenance & Head Admins */}
      {isAdmin && (
        <div className="flex items-center justify-between border-b border-subtle-border pb-3 animate-in fade-in duration-150">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#155137]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
              MAINTENANCE MANAGEMENT ({currentUser?.role === 'head_admin' ? 'Head Admin Mode' : 'Staff Admin Mode'})
            </span>
          </div>

          <div className="flex items-center bg-card border border-subtle-border rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'admin'
                  ? 'bg-[#155137] text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Operations Dashboard
            </button>
            <button
              onClick={() => setViewMode('user')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'user'
                  ? 'bg-[#155137] text-white shadow-sm'
                  : 'text-charcoal-muted hover:text-charcoal'
              }`}
            >
              Report View Preview
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 1: NORMAL USER (5) Issues - Normal User.jpeg)
          ======================================================== */}
      {viewMode === 'user' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left Column: Header, CTA Banner, My Issues List (7 or 8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-charcoal/70">
                  CAMPUS ISSUES
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#155137]"></span>
              </div>
              <h1 className="font-display text-5xl font-black uppercase tracking-tight text-charcoal leading-[0.9]">
                Report<br />
                <span className="text-[#3D775F]">an Issue.</span>
              </h1>
              <div className="pt-1">
                <div className="text-[11px] font-bold tracking-wider text-charcoal/80 uppercase">
                  CLEANER. SAFER. BETTER CAMPUS.
                </div>
                <p className="text-xs text-charcoal-muted">
                  Help us keep our campus clean, safe and functional for everyone.
                </p>
              </div>
            </div>

            {/* Big Green CTA Banner matching screenshot */}
            <div
              onClick={() => setShowReportDrawer(true)}
              className="bg-[#155137] hover:bg-[#0E3E2A] text-white rounded-2xl p-5 flex items-center justify-between cursor-pointer shadow-md transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white group-hover:scale-110 transition-transform flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">
                    Report an Issue
                  </h3>
                  <div className="text-xs text-white/80">
                    Broken benches, Wi-Fi, lights, equipment and more.
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white flex-shrink-0" />
            </div>

            {/* My Issues Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xl font-bold uppercase text-charcoal">
                  My Issues
                </h3>
                <select
                  value={userSortOrder}
                  onChange={(e) => setUserSortOrder(e.target.value as any)}
                  className="bg-card border border-subtle-border rounded-lg px-2.5 py-1 text-xs font-semibold text-charcoal focus:outline-none"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>

              {/* Status Filter Pills */}
              <div className="flex space-x-2 text-xs">
                {[
                  { id: 'all', label: `All (${issues.length})` },
                  { id: 'registered', label: `Registered (${counts.new})` },
                  { id: 'in_progress', label: `In Progress (${counts.in_progress})` },
                  { id: 'resolved', label: `Resolved (${counts.resolved})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setUserStatusFilter(pill.id as any)}
                    className={`py-1.5 px-3 rounded-xl font-bold transition-all ${
                      userStatusFilter === pill.id
                        ? 'bg-[#155137] text-white shadow-2xs'
                        : 'bg-card border border-subtle-border text-charcoal hover:bg-canvas'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* User Issues List */}
              <div className="space-y-3">
                {userFilteredIssues.map((issue) => {
                  const statusColors = {
                    registered: 'bg-[#E3F2FD] text-[#1565C0]',
                    in_progress: 'bg-[#FFF3E0] text-[#B76E00]',
                    resolved: 'bg-[#E8F5E9] text-[#1B5E20]',
                  };

                  return (
                    <div
                      key={issue.id}
                      className="bg-card rounded-2xl p-4 border border-subtle-border hover:border-charcoal-muted hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3.5 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-canvas border border-subtle-border flex-shrink-0">
                          <img
                            src={issue.photo_urls[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'}
                            alt={issue.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Title and details */}
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-sm text-charcoal truncate">
                            {issue.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-charcoal-muted">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-[#155137]" />
                              <span>{issue.location_text}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <CalendarIcon className="w-3 h-3 text-charcoal-muted" />
                              <span>{new Date(issue.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </span>
                            <span>•</span>
                            <span className="capitalize font-semibold text-charcoal/80">{issue.category}</span>
                          </div>
                          <p className="text-xs text-charcoal-muted line-clamp-1">
                            {issue.description}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge & Arrow */}
                      <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${statusColors[issue.status]}`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <div className="w-7 h-7 rounded-full border border-subtle-border flex items-center justify-center text-charcoal hover:bg-[#155137] hover:text-white transition-colors">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: "Report an Issue" Slide-in Form Panel (5 cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-card rounded-2xl border border-subtle-border p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-subtle-border pb-3">
                <div>
                  <h3 className="font-bold text-lg text-charcoal">Report an Issue</h3>
                  <div className="text-xs text-charcoal-muted">Fill in the details below to raise a new issue.</div>
                </div>
                {showReportDrawer && (
                  <button
                    onClick={() => setShowReportDrawer(false)}
                    className="w-7 h-7 rounded-full bg-canvas border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {submitSuccess ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h4 className="font-bold text-sm text-charcoal">Issue Registered Successfully!</h4>
                  <p className="text-xs text-charcoal-muted">Campus maintenance team has received your ticket.</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  {/* Category 3x3 Grid */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-charcoal">Category *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {categoriesList.map((cat) => {
                        const IconComp = cat.icon;
                        const isSelected = newCategory === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setNewCategory(cat.id)}
                            className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? 'border-[#155137] bg-[#E8F5E9] text-[#155137] font-bold shadow-2xs'
                                : 'border-subtle-border bg-canvas/40 text-charcoal-muted hover:bg-canvas hover:text-charcoal'
                            }`}
                          >
                            <IconComp className="w-4 h-4 mb-1" />
                            <span className="text-[10px] leading-tight line-clamp-1">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-charcoal">Location *</label>
                    <select
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      required
                      className="w-full bg-canvas border border-subtle-border rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-[#155137]"
                    >
                      <option value="">Select location</option>
                      {locationsList.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-charcoal">Title *</label>
                    <input
                      type="text"
                      placeholder="Brief title of the issue"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      required
                      className="w-full bg-canvas border border-subtle-border rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-[#155137]"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <label className="font-bold text-charcoal">Description *</label>
                      <span className="text-[10px] text-charcoal-muted">{newDescription.length}/500</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={500}
                      placeholder="Describe the issue in detail..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      required
                      className="w-full bg-canvas border border-subtle-border rounded-xl p-2.5 text-xs text-charcoal focus:outline-none focus:border-[#155137] resize-none"
                    />
                  </div>

                  {/* Photo Upload Placeholder */}
                  <div className="border border-dashed border-subtle-border rounded-xl p-3 text-center bg-canvas/40 space-y-1 cursor-pointer hover:bg-canvas transition-colors">
                    <Upload className="w-4 h-4 text-charcoal-muted mx-auto" />
                    <div className="text-[11px] font-semibold text-charcoal">Click to upload or drag & drop</div>
                    <div className="text-[9px] text-charcoal-muted">PNG, JPG (Max 5 images)</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewTitle('');
                        setNewDescription('');
                        setNewLocation('');
                      }}
                      className="flex-1 py-2.5 border border-subtle-border rounded-xl text-xs font-bold text-charcoal hover:bg-canvas transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-2.5 bg-[#155137] hover:bg-[#0E3E2A] text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Issue'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODE 2: MAINTENANCE ADMIN (5) Issues - Admin User.jpeg)
          ======================================================== */}
      {viewMode === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Admin Sidebar (2 cols) */}
          <div className="lg:col-span-2 space-y-4 text-xs">
            <div className="border-b border-subtle-border pb-3">
              <div className="font-bold text-xs text-charcoal">Maintenance Admin</div>
              <div className="text-[10px] text-charcoal-muted">Campus Maintenance</div>
            </div>

            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Issues', count: counts.total },
                { id: 'new', label: 'New Issues', count: counts.new },
                { id: 'in_progress', label: 'In Progress', count: counts.in_progress },
                { id: 'resolved', label: 'Resolved', count: counts.resolved },
                { id: 'assigned', label: 'My Assigned', count: 4 },
                { id: 'overdue', label: 'Overdue', count: 3, alert: true },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAdminNavTab(item.id as any)}
                  className={`w-full py-1.5 px-2.5 rounded-xl font-semibold flex items-center justify-between transition-all ${
                    adminNavTab === item.id
                      ? 'bg-[#155137] text-white shadow-2xs'
                      : 'text-charcoal hover:bg-card'
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      adminNavTab === item.id
                        ? 'bg-white/20 text-white'
                        : item.alert
                        ? 'bg-red-100 text-red-700'
                        : 'bg-canvas text-charcoal-muted'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              ))}
            </div>

            <hr className="border-subtle-border" />

            <div className="space-y-1 text-charcoal-muted">
              <div className="px-2.5 py-1 hover:text-charcoal cursor-pointer">Reports</div>
              <div className="px-2.5 py-1 hover:text-charcoal cursor-pointer">Staff Management</div>
              <div className="px-2.5 py-1 hover:text-charcoal cursor-pointer">Settings</div>
            </div>
          </div>

          {/* Admin Main Table Area (6 or 7 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Header + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-black uppercase text-charcoal">
                  Campus Issues
                </h2>
                <div className="text-xs text-charcoal-muted">
                  Manage and resolve campus maintenance issues.
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 bg-[#155137] hover:bg-[#0E3E2A] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-2xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Issue</span>
                </button>
                <button className="px-3 py-1.5 bg-card border border-subtle-border text-charcoal rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-canvas transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-4 gap-2.5">
              <div className="bg-card border border-subtle-border rounded-xl p-3 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-canvas flex items-center justify-center text-charcoal">
                  <Building2 className="w-4 h-4 text-charcoal-muted" />
                </div>
                <div>
                  <div className="font-display font-black text-lg text-charcoal leading-none">{counts.total}</div>
                  <div className="text-[9px] text-charcoal-muted uppercase font-bold">Total</div>
                </div>
              </div>

              <div className="bg-card border border-subtle-border rounded-xl p-3 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-black text-lg text-amber-700 leading-none">{counts.new}</div>
                  <div className="text-[9px] text-charcoal-muted uppercase font-bold">New</div>
                </div>
              </div>

              <div className="bg-card border border-subtle-border rounded-xl p-3 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-black text-lg text-blue-700 leading-none">{counts.in_progress}</div>
                  <div className="text-[9px] text-charcoal-muted uppercase font-bold">In Progress</div>
                </div>
              </div>

              <div className="bg-card border border-subtle-border rounded-xl p-3 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display font-black text-lg text-emerald-700 leading-none">{counts.resolved}</div>
                  <div className="text-[9px] text-charcoal-muted uppercase font-bold">Resolved</div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[140px]">
                <Search className="w-3.5 h-3.5 text-charcoal-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search issues..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full bg-card border border-subtle-border rounded-xl pl-8 pr-2.5 py-1 text-xs text-charcoal focus:outline-none"
                />
              </div>

              <select
                value={adminCategoryFilter}
                onChange={(e) => setAdminCategoryFilter(e.target.value)}
                className="bg-card border border-subtle-border rounded-xl px-2.5 py-1 text-xs font-semibold text-charcoal"
              >
                <option value="all">All Categories</option>
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>

              <select
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value)}
                className="bg-card border border-subtle-border rounded-xl px-2.5 py-1 text-xs font-semibold text-charcoal"
              >
                <option value="all">All Status</option>
                <option value="registered">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-card border border-subtle-border rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-subtle-border text-charcoal font-bold">
                  <tr>
                    <th className="py-2 px-3">ID</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Location</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle-border">
                  {adminFilteredIssues.map((issue) => {
                    const isSelected = selectedIssueId === issue.id;
                    return (
                      <tr
                        key={issue.id}
                        onClick={() => setSelectedIssueId(issue.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-canvas font-semibold' : 'hover:bg-canvas/50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-charcoal">{issue.ticket_number}</td>
                        <td className="py-2.5 px-3 truncate max-w-[140px]">{issue.title}</td>
                        <td className="py-2.5 px-3 text-charcoal-muted truncate max-w-[100px]">{issue.location_text}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              issue.status === 'resolved'
                                ? 'bg-badge-green text-badge-green-text'
                                : issue.status === 'in_progress'
                                ? 'bg-[#FFF3E0] text-[#B76E00]'
                                : 'bg-[#E3F2FD] text-[#1565C0]'
                            }`}
                          >
                            {issue.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-charcoal-muted text-[10px]">
                          {new Date(issue.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Admin Right Side Detail Drawer (4 cols) */}
          <div className="lg:col-span-4 sticky top-24">
            {selectedIssue ? (
              <div className="bg-card rounded-2xl border border-subtle-border p-5 shadow-sm space-y-4 text-xs">
                {/* Header ID & Status */}
                <div className="flex items-center justify-between border-b border-subtle-border pb-3">
                  <span className="font-bold text-sm text-charcoal">{selectedIssue.ticket_number}</span>
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => handleUpdateStatus(selectedIssue.id, e.target.value as any)}
                    className="bg-canvas border border-subtle-border rounded-lg px-2.5 py-1 text-xs font-bold text-charcoal focus:outline-none"
                  >
                    <option value="registered">Registered</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                {/* Title & Category */}
                <div>
                  <h3 className="font-bold text-base text-charcoal">{selectedIssue.title}</h3>
                  <div className="text-[11px] text-charcoal-muted capitalize mt-0.5">
                    {selectedIssue.category} • {selectedIssue.location_text}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-charcoal-muted leading-relaxed">
                  {selectedIssue.description}
                </p>

                {/* Photos */}
                {selectedIssue.photo_urls && selectedIssue.photo_urls.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase text-charcoal">Photos</div>
                    <div className="flex space-x-2">
                      {selectedIssue.photo_urls.map((url, i) => (
                        <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-subtle-border">
                          <img src={url} alt="Issue photo" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-subtle-border" />

                {/* Timeline */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase text-charcoal">Activity Timeline</div>
                  <div className="space-y-2.5 border-l-2 border-subtle-border pl-3 ml-1.5 text-[11px]">
                    <div className="relative">
                      <div className="w-2 h-2 rounded-full bg-[#155137] absolute -left-[17px] top-1" />
                      <div className="font-bold text-charcoal">Issue Reported</div>
                      <div className="text-charcoal-muted text-[10px]">
                        {new Date(selectedIssue.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </div>
                    {selectedIssue.status !== 'registered' && (
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-blue-600 absolute -left-[17px] top-1" />
                        <div className="font-bold text-charcoal">Assigned to Maintenance Staff</div>
                        <div className="text-charcoal-muted text-[10px]">Work ticket created</div>
                      </div>
                    )}
                    {selectedIssue.status === 'resolved' && (
                      <div className="relative">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 absolute -left-[17px] top-1" />
                        <div className="font-bold text-emerald-700">Resolved & Closed</div>
                        <div className="text-charcoal-muted text-[10px]">Verified on campus</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2 border-t border-subtle-border">
                  <button
                    onClick={() => handleUpdateStatus(selectedIssue.id, selectedIssue.status === 'resolved' ? 'in_progress' : 'resolved')}
                    className="flex-1 py-2 bg-[#155137] hover:bg-[#0E3E2A] text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    {selectedIssue.status === 'resolved' ? 'Reopen Issue' : 'Mark Resolved'}
                  </button>
                  <button className="px-3 py-2 border border-subtle-border text-charcoal rounded-xl font-bold text-xs hover:bg-canvas">
                    Reassign
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
