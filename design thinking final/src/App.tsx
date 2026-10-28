import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './features/home/HomePage';
import { SpacesPage } from './features/spaces/SpacesPage';
import { Calendar, Users, Wrench, ShoppingBag, Key, ArrowRight } from 'lucide-react';

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

        {/* Temporary Handlers for upcoming batches */}
        {activeTab === 'calendar' && (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FDF3E7] text-charcoal flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl font-black text-charcoal">
              CAMPUS EVENTS & CALENDAR
            </h2>
            <p className="text-sm text-charcoal-muted max-w-md mx-auto">
              Prepared for Batch 2: Month, Year, and List view calendar with dedicated Holiday filters and Club/Department event manager.
            </p>
            <button
              onClick={() => setActiveTab('spaces')}
              className="px-6 py-2.5 bg-forest text-white rounded-xl font-bold text-xs hover:bg-forest-dark transition-colors inline-flex items-center space-x-2"
            >
              <span>Explore Spaces</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#EBF3FB] text-charcoal flex items-center justify-center mx-auto shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl font-black text-charcoal">
              CAMPUS FACULTY DIRECTORY
            </h2>
            <p className="text-sm text-charcoal-muted max-w-md mx-auto">
              Prepared for Batch 2: Search teachers by name, department, designation, and room/cabin location.
            </p>
            <button
              onClick={() => setActiveTab('spaces')}
              className="px-6 py-2.5 bg-forest text-white rounded-xl font-bold text-xs hover:bg-forest-dark transition-colors inline-flex items-center space-x-2"
            >
              <span>Explore Spaces</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#FDEBEB] text-charcoal flex items-center justify-center mx-auto shadow-sm">
              <Wrench className="w-8 h-8" />
            </div>
            <h2 className="font-display text-4xl font-black text-charcoal">
              CAMPUS ISSUES SYSTEM
            </h2>
            <p className="text-sm text-charcoal-muted max-w-md mx-auto">
              Prepared for Batch 3: Normal user issue reporting drawer + Maintenance Admin management dashboard with timeline.
            </p>
          </div>
        )}

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
