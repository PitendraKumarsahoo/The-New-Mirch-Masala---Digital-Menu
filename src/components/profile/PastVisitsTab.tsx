import React from 'react';
import { Customer, LoyaltyStatus, Visit } from '../../types';
import { ShieldCheck, Calendar, Clock, Gift, Info, UserCheck, ArrowRight } from 'lucide-react';

interface PastVisitsTabProps {
  customer?: Customer | null;
  loyalty?: LoyaltyStatus | null;
  visits: Visit[];
  onGoToRewards: () => void;
  onSelectDemoCustomer?: (customer: Customer) => void;
  onOpenLoginModal: () => void;
}

export const PastVisitsTab: React.FC<PastVisitsTabProps> = ({
  customer,
  loyalty,
  visits,
  onGoToRewards,
  onOpenLoginModal,
}) => {
  const isGuest = !customer;
  const totalVisits = customer?.totalVisits ?? visits.length;

  return (
    <div className="space-y-4">
      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Total Visits
          </span>
          <span className="text-xl font-black text-stone-900 mt-0.5 block">
            {totalVisits}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">
            Verified Dine-Ins
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Reward Strikes
          </span>
          <span className="text-xl font-black text-orange-600 mt-0.5 block">
            {loyalty ? loyalty.currentVisits : totalVisits % 10}/10
          </span>
          <span className="text-[10px] text-orange-600 font-semibold">
            Progress to Discount
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-stone-200/80 p-3.5 shadow-xs text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Available Rewards
          </span>
          <span className="text-xl font-black text-amber-600 mt-0.5 block">
            {loyalty?.unlockedTiers?.length || 0}
          </span>
          <button
            type="button"
            onClick={onGoToRewards}
            className="text-[10px] text-amber-700 font-bold hover:underline cursor-pointer"
          >
            View Vouchers →
          </button>
        </div>
      </div>

      {/* Guest Mode Banner */}
      {isGuest && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Currently Browsing as Guest</span>
          </div>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            Sign in with your mobile number to link your verified dining visits and claim 10-strike reward vouchers.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Sign In / Link Mobile</span>
            </button>
          </div>
        </div>
      )}

      {/* Visit List Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-stone-900">Dine-In Visit Log</h3>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {visits.length} {visits.length === 1 ? 'visit' : 'visits'}
          </span>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-8 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-stone-700">No visits logged yet</h4>
            <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Whenever you dine at The New Mirch Masala, present your phone number to the service staff to collect your strike!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {visits.map((visit, idx) => (
              <div
                key={visit.visitId || idx}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/60">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-stone-900">
                      {visit.visitDate}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{visit.visitTime || 'Dine-In'}</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px]">
                        {visit.verifiedBy || 'Staff'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    VERIFIED
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Anti-Fraud / Fair Visit Policy */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-start gap-2.5 text-[11px] text-stone-600">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-stone-800">Fair Visit Policy:</span> A maximum of 1 verified dine-in visit is logged per customer per calendar day (Asia/Kolkata).
          </p>
        </div>
      </div>

      {/* Rewards Link Banner */}
      <div
        role="button"
        tabIndex={0}
        onClick={onGoToRewards}
        className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-4 text-white flex items-center justify-between shadow-md cursor-pointer hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white">Customer Rewards Program</h4>
            <p className="text-[11px] text-orange-100">
              {loyalty?.nextRewardTier
                ? `Next: ${loyalty.nextRewardTier.name} in ${loyalty.remainingForNextReward || 1} visits`
                : 'Unlock ₹50 OFF, 20% & 40% OFF vouchers'}
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </div>
  );
};
