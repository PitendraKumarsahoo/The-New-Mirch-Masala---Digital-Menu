import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Gift,
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  Percent,
  Utensils,
  LogOut,
  KeyRound,
  Users,
} from 'lucide-react';
import {
  searchCustomerForStaff,
  verifyCustomerVisit,
  redeemCustomerReward,
  normalizePhoneNumber,
  formatPhoneForDisplay,
  getTodayKolkataDate,
  getDemoCustomers,
} from '../../services/loyaltyService';
import { findStaffAccount, STAFF_ACCOUNTS, StaffAccount } from '../../config/staffAccounts';
import { Customer, LoyaltyStatus, Visit, RewardTier } from '../../types';

interface StaffVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  prefillCustomer?: Customer | null;
  initialStaff?: StaffAccount | null;
  onCustomerUpdated?: (customer: Customer, loyalty: LoyaltyStatus) => void;
}

export const StaffVerification: React.FC<StaffVerificationProps> = ({
  isOpen,
  onClose,
  prefillCustomer,
  initialStaff,
  onCustomerUpdated,
}) => {
  // Staff Authentication State
  const [currentStaff, setCurrentStaff] = useState<StaffAccount | null>(() => {
    if (initialStaff) return initialStaff;
    try {
      const saved = sessionStorage.getItem('mirch_staff_account');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });

  const [staffIdInput, setStaffIdInput] = useState('');
  const [staffPasswordInput, setStaffPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Customer search & details
  const [searchPhone, setSearchPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyStatus | null>(null);
  const [recentVisits, setRecentVisits] = useState<Visit[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);

  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<string>('');

  useEffect(() => {
    if (initialStaff) {
      setCurrentStaff(initialStaff);
    }
  }, [initialStaff]);

  useEffect(() => {
    if (prefillCustomer && isOpen) {
      setSearchPhone(prefillCustomer.phone);
      if (currentStaff) {
        handleSearch(prefillCustomer.phone);
      }
    }
  }, [prefillCustomer, isOpen, currentStaff]);

  if (!isOpen) return null;

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const account = findStaffAccount(staffIdInput, staffPasswordInput);
    if (account) {
      setCurrentStaff(account);
      try {
        sessionStorage.setItem('mirch_staff_account', JSON.stringify(account));
      } catch {
        // ignore
      }
      if (searchPhone) {
        handleSearch(searchPhone);
      }
    } else {
      setLoginError('Invalid ID or Password. Please check the preset accounts list below.');
    }
  };

  const handleStaffLogout = () => {
    setCurrentStaff(null);
    try {
      sessionStorage.removeItem('mirch_staff_account');
    } catch {
      // ignore
    }
    setCustomer(null);
    setLoyalty(null);
  };

  const handleSearch = async (phoneToSearch?: string) => {
    const raw = phoneToSearch || searchPhone;
    const clean = normalizePhoneNumber(raw);

    if (!clean || clean.length !== 10) {
      setSearchError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSearchError(null);
    setActionMessage(null);
    setIsSearching(true);

    try {
      const res = await searchCustomerForStaff(clean);
      if (res.success && res.customer && res.loyalty) {
        setCustomer(res.customer);
        setLoyalty(res.loyalty);
        setRecentVisits(res.recentVisits || []);
        if (res.loyalty.unlockedTiers.length > 0) {
          setSelectedRewardToRedeem(res.loyalty.unlockedTiers[0].id);
        }
      } else {
        setCustomer(null);
        setLoyalty(null);
        setRecentVisits([]);
        setSearchError(res.error || 'No customer registered with this mobile number.');
      }
    } catch {
      setSearchError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Staff Action: Verify Visit for Today (Valid 1 Strike)
  const handleVerifyEat = async () => {
    if (!customer || !currentStaff) return;

    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await verifyCustomerVisit(
        customer.customerId,
        customer.restaurantId || 'mirch-masala-01',
        currentStaff.password,
        `${currentStaff.name} (${currentStaff.role})`
      );

      if (res.success && res.customer && res.loyalty) {
        setCustomer(res.customer);
        setLoyalty(res.loyalty);
        setActionMessage({
          type: 'success',
          text: `✓ Visit Verified! Valid 1 strike recorded for today. Total: ${res.customer.totalVisits} strikes.`,
        });

        // Add to recent visits display
        if (res.visit) {
          setRecentVisits((prev) => [res.visit!, ...prev.filter((v) => v.visitId !== res.visit!.visitId)]);
        }

        if (onCustomerUpdated) {
          onCustomerUpdated(res.customer, res.loyalty);
        }
      } else if (res.alreadyVerified) {
        setActionMessage({
          type: 'warning',
          text: res.message || "Customer's dine-in visit is already verified today. Maximum 1 strike per day.",
        });
      } else {
        setActionMessage({
          type: 'error',
          text: res.error || 'Could not verify visit.',
        });
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Network error while recording strike.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Staff Action: Redeem Milestone Reward (₹50 OFF, 20% OFF, 40% OFF / Free Dish)
  const handleRedeemReward = async (tierId?: string) => {
    if (!customer || !currentStaff) return;
    const targetTierId = tierId || selectedRewardToRedeem;

    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await redeemCustomerReward(
        customer.customerId,
        targetTierId,
        customer.restaurantId || 'mirch-masala-01',
        currentStaff.password,
        `${currentStaff.name} (${currentStaff.role})`
      );

      if (res.success && res.customer && res.loyalty) {
        setCustomer(res.customer);
        setLoyalty(res.loyalty);
        setActionMessage({
          type: 'success',
          text: `🎉 ${res.message || 'Reward redeemed successfully!'} Applied to customer dining bill.`,
        });

        if (res.loyalty.unlockedTiers.length > 0) {
          setSelectedRewardToRedeem(res.loyalty.unlockedTiers[0].id);
        } else {
          setSelectedRewardToRedeem('');
        }

        if (onCustomerUpdated) {
          onCustomerUpdated(res.customer, res.loyalty);
        }
      } else {
        setActionMessage({
          type: 'error',
          text: res.error || 'Reward redemption failed.',
        });
      }
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Network error during reward redemption.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const demoCustomers = getDemoCustomers();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Owner & Staff Terminal</h3>
                {currentStaff && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${currentStaff.badgeColor}`}>
                    {currentStaff.role}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400">
                {currentStaff
                  ? `Logged in: ${currentStaff.name}`
                  : 'Verify dine-in eat & apply milestone discounts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {currentStaff && (
              <button
                type="button"
                onClick={handleStaffLogout}
                title="Log Out Staff"
                className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: AUTHENTICATION IF NOT SIGNED IN */}
          {!currentStaff ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  <span>Enter Staff / Owner Credentials</span>
                </div>

                {loginError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleStaffLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Staff / Owner ID (Username)
                    </label>
                    <input
                      type="text"
                      value={staffIdInput}
                      onChange={(e) => setStaffIdInput(e.target.value)}
                      placeholder="e.g. rajesh or vikram or pooja"
                      required
                      className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={staffPasswordInput}
                      onChange={(e) => setStaffPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Unlock Terminal
                  </button>
                </form>
              </div>

              {/* Quick Staff Selection */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Select Preset Staff Account
                </span>
                <div className="space-y-1.5">
                  {STAFF_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setStaffIdInput(acc.id);
                        setStaffPasswordInput(acc.password);
                      }}
                      className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/50 border border-stone-200 text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{acc.name}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${acc.badgeColor}`}>
                            {acc.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 font-mono">
                          ID: {acc.id} • Pass: {acc.password}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-1 rounded-lg">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: VERIFICATION TERMINAL */
            <div className="space-y-4">
              {/* Customer Search Bar */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Customer Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-stone-400" />
                    </div>
                    <span className="absolute inset-y-0 left-9 flex items-center text-xs font-bold text-stone-500 pointer-events-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                      }}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-17 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isSearching ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick preset diner buttons for testing */}
              {demoCustomers.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    Quick Diners:
                  </span>
                  {demoCustomers.map((d) => (
                    <button
                      key={d.customerId}
                      type="button"
                      onClick={() => {
                        setSearchPhone(d.phone);
                        handleSearch(d.phone);
                      }}
                      className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 border border-stone-200 text-[11px] font-medium text-stone-700 transition-colors cursor-pointer"
                    >
                      {d.name.split(' ')[0]} ({d.totalVisits} strikes)
                    </button>
                  ))}
                </div>
              )}

              {/* Search Error */}
              {searchError && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{searchError}</span>
                </div>
              )}

              {/* Action Banner Message */}
              {actionMessage && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-medium ${
                    actionMessage.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : actionMessage.type === 'warning'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {actionMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* CUSTOMER FOUND DETAILS & VERIFICATION ACTIONS */}
              {customer && loyalty && (
                <div className="space-y-4 pt-1">
                  {/* Customer Snapshot Card */}
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-stone-900">{customer.name}</h4>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-700">
                            ID: {customer.customerId.substring(0, 10)}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">
                          {formatPhoneForDisplay(customer.phone)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-black text-amber-600 leading-none">
                          {loyalty.progressVisits}
                          <span className="text-xs text-stone-400 font-semibold">/10</span>
                        </span>
                        <span className="text-[10px] font-bold text-stone-500 block mt-0.5">
                          {customer.totalVisits} Total Strikes
                        </span>
                      </div>
                    </div>

                    {/* Today Status Pill */}
                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 text-xs">
                      <span className="text-stone-500 font-medium">Today's Dining Eat:</span>
                      {loyalty.todayVisitStatus === 'VERIFIED' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>1 Strike Verified Today</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Not Verified Yet Today</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTION 1: VERIFY EAT & RECORD 1 STRIKE */}
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/60 space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>Verify Dine-In Eat (Valid 1 Strike)</span>
                        </h4>
                        <p className="text-xs text-amber-800/90 mt-0.5">
                          Enforces 1 valid strike per customer per day in Indian Standard Time.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyEat}
                      disabled={actionLoading || loyalty.todayVisitStatus === 'VERIFIED'}
                      className={`w-full py-3 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                        loyalty.todayVisitStatus === 'VERIFIED'
                          ? 'bg-stone-200 text-stone-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                      }`}
                    >
                      {actionLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : loyalty.todayVisitStatus === 'VERIFIED' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-stone-500" />
                          <span>Already Recorded 1 Strike Today</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Confirm Dine-In & Add 1 Strike (+1)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* ACTION 2: REDEEM MILESTONE REWARD */}
                  <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-orange-600" />
                        <span>Redeem Milestone Reward</span>
                      </h4>
                      <span className="text-xs font-bold text-stone-500">
                        {loyalty.unlockedTiers.length} Available
                      </span>
                    </div>

                    {loyalty.unlockedTiers.length === 0 ? (
                      <p className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-150">
                        No active milestone rewards unlocked right now. Rewards unlock at Strike 5 (₹50 OFF), Strike 7 (20% OFF), and Strike 10 (40% OFF / Free Dish).
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {loyalty.unlockedTiers.map((tier) => (
                          <div
                            key={tier.id}
                            className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                                {tier.strike === 5 ? '5' : tier.strike === 7 ? '7' : '10'}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-stone-900 block leading-tight">
                                  {tier.name}
                                </span>
                                <span className="text-[10px] text-stone-500">
                                  {tier.description}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRedeemReward(tier.id)}
                              disabled={actionLoading}
                              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-black text-white text-[11px] font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
                            >
                              Apply to Bill
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Visits History */}
                  {recentVisits.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-stone-100">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                        Recent Verified Visits
                      </span>
                      <div className="space-y-1.5">
                        {recentVisits.slice(0, 3).map((v) => (
                          <div
                            key={v.visitId}
                            className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 text-stone-700">
                              <Calendar className="w-3.5 h-3.5 text-stone-400" />
                              <span className="font-semibold">{v.visitDate}</span>
                              <span className="text-stone-400 font-normal">at {v.visitTime}</span>
                            </div>
                            <span className="text-[10px] font-medium text-stone-500">
                              By {v.verifiedBy}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
