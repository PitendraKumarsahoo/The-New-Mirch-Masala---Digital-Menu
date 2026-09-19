import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Customer, LoyaltyStatus, Visit, RewardRedemption } from '../../types';
import { fetchCustomerActivityHistory } from '../../services/loyaltyService';
import {
  Calendar,
  Gift,
  ShieldCheck,
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
  Tag,
  AlertCircle,
} from 'lucide-react';

interface CustomerActivityHistoryProps {
  customer?: Customer | null;
  loyalty?: LoyaltyStatus | null;
  restaurantId?: string;
  onGoToRewards?: () => void;
  onOpenLoginModal?: () => void;
  onSelectDemoCustomer?: (customer: Customer) => void;
}

type FilterTab = 'all' | 'visits' | 'redemptions';

interface TimelineItem {
  id: string;
  type: 'visit' | 'redemption';
  timestamp: string; // ISO or date string for sorting
  dateFormatted: string;
  timeFormatted: string;
  title: string;
  subtitle: string;
  badge: string;
  verifiedBy?: string;
  meta?: {
    code?: string;
    strikeNumber?: number;
    rewardTierId?: string;
  };
}

export const CustomerActivityHistory: React.FC<CustomerActivityHistoryProps> = ({
  customer,
  loyalty,
  restaurantId = 'mirch-masala-01',
  onGoToRewards,
  onOpenLoginModal,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const isGuest = !customer;

  // Active fetch logic
  const loadActivity = useCallback(async () => {
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
        setError(res.error || 'Failed to load activity log.');
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Unable to fetch recent activity history.');
    } finally {
      setIsLoading(false);
    }
  }, [customer?.customerId, customer?.phone, customer?.mobile, restaurantId]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const handleCopyCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Merge visits and redemptions into unified timeline
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];

    // Map visits
    visits.forEach((v, index) => {
      items.push({
        id: v.visitId || `vis-${index}`,
        type: 'visit',
        timestamp: `${v.visitDate} ${v.visitTime || '12:00 PM'}`,
        dateFormatted: v.visitDate,
        timeFormatted: v.visitTime || 'Dine-In',
        title: 'Verified Dine-In Visit',
        subtitle: `Stamp verified by ${v.verifiedBy || 'Service Staff'}`,
        badge: 'Verified Visit',
        verifiedBy: v.verifiedBy,
        meta: {
          strikeNumber: visits.length - index,
        },
      });
    });

    // Map redemptions
    redemptions.forEach((r, index) => {
      // parse redeemedAt
      const parts = r.redeemedAt.split(' ');
      const datePart = parts[0] || 'Recently';
      const timePart = parts.slice(1).join(' ') || 'Completed';

      items.push({
        id: r.redemptionId || `red-${index}`,
        type: 'redemption',
        timestamp: r.redeemedAt,
        dateFormatted: datePart,
        timeFormatted: timePart,
        title: r.rewardName || 'Reward Voucher Redeemed',
        subtitle: `Applied at dine-in billing • Verified by ${r.verifiedBy || 'Cashier'}`,
        badge: 'Reward Claimed',
        verifiedBy: r.verifiedBy,
        meta: {
          code: r.redemptionId,
        },
      });
    });

    // Sort descending by timestamp
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return items;
  }, [visits, redemptions]);

  // Filtered list
  const displayedItems = useMemo(() => {
    if (filter === 'visits') return timelineItems.filter((i) => i.type === 'visit');
    if (filter === 'redemptions') return timelineItems.filter((i) => i.type === 'redemption');
    return timelineItems;
  }, [timelineItems, filter]);

  const totalVisitsCount = customer?.totalVisits ?? visits.length;
  const totalRedemptionsCount = redemptions.length;

  return (
    <div className="space-y-4" id="customer-activity-history-container">
      {/* Activity Summary KPI Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Dine-In Visits
          </span>
          <span className="text-lg font-black text-stone-900 mt-0.5 block">
            {totalVisitsCount}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-0.5">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Redemptions
          </span>
          <span className="text-lg font-black text-amber-600 mt-0.5 block">
            {totalRedemptionsCount}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold flex items-center justify-center gap-0.5">
            <Gift className="w-3 h-3" />
            Claimed
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/80 p-3 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Strike Progress
          </span>
          <span className="text-lg font-black text-orange-600 mt-0.5 block">
            {loyalty ? loyalty.currentVisits : totalVisitsCount % 10}/10
          </span>
          <span className="text-[10px] text-orange-600 font-semibold flex items-center justify-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            To Discount
          </span>
        </div>
      </div>

      {/* Guest Notice */}
      {isGuest && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sign In to Track Activity</span>
          </div>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            Link your mobile number to see every past dine-in visit date, staff verification stamp, and redeemed voucher history.
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

      {/* Main Activity Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Header & Controls */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Activity & Redemption History</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {lastRefreshed
                ? `Updated ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Verified dining visits and reward vouchers'}
            </p>
          </div>

          <button
            type="button"
            onClick={loadActivity}
            disabled={isLoading || isGuest}
            title="Refresh activity history"
            className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
        </div>

        {/* Filter Segmented Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-stone-100/80 p-1 rounded-xl text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Activity ({timelineItems.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('visits')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              filter === 'visits'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Visits ({visits.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('redemptions')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
              filter === 'redemptions'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Vouchers ({redemptions.length})
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
              onClick={loadActivity}
              className="text-[11px] font-bold underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="py-8 space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-3 rounded-2xl border border-stone-100 bg-stone-50/60 animate-pulse flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 bg-stone-200 rounded-sm" />
                  <div className="h-2.5 w-1/2 bg-stone-200 rounded-sm" />
                </div>
                <div className="w-16 h-5 bg-stone-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : displayedItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-8 px-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            {filter === 'redemptions' ? (
              <>
                <Gift className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-stone-700">No Rewards Redeemed Yet</h4>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Earn strikes by dining in at The New Mirch Masala. Reach 5 strikes for ₹50 OFF, 7 strikes for 20% OFF, or 10 strikes for 40% OFF or a Free Dish!
                </p>
                {onGoToRewards && (
                  <button
                    type="button"
                    onClick={onGoToRewards}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                  >
                    <span>View Reward Tiers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : filter === 'visits' ? (
              <>
                <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-stone-700">No Visits Recorded</h4>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Every time you dine in at the restaurant, provide your mobile number to the staff to receive your verified visit stamp.
                </p>
              </>
            ) : (
              <>
                <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-stone-700">No Activity Yet</h4>
                <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  Your visit dates and voucher redemptions will appear here once verified by our staff.
                </p>
              </>
            )}
          </div>
        ) : (
          /* Timeline Activity List */
          <div className="space-y-2.5 divide-y divide-stone-100">
            {displayedItems.map((item) => (
              <div
                key={item.id}
                className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-left"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Type Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      item.type === 'visit'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100/70'
                        : 'bg-amber-50 text-amber-700 border-amber-100/70'
                    }`}
                  >
                    {item.type === 'visit' ? (
                      <Calendar className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Gift className="w-4 h-4 text-amber-700" />
                    )}
                  </div>

                  {/* Content Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-bold text-stone-900 leading-tight">
                        {item.title}
                      </h4>
                      {item.type === 'redemption' && item.meta?.code && (
                        <button
                          type="button"
                          onClick={() => handleCopyCode(item.meta!.code!)}
                          title="Copy Redemption Code"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-[10px] font-mono text-stone-600 transition-colors cursor-pointer"
                        >
                          <span>{item.meta.code}</span>
                          {copiedCode === item.meta.code ? (
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

                    <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="shrink-0 text-right">
                  {item.type === 'visit' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                      <CheckCircle2 className="w-3 h-3 text-amber-600" />
                      REDEEMED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fair Dining Policy Footnote */}
        <div className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200/70 flex items-start gap-2 text-[11px] text-stone-600">
          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <span className="font-semibold text-stone-800">Visit & Voucher Verification:</span> All dine-in visits and discount vouchers are authenticated by authorized staff at The New Mirch Masala. Max 1 verified strike per calendar day (Asia/Kolkata timezone).
          </p>
        </div>
      </div>

      {/* Quick Jump to Rewards */}
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
              <Gift className="w-5 h-5 text-white" />
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
