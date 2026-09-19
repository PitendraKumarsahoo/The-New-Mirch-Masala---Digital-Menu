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
  Lock,
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
import { loginAdmin, logoutAdmin, getStoredAuthToken, fetchCurrentSession } from '../../admin/services/adminAuthService';
import { STAFF_METADATA } from '../../config/staffAccounts';
import { Customer, LoyaltyStatus, Visit, RewardTier } from '../../types';

interface StaffUserSession {
  id: string;
  name: string;
  role: 'Owner' | 'Manager' | 'Staff';
  badgeColor: string;
}

interface StaffVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  prefillCustomer?: Customer | null;
  initialStaff?: StaffUserSession | null;
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
  const [currentStaff, setCurrentStaff] = useState<StaffUserSession | null>(initialStaff || null);
  const [staffIdInput, setStaffIdInput] = useState('');
  const [staffPasswordInput, setStaffPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

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

  // Check active session on mount
  useEffect(() => {
    if (!currentStaff && isOpen) {
      const token = getStoredAuthToken();
      if (token) {
        fetchCurrentSession().then((res) => {
          if (res.success && res.data?.user) {
            const u = res.data.user;
            const meta = STAFF_METADATA.find((m) => m.id === u.userId.toLowerCase());
            setCurrentStaff({
              id: u.userId,
              name: u.name,
              role: u.role === 'OWNER' ? 'Owner' : u.role === 'MANAGER' ? 'Manager' : 'Staff',
              badgeColor: meta?.badgeColor || 'bg-stone-700 text-white',
            });
          }
        });
      }
    }
  }, [isOpen, currentStaff]);

  useEffect(() => {
    if (prefillCustomer && isOpen) {
      setSearchPhone(prefillCustomer.phone);
      if (currentStaff) {
        handleSearch(prefillCustomer.phone);
      }
    }
  }, [prefillCustomer, isOpen, currentStaff]);

  if (!isOpen) return null;

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsAuthenticating(true);

    const res = await loginAdmin(staffIdInput, staffPasswordInput);
    setIsAuthenticating(false);

    if (res.success && res.data?.user) {
      const u = res.data.user;
      const meta = STAFF_METADATA.find((m) => m.id === u.userId.toLowerCase());
      const roleStr = u.role === 'OWNER' ? 'Owner' : u.role === 'MANAGER' ? 'Manager' : 'Staff';
      const staffUser: StaffUserSession = {
        id: u.userId,
        name: u.name,
        role: roleStr,
        badgeColor: meta?.badgeColor || 'bg-stone-700 text-white',
      };
      setCurrentStaff(staffUser);

      if (searchPhone) {
        handleSearch(searchPhone);
      }
    } else {
      setLoginError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleStaffLogout = async () => {
    await logoutAdmin();
    setCurrentStaff(null);
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
        `${currentStaff.name} (${currentStaff.role})`
      );

      if (res.success && res.customer && res.loyalty) {
        setCustomer(res.customer);
        setLoyalty(res.loyalty);
        setActionMessage({
          type: 'success',
          text: `🎉 Milestone discount redeemed! Successfully applied to bill.`,
        });

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
                    disabled={isAuthenticating}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isAuthenticating ? 'Authenticating...' : 'Unlock Terminal'}
                  </button>
                </form>
              </div>

              {/* Staff Accounts Reference */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Staff Accounts Directory
                </span>
                <div className="space-y-1.5">
                  {STAFF_METADATA.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setStaffIdInput(acc.id);
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
                          Username: {acc.id}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-1 rounded-lg">
                        Fill Username
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
                  Search Customer by Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="tel"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Enter 10-digit mobile..."
                      maxLength={14}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none focus:bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isSearching ? 'Searching...' : 'Lookup'}</span>
                  </button>
                </div>
                {searchError && (
                  <p className="text-xs text-red-600 font-medium mt-1.5">{searchError}</p>
                )}
              </div>

              {/* Action Feedback Banner */}
              {actionMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150 ${
                    actionMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : actionMessage.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {actionMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* Customer Profile & Actions */}
              {customer && loyalty && (
                <div className="space-y-4 pt-1">
                  {/* Customer Quick Card */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-stone-900 text-amber-400 font-bold text-lg flex items-center justify-center">
                        {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">{customer.name}</h4>
                        <p className="text-xs text-stone-500 font-mono">
                          {formatPhoneForDisplay(customer.phone)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Verified Strikes
                      </span>
                      <span className="text-xl font-black text-amber-600">
                        {loyalty.currentStrikes ?? loyalty.currentVisits ?? 0} / 10
                      </span>
                      <span className="text-[10px] text-stone-400 block font-medium">
                        Total: {customer.totalVisits}
                      </span>
                    </div>
                  </div>

                  {/* Primary Action 1: Verify Dine-in Eat Today */}
                  <div className="p-4 rounded-2xl bg-stone-900 text-white space-y-3 shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-0.5">
                          Anti-Fraud Dine-In Verification
                        </span>
                        <h4 className="font-bold text-sm text-white">
                          Verify Today&apos;s Customer Dine-In Visit
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-stone-800 border border-stone-700 text-[10px] text-stone-300 font-mono">
                        {getTodayKolkataDate()}
                      </span>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      Customers earn 1 verified strike per day upon finishing their meal.
                    </p>

                    <button
                      type="button"
                      onClick={handleVerifyEat}
                      disabled={actionLoading}
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{actionLoading ? 'Recording Strike...' : 'Verify Dine-In (+1 Strike)'}</span>
                    </button>
                  </div>

                  {/* Primary Action 2: Redeem Milestone Rewards */}
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
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
                        No active milestone rewards unlocked right now. Rewards unlock at Strike 5, 7, and 10.
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
                                {tier.strike}
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
