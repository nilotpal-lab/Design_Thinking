import React from 'react';
import { Search } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
  userName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole = 'Student',
  userName = 'Nilotpal'
}) => {
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
    <header className="sticky top-0 z-50 bg-canvas/95 backdrop-blur-md border-b border-subtle-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          {/* Temple Facade Icon matching the screenshot */}
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
              {/* Roof pediment */}
              <path d="M4 10L16 4L28 10H4Z" fill="currentColor" fillOpacity="0.05" />
              {/* Entablature */}
              <line x1="3" y1="10" x2="29" y2="10" />
              {/* 4 Pillars */}
              <line x1="7" y1="10" x2="7" y2="24" strokeWidth="2.5" />
              <line x1="13" y1="10" x2="13" y2="24" strokeWidth="2.5" />
              <line x1="19" y1="10" x2="19" y2="24" strokeWidth="2.5" />
              <line x1="25" y1="10" x2="25" y2="24" strokeWidth="2.5" />
              {/* Base plinth */}
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

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
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

        {/* Right Tools (Search + Auth) */}
        <div className="flex items-center space-x-3">
          <button 
            className="w-10 h-10 rounded-full border border-subtle-border bg-card flex items-center justify-center text-charcoal-muted hover:text-charcoal hover:border-charcoal-muted transition-all"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Sign In / Profile Pill */}
          <div className="flex items-center">
            {userName ? (
              <div className="flex items-center space-x-2.5 py-1.5 px-3 rounded-full border border-subtle-border bg-card shadow-sm hover:border-charcoal-muted cursor-pointer transition-all">
                <div className="w-7 h-7 rounded-full bg-forest text-white text-xs font-bold flex items-center justify-center">
                  {userName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-charcoal leading-tight">{userName}</div>
                  <div className="text-[10px] text-charcoal-muted leading-none capitalize">{userRole}</div>
                </div>
              </div>
            ) : (
              <button className="px-5 py-2 rounded-full bg-charcoal text-white text-sm font-semibold hover:bg-forest transition-colors shadow-sm">
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
