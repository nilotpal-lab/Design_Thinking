import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomePage } from './features/home/HomePage';
import { SpacesPage } from './features/spaces/SpacesPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { FacultyPage } from './features/faculty/FacultyPage';
import { IssuesPage } from './features/issues/IssuesPage';
import { MarketplacePage } from './features/marketplace/MarketplacePage';
import { LostFoundPage } from './features/lostfound/LostFoundPage';
import { HeadAdminPage } from './features/admin/HeadAdminPage';
import { CommandPalette } from './components/CommandPalette';
import { AuthModal, UserSession } from './components/AuthModal';
import { AccessDenied } from './components/AccessDenied';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // Active user session (defaults to Nilotpal - Student for seamless testing)
  const [currentUser, setCurrentUser] = useState<UserSession | null>({
    id: 'a0000000-0000-0000-0000-000000000006',
    name: 'Nilotpal',
    email: 'nilotpal.student@jainuniversity.ac.in',
    role: 'student',
    department: 'B.Tech CSE - 3rd Sem',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  });

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
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={() => {
          setCurrentUser(null);
          setActiveTab('home');
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Sign In / Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(user) => {
          setCurrentUser(user);
          if (user.role === 'head_admin') setActiveTab('admin');
          else if (user.role === 'staff_admin') setActiveTab('issues');
          else setActiveTab('home');
        }}
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
        {activeTab === 'faculty' && <FacultyPage currentUser={currentUser} />}
        {activeTab === 'issues' && (
          <IssuesPage 
            currentUser={currentUser} 
            onRequireAuth={() => setIsAuthOpen(true)} 
          />
        )}
        {activeTab === 'marketplace' && (
          <MarketplacePage 
            currentUser={currentUser} 
            onRequireAuth={() => setIsAuthOpen(true)} 
          />
        )}
        {activeTab === 'lostfound' && (
          <LostFoundPage 
            currentUser={currentUser} 
            onRequireAuth={() => setIsAuthOpen(true)} 
          />
        )}
        {activeTab === 'admin' && (
          currentUser?.role === 'head_admin' ? (
            <HeadAdminPage />
          ) : (
            <AccessDenied 
              title="Head Admin Clearance Required"
              message="You do not have administrative privileges to access the User Directory and Governance Console. Please sign in with an executive Head Admin account."
              onGoHome={() => setActiveTab('home')}
              onSignIn={() => setIsAuthOpen(true)}
            />
          )
        )}
      </main>
    </div>
  );
};
