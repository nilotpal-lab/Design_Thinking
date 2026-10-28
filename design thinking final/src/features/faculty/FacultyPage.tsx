import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowRight, 
  RotateCcw, 
  X, 
  ChevronRight, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Briefcase,
  Building,
  Plus,
  Trash2,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FacultyMember } from '../../types/database';
import { UserSession } from '../../components/AuthModal';

interface FacultyPageProps {
  currentUser?: UserSession | null;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({ currentUser }) => {
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Administrative State
  const isHeadAdmin = currentUser?.role === 'head_admin';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formFacultyId, setFormFacultyId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('Assistant Professor');
  const [formDepartment, setFormDepartment] = useState('Computer Science & Engineering');
  const [formCabin, setFormCabin] = useState('');
  const [formSubjects, setFormSubjects] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc'>('name_asc');

  // Selected faculty member for right detail inspector
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);

  const loadFaculty = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('faculty').select('*').order('name', { ascending: true });
    if (!error && data) {
      setFaculty(data as FacultyMember[]);
      if (data.length > 0 && !selectedFacultyId) {
        setSelectedFacultyId(data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setFormFacultyId(null);
    setFormName('');
    setFormDesignation('Assistant Professor');
    setFormDepartment('Computer Science & Engineering');
    setFormCabin('');
    setFormSubjects('');
    setFormEmail('');
    setFormPhone('');
    setFormPhotoUrl('');
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (member: FacultyMember) => {
    setModalMode('edit');
    setFormFacultyId(member.id);
    setFormName(member.name);
    setFormDesignation(member.designation);
    setFormDepartment(member.department);
    setFormCabin(member.cabin_location);
    setFormSubjects((member.subjects || []).join(', '));
    setFormEmail(member.email || '');
    setFormPhone(member.phone || '');
    setFormPhotoUrl(member.photo_url || '');
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleSaveFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCabin.trim()) {
      setActionError('Name and Cabin Location are required.');
      return;
    }

    const subjectsArray = formSubjects
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      name: formName.trim(),
      designation: formDesignation,
      department: formDepartment,
      cabin_location: formCabin.trim(),
      subjects: subjectsArray.length > 0 ? subjectsArray : ['General Studies'],
      email: formEmail.trim() || null,
      phone: formPhone.trim() || null,
      photo_url: formPhotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    try {
      if (modalMode === 'create') {
        const { data, error } = await supabase.from('faculty').insert([payload]).select();
        if (error) throw error;
        setActionSuccess('Faculty member added successfully!');
        if (data && data[0]) {
          setFaculty(prev => [data[0] as FacultyMember, ...prev]);
          setSelectedFacultyId(data[0].id);
        }
      } else if (modalMode === 'edit' && formFacultyId) {
        const { error } = await supabase.from('faculty').update(payload).eq('id', formFacultyId);
        if (error) throw error;
        setActionSuccess('Faculty member updated successfully!');
        setFaculty(prev => prev.map(f => f.id === formFacultyId ? { ...f, ...payload } as FacultyMember : f));
      }
      setIsModalOpen(false);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      console.error('Faculty save error:', err);
      setActionError(err.message || 'Failed to save faculty record.');
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the University Faculty directory?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('faculty').delete().eq('id', id);
      if (error) throw error;
      setFaculty(prev => prev.filter(f => f.id !== id));
      if (selectedFacultyId === id) {
        setSelectedFacultyId(null);
      }
      setActionSuccess(`Faculty member ${name} removed from directory.`);
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      console.error('Faculty delete error:', err);
      setActionError(err.message || 'Failed to delete faculty record.');
    }
  };

  // Collect unique departments and subjects
  const departments = useMemo(() => {
    const set = new Set<string>();
    faculty.forEach((f) => {
      if (f.department) set.add(f.department);
    });
    return Array.from(set).sort();
  }, [faculty]);

  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    faculty.forEach((f) => {
      (f.subjects || []).forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [faculty]);

  const designationsList = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Guest Faculty',
    'Other'
  ];

  // Toggle designation
  const toggleDesignation = (desig: string) => {
    if (selectedDesignations.includes(desig)) {
      setSelectedDesignations(selectedDesignations.filter((d) => d !== desig));
    } else {
      setSelectedDesignations([...selectedDesignations, desig]);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('all');
    setSelectedDesignations([]);
    setSelectedSubject('all');
    setSortBy('name_asc');
  };

  // Filtered & Sorted Faculty
  const filteredFaculty = useMemo(() => {
    return faculty
      .filter((member) => {
        // Search query (name, department, cabin, or subjects)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = member.name.toLowerCase().includes(q);
          const matchDept = member.department.toLowerCase().includes(q);
          const matchCabin = member.cabin_location.toLowerCase().includes(q);
          const matchSubject = (member.subjects || []).some((s) => s.toLowerCase().includes(q));
          if (!matchName && !matchDept && !matchCabin && !matchSubject) return false;
        }

        // Department filter
        if (selectedDepartment !== 'all' && member.department !== selectedDepartment) {
          return false;
        }

        // Designation filter
        if (selectedDesignations.length > 0) {
          const match = selectedDesignations.some((d) => {
            if (d === 'Other') {
              return !['Professor', 'Associate Professor', 'Assistant Professor', 'Guest Faculty'].some((std) =>
                member.designation.includes(std)
              );
            }
            return member.designation.includes(d);
          });
          if (!match) return false;
        }

        // Subject filter
        if (selectedSubject !== 'all') {
          if (!(member.subjects || []).includes(selectedSubject)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [faculty, searchQuery, selectedDepartment, selectedDesignations, selectedSubject, sortBy]);

  const selectedFaculty = useMemo(() => {
    return faculty.find((f) => f.id === selectedFacultyId) || filteredFaculty[0] || faculty[0] || null;
  }, [faculty, selectedFacultyId, filteredFaculty]);

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header matching 4) Faculty.jpeg */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold tracking-widest uppercase text-charcoal-muted">
                CAMPUS FACULTY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#155137]"></span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-black uppercase tracking-tight text-charcoal leading-none">
              OUR <span className="text-[#3D775F]">FACULTY.</span>
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            {isHeadAdmin && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 bg-[#155137] hover:bg-[#0E3E2A] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Faculty Member</span>
              </button>
            )}
            <div className="text-right">
              <span className="text-xs font-bold tracking-widest text-charcoal-muted uppercase">
                LEARN. CONNECT. GROW.
              </span>
            </div>
          </div>
        </div>

        {/* Status notification toast */}
        {actionSuccess && (
          <div className="bg-[#EAF5EE] border border-[#137333]/20 text-[#137333] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess(null)} className="p-1 hover:bg-[#137333]/10 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {actionError && (
          <div className="bg-[#FCE8E6] border border-[#C5221F]/20 text-[#C5221F] px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="p-1 hover:bg-[#C5221F]/10 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search Bar matching screenshot */}
        <div className="flex items-center bg-card rounded-2xl border border-subtle-border p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#155137]/20 focus-within:border-[#155137] transition-all">
          <Search className="w-5 h-5 text-charcoal-muted ml-3 mr-3" />
          <input
            type="text"
            placeholder="Search by name, department, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-charcoal text-base placeholder:text-charcoal-muted/60 focus:outline-none py-1.5"
          />
          <button 
            className="w-11 h-11 rounded-xl bg-[#155137] hover:bg-[#0E3E2A] text-white flex items-center justify-center transition-colors shadow-sm ml-2 flex-shrink-0"
            aria-label="Search Faculty"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Column 1: Left Filter Sidebar (3 cols) */}
        <div className="lg:col-span-3 space-y-6 bg-card rounded-2xl border border-subtle-border p-5 shadow-sm">
          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full bg-canvas border border-subtle-border rounded-xl px-3 py-2 text-xs font-bold text-charcoal focus:outline-none focus:border-[#155137]"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <hr className="border-subtle-border" />

          {/* Designation Checkboxes */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Designation
            </label>
            <div className="space-y-2 text-xs">
              {designationsList.map((desig) => (
                <label key={desig} className="flex items-center space-x-2.5 cursor-pointer text-charcoal">
                  <input
                    type="checkbox"
                    checked={selectedDesignations.includes(desig)}
                    onChange={() => toggleDesignation(desig)}
                    className="w-4 h-4 rounded border-subtle-border text-[#155137] focus:ring-[#155137]"
                  />
                  <span>{desig}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="border-subtle-border" />

          {/* Subject Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-charcoal uppercase tracking-wider block">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-canvas border border-subtle-border rounded-xl px-3 py-2 text-xs font-bold text-charcoal focus:outline-none focus:border-[#155137]"
            >
              <option value="all">All Subjects</option>
              {allSubjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <hr className="border-subtle-border" />

          {/* Clear Filters */}
          <button
            onClick={handleClearFilters}
            className="w-full py-2.5 border border-subtle-border rounded-xl text-xs font-bold text-charcoal hover:bg-canvas flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-charcoal-muted" />
            <span>Clear Filters</span>
          </button>
        </div>

        {/* Column 2: Center Faculty Grid (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-bold uppercase tracking-wide text-charcoal">
              {filteredFaculty.length} FACULTY MEMBERS
            </span>
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-charcoal-muted">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-card border border-subtle-border rounded-lg px-2.5 py-1 font-semibold text-charcoal focus:outline-none focus:border-[#155137]"
              >
                <option value="name_asc">Name (A - Z)</option>
                <option value="name_desc">Name (Z - A)</option>
              </select>
            </div>
          </div>

          {/* Faculty Card Grid (3 Columns within center) */}
          {loading ? (
            <div className="bg-card rounded-2xl border border-subtle-border p-12 text-center text-charcoal-muted">
              Loading faculty directory...
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="bg-card rounded-2xl border border-subtle-border p-8 text-center space-y-3">
              <div className="text-sm font-bold text-charcoal">No faculty found</div>
              <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                No faculty members match your filter criteria. Try clearing filters or searching a different name.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-1.5 bg-[#155137] text-white text-xs font-bold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredFaculty.map((member) => {
                const isSelected = selectedFacultyId === member.id;
                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedFacultyId(member.id)}
                    className={`bg-card rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#155137] ring-1 ring-[#155137] shadow-md'
                        : 'border-subtle-border hover:border-charcoal-muted hover:shadow-sm'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Avatar Image */}
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto bg-canvas border border-subtle-border">
                        <img 
                          src={member.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'} 
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Name & Title */}
                      <div className="text-center space-y-0.5">
                        <h4 className="font-bold text-xs text-charcoal group-hover:text-[#155137] transition-colors line-clamp-1">
                          {member.name}
                        </h4>
                        <div className="text-[10px] text-charcoal-muted line-clamp-1">
                          {member.designation}
                        </div>
                        <div className="text-[10px] font-semibold text-charcoal/80 line-clamp-1">
                          {member.department}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Arrow Button */}
                    <div className="pt-2 flex justify-end">
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

        {/* Column 3: Right Faculty Bio Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4 sticky top-28 space-y-4">
          {selectedFaculty ? (
            <div className="bg-card rounded-2xl border border-subtle-border p-6 shadow-sm space-y-5">
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedFacultyId(null)}
                  className="w-7 h-7 rounded-full bg-canvas border border-subtle-border flex items-center justify-center text-charcoal-muted hover:text-charcoal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Large Centered Avatar */}
              <div className="text-center space-y-2">
                <div className="w-28 h-28 rounded-full overflow-hidden mx-auto bg-canvas border-2 border-subtle-border shadow-sm">
                  <img
                    src={selectedFaculty.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                    alt={selectedFaculty.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-display text-2xl font-black text-charcoal leading-tight">
                  {selectedFaculty.name}
                </h2>
                <div className="text-xs text-charcoal-muted font-medium">
                  {selectedFaculty.designation}
                </div>
                <div className="text-xs font-bold text-charcoal">
                  {selectedFaculty.department}
                </div>
              </div>

              <hr className="border-subtle-border" />

              {/* Cabin Location */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Cabin / Office Location
                </h4>
                <div className="flex items-center space-x-2 text-xs text-charcoal">
                  <MapPin className="w-4 h-4 text-[#155137] flex-shrink-0" />
                  <span>{selectedFaculty.cabin_location}</span>
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Subjects
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedFaculty.subjects || ['Core Theory', 'Research Lab']).map((sub) => (
                    <span
                      key={sub}
                      className="px-2.5 py-1 rounded-full bg-[#EBF5F0] text-[#155137] text-[11px] font-semibold"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>

              {/* Department Card */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  Department
                </h4>
                <div className="bg-canvas border border-subtle-border rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Building className="w-4 h-4 text-charcoal-muted" />
                    <span className="text-xs font-bold text-charcoal">
                      {selectedFaculty.department}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-charcoal-muted" />
                </div>
              </div>

              {/* Contact Information (if provided) */}
              {(selectedFaculty.email || selectedFaculty.phone) && (
                <div className="space-y-2 pt-2 border-t border-subtle-border text-xs text-charcoal-muted">
                  {selectedFaculty.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-charcoal-muted" />
                      <span className="truncate">{selectedFaculty.email}</span>
                    </div>
                  )}
                  {selectedFaculty.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-charcoal-muted" />
                      <span>{selectedFaculty.phone}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Head Admin Governance Action Controls */}
              {isHeadAdmin && (
                <div className="pt-3 border-t border-subtle-border space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Head Admin Clearance</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => openEditModal(selectedFaculty)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-canvas border border-subtle-border hover:border-charcoal-muted rounded-xl text-xs font-bold text-charcoal transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Info</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFaculty(selectedFaculty.id, selectedFaculty.name)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl text-xs font-bold text-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-subtle-border p-8 text-center text-xs text-charcoal-muted">
              Select a faculty member from the directory to view office location, subjects, and credentials.
            </div>
          )}
        </div>
      </div>

      {/* Head Admin Modal: Add / Edit Faculty */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold uppercase tracking-wider text-purple-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Executive Governance Console</span>
                </div>
                <h3 className="font-bold text-xl text-charcoal">
                  {modalMode === 'create' ? 'Onboard New Faculty' : 'Update Faculty Record'}
                </h3>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Changes update the live university directory immediately.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 text-charcoal-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="bg-[#FCE8E6] border border-[#C5221F]/20 text-[#C5221F] p-3 rounded-xl text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveFaculty} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Ramesh Rao"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Designation *
                  </label>
                  <select
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Guest Faculty">Guest Faculty</option>
                    <option value="Head of Department">Head of Department</option>
                    <option value="Dean">Dean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Cabin Location *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Block A, Cabin 304"
                    value={formCabin}
                    onChange={(e) => setFormCabin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & Engineering"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Subjects Taught (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Data Structures, Design Thinking, Algorithms"
                  value={formSubjects}
                  onChange={(e) => setFormSubjects(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="faculty@jainuniversity.ac.in"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Office Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formPhotoUrl}
                  onChange={(e) => setFormPhotoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-xs focus:outline-none focus:border-forest"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-black/15 font-bold text-xs text-charcoal hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#155137] hover:bg-[#0E3E2A] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  {modalMode === 'create' ? 'Save & Publish' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
