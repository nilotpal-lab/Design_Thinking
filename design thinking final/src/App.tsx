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
    </div>
  );
};
