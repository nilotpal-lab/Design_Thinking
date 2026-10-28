import React, { useState } from 'react';
import { X, ShieldCheck, GraduationCap, Wrench, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff_admin' | 'head_admin';
  department: string;
  avatarUrl: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setGoogleError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        setGoogleError(error.message);
      }
    } catch (err: any) {
      setGoogleError(err.message || 'Google Sign-In failed');
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Demo Accounts
  const demoAccounts: UserSession[] = [
    {
      id: 'a0000000-0000-0000-0000-000000000006',
      name: 'Nilotpal',
      email: 'nilotpal.student@jainuniversity.ac.in',
      role: 'student',
      department: 'B.Tech CSE - 3rd Sem',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      name: 'Ramesh Kumar',
      email: 'ramesh.facilities@jainuniversity.ac.in',
      role: 'staff_admin',
      department: 'Campus Estate & Maintenance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Dr. Arvind Mehra',
      email: 'arvind.dean@jainuniversity.ac.in',
      role: 'head_admin',
      department: 'Office of the Dean & Academic Affairs',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-black/10 space-y-6 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-display text-lg font-black tracking-wider text-charcoal">
                JAINSPACE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            </div>
            <h3 className="font-display text-2xl font-black text-charcoal tracking-tight uppercase">
              Sign In to JainSpace
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Access classrooms, events, tickets, and administrative controls.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 text-charcoal-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-2">
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-black/15 bg-white hover:bg-black/5 font-semibold text-xs text-charcoal shadow-2xs transition-all cursor-pointer"
          >
            {/* Google G Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{loadingGoogle ? 'Connecting to Google...' : 'Continue with Google Account'}</span>
          </button>

          {googleError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{googleError}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-black/10 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-charcoal-muted uppercase tracking-wider shrink-0">
            Or Choose Demo Role
          </span>
        </div>

        {/* 3 Role Options */}
        <div className="space-y-2.5">
          {demoAccounts.map(acc => {
            const isHead = acc.role === 'head_admin';
            const isStaff = acc.role === 'staff_admin';

            return (
              <button
                key={acc.id}
                onClick={() => {
                  onLogin(acc);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-black/10 hover:border-forest/40 hover:bg-[#FAF8F5] transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.avatarUrl}
                    alt={acc.name}
                    className="w-10 h-10 rounded-full object-cover border border-black/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-charcoal group-hover:text-forest">
                        {acc.name}
                      </span>
                      {isHead && (
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-2 py-0.2 rounded-full uppercase">
                          Head Admin
                        </span>
                      )}
                      {isStaff && (
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2 py-0.2 rounded-full uppercase">
                          Staff Admin
                        </span>
                      )}
                      {!isHead && !isStaff && (
                        <span className="bg-[#EAF5EE] text-[#137333] text-[10px] font-black px-2 py-0.2 rounded-full uppercase">
                          Student
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-charcoal-muted mt-0.5">
                      {acc.department}
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-forest group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-[#FAF8F5] p-3 rounded-xl border border-black/5 text-[11px] text-charcoal-muted text-center leading-relaxed">
          Switch roles anytime to inspect the system as a <strong>Student</strong>, <strong>Maintenance Staff</strong>, or <strong>Head Admin</strong>.
        </div>

      </div>
    </div>
  );
};
