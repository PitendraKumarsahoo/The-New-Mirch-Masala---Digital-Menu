import React, { useState, useEffect, useCallback } from 'react';
import { MenuItem, Customer, LoyaltyStatus, Visit, BottomNavTab } from '../../types';
import {
  getCustomerSession,
  clearCustomerSession,
  saveCustomerSession,
  getLoyaltyStatus,
  getDemoCustomers,
  loginCustomer,
  registerCustomer,
  normalizePhoneNumber,
} from '../../services/loyaltyService';
import {
  useCustomerPreferences,
  saveCustomerPreferences,
} from '../../services/customerProfileService';
import { CustomerPreferences } from '../../types/profile';
import { FavoriteDishesTab } from './FavoriteDishesTab';
import { SpicePreferencesTab } from './SpicePreferencesTab';
import { PastVisitsTab } from './PastVisitsTab';
import { ProfileAccountCard } from './ProfileAccountCard';
import { CustomerActivityHistory } from './CustomerActivityHistory';
import { ActivityLog } from './ActivityLog';
import {
  ChevronLeft,
  Heart,
  Flame,
  Clock,
  X,
  Phone,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Gift,
  Sparkles,
  Tag,
} from 'lucide-react';

export { CustomerActivityHistory, ActivityLog };

interface CustomerProfilePageProps {
  onBackToMenu: () => void;
  allMenuItems: MenuItem[];
  onSelectDish: (item: MenuItem) => void;
  onNavigateToTab: (tab: BottomNavTab) => void;
  initialSection?: 'favorites' | 'spice' | 'activity' | 'visits';
}

