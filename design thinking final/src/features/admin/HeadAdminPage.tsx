import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Wrench, 
  Search, 
  RefreshCw, 
  Building2, 
  Sparkles, 
  Award, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Check, 
  ChevronRight, 
  Layers 
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  assigned_department?: string;
  assigned_club?: string;
  avatar_url?: string;
  created_at?: string;
}

export const HeadAdminPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Primary Filter: 'all' | 'students' | 'faculty' | 'admins'
  const [primaryTab, setPrimaryTab] = useState<'all' | 'students' | 'faculty' | 'admins'>('all');
  
  // Admin Sub-Filter: 'all_admins' | 'club_admin' | 'department_admin' | 'maintenance_staff' | 'security_admin' | 'head_admin'
  const [adminSubFilter, setAdminSubFilter] = useState<string>('all_admins');

  // Department filter
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch profiles from Supabase
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
      } else if (data) {
        setProfiles(data as Profile[]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Update role live in Supabase
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (!error) {
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
        setNotification(`Role updated to ${newRole.replace('_', ' ')} successfully!`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        console.error('Failed to update role:', error);
      }
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      // Primary category filter
      if (primaryTab === 'students' && p.role !== 'student') return false;
      if (primaryTab === 'faculty' && p.role !== 'faculty') return false;
      if (primaryTab === 'admins') {
        const adminRoles = ['head_admin', 'super_admin', 'department_admin', 'club_admin', 'maintenance_staff', 'security_admin', 'staff_admin'];
        if (!adminRoles.includes(p.role)) return false;

        // Sub-filter inside Admins
        if (adminSubFilter !== 'all_admins') {
          if (adminSubFilter === 'club_admin' && p.role !== 'club_admin') return false;
          if (adminSubFilter === 'department_admin' && p.role !== 'department_admin') return false;
          if (adminSubFilter === 'maintenance_staff' && p.role !== 'maintenance_staff') return false;
          if (adminSubFilter === 'security_admin' && p.role !== 'security_admin') return false;
          if (adminSubFilter === 'head_admin' && !['head_admin', 'super_admin'].includes(p.role)) return false;
        }
      }

      // Department filter
      if (departmentFilter !== 'all') {
        if (!p.assigned_department || !p.assigned_department.toLowerCase().includes(departmentFilter.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.full_name.toLowerCase().includes(q);
        const matchEmail = (p.email || '').toLowerCase().includes(q);
        const matchDept = (p.assigned_department || '').toLowerCase().includes(q);
        const matchClub = (p.assigned_club || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept && !matchClub) return false;
      }

      return true;
    });
  }, [profiles, primaryTab, adminSubFilter, departmentFilter, searchQuery]);

  // Counts
  const totalCount = profiles.length;
  const studentCount = profiles.filter(p => p.role === 'student').length;
  const facultyCount = profiles.filter(p => p.role === 'faculty').length;
  const deptAdminCount = profiles.filter(p => p.role === 'department_admin').length;
  const clubAdminCount = profiles.filter(p => p.role === 'club_admin').length;
  const maintenanceCount = profiles.filter(p => p.role === 'maintenance_staff').length;
  const securityCount = profiles.filter(p => p.role === 'security_admin').length;
  const headAdminCount = profiles.filter(p => ['head_admin', 'super_admin'].includes(p.role)).length;
  const totalAdminsCount = deptAdminCount + clubAdminCount + maintenanceCount + securityCount + headAdminCount;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#155137] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-widest text-[#155137] uppercase">
              JAINSPACE HEAD ADMIN •
            </span>
            <span className="w-12 h-0.5 bg-[#3D775F]/30 rounded-full" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-black text-charcoal tracking-tight uppercase">
            User Directory &amp; Role Governance
          </h1>
          <p className="text-sm text-charcoal-muted mt-1 max-w-2xl">
            Complete administration console to inspect user populations, filter across faculties, students, and granular admin tiers (Club Admins, Department Admins, Maintenance, Security, and Head Admins).
          </p>
        </div>

        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-charcoal shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-forest' : ''}`} />
          <span>Refresh Live Users</span>
        </button>
      </div>

      {/* 6 Metric Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Users */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-charcoal" />
          </div>
          <div className="font-display text-3xl font-black text-charcoal">
            {totalCount}
          </div>
          <div className="text-[10px] text-charcoal-muted">All registered accounts</div>
        </div>

        {/* Students */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[#155137]">
            <span className="text-[10px] font-bold uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="font-display text-3xl font-black text-[#155137]">
            {studentCount}
          </div>
          <div className="text-[10px] text-[#155137]/80">Active students</div>
        </div>

        {/* Faculty */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-teal-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Faculty</span>
            <Building2 className="w-4 h-4" />
          </div>
          <div className="font-display text-3xl font-black text-teal-700">
            {facultyCount}
          </div>
          <div className="text-[10px] text-teal-700/80">Teaching professors</div>
        </div>

        {/* Department Admins */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dept Admins</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="font-display text-3xl font-black text-amber-700">
            {deptAdminCount}
          </div>
          <div className="text-[10px] text-amber-700/80">CSE &amp; AI/ML leads</div>
        </div>

        {/* Club Admins */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Club Admins</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="font-display text-3xl font-black text-indigo-700">
            {clubAdminCount}
          </div>
          <div className="text-[10px] text-indigo-700/80">Tech, Cultural, Sports</div>
        </div>

        {/* Head Admins */}
        <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[10px] font-bold uppercase tracking-wider">Head Admins</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="font-display text-3xl font-black text-purple-700">
            {headAdminCount}
          </div>
          <div className="text-[10px] text-purple-700/80">Executive governance</div>
        </div>

      </div>

      {/* Primary Category Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-2xs space-y-4">
        
        {/* Main Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Accounts', count: totalCount },
              { id: 'students', label: 'Students', count: studentCount },
              { id: 'faculty', label: 'Faculties', count: facultyCount },
              { id: 'admins', label: 'Admins (Hierarchy)', count: totalAdminsCount },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setPrimaryTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  primaryTab === tab.id
                    ? 'bg-[#155137] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-charcoal hover:bg-black/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${primaryTab === tab.id ? 'bg-white/20' : 'bg-black/5'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Department Quick Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-charcoal-muted font-medium shrink-0">Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-black/10 text-charcoal text-xs font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:border-forest cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="AI & Machine Learning">AI &amp; Machine Learning</option>
              <option value="Electronics">Electronics &amp; Comm.</option>
              <option value="Robotics">Robotics</option>
              <option value="Office of the Dean">Dean / Academic Affairs</option>
              <option value="Maintenance">Estate &amp; Maintenance</option>
              <option value="Security">Security &amp; Lost-Found</option>
            </select>
          </div>
        </div>

        {/* Granular Sub-Filters for Admins (Shown only when 'Admins' is selected) */}
        {primaryTab === 'admins' && (
          <div className="pt-3 border-t border-black/5 flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
            <span className="text-[11px] font-bold text-charcoal-muted uppercase tracking-wider mr-1">
              Admin Sub-Roles:
            </span>

            {[
              { id: 'all_admins', label: 'All Admins', count: totalAdminsCount },
              { id: 'club_admin', label: 'Club Admins', count: clubAdminCount, icon: Award, color: 'text-indigo-700' },
              { id: 'department_admin', label: 'Department Admins', count: deptAdminCount, icon: Layers, color: 'text-amber-700' },
              { id: 'maintenance_staff', label: 'Maintenance Staff', count: maintenanceCount, icon: Wrench, color: 'text-blue-700' },
              { id: 'security_admin', label: 'Security & Helpdesk', count: securityCount, icon: ShieldAlert, color: 'text-cyan-700' },
              { id: 'head_admin', label: 'Head Admins', count: headAdminCount, icon: ShieldCheck, color: 'text-purple-700' },
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setAdminSubFilter(sub.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  adminSubFilter === sub.id
                    ? 'bg-charcoal text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-charcoal-muted hover:text-charcoal hover:bg-black/5'
                }`}
              >
                <span>{sub.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({sub.count})</span>
              </button>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative pt-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by full name, university email, department, or club affiliation..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-black/10 rounded-xl text-sm placeholder:text-charcoal-muted/70 focus:outline-none focus:border-forest"
          />
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAF8F5] text-[11px] font-bold text-charcoal uppercase tracking-wider">
                <th className="py-4 px-6">User Account</th>
                <th className="py-4 px-6">Email &amp; Contact</th>
                <th className="py-4 px-6">Department / Club Assignment</th>
                <th className="py-4 px-6">Role Classification</th>
                <th className="py-4 px-6 text-right">Governed Role Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-charcoal">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-charcoal-muted">
                    No accounts match the selected category or search filters.
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  const isUpdating = updatingId === p.id;
                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      
                      {/* Name + Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                            alt={p.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-black/10 bg-gray-100 shrink-0 shadow-2xs"
                          />
                          <div>
                            <div className="font-bold text-sm text-charcoal">
                              {p.full_name}
                            </div>
                            <div className="text-[10px] text-charcoal-muted font-mono">
                              ID: {p.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="flex items-center gap-1.5 text-charcoal">
                          <Mail className="w-3.5 h-3.5 text-charcoal-muted shrink-0" />
                          <span className="font-mono text-[11px]">{p.email}</span>
                        </div>
                        {p.phone && (
                          <div className="flex items-center gap-1.5 text-charcoal-muted text-[11px]">
                            <Phone className="w-3 h-3 text-charcoal-muted shrink-0" />
                            <span>{p.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Department & Club Assignment */}
                      <td className="py-4 px-6 space-y-1">
                        <div className="font-medium text-charcoal">
                          {p.assigned_department || 'General University'}
                        </div>
                        {p.assigned_club && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                            <Award className="w-3 h-3" />
                            <span>{p.assigned_club}</span>
                          </div>
                        )}
                      </td>

                      {/* Granular Role Badges */}
                      <td className="py-4 px-6">
                        {p.role === 'student' && (
                          <span className="inline-flex items-center gap-1.5 bg-[#EAF5EE] text-[#137333] px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Student</span>
                          </span>
                        )}
                        {p.role === 'faculty' && (
                          <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-teal-200">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Faculty Member</span>
                          </span>
                        )}
                        {p.role === 'club_admin' && (
                          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-indigo-200">
                            <Award className="w-3.5 h-3.5" />
                            <span>Club Admin</span>
                          </span>
                        )}
                        {p.role === 'department_admin' && (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-amber-200">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Department Admin</span>
                          </span>
                        )}
                        {p.role === 'maintenance_staff' && (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-blue-200">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Maintenance Admin</span>
                          </span>
                        )}
                        {p.role === 'security_admin' && (
                          <span className="inline-flex items-center gap-1.5 bg-cyan-50 text-cyan-800 px-2.5 py-1 rounded-full text-[11px] font-bold border border-cyan-200">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Security Admin</span>
                          </span>
                        )}
                        {(p.role === 'head_admin' || p.role === 'super_admin') && (
                          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-900 px-2.5 py-1 rounded-full text-[11px] font-bold border border-purple-300">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Head Admin (Super)</span>
                          </span>
                        )}
                      </td>

                      {/* Governed Role Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={p.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(p.id, e.target.value)}
                            className="bg-[#FAF8F5] border border-black/15 text-charcoal rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-forest cursor-pointer disabled:opacity-50"
                          >
                            <option value="student">Student</option>
                            <option value="faculty">Faculty</option>
                            <option value="club_admin">Club Admin</option>
                            <option value="department_admin">Department Admin</option>
                            <option value="maintenance_staff">Maintenance Staff</option>
                            <option value="security_admin">Security Admin</option>
                            <option value="head_admin">Head Admin (Super)</option>
                          </select>
                          {isUpdating && <RefreshCw className="w-3.5 h-3.5 animate-spin text-forest" />}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
