import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Wrench, 
  Search, 
  ChevronDown, 
  UserCheck, 
  Filter, 
  RefreshCw, 
  ArrowUpDown, 
  Check, 
  Mail, 
  Phone, 
  Building2 
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  assigned_department?: string;
  avatar_url?: string;
  created_at?: string;
}

export const HeadAdminPage: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  // Role promotion / change handler
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setUpdatingId(userId);
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (!error) {
        setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
      } else {
        console.error('Failed to update role:', error);
      }
    } catch (err) {
      console.error('Error updating role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (roleFilter !== 'all') {
        if (roleFilter === 'student' && p.role !== 'student') return false;
        if (roleFilter === 'staff' && !['maintenance_staff', 'staff_admin', 'club_editor', 'department_editor'].includes(p.role)) return false;
        if (roleFilter === 'faculty' && p.role !== 'faculty') return false;
        if (roleFilter === 'head_admin' && !['head_admin', 'super_admin'].includes(p.role)) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.full_name.toLowerCase().includes(q);
        const matchEmail = (p.email || '').toLowerCase().includes(q);
        const matchDept = (p.assigned_department || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchDept) return false;
      }

      return true;
    });
  }, [profiles, roleFilter, searchQuery]);

  // Metric counts
  const totalUsers = profiles.length;
  const studentCount = profiles.filter(p => p.role === 'student').length;
  const staffCount = profiles.filter(p => ['maintenance_staff', 'staff_admin', 'club_editor', 'department_editor'].includes(p.role)).length;
  const facultyCount = profiles.filter(p => p.role === 'faculty').length;
  const headAdminCount = profiles.filter(p => ['head_admin', 'super_admin'].includes(p.role)).length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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
            User Management &amp; System Overview
          </h1>
          <p className="text-sm text-charcoal-muted mt-1 max-w-2xl">
            Monitor campus user registrations, inspect role breakdowns, and manage administrative privileges across all student, faculty, and maintenance tiers.
          </p>
        </div>

        <button
          onClick={fetchProfiles}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-charcoal shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-forest' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-charcoal" />
          </div>
          <div className="font-display text-3xl font-black text-charcoal">
            {totalUsers}
          </div>
          <div className="text-[11px] text-charcoal-muted">
            Registered accounts on JainSpace
          </div>
        </div>

        {/* Normal Students */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Students</span>
            <GraduationCap className="w-4 h-4 text-[#155137]" />
          </div>
          <div className="font-display text-3xl font-black text-[#155137]">
            {studentCount}
          </div>
          <div className="text-[11px] text-[#155137]/80">
            Enrolled undergraduate students
          </div>
        </div>

        {/* Low-Power Staff Admins */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Staff Admins</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-display text-3xl font-black text-blue-700">
            {staffCount}
          </div>
          <div className="text-[11px] text-blue-600/80">
            Maintenance &amp; Helpdesk staff
          </div>
        </div>

        {/* Faculty */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Faculty</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="font-display text-3xl font-black text-teal-700">
            {facultyCount}
          </div>
          <div className="text-[11px] text-teal-600/80">
            Teaching professors &amp; mentors
          </div>
        </div>

        {/* Head Admins */}
        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-charcoal-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Head Admins</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-display text-3xl font-black text-purple-700">
            {headAdminCount}
          </div>
          <div className="text-[11px] text-purple-600/80">
            Super admin executive privileges
          </div>
        </div>

      </div>

      {/* User Search & Role Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, university email, or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm placeholder:text-charcoal-muted/70 focus:outline-none focus:border-forest shadow-2xs"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'student', label: 'Students' },
            { id: 'staff', label: 'Staff Admins' },
            { id: 'faculty', label: 'Faculty' },
            { id: 'head_admin', label: 'Head Admins' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                roleFilter === tab.id
                  ? 'bg-[#155137] text-white shadow-2xs'
                  : 'bg-white border border-black/10 text-charcoal hover:bg-black/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#FAF8F5] text-[11px] font-bold text-charcoal uppercase tracking-wider">
                <th className="py-4 px-6">User / Account</th>
                <th className="py-4 px-6">Contact &amp; Email</th>
                <th className="py-4 px-6">Department / Class</th>
                <th className="py-4 px-6">Current Role</th>
                <th className="py-4 px-6 text-right">Manage Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-xs text-charcoal">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-charcoal-muted">
                    No user accounts match the search or role filter.
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
                            className="w-10 h-10 rounded-full object-cover border border-black/10 bg-gray-100 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-sm text-charcoal">
                              {p.full_name}
                            </div>
                            <div className="text-[11px] text-charcoal-muted font-mono">
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

                      {/* Department */}
                      <td className="py-4 px-6 text-charcoal-muted">
                        <span className="font-medium text-charcoal">
                          {p.assigned_department || 'General University'}
                        </span>
                      </td>

                      {/* Current Role Badge */}
                      <td className="py-4 px-6">
                        {p.role === 'student' && (
                          <span className="inline-flex items-center gap-1.5 bg-[#EAF5EE] text-[#137333] px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <GraduationCap className="w-3.5 h-3.5" />
                            <span>Student</span>
                          </span>
                        )}
                        {(p.role === 'maintenance_staff' || p.role === 'staff_admin') && (
                          <span className="inline-flex items-center gap-1.5 bg-[#E8F0FE] text-[#1967D2] px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <Wrench className="w-3.5 h-3.5" />
                            <span>Staff Admin</span>
                          </span>
                        )}
                        {p.role === 'faculty' && (
                          <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Faculty</span>
                          </span>
                        )}
                        {(p.role === 'head_admin' || p.role === 'super_admin') && (
                          <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Head Admin</span>
                          </span>
                        )}
                      </td>

                      {/* Role Switcher Action */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={p.role}
                            disabled={isUpdating}
                            onChange={(e) => handleRoleChange(p.id, e.target.value)}
                            className="bg-[#FAF8F5] border border-black/15 text-charcoal rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-forest cursor-pointer disabled:opacity-50"
                          >
                            <option value="student">Student</option>
                            <option value="maintenance_staff">Staff Admin (Maintenance)</option>
                            <option value="staff_admin">Staff Admin (Helpdesk)</option>
                            <option value="faculty">Faculty</option>
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