export const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({
  onBackToMenu,
  allMenuItems,
  onSelectDish,
  onNavigateToTab,
  initialSection = 'activity',
}) => {
  const [activeSection, setActiveSection] = useState<'favorites' | 'spice' | 'activity' | 'visits'>(
    initialSection || 'activity'
  );
  const [activityFilter, setActivityFilter] = useState<'all' | 'visits' | 'redemptions'>('all');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyStatus | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(true);

  // Quick Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const demoCustomers = getDemoCustomers();

  // Load customer session on mount
  const loadActiveCustomer = useCallback(async () => {
    setIsLoadingCustomer(true);
    const session = getCustomerSession();
    if (session && session.customerId) {
      try {
        const res = await getLoyaltyStatus(session.customerId, session.phone, session.restaurantId);
        if (res.success && res.customer) {
          setCustomer(res.customer);
          setLoyalty(res.loyalty || null);
          setVisits(res.recentVisits || []);
        }
      } catch {
        // Continue in local/offline mode
      }
    }
    setIsLoadingCustomer(false);
  }, []);

  useEffect(() => {
    loadActiveCustomer();
  }, [loadActiveCustomer]);

  // Hook for customer preferences (favorites, spice level, notes)
  const {
    preferences,
    favoriteDishIds,
    toggleFavorite,
    setSpiceLevel,
    setDietaryPreference,
    setSpecialInstructions,
  } = useCustomerPreferences(customer?.customerId);

  const handleLogout = () => {
    clearCustomerSession();
    setCustomer(null);
    setLoyalty(null);
    setVisits([]);
  };

  const handleSelectDemoCustomer = async (demo: Customer) => {
    saveCustomerSession({
      customerId: demo.customerId,
      phone: demo.phone || demo.mobile,
      name: demo.name,
      restaurantId: demo.restaurantId || 'mirch-masala-01',
    });
    setCustomer(demo);
    const res = await getLoyaltyStatus(demo.customerId, demo.phone, demo.restaurantId);
    if (res.success) {
      setLoyalty(res.loyalty || null);
      setVisits(res.recentVisits || []);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        const res = await registerCustomer(authName, authPhone, authPassword);
        if (!res.success) {
          setAuthError(res.error || 'Registration failed');
        } else if (res.customer) {
          setCustomer(res.customer);
          setLoyalty(res.loyalty || null);
          setIsAuthModalOpen(false);
          setAuthName('');
          setAuthPhone('');
          setAuthPassword('');
        }
      } else {
        const res = await loginCustomer(authPhone, authPassword);
        if (!res.success) {
          setAuthError(res.error || 'Login failed');
        } else if (res.customer) {
          setCustomer(res.customer);
          setLoyalty(res.loyalty || null);
          setIsAuthModalOpen(false);
          setAuthPhone('');
          setAuthPassword('');
          // Refresh visits
          const visitsRes = await getLoyaltyStatus(res.customer.customerId, res.customer.phone);
          if (visitsRes.success && visitsRes.recentVisits) {
            setVisits(visitsRes.recentVisits);
          }
        }
      }
    } catch (err: unknown) {
      setAuthError((err as Error)?.message || 'Operation failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-stone-50 pb-28">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToMenu}
            className="p-1 -ml-1 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
            title="Back to menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-stone-900 leading-tight">Customer Profile</h1>
            <p className="text-[11px] text-stone-500">The New Mirch Masala</p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-200/60">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>{favoriteDishIds.length} Saved</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 max-w-md mx-auto space-y-4">
        {/* Customer Identity / Header Card */}
        <ProfileAccountCard
          customer={customer}
          loyalty={loyalty}
          onLogout={handleLogout}
          onOpenLoginModal={() => {
            setAuthError(null);
            setIsAuthModalOpen(true);
          }}
          onSelectDemoCustomer={handleSelectDemoCustomer}
          demoCustomers={demoCustomers}
        />

        {/* 3-Section Navigation Segment */}
        <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-stone-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSection('activity')}
            className={`py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'activity' || activeSection === 'visits'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Activity</span>
            {(customer?.totalVisits || visits.length) > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  activeSection === 'activity' || activeSection === 'visits'
                    ? 'bg-white/25 text-white'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {customer?.totalVisits || visits.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('favorites')}
            className={`py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'favorites'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                activeSection === 'favorites' ? 'fill-white' : 'text-rose-500 fill-rose-500'
              }`}
            />
            <span>Favorites</span>
            {favoriteDishIds.length > 0 && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                  activeSection === 'favorites'
                    ? 'bg-white/25 text-white'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {favoriteDishIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('spice')}
            className={`py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeSection === 'spice'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                activeSection === 'spice' ? 'fill-white' : 'text-orange-500 fill-orange-500'
              }`}
            />
            <span>Spice</span>
          </button>
        </div>

        {/* Section Viewports */}
        {activeSection === 'favorites' && (
          <FavoriteDishesTab
            favoriteIds={favoriteDishIds}
            allMenuItems={allMenuItems}
            onToggleFavorite={toggleFavorite}
            onSelectDish={onSelectDish}
            onBrowseMenu={onBackToMenu}
          />
        )}

        {activeSection === 'spice' && (
          <SpicePreferencesTab
            preferences={preferences}
            onSavePreferences={(updated) => {
              saveCustomerPreferences(updated, customer?.customerId);
            }}
          />
        )}

        {(activeSection === 'activity' || activeSection === 'visits') && (
          <div className="space-y-4">
            {/* Section that distinguishes between 'Verified Visits' and 'Reward Redemptions' using distinct icon indicators */}
            <section
              id="activity-distinction-guide-section"
              className="bg-white rounded-3xl border border-stone-200/80 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Activity Distinction
                  </h3>
                </div>
                <span className="text-[10px] text-stone-400 font-medium">
                  Dining & Rewards Guide
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Verified Visits Distinction Indicator */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActivityFilter('visits')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActivityFilter('visits');
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                    activityFilter === 'visits'
                      ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
                      : 'bg-emerald-50/40 border-emerald-100 hover:bg-emerald-50/70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Distinct Emerald Shield Icon Indicator */}
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                          <span>Verified Visits</span>
                        </h4>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-200/80 text-emerald-900">
                          {customer?.totalVisits ?? visits.length}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800/85 mt-0.5 leading-snug">
                        Authenticated dine-in visits stamped by restaurant staff. Each visit awards 1 strike toward discount milestones.
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Staff Authenticated • Anti-Fraud Checked</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Reward Redemptions Distinction Indicator */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setActivityFilter('redemptions')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActivityFilter('redemptions');
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all text-left cursor-pointer ${
                    activityFilter === 'redemptions'
                      ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs'
                      : 'bg-amber-50/40 border-amber-100 hover:bg-amber-50/70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Distinct Amber Gift Icon Indicator */}
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1">
                          <span>Reward Redemptions</span>
                        </h4>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-200/80 text-amber-900">
                          Claimed
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800/85 mt-0.5 leading-snug">
                        Milestone vouchers claimed & applied during dining billing (₹50 OFF, 20% OFF, or Free Special Dish).
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-amber-700">
                        <Tag className="w-3 h-3 text-amber-600" />
                        <span>Voucher Code Tracked • Instant Savings</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ActivityLog Component (implements skeleton loader while fetching) */}
            <ActivityLog
              customer={customer}
              loyalty={loyalty}
              restaurantId="mirch-masala-01"
              activeFilter={activityFilter}
              onFilterChange={setActivityFilter}
              onGoToRewards={() => onNavigateToTab('rewards')}
              onSelectDemoCustomer={handleSelectDemoCustomer}
              onOpenLoginModal={() => {
                setAuthError(null);
                setIsAuthModalOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* Auth Modal (Quick Login / Register) */}
      {isAuthModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-900">
                {authMode === 'login' ? 'Customer Sign In' : 'Create Customer Profile'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab toggle */}
            <div className="grid grid-cols-2 gap-1 bg-stone-100 p-1 rounded-xl mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError(null);
                }}
                className={`py-1.5 rounded-lg transition-colors ${
                  authMode === 'login' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError(null);
                }}
                className={`py-1.5 rounded-lg transition-colors ${
                  authMode === 'register' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  10-Digit Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {authLoading
                  ? 'Verifying...'
                  : authMode === 'login'
                  ? 'Sign In to Profile'
                  : 'Create Profile Account'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
