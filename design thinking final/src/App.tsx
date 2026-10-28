import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './features/home/HomePage';
import { SpacesPage } from './features/spaces/SpacesPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { FacultyPage } from './features/faculty/FacultyPage';
import { IssuesPage } from './features/issues/IssuesPage';
import { MarketplacePage } from './features/marketplace/MarketplacePage';
import { LostFoundPage } from './features/lostfound/LostFoundPage';
import { CommandPalette } from './components/CommandPalette';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<string>('Student');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans selection:bg-forest/15 selection:text-forest">
      {/* Top Fixed Header Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userName="Nilotpal" 
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Global Command Palette / Search Modal */}
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'spaces' && <SpacesPage />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'faculty' && <FacultyPage />}
        {activeTab === 'issues' && <IssuesPage />}
        {activeTab === 'marketplace' && <MarketplacePage />}
        {activeTab === 'lostfound' && <LostFoundPage />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-subtle-border py-8 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-muted space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-display text-lg font-bold text-charcoal tracking-wider">CAMPUS •</span>
            <span>All rights reserved. Real data from college timetable snapshot (14 Sep 2026).</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hover:text-charcoal cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-charcoal cursor-pointer">Campus Directory</span>
            <span>•</span>
            <span className="hover:text-charcoal cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
