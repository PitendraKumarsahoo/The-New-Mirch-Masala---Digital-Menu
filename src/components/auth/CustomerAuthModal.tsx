import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutCustomer,
} from '../../services/firebaseAuthService';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  Heart,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  favoritesCount?: number;
  onViewFavorites?: () => void;
  onViewOrders?: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  favoritesCount = 0,
  onViewFavorites,
  onViewOrders,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        setSuccessMessage('Successfully signed in with Google!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 800);
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.success) {
          setSuccessMessage('Welcome back!');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 800);
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      } else {
        if (!displayName.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password, displayName);
        if (res.success) {
          setSuccessMessage('Account created successfully! Welcome to The New Mirch Masala.');
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        } else if (res.error) {
          setErrorMessage(res.error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutCustomer();
      setSuccessMessage('You have been signed out.');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not sign out.');
    } finally {
      setIsLoading(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden z-10 my-auto"
          >
            {/* Header / Brand Banner */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 px-6 pt-7 pb-6 text-white relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Sparkles className="w-4 h-4 text-amber-200" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
                  Customer Account & Cloud Sync
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {currentUser ? 'Your Dining Profile' : 'Sign in to Mirch Masala'}
              </h2>
              <p className="text-xs text-orange-100/90 mt-1 leading-relaxed">
                {currentUser
                  ? 'Your favorite dishes and dining orders are saved securely in the cloud.'
                  : 'Save your favorite spicy curries, biryanis & track live kitchen orders.'}
              </p>
            </div>

            {/* Content Body */}
            <div className="p-6">
              {/* If user is ALREADY LOGGED IN */}
              {currentUser ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-3.5 p-4 bg-orange-50/70 border border-orange-200/60 rounded-2xl">
                    <div className="w-13 h-13 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0 overflow-hidden">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || 'User'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        (currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 text-base truncate">
                          {currentUser.displayName || 'Guest Gourmet'}
                        </span>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-stone-500 truncate mt-0.5">{currentUser.email}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full mt-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Firebase Cloud Connected
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Navigation Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewFavorites?.();
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl transition-colors cursor-pointer text-center group"
                    >
                      <span className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <Heart className="w-4 h-4 fill-red-500" />
                      </span>
                      <span className="text-xs font-bold text-stone-900">Saved Favorites</span>
                      <span className="text-[10px] text-stone-500">{favoritesCount} dishes saved</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewOrders?.();
                      }}
                      className="flex flex-col items-center justify-center p-3.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-2xl transition-colors cursor-pointer text-center group"
                    >
                      <span className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                        <ShoppingBag className="w-4 h-4" />
                      </span>
                      <span className="text-xs font-bold text-stone-900">Track Orders</span>
                      <span className="text-[10px] text-stone-500">Live Kitchen Queue</span>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
                    ) : (
                      <LogOut className="w-4 h-4 text-stone-500" />
                    )}
                    <span>Sign Out from this Device</span>
                  </button>
                </div>
              ) : (
                /* If user is NOT LOGGED IN: Sign In / Sign Up Form */
                <div className="space-y-4">
                  {/* Google 1-Click Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl font-bold text-stone-800 text-xs flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-stone-200 w-full" />
                    <span className="bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider absolute">
                      or use email
                    </span>
                  </div>

                  {/* Mode Toggle Pills */}
                  <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setErrorMessage(null);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mode === 'signin'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setErrorMessage(null);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        mode === 'signup'
                          ? 'bg-white text-stone-900 shadow-xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Alert Feedbacks */}
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {successMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>{successMessage}</span>
                    </div>
                  )}

                  {/* Email & Password Form */}
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    {mode === 'signup' && (
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g. Pitendra Kumar"
                            className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            required={mode === 'signup'}
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-xs rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{mode === 'signin' ? 'Sign In' : 'Create Customer Account'}</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
