import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Customer, LoyaltyStatus, Visit, RewardRedemption } from '../../types';
import { fetchCustomerActivityHistory } from '../../services/loyaltyService';
import {
  ShieldCheck,
  Gift,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Info,
  UserCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award,
} from 'lucide-react';

export interface ActivityLogProps {
  customer?: Customer | null;
  loyalty?: LoyaltyStatus | null;
  restaurantId?: string;
  activeFilter?: 'all' | 'visits' | 'redemptions';
  onFilterChange?: (filter: 'all' | 'visits' | 'redemptions') => void;
  onGoToRewards?: () => void;
  onOpenLoginModal?: () => void;
  onSelectDemoCustomer?: (customer: Customer) => void;
  initialVisits?: Visit[];
  initialRedemptions?: RewardRedemption[];
}

export type ActivityFilterType = 'all' | 'visits' | 'redemptions';

interface UnifiedActivityItem {
  id: string;
  type: 'visit' | 'redemption';
  timestamp: string;
  dateFormatted: string;
  timeFormatted: string;
  title: string;
  description: string;
  badgeLabel: string;
  verifiedBy?: string;
  code?: string;
  strikeNumber?: number;
}

/**
 * Skeleton Loader Component for ActivityLog
 * Precisely mirrors the real layout (KPI strip + Header + Filter Buttons + 4 Activity Cards)
 * to completely eliminate layout shifts during asynchronous data loading.
 */
