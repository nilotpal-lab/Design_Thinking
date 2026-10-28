import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  onGoHome: () => void;
  onSignIn: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Restricted Administrative Access',
  message = 'This portal is restricted to University Head Administrators and executive governance. Your current session does not have sufficient clearance to view or modify this directory.',
  onGoHome,
  onSignIn,
}) => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-20 h-20 rounded-3xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto shadow-sm">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-block px-3 py-1 bg-red-100 text-red-800 text-[11px] font-mono font-bold uppercase rounded-full">
          HTTP 403 • Unauthorized Access
        </div>
        <h2 className="font-display text-4xl font-black text-charcoal tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-charcoal-muted max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onGoHome}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-black/15 bg-white hover:bg-black/5 text-xs font-semibold text-charcoal shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>

        <button
          onClick={onSignIn}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#155137] hover:bg-[#103E2A] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In as Head Admin</span>
        </button>
      </div>
    </div>
  );
};
