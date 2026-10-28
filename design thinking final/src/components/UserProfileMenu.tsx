import React from 'react';
import { User, Shield, Wrench, ShieldCheck, LogOut, X, GraduationCap } from 'lucide-react';
import { UserSession } from './AuthModal';

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onSwitchUser: (role: 'student' | 'staff_admin' | 'head_admin') => void;
  onSignOut: () => void;
  onNavigate: (tab: string) => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
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
            <span className="text-[11px] text-charcoal-muted truncate block">{currentUser.email}</span>
            <span className="text-[10px] text-forest font-semibold truncate block mt-0.5">{currentUser.department}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Role Switcher Grid */}
      <div className="p-4 space-y-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted block">
          Switch Testing Perspective
        </span>

        <div className="grid grid-cols-3 gap-1.5 bg-[#FAF8F5] p-1.5 rounded-2xl border border-black/5">
          <button
            onClick={() => onSwitchUser('student')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
              currentUser.role === 'student'
                ? 'bg-white text-[#155137] shadow-2xs border border-black/5'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            onClick={() => onSwitchUser('staff_admin')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
              currentUser.role === 'staff_admin'
                ? 'bg-[#155137] text-white shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Staff Admin</span>
          </button>

          <button
            onClick={() => onSwitchUser('head_admin')}
            className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
              currentUser.role === 'head_admin'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Head Admin</span>
          </button>
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
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left"
        >
          <span>Campus Issues &amp; Maintenance</span>
          <span className="text-charcoal-muted font-mono text-[10px]">Tickets</span>
        </button>

        <button
          onClick={() => { onNavigate('marketplace'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left"
        >
          <span>Marketplace</span>
          <span className="text-charcoal-muted font-mono text-[10px]">Listings</span>
        </button>

        <button
          onClick={() => { onNavigate('lostfound'); onClose(); }}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 text-charcoal text-left"
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
