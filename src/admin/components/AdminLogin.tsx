import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ShieldCheck, Lock, User, UtensilsCrossed, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess }) => {
  const { login, isLoading } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login({ username, password });
    setSubmitting(false);

    if (result.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const handleQuickFill = (role: 'owner' | 'manager') => {
    if (role === 'owner') {
      setUsername('rajesh');
      setPassword('mirchowner123');
    } else {
      setUsername('vikram');
      setPassword('mirchmanager123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">The New Mirch Masala</h1>
          <p className="text-sm text-stone-400 mt-1">Restaurant Owner & Management Portal</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 bg-stone-900 border border-stone-800 rounded-full text-xs text-amber-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Admin Route (/admin)</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-200">Access Denied</p>
              <p className="mt-0.5 text-red-300/90">{error}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Username or Staff ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="admin-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rajesh"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            id="admin-submit-login-btn"
            type="submit"
            disabled={submitting || isLoading}
            className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></span>
                Verifying Credentials...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Fill Helpers for Testing */}
        <div className="mt-8 pt-6 border-t border-stone-900 text-center">
          <p className="text-xs text-stone-500 mb-3 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo Login (Phase 6 Testing):
          </p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('owner')}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-amber-400 font-medium transition-colors"
            >
              👑 Owner (Rajesh)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('manager')}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 text-xs text-orange-400 font-medium transition-colors"
            >
              💼 Manager (Vikram)
            </button>
          </div>
        </div>

        {/* Back to customer site */}
        <div className="mt-6 text-center">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="text-xs text-stone-400 hover:text-stone-200 underline transition-colors"
          >
            ← Return to Customer Digital Menu
          </a>
        </div>
      </div>
    </div>
  );
};