export const ActivityLogSkeleton: React.FC = () => {
  return (
    <div
      className="space-y-4 animate-pulse"
      id="activity-log-skeleton-loader"
      aria-label="Loading activity history"
    >
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-2xs text-center space-y-2"
          >
            <div className="h-2.5 w-16 bg-stone-200 rounded mx-auto" />
            <div className="h-6 w-10 bg-stone-200 rounded mx-auto" />
            <div className="h-2.5 w-14 bg-stone-200 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Main Card Skeleton */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="space-y-1.5">
            <div className="h-4 w-44 bg-stone-200 rounded" />
            <div className="h-3 w-56 bg-stone-100 rounded" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-stone-200" />
        </div>

        {/* Filter Segment Skeleton */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 bg-stone-200 rounded-lg" />
          ))}
        </div>

        {/* List Items Skeleton (4 rows) */}
        <div className="space-y-3 pt-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-3 rounded-2xl border border-stone-100 bg-stone-50/50 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1">
                {/* Icon Placeholder */}
                <div className="w-10 h-10 rounded-xl bg-stone-200 shrink-0" />
                {/* Text Lines */}
                <div className="space-y-2 flex-1 pt-0.5">
                  <div className="h-3.5 w-36 bg-stone-200 rounded" />
                  <div className="h-2.5 w-48 bg-stone-200/80 rounded" />
                  <div className="h-2 w-32 bg-stone-100 rounded" />
                </div>
              </div>
              {/* Badge Placeholder */}
              <div className="w-20 h-6 rounded-full bg-stone-200 shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ActivityLog: React.FC<ActivityLogProps> = ({
  customer,
  loyalty,
  restaurantId = 'mirch-masala-01',
  activeFilter,
  onFilterChange,
  onGoToRewards,
  onOpenLoginModal,
  initialVisits,
  initialRedemptions,
}) => {
  const [internalFilter, setInternalFilter] = useState<ActivityFilterType>('all');
  const [visits, setVisits] = useState<Visit[]>(initialVisits || []);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>(initialRedemptions || []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const currentFilter = activeFilter ?? internalFilter;
  const handleFilterSelect = (filter: ActivityFilterType) => {
    setInternalFilter(filter);
    if (onFilterChange) onFilterChange(filter);
  };

  const isGuest = !customer;

  // Asynchronous Fetch logic
  const loadActivityData = useCallback(async () => {
    if (!customer?.customerId && !customer?.phone) {
      setVisits([]);
      setRedemptions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchCustomerActivityHistory(
        customer.customerId,
        customer.phone || customer.mobile,
        restaurantId
      );

      if (res.success) {
        setVisits(res.visits || []);
        setRedemptions(res.redemptions || []);
        setLastRefreshed(new Date());
      } else {
        setError(res.error || 'Failed to retrieve activity log.');
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Unable to fetch recent activity history.');
    } finally {
      setIsLoading(false);
    }
  }, [customer?.customerId, customer?.phone, customer?.mobile, restaurantId]);

  useEffect(() => {
    loadActivityData();
  }, [loadActivityData]);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Convert visits and redemptions into unified list
  const activityItems: UnifiedActivityItem[] = useMemo(() => {
    const list: UnifiedActivityItem[] = [];

    // Map Visits with distinct verified visit properties
    visits.forEach((v, index) => {
      list.push({
        id: v.visitId || `visit-${index}`,
        type: 'visit',
        timestamp: `${v.visitDate} ${v.visitTime || '12:00 PM'}`,
        dateFormatted: v.visitDate,
        timeFormatted: v.visitTime || 'Dine-In',
        title: 'Verified Dine-In Visit',
        description: `Authenticated by ${v.verifiedBy || 'Service Staff'} • +1 Strike Earned`,
        badgeLabel: 'VERIFIED',
        verifiedBy: v.verifiedBy,
        strikeNumber: visits.length - index,
      });
    });

    // Map Redemptions with distinct reward redemption properties
    redemptions.forEach((r, index) => {
      const parts = r.redeemedAt.split(' ');
      const datePart = parts[0] || 'Recently';
      const timePart = parts.slice(1).join(' ') || 'Completed';

      list.push({
        id: r.redemptionId || `redemption-${index}`,
        type: 'redemption',
        timestamp: r.redeemedAt,
        dateFormatted: datePart,
        timeFormatted: timePart,
        title: r.rewardName || 'Reward Voucher Redeemed',
        description: `Applied at dine-in billing • Verified by ${r.verifiedBy || 'Staff'}`,
        badgeLabel: 'REDEEMED',
        verifiedBy: r.verifiedBy,
        code: r.redemptionId,
      });
    });

    // Chronological sort: newest first
    list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return list;
  }, [visits, redemptions]);

  const filteredItems = useMemo(() => {
    if (currentFilter === 'visits') return activityItems.filter((i) => i.type === 'visit');
    if (currentFilter === 'redemptions') return activityItems.filter((i) => i.type === 'redemption');
    return activityItems;
  }, [activityItems, currentFilter]);

  const totalVisitsCount = customer?.totalVisits ?? visits.length;
  const totalRedemptionsCount = redemptions.length;

  // If loading, display the dedicated skeleton loader to prevent layout shifts
  if (isLoading) {
    return <ActivityLogSkeleton />;
  }

  return (
    <div className="space-y-4" id="activity-log-component">
      {/* Activity Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-2">
        {/* Verified Visits Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleFilterSelect('visits')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFilterSelect('visits');
            }
          }}
          className={`rounded-2xl border p-3 text-center transition-all cursor-pointer ${
            currentFilter === 'visits'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-400/40 shadow-xs'
              : 'bg-white border-stone-200/80 shadow-2xs hover:border-emerald-200'
          }`}
        >
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Verified Visits
          </span>
          <span className="text-lg font-black text-emerald-700 mt-0.5 block">
            {totalVisitsCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Stamps</span>
          </span>
        </div>

        {/* Reward Redemptions Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleFilterSelect('redemptions')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFilterSelect('redemptions');
            }
          }}
          className={`rounded-2xl border p-3 text-center transition-all cursor-pointer ${
            currentFilter === 'redemptions'
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
              : 'bg-white border-stone-200/80 shadow-2xs hover:border-amber-200'
          }`}
        >
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Redemptions
          </span>
          <span className="text-lg font-black text-amber-600 mt-0.5 block">
            {totalRedemptionsCount}
          </span>
          <span className="text-[10px] text-amber-700 font-bold flex items-center justify-center gap-1">
            <Gift className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Claimed</span>
          </span>
        </div>

        {/* Strike Progress Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onGoToRewards && onGoToRewards()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (onGoToRewards) onGoToRewards();
            }
          }}
          className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-2xs text-center cursor-pointer hover:border-orange-200 transition-colors"
        >
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Next Reward
          </span>
          <span className="text-lg font-black text-orange-600 mt-0.5 block">
            {loyalty ? loyalty.currentVisits : totalVisitsCount % 10}/10
          </span>
          <span className="text-[10px] text-orange-600 font-semibold flex items-center justify-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            <span>Strikes</span>
          </span>
        </div>
      </div>

      {/* Guest Banner if not signed in */}
      {isGuest && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sign In to Track Activity</span>
          </div>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            Link your mobile number to view every past dine-in visit date, staff verification stamp, and redeemed voucher history.
          </p>
          {onOpenLoginModal && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Sign In / Create Account</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Activity Container */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header with Title and Refresh Button */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Activity & History</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {lastRefreshed
                ? `Updated ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'All verified visits and redeemed reward vouchers'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadActivityData}
            disabled={isGuest}
            title="Refresh activity history"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Segmented Controls */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => handleFilterSelect('all')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              currentFilter === 'all'
                ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({activityItems.length})
          </button>

          <button
            type="button"
            onClick={() => handleFilterSelect('visits')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
              currentFilter === 'visits'
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Visits ({visits.length})</span>
          </button>

          <button
            type="button"
            onClick={() => handleFilterSelect('redemptions')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1 ${
              currentFilter === 'redemptions'
                ? 'bg-white text-amber-800 shadow-2xs font-extrabold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Gift className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Vouchers ({redemptions.length})</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center justify-between border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadActivityData}
              className="text-[11px] font-bold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Activity List */}
        {filteredItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            {currentFilter === 'redemptions' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-amber-100/60 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Gift className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-stone-700">No Rewards Redeemed Yet</h4>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Dine at The New Mirch Masala to earn strikes! Reach 5 strikes for ₹50 OFF, 7 strikes for 20% OFF, and 10 strikes for a Free Dish or 40% OFF.
                </p>
                {onGoToRewards && (
                  <button
                    type="button"
                    onClick={onGoToRewards}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    <span>View Rewards Milestone</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : currentFilter === 'visits' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-stone-700">No Verified Visits Found</h4>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Provide your mobile number to the restaurant cashier or waiter when dining in to receive your verified visit stamp.
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-stone-200/60 text-stone-400 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-stone-700">No Activity Recorded Yet</h4>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Your verified dine-in dates and redeemed reward vouchers will appear here.
                </p>
              </>
            )}
          </div>
        ) : (
          /* Rendered Items with Distinct Icon Indicators */
          <div className="space-y-2.5 divide-y divide-stone-100">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-left"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Distinct Icon Indicator:
                      Verified Visit -> ShieldCheck in emerald container
                      Reward Redemption -> Gift in amber/purple container */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border shadow-2xs ${
                      item.type === 'visit'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-2 ring-emerald-500/10'
                        : 'bg-amber-50 text-amber-700 border-amber-200/80 ring-2 ring-amber-500/10'
                    }`}
                  >
                    {item.type === 'visit' ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Gift className="w-5 h-5 text-amber-600" />
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-stone-900 leading-tight">
                        {item.title}
                      </h4>
                      {item.type === 'redemption' && item.code && (
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.code!)}
                          title="Copy Voucher Code"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[10px] font-mono text-stone-700 transition-colors cursor-pointer"
                        >
                          <span>{item.code}</span>
                          {copiedCode === item.code ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 text-stone-400" />
                          )}
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-stone-700">
                        {item.dateFormatted}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {item.timeFormatted}
                      </span>
                    </div>

                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Distinct Status Badges */}
                <div className="shrink-0 text-right">
                  {item.type === 'visit' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      REDEEMED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verification Rules Footnote */}
        <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200/70 flex items-start gap-2 text-[11px] text-stone-600">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-stone-800">Fair Dining Policy:</span> Each visit requires staff authentication at the restaurant. Maximum 1 strike per calendar day (Asia/Kolkata timezone).
          </p>
        </div>
      </div>

      {/* Rewards Navigation Banner */}
      {onGoToRewards && (
        <div
          role="button"
          tabIndex={0}
          onClick={onGoToRewards}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onGoToRewards();
            }
          }}
          className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-4 text-white flex items-center justify-between shadow-md cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Customer Rewards Program
              </h4>
              <p className="text-[11px] text-orange-100">
                {loyalty?.nextRewardTier
                  ? `Next: ${loyalty.nextRewardTier.name} in ${loyalty.remainingForNextReward || 1} visits`
                  : 'Unlock ₹50 OFF, 20% & 40% OFF vouchers'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
