import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, User, UtensilsCrossed, AlertCircle, Eye, EyeOff, CheckCircle2, Clock } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSuccess,
  title = 'The New Mirch Masala',
  subtitle = 'Restaurant Owner & Staff Portal',
}) => {
  const { login, isLoading, sessionError, clearSessionError } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearSessionError();
    setSubmitting(true);

    const result = await login({ username, password });
    setSubmitting(false);

    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      if (result.errorCode === 'ACCOUNT_DISABLED') {
        setError('This account has been deactivated. Please contact the restaurant owner for assistance.');
      } else if (result.errorCode === 'SESSION_EXPIRED') {
        setError('Your session has expired. Please sign in again.');
      } else if (result.errorCode === 'NETWORK_ERROR') {
        setError('Unable to connect to authentication server. Please check your network and try again.');
      } else {
        setError(result.error || 'Invalid credentials. Please verify your username and password.');
      }
    }
  };

  const activeError = error || sessionError;

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 text-stone-100">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UtensilsCrossed className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">{subtitle}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 bg-stone-900 border border-stone-800 rounded-full text-[11px] text-amber-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Role-Based Access Control</span>
          </div>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-200">Authentication Alert</p>
              <p className="mt-0.5 text-red-300/90 break-words">{activeError}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Username or Staff ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username-input"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. rajesh, vikram, pooja)"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
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
                className="w-full pl-10 pr-10 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
            disabled={submitting || isLoading}
            className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer text-sm"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                Verifying Credentials...
              </span>
            ) : (
              <span>Sign In to Portal</span>
            )}
          </button>
        </form>

        {/* Security & Access Information */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 text-xs text-stone-400 space-y-2.5">
          <div className="flex items-center gap-2 text-stone-400 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>Authenticated sessions expire after 8 hours of inactivity.</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            <span>All administrative and staff actions are cryptographically logged.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
