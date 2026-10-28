import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './features/home/HomePage';
import { SpacesPage } from './features/spaces/SpacesPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { FacultyPage } from './features/faculty/FacultyPage';
import { IssuesPage } from './features/issues/IssuesPage';
import { ShoppingBag, Key, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');

  return (
    <div className="min-h-screen bg-canvas flex flex-col font-sans selection:bg-forest/15 selection:text-forest">
      {/* Top Fixed Header Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userName="Nilotpal" 
        userRole="Student" 
      />

      {/* Main Routed Content */}
      <main className="flex-1">
        {activeTab === 'home' && <HomePage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'spaces' && <SpacesPage />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'faculty' && <FacultyPage />}
        {activeTab === 'issues' && <IssuesPage />}

        {activeTab === 'marketplace' && (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#F2EDF9] text-charcoal flex items-center justify-center mx-auto shadow-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl font-black text-charcoal">
              CAMPUS MARKETPLACE
            </h2>
            <p className="text-sm text-charcoal-muted max-w-md mx-auto">
              Prepared for Batch 4: Buy, sell, and exchange books, electronics, and essentials with peer contact sharing.
            </p>
          </div>
        )}

        {activeTab === 'lostfound' && (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#EBF5F0] text-charcoal flex items-center justify-center mx-auto shadow-sm">
              <Key className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl font-black text-charcoal">
              LOST & FOUND RECOVERY
            </h2>
            <p className="text-sm text-charcoal-muted max-w-md mx-auto">
              Prepared for Batch 4: Browse lost and found items with privacy protection and status tracking.
            </p>
          </div>
        )}
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
