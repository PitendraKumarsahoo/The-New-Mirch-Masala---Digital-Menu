import React, { useState } from 'react';
import {
  Gift,
  Phone,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  Users,
} from 'lucide-react';
import {
  registerCustomer,
  loginCustomer,
  normalizePhoneNumber,
  getDemoCustomers,
} from '../../services/loyaltyService';
import { findStaffAccount, STAFF_ACCOUNTS, StaffAccount } from '../../config/staffAccounts';
import { Customer, LoyaltyStatus } from '../../types';

interface LoyaltyRegistrationProps {
  onSuccess: (customer: Customer, loyalty: LoyaltyStatus, isNew?: boolean) => void;
  onStaffLoginSuccess: (staff: StaffAccount) => void;
  defaultStaffMode?: boolean;
}

export const LoyaltyRegistration: React.FC<LoyaltyRegistrationProps> = ({
  onSuccess,
  onStaffLoginSuccess,
  defaultStaffMode = false,
}) => {
  // Main view mode: 'customer' or 'staff'
  const [activePortal, setActivePortal] = useState<'customer' | 'staff'>(
    defaultStaffMode ? 'staff' : 'customer'
  );

  // Customer sub-tab: 'register' or 'login'
  const [customerMode, setCustomerMode] = useState<'register' | 'login'>('register');

  // Customer Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Staff Form State
  const [staffId, setStaffId] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick test demo diners
  const demoCustomers = getDemoCustomers();

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    if (!password || password.trim().length < 4) {
      setError('Please enter a password with at least 4 characters.');
      return;
    }

    setLoading(true);
    try {
      if (customerMode === 'register') {
        const trimmedName = name.trim();
        if (!trimmedName || trimmedName.length < 2) {
          setError('Please enter your full name (minimum 2 characters).');
          setLoading(false);
          return;
        }
        const res = await registerCustomer(trimmedName, cleanPhone, password.trim());
        if (res.success && res.customer && res.loyalty) {
          onSuccess(res.customer, res.loyalty, res.isNew);
        } else {
          setError(res.error || 'Unable to create account. Please try again.');
        }
      } else {
        const res = await loginCustomer(cleanPhone, password.trim());
        if (res.success && res.customer && res.loyalty) {
          onSuccess(res.customer, res.loyalty, false);
        } else {
          setError(res.error || 'Invalid phone or password.');
        }
      }
    } catch {
      setError('Connection error. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = staffId.trim();
    const cleanPwd = staffPassword.trim();

    if (!cleanId) {
      setError('Please enter your Staff or Owner ID / Username.');
      return;
    }
    if (!cleanPwd) {
      setError('Please enter your Staff / Owner password.');
      return;
    }

    const matched = findStaffAccount(cleanId, cleanPwd);
    if (matched) {
      try {
        sessionStorage.setItem('mirch_staff_account', JSON.stringify(matched));
      } catch {
        // ignore
      }
      onStaffLoginSuccess(matched);
    } else {
      setError('Invalid Owner/Staff ID or Password. Please verify your credentials.');
    }
  };

  // Quick fill staff demo credentials
  const handleQuickFillStaff = (staff: StaffAccount) => {
    setStaffId(staff.id);
    setStaffPassword(staff.password);
    setError(null);
  };

  // Quick login demo diner
  const handleQuickDiner = async (diner: Customer) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginCustomer(diner.phone, diner.password || 'password123');
      if (res.success && res.customer && res.loyalty) {
        onSuccess(res.customer, res.loyalty, false);
      }
    } catch {
      setError('Unable to switch demo customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Top Selector: Customer Account vs Owner/Staff Login */}
      <div className="bg-stone-100 p-1 rounded-2xl flex items-center shadow-inner">
        <button
          type="button"
          onClick={() => {
            setActivePortal('customer');
            setError(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activePortal === 'customer'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <User className="w-3.5 h-3.5 text-amber-600" />
          <span>Customer Rewards</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActivePortal('staff');
            setError(null);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activePortal === 'staff'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
          <span>Owner & Staff Portal</span>
        </button>
      </div>

      {/* CUSTOMER PORTAL VIEW */}
      {activePortal === 'customer' && (
        <div className="space-y-4">
          {/* Rewards Milestones Banner */}
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold text-white uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-200" />
                The New Mirch Masala Dining Strikes
              </div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                Dine In. Earn Strikes.<br />Unlock 3 Milestone Offers!
              </h2>

              {/* 3 Milestone Badges */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-black/20 backdrop-blur-xs rounded-xl p-2 text-center border border-white/15">
                  <span className="text-[10px] font-bold text-amber-200 uppercase block">5 Strikes</span>
                  <span className="text-xs font-black text-white leading-tight block">₹50 OFF</span>
                  <span className="text-[9px] text-stone-200">Dining Bill</span>
                </div>
                <div className="bg-black/20 backdrop-blur-xs rounded-xl p-2 text-center border border-white/15">
                  <span className="text-[10px] font-bold text-amber-200 uppercase block">7 Strikes</span>
                  <span className="text-xs font-black text-white leading-tight block">20% OFF</span>
                  <span className="text-[9px] text-stone-200">Total Bill</span>
                </div>
                <div className="bg-black/20 backdrop-blur-xs rounded-xl p-2 text-center border border-white/15">
                  <span className="text-[10px] font-bold text-amber-200 uppercase block">10 Strikes</span>
                  <span className="text-xs font-black text-white leading-tight block">40% / FREE</span>
                  <span className="text-[9px] text-stone-200">Special Dish</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-100/90 pt-1">
                ✓ 1 verified strike per dine-in visit each day. Instant auto-login on this phone.
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* Customer Auth Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            {/* Toggle Create Account vs Sign In */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {customerMode === 'register' ? 'Create Diner Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-stone-500">
                  {customerMode === 'register'
                    ? 'Enter details & password to track strikes & rewards'
                    : 'Sign in with your phone & password'}
                </p>
              </div>

              <div className="flex bg-stone-100 p-0.5 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('register');
                    setError(null);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    customerMode === 'register' ? 'bg-white text-amber-600 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerMode('login');
                    setError(null);
                  }}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    customerMode === 'login' ? 'bg-white text-amber-600 shadow-xs' : 'text-stone-500'
                  }`}
                >
                  Sign In
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCustomerSubmit} className="space-y-3.5">
              {/* Full Name (Only when Registering) */}
              {customerMode === 'register' && (
                <div>
                  <label
                    htmlFor="customer-name"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
                  >
                    Your Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-stone-400" />
                    </div>
                    <input
                      id="customer-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Number */}
              <div>
                <label
                  htmlFor="customer-phone"
                  className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="w-4 h-4 text-stone-400" />
                  </div>
                  <span className="absolute inset-y-0 left-9 flex items-center text-xs font-bold text-stone-500 pointer-events-none">
                    +91
                  </span>
                  <input
                    id="customer-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhone(val);
                    }}
                    placeholder="9876543210"
                    maxLength={10}
                    required
                    className="w-full pl-17 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="customer-password"
                    className="block text-xs font-bold text-stone-700 uppercase tracking-wider"
                  >
                    Password
                  </label>
                  <span className="text-[11px] text-stone-400">Min 4 characters</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-stone-400" />
                  </div>
                  <input
                    id="customer-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Auto-saved: you won't need to re-enter password tomorrow on this phone!</span>
                </p>
              </div>

              <button
                id="btn-customer-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-3"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {customerMode === 'register'
                        ? 'Create Account & Start Earning'
                        : 'Sign In to My Rewards'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Diners (Instant Testing of 5th, 7th, 10th strikes) */}
            {demoCustomers.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  <span>Fast Demo Diner Logins</span>
                  <span className="text-[10px] text-amber-700 font-normal">Click to test milestones</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {demoCustomers.map((d) => (
                    <button
                      key={d.customerId}
                      type="button"
                      onClick={() => handleQuickDiner(d)}
                      className="p-2 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-left transition-colors cursor-pointer group"
                    >
                      <span className="font-bold text-xs text-stone-900 group-hover:text-amber-900 block truncate">
                        {d.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-700 block">
                        {d.totalVisits} Strikes
                      </span>
                      <span className="text-[9px] text-stone-500 block truncate">
                        {d.totalVisits === 4 ? 'Next: ₹50 OFF' : d.totalVisits === 6 ? 'Next: 20% OFF' : 'Next: 40% OFF'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OWNER & STAFF PORTAL VIEW */}
      {activePortal === 'staff' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-slate-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Authorized Staff Terminal
              </div>
              <h2 className="text-xl font-black tracking-tight leading-tight">
                Owner & Staff Verification
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Log in with your Staff or Owner ID & password to verify customer dining visits (1 strike/day) and redeem customer reward discounts.
              </p>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900">Sign In with ID & Password</h3>
              <p className="text-xs text-stone-500">
                Use your preset Owner or Staff account credentials.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStaffSubmit} className="space-y-3.5">
              {/* Staff ID / Username */}
              <div>
                <label
                  htmlFor="staff-id"
                  className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
                >
                  Owner / Staff ID (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-stone-400" />
                  </div>
                  <input
                    id="staff-id"
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="e.g. rajesh or vikram or pooja"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 transition-colors"
                  />
                </div>
              </div>

              {/* Staff Password */}
              <div>
                <label
                  htmlFor="staff-password"
                  className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="w-4 h-4 text-stone-400" />
                  </div>
                  <input
                    id="staff-password"
                    type={showStaffPassword ? 'text' : 'password'}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-500/20 focus:border-stone-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowStaffPassword(!showStaffPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-staff-submit"
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Enter Verification Terminal</span>
              </button>
            </form>

            {/* Preset Credentials Help Box for 2 to 3 Owner / Staff */}
            <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-stone-500" />
                  <span>Preset Accounts (1-Click Fill)</span>
                </span>
                <span className="text-[10px] text-stone-400 font-normal">Created for testing</span>
              </div>

              <div className="space-y-1.5">
                {STAFF_ACCOUNTS.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => handleQuickFillStaff(account)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-left flex items-center justify-between transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900 group-hover:text-amber-600">
                          {account.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${account.badgeColor}`}>
                          {account.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                        ID: <span className="font-bold text-stone-800">{account.id}</span> • PWD: <span className="text-stone-700">{account.password}</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg group-hover:bg-amber-100">
                      Use
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
