import React, { useState } from 'react';
import { Customer, LoyaltyStatus } from '../../types';
import { formatPhoneForDisplay } from '../../services/loyaltyService';
import { User, LogOut, Sparkles, UserCheck, ShieldCheck, ChevronDown } from 'lucide-react';

interface ProfileAccountCardProps {
  customer?: Customer | null;
  loyalty?: LoyaltyStatus | null;
  onLogout: () => void;
  onOpenLoginModal: () => void;
  onSelectDemoCustomer: (cust: Customer) => void;
  demoCustomers: Customer[];
}

export const ProfileAccountCard: React.FC<ProfileAccountCardProps> = ({
  customer,
  loyalty,
  onLogout,
  onOpenLoginModal,
  onSelectDemoCustomer,
  demoCustomers,
}) => {
  const [showDemoDropdown, setShowDemoDropdown] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return 'MM';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="bg-stone-900 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-600/20 rounded-full blur-2xl pointer-events-none" />

      {customer ? (
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            {/* Avatar Initials */}
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white font-black text-base flex items-center justify-center shadow-md shrink-0 border-2 border-white/20">
              {getInitials(customer.name)}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {customer.name}
                </h2>
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400" title="Verified Customer">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {formatPhoneForDisplay(customer.phone || customer.mobile)}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-800 text-orange-400 border border-stone-700">
                  {customer.totalVisits || 0} Total Visits
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
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-stone-800 text-stone-300 flex items-center justify-center shrink-0 border border-stone-700">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Guest Diner</h3>
                <p className="text-[11px] text-stone-400">
                  Save favorites & spice preferences on this device
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>

          {/* Quick Demo Switcher Strip for Instant Evaluator Convenience */}
          <div className="pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Quick Test Accounts</span>
              </span>
              <button
                type="button"
                onClick={() => setShowDemoDropdown((prev) => !prev)}
                className="text-[10px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>{showDemoDropdown ? 'Hide' : 'Pick Diner'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showDemoDropdown ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showDemoDropdown && (
              <div className="flex flex-wrap gap-1.5 pt-1 animate-in fade-in">
                {demoCustomers.map((demo) => (
                  <button
                    key={demo.customerId}
                    type="button"
                    onClick={() => {
                      onSelectDemoCustomer(demo);
                      setShowDemoDropdown(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{demo.name.split(' ')[0]}</span>
                    <span className="text-orange-400">({demo.totalVisits} visits)</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
