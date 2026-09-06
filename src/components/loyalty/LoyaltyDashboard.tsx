import React, { useState } from 'react';
import {
  User,
  Phone,
  Copy,
  Check,
  RefreshCw,
  LogOut,
  ShieldCheck,
  CalendarCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { Customer, LoyaltyStatus, Visit } from '../../types';
import { LoyaltyProgress } from './LoyaltyProgress';
import { RewardCard } from './RewardCard';
import { VisitHistory } from './VisitHistory';
import { formatPhoneForDisplay, getLoyaltyStatus } from '../../services/loyaltyService';

interface LoyaltyDashboardProps {
  customer: Customer;
  loyalty: LoyaltyStatus;
  recentVisits: Visit[];
  onLogout: () => void;
  onOpenStaffModal?: () => void;
  onUpdateData: (customer: Customer, loyalty: LoyaltyStatus, visits: Visit[]) => void;
}

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({
  customer,
  loyalty,
  recentVisits,
  onLogout,
  onOpenStaffModal,
  onUpdateData,
}) => {
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(customer.customerId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await getLoyaltyStatus(customer.customerId, customer.phone, customer.restaurantId);
      if (res.success && res.customer && res.loyalty) {
        onUpdateData(res.customer, res.loyalty, res.recentVisits || []);
      }
    } catch {
      // Ignore network hiccup
    } finally {
      setRefreshing(false);
    }
  };

  const isVerifiedToday = loyalty.todayVisitStatus === 'VERIFIED';

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Customer Profile Header */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
              {customer.name ? customer.name.charAt(0).toUpperCase() : 'M'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-bold text-stone-900 leading-tight">{customer.name}</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                  DINER
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{formatPhoneForDisplay(customer.phone)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh loyalty strikes"
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onLogout}
              title="Sign Out or Change Mobile Number"
              className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-600 hover:text-red-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-stone-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Member ID & Persistent Session Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between bg-stone-50 rounded-xl p-2.5 border border-stone-200">
            <div className="flex items-center gap-1.5 text-stone-600">
              <span className="font-semibold text-stone-700">Member ID:</span>
              <span className="font-mono font-bold text-stone-900">{customer.customerId.slice(0, 10)}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Auto-login active on this phone</span>
          </div>
        </div>
      </div>

      {/* Today's Dine-In Strike Banner */}
      <div
        id="today-visit-status"
        className={`rounded-3xl p-4 border flex items-start gap-3 transition-all ${
          isVerifiedToday
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isVerifiedToday ? 'bg-emerald-500 text-white shadow-sm' : 'bg-amber-500 text-white shadow-sm'
          }`}
        >
          {isVerifiedToday ? <CalendarCheck className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {isVerifiedToday ? '1 Strike Recorded Today' : 'Today’s Dine-In Visit'}
            </h4>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isVerifiedToday ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {isVerifiedToday ? 'VALIDATED ✓' : '1 STRIKE PENDING'}
            </span>
          </div>

          <p className="text-xs mt-1 leading-relaxed">
            {isVerifiedToday
              ? 'Your dining visit for today has been verified. 1 strike has been added to your milestone ladder.'
              : 'Dining with us right now? Show your number (+91 ' + customer.phone + ') to staff at billing to verify 1 strike!'}
          </p>

          {!isVerifiedToday && onOpenStaffModal && (
            <button
              type="button"
              onClick={onOpenStaffModal}
              className="mt-2 text-xs font-bold text-amber-800 underline hover:text-amber-950 inline-flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff Verification Terminal</span>
            </button>
          )}
        </div>
      </div>

      {/* 10-Strike Milestone Progress Ladder */}
      <LoyaltyProgress loyalty={loyalty} />

      {/* Active Milestone Vouchers Card */}
      <RewardCard loyalty={loyalty} />

      {/* Verified Visits History */}
      <VisitHistory visits={recentVisits} />

      {/* Footer Switch Account Option */}
      <div className="pt-2 p-3 rounded-2xl bg-stone-100/80 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
        <div>
          <span className="font-semibold block text-stone-800">Need to change mobile number?</span>
          <span className="text-[11px] text-stone-500">Sign out will let you enter any other number or account.</span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 font-bold text-xs text-stone-800 shadow-xs cursor-pointer transition-colors"
        >
          Sign Out / Change
        </button>
      </div>
    </div>
  );
};
