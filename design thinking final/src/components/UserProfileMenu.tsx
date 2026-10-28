import React from 'react';
import { User, Shield, Wrench, ExternalLink, LogOut, X, Sparkles } from 'lucide-react';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
  setUserRole: (role: string) => void;
  onNavigate: (tab: string) => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  isOpen,
  onClose,
  userName,
  userRole,
  setUserRole,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-14 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl border border-black/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Profile Header */}
      <div className="p-5 bg-[#FAF8F5] border-b border-black/10 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#155137] text-white font-black text-lg flex items-center justify-center shadow-sm">
            {userName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-charcoal">{userName}</h4>
            <span className="text-[11px] text-charcoal-muted block">Student ID: 26JAIN-CS-084</span>
            <span className="text-[10px] text-forest font-semibold">Semester 3 • Computer Science</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role Switcher */}
      <div className="p-4 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted block">
          Current Role &amp; Perspective
        </span>

        <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-1.5 rounded-2xl border border-black/5">
          <button
            onClick={() => {
              setUserRole('Student');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              userRole === 'Student'
                ? 'bg-white text-[#155137] shadow-2xs border border-black/5'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            onClick={() => {
              setUserRole('Admin');
              onNavigate('issues');
              onClose();
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              userRole === 'Admin'
                ? 'bg-[#155137] text-white shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Quick Nav shortcuts */}
      <div className="px-4 py-2 space-y-1 border-t border-black/5 text-xs font-medium">
        <button
          onClick={() => { onNavigate('issues'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left"
        >
          <span>My Reported Issues</span>
          <span className="text-charcoal-muted font-mono text-[11px]">3 tickets</span>
        </button>

        <button
          onClick={() => { onNavigate('marketplace'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left"
        >
          <span>My Marketplace Listings</span>
          <span className="text-charcoal-muted font-mono text-[11px]">4 items</span>
        </button>

        <button
          onClick={() => { onNavigate('lostfound'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left"
        >
          <span>My Lost &amp; Found Reports</span>
          <span className="text-charcoal-muted font-mono text-[11px]">2 items</span>
        </button>
      </div>
    </div>
  );
};
