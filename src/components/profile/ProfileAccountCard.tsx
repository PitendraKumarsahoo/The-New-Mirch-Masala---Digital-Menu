import React from 'react';
import { Customer, LoyaltyStatus } from '../../types';
import { formatPhoneForDisplay } from '../../services/loyaltyService';
import { User, LogOut, Sparkles, UserCheck, ShieldCheck, ChevronDown, CheckCircle2 } from 'lucide-react';
import { GoogleIcon } from '../icons/GoogleIcon';
import { User as FirebaseUser } from 'firebase/auth';

interface ProfileAccountCardProps {
  customer?: Customer | null;
  loyalty?: LoyaltyStatus | null;
  currentUser?: FirebaseUser | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onGoogleSignIn?: () => Promise<void>;
  onSelectDemoCustomer?: (cust: Customer) => void;
  demoCustomers?: Customer[];
}

export const ProfileAccountCard: React.FC<ProfileAccountCardProps> = ({
  customer,
  loyalty,
  currentUser,
  onLogout,
  onOpenLoginModal,
  onGoogleSignIn,
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'MM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const displayName = currentUser?.displayName || customer?.name || 'Guest Diner';
  const displayEmail = currentUser?.email || customer?.email || '';
  const displayPhone = customer?.phone || customer?.mobile || '';
  const isGoogleUser = !!currentUser;

  return (
    <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-600/20 rounded-full blur-2xl pointer-events-none" />

      {customer || currentUser ? (
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar (Google photo or Initials) */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0 border-2 border-white/20 overflow-hidden">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(displayName)
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight truncate">
                  {displayName}
                </h2>
                {isGoogleUser ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                    <GoogleIcon className="w-3 h-3 shrink-0" />
                    <span>Google Account</span>
                  </span>
                ) : (
                  <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400" title="Verified Customer">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {displayEmail ? (
                <p className="text-xs text-stone-300 truncate mt-0.5">{displayEmail}</p>
              ) : displayPhone ? (
                <p className="text-xs text-stone-400 truncate mt-0.5">{formatPhoneForDisplay(displayPhone)}</p>
              ) : null}

              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-orange-400 border border-stone-700">
                  {customer?.totalVisits || 1} Dine-in Visits
                </span>
                {loyalty?.nextRewardTier && (
                  <span className="text-[10px] font-semibold text-stone-400">
                    Next: {loyalty.nextRewardTier.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
            title="Sign Out / Switch Profile"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-stone-800 text-stone-300 flex items-center justify-center shrink-0 border border-stone-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Guest Diner</h3>
                <p className="text-[11px] text-stone-400">
                  Sign in with Google to sync favorites &amp; live orders
                </p>
              </div>
            </div>
          </div>

          {/* Quick Sign-In Options */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            {onGoogleSignIn && (
              <button
                type="button"
                id="profile-google-signin-btn"
                onClick={onGoogleSignIn}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-stone-100 active:scale-[0.98] text-stone-900 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Sign In with Google</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors shrink-0 cursor-pointer inline-flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>Phone / Password</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
