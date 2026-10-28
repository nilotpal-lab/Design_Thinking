import React from 'react';
import { Shield, Wrench, ShieldCheck, LogOut, X, GraduationCap, CheckCircle2 } from 'lucide-react';
import { UserSession } from './AuthModal';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onSignOut: () => void;
  onNavigate: (tab: string) => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onNavigate,
}) => {
  if (!isOpen || !currentUser) return null;

  return (
    <div className="absolute right-0 top-14 w-80 bg-white rounded-3xl shadow-2xl border border-black/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      
      {/* Profile Header */}
      <div className="p-5 bg-[#FAF8F5] border-b border-black/10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-12 h-12 rounded-2xl object-cover border border-black/10 shrink-0 shadow-2xs"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-charcoal truncate">{currentUser.name}</h4>
            <span className="text-[11px] text-charcoal-muted truncate block font-mono">{currentUser.email}</span>
            <span className="text-[10px] text-forest font-semibold truncate block mt-0.5">{currentUser.department}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Verified Role Clearance Card */}
      <div className="p-4 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
          Verified Access Clearance
        </span>

        <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {currentUser.role === 'student' && (
              <div className="w-8 h-8 rounded-xl bg-[#EAF5EE] text-[#137333] flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            )}
            {currentUser.role === 'staff_admin' && (
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            )}
            {currentUser.role === 'head_admin' && (
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="font-bold text-xs text-charcoal capitalize">
                {currentUser.role === 'head_admin' ? 'Head Administrator' : currentUser.role === 'staff_admin' ? 'Staff Maintenance Admin' : 'Enrolled Student'}
              </div>
              <div className="text-[10px] text-charcoal-muted">
                {currentUser.role === 'head_admin' ? 'Executive Governance Access' : currentUser.role === 'staff_admin' ? 'Facilities & Work Order Access' : 'Standard Student Privileges'}
              </div>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0" />
        </div>
      </div>

      {/* Head Admin Specific Action Banner */}
      {currentUser.role === 'head_admin' && (
        <div className="px-4 pb-2">
          <button
            onClick={() => {
              onNavigate('admin');
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Head Admin Console</span>
            </div>
            <span className="text-[10px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-mono">
              All Users
            </span>
          </button>
        </div>
      )}

      {/* Quick Nav shortcuts */}
      <div className="px-4 py-2 space-y-0.5 border-t border-black/5 text-xs font-medium">
        <button
          onClick={() => { onNavigate('issues'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left cursor-pointer"
        >
          <span>Campus Issues &amp; Maintenance</span>
          <span className="text-charcoal-muted font-mono text-[10px]">
            {currentUser.role === 'student' ? 'My Tickets' : 'Operations'}
          </span>
        </button>

        <button
          onClick={() => { onNavigate('marketplace'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left cursor-pointer"
        >
          <span>Marketplace</span>
          <span className="text-charcoal-muted font-mono text-[10px]">Listings</span>
        </button>

        <button
          onClick={() => { onNavigate('lostfound'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left cursor-pointer"
        >
          <span>Lost &amp; Found</span>
          <span className="text-charcoal-muted font-mono text-[10px]">Claims</span>
        </button>
      </div>

      {/* Sign Out Button */}
      <div className="p-3 bg-[#FAF8F5] border-t border-black/5">
        <button
          onClick={() => {
            onSignOut();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
};
