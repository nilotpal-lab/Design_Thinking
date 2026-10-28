import React, { useState } from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { NotificationsPopover } from './NotificationsPopover';
import { UserProfileMenu } from './UserProfileMenu';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
  setUserRole?: (role: string) => void;
  userName?: string;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole = 'Student',
  setUserRole = () => {},
  userName = 'Nilotpal',
  onOpenSearch = () => {},
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'spaces', label: 'Spaces' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'issues', label: 'Issues' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'lostfound', label: 'Lost & Found' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-subtle-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo matching reference */}
        <div 
          onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          {/* Temple Facade Icon */}
          <div className="text-charcoal group-hover:text-forest transition-colors">
            <svg 
              className="w-8 h-8" 
              viewBox="0 0 32 32" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 10L16 4L28 10H4Z" fill="currentColor" fillOpacity="0.05" />
              <line x1="3" y1="10" x2="29" y2="10" />
              <line x1="7" y1="10" x2="7" y2="24" strokeWidth="2.5" />
              <line x1="13" y1="10" x2="13" y2="24" strokeWidth="2.5" />
              <line x1="19" y1="10" x2="19" y2="24" strokeWidth="2.5" />
              <line x1="25" y1="10" x2="25" y2="24" strokeWidth="2.5" />
              <line x1="3" y1="24" x2="29" y2="24" />
              <line x1="2" y1="27" x2="30" y2="27" strokeWidth="3" />
            </svg>
          </div>
          <div className="flex items-center space-x-1">
            <span className="font-display text-2xl font-black tracking-wider text-charcoal">
              CAMPUS
            </span>
            <span className="w-2 h-2 rounded-full bg-forest ml-1"></span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-charcoal font-semibold'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Tools (Search + Bell + User Pill + Mobile Toggle) */}
        <div className="flex items-center space-x-3">
          
          {/* Global Search Button */}
          <button 
            onClick={onOpenSearch}
            className="w-10 h-10 rounded-full border border-subtle-border bg-card flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:border-charcoal-muted shadow-2xs transition-all cursor-pointer group"
            aria-label="Search"
            title="Search campus (Ctrl+K)"
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="w-10 h-10 rounded-full border border-subtle-border bg-card flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:border-charcoal-muted shadow-2xs transition-all cursor-pointer relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2.5 right-2.5 ring-2 ring-white" />
            </button>

            <NotificationsPopover 
              isOpen={isNotifOpen} 
              onClose={() => setIsNotifOpen(false)}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setIsNotifOpen(false);
              }}
            />
          </div>

          {/* User Sign In / Profile Pill */}
          <div className="relative">
            <div 
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center space-x-2.5 py-1.5 px-3 rounded-full border border-subtle-border bg-card shadow-2xs hover:border-charcoal-muted cursor-pointer transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                {userName.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-charcoal leading-tight">{userName}</div>
                <div className="text-[10px] text-charcoal-muted leading-none capitalize">{userRole}</div>
              </div>
            </div>

            <UserProfileMenu
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              userName={userName}
              userRole={userRole}
              setUserRole={setUserRole}
              onNavigate={(tab) => {
                setActiveTab(tab);
                setIsProfileOpen(false);
              }}
            />
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-full border border-subtle-border bg-card flex items-center justify-center text-charcoal"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-subtle-border bg-canvas/98 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-[#155137] text-white shadow-2xs'
                    : 'text-charcoal hover:bg-black/5'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-white" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
