import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  User,
  UtensilsCrossed,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  ArrowRight,
  LogOut,
  Sparkles,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { GoogleIcon } from '../../components/icons/GoogleIcon';
import { AUTHORIZED_ADMIN_LIST } from '../config/authorizedAdmins';
import { auth } from '../../config/firebase';

interface AdminLoginProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  title = 'The New Mirch Masala',
  subtitle = 'Restaurant Owner & Staff Operations',
}) => {
  const {
    login,
    loginWithGoogle,
    loginWithFirebaseEmail,
    logout,
    isLoading,
    sessionError,
    clearSessionError,
  } = useAdminAuth();

  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(() => {
    // If Firebase Auth already has an unauthorized user signed in
    if (auth.currentUser?.email) {
      return auth.currentUser.email;
    }
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Google Sign-In with Firebase Authentication
  const handleGoogleSignIn = async () => {
    setError(null);
    clearSessionError();
    setUnauthorizedEmail(null);
    setIsGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        if (res.unauthorizedEmail) {
          setUnauthorizedEmail(res.unauthorizedEmail);
        } else {
          setError(res.error || 'Google authentication was cancelled or failed.');
        }
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Handle Email / Password Sign In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearSessionError();
    setUnauthorizedEmail(null);
    setIsSubmitting(true);

    const cleanInput = emailOrUser.trim();

    try {
      if (cleanInput.includes('@')) {
        // Sign in via Firebase Email Auth
        const res = await loginWithFirebaseEmail(cleanInput, password);
        if (res.success) {
          if (onSuccess) onSuccess();
          return;
        } else if (res.unauthorizedEmail) {
          setUnauthorizedEmail(res.unauthorizedEmail);
          return;
        }
      }

      // Fallback or staff username sign-in
      const result = await login({ username: cleanInput, password });
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || 'Invalid credentials. Please verify your email/username and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick 1-click test accounts
  const handleQuickLogin = async (u: string, p: string) => {
    setEmailOrUser(u);
    setPassword(p);
    setError(null);
    clearSessionError();
    setUnauthorizedEmail(null);
    setIsSubmitting(true);
    try {
      const result = await login({ username: u, password: p });
      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(result.error || 'Quick login failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOutCurrent = async () => {
    await logout();
    setUnauthorizedEmail(null);
    setError(null);
    clearSessionError();
  };

  const activeError = error || sessionError;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 my-auto">
        {/* Top Decorative Header */}
        <div className="relative px-6 pt-8 pb-6 text-center border-b border-stone-800/80 bg-gradient-to-b from-stone-950 to-stone-900">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <UtensilsCrossed className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">{subtitle}</p>

          <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800/80 border border-stone-700/80 rounded-full text-[11px] text-amber-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Authentication &bull; Authorized Email Protected</span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Unauthorized Email Overlay Alert */}
          {unauthorizedEmail ? (
            <div className="p-4 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-white">Access Denied: Unauthorized Account</h3>
                  <p className="text-xs text-red-300 leading-relaxed">
                    The account <span className="font-mono font-semibold text-white px-1.5 py-0.5 bg-red-900/50 rounded">{unauthorizedEmail}</span> does not have administrative privileges for The New Mirch Masala.
                  </p>
                  <p className="text-[11px] text-red-400/90 pt-1">
                    Only authorized owner, manager, and staff email addresses can access the /admin dashboard.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-red-900/50">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="flex-1 py-2 px-3 bg-red-900 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <GoogleIcon className="w-3.5 h-3.5" />
                  <span>Switch Google Account</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOutCurrent}
                  className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* General Error Alert */}
          {activeError && !unauthorizedEmail && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-200">Authentication Error</p>
                <p className="mt-0.5 text-red-300/90">{activeError}</p>
              </div>
            </div>
          )}

          {/* PRIMARY OPTION: Sign in with Google (Firebase Auth) */}
          <div className="space-y-3">
            <button
              id="admin-google-signin-btn"
              type="button"
              disabled={isGoogleLoading || isSubmitting || isLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 bg-white hover:bg-stone-100 active:scale-[0.99] text-stone-900 font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-white/5 transition-all cursor-pointer disabled:opacity-50 text-sm group"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating with Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>Sign In with Google (Firebase)</span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-stone-400">
              Instant login for authorized Gmail/Google Workspace accounts
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-800 w-full" />
            <span className="bg-stone-900 px-3 text-[11px] font-bold text-stone-500 uppercase tracking-widest shrink-0">
              Or Sign In with Email &amp; Password
            </span>
            <div className="border-t border-stone-800 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Authorized Email or Staff ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="text"
                  autoComplete="username"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  placeholder="e.g. kumarpitendra9@gmail.com, rajesh@mirchmasala.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="admin-submit-login-btn"
              type="submit"
              disabled={isSubmitting || isGoogleLoading || isLoading}
              className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  Verifying Authorized Credentials...
                </span>
              ) : (
                <span>Sign In to Admin Dashboard</span>
              )}
            </button>
          </form>

          {/* Quick 1-Click Authorized Test Logins */}
          <div className="p-4 bg-stone-950/80 border border-stone-800/80 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Click Authorized Test Logins</span>
              </span>
              <span className="text-[10px] text-stone-400 font-medium">Click role to enter</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isSubmitting || isGoogleLoading || isLoading}
                onClick={() => handleQuickLogin('kumarpitendra9@gmail.com', 'admin123')}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 border border-amber-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-black text-amber-400 uppercase tracking-wide">Owner</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Pitendra Kumar</div>
                <div className="text-[10px] text-stone-400 mt-0.5 truncate font-mono">kumarpitendra9@gmail.com</div>
                <span className="mt-1.5 inline-block text-[10px] font-bold text-amber-300 group-hover:underline">
                  Sign In &rarr;
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || isGoogleLoading || isLoading}
                onClick={() => handleQuickLogin('vikram@mirchmasala.com', 'mirchmanager123')}
                className="p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 border border-orange-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-black text-orange-400 uppercase tracking-wide">Manager</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Vikram Singh</div>
                <div className="text-[10px] text-stone-400 mt-0.5 truncate font-mono">vikram@mirchmasala.com</div>
                <span className="mt-1.5 inline-block text-[10px] font-bold text-orange-300 group-hover:underline">
                  Sign In &rarr;
                </span>
              </button>

              <button
                type="button"
                disabled={isSubmitting || isGoogleLoading || isLoading}
                onClick={() => handleQuickLogin('pooja@mirchmasala.com', 'mirchstaff123')}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 text-left transition-all cursor-pointer group"
              >
                <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wide">Staff</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Pooja Verma</div>
                <div className="text-[10px] text-stone-400 mt-0.5 truncate font-mono">pooja@mirchmasala.com</div>
                <span className="mt-1.5 inline-block text-[10px] font-bold text-emerald-300 group-hover:underline">
                  Sign In &rarr;
                </span>
              </button>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="pt-2 flex items-center justify-between text-xs text-stone-400">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-stone-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 hover:underline"
            >
              &larr; Back to Customer Menu
            </a>
            <span className="text-[11px] text-stone-500">
              Database: <code className="font-mono text-stone-400">Firestore Cloud</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
