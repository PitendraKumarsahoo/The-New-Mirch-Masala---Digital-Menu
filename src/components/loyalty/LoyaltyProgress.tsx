import React from 'react';
import { Check, Gift, Sparkles, Percent, Utensils, Star, Clock } from 'lucide-react';
import { LoyaltyStatus } from '../../types';
import { REWARD_TIERS } from '../../config/loyaltyConfig';

interface LoyaltyProgressProps {
  loyalty: LoyaltyStatus;
}

export const LoyaltyProgress: React.FC<LoyaltyProgressProps> = ({ loyalty }) => {
  const {
    totalVisits,
    visitsRequired,
    progressVisits,
    remainingVisits,
    unlockedTiers,
    nextRewardTier,
    remainingForNextReward,
  } = loyalty;

  // Total strikes in cycle: 10
  const maxStrikes = visitsRequired || 10;
  const currentStrikes = progressVisits;

  // Helper to check if a specific strike is a milestone
  const getMilestoneInfo = (strikeNum: number) => {
    return REWARD_TIERS.find((t) => t.strike === strikeNum);
  };

  return (
    <div id="loyalty-progress-card" className="bg-white rounded-3xl border border-stone-200 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>10-Strike Milestone Journey</span>
          </div>
          <h3 className="text-base font-bold text-stone-900 mt-1.5 leading-snug">
            {currentStrikes >= 10
              ? 'All 10 Strikes Completed! 🎉'
              : nextRewardTier
              ? `${remainingForNextReward} more ${remainingForNextReward === 1 ? 'strike' : 'strikes'} for ${nextRewardTier.shortBadge}`
              : 'Keep dining to unlock rewards'}
          </h3>
        </div>

        <div className="text-right shrink-0">
          <span className="text-2xl font-black text-amber-600 leading-none">
            {currentStrikes}
            <span className="text-xs text-stone-400 font-semibold">/{maxStrikes}</span>
          </span>
          <span className="text-[10px] text-stone-500 block font-medium mt-0.5">
            Total Visits: {totalVisits}
          </span>
        </div>
      </div>

      {/* 10 Strike Grid (2 rows of 5) */}
      <div className="space-y-2 pt-1">
        {/* Row 1: Strikes 1 to 5 */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, idx) => {
            const strikeNum = idx + 1;
            const isCompleted = strikeNum <= currentStrikes;
            const milestone = getMilestoneInfo(strikeNum);
            const isMilestone = Boolean(milestone);

            return (
              <div key={strikeNum} className="flex flex-col items-center gap-1">
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 font-bold text-xs relative ${
                    isCompleted
                      ? isMilestone
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300'
                        : 'bg-amber-500 text-white shadow-xs'
                      : isMilestone
                      ? 'bg-amber-50 border-2 border-dashed border-amber-400 text-amber-700'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isMilestone ? (
                    <Gift className="w-4 h-4 text-amber-600" />
                  ) : (
                    <span>{strikeNum}</span>
                  )}

                  {isMilestone && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-orange-600 text-[8px] font-bold text-white shadow-xs">
                      ★
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold leading-none text-center ${
                    isMilestone
                      ? isCompleted
                        ? 'text-amber-700 font-black'
                        : 'text-amber-800'
                      : isCompleted
                      ? 'text-stone-700'
                      : 'text-stone-400'
                  }`}
                >
                  {isMilestone ? milestone?.shortBadge : `#${strikeNum}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Row 2: Strikes 6 to 10 */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {Array.from({ length: 5 }).map((_, idx) => {
            const strikeNum = idx + 6;
            const isCompleted = strikeNum <= currentStrikes;
            const milestone = getMilestoneInfo(strikeNum);
            const isMilestone = Boolean(milestone);

            return (
              <div key={strikeNum} className="flex flex-col items-center gap-1">
                <div
                  className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 font-bold text-xs relative ${
                    isCompleted
                      ? isMilestone
                        ? strikeNum === 10
                          ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-md ring-2 ring-orange-300'
                          : 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300'
                        : 'bg-amber-500 text-white shadow-xs'
                      : isMilestone
                      ? strikeNum === 10
                        ? 'bg-orange-50 border-2 border-dashed border-orange-500 text-orange-700'
                        : 'bg-amber-50 border-2 border-dashed border-amber-400 text-amber-700'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isMilestone ? (
                    strikeNum === 10 ? (
                      <Star className="w-4 h-4 text-orange-600 fill-orange-200" />
                    ) : (
                      <Percent className="w-4 h-4 text-amber-600" />
                    )
                  ) : (
                    <span>{strikeNum}</span>
                  )}

                  {isMilestone && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white shadow-xs">
                      ★
                    </span>
                  )}
                </div>

                <span
                  className={`text-[10px] font-bold leading-none text-center ${
                    isMilestone
                      ? isCompleted
                        ? 'text-orange-700 font-black'
                        : 'text-orange-800'
                      : isCompleted
                      ? 'text-stone-700'
                      : 'text-stone-400'
                  }`}
                >
                  {isMilestone ? milestone?.shortBadge : `#${strikeNum}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (currentStrikes / maxStrikes) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-stone-500 font-medium">
          <span>{currentStrikes} of {maxStrikes} strikes completed</span>
          <span>{unlockedTiers.length} Rewards Unlocked</span>
        </div>
      </div>

      {/* 3 Milestone Tier Summary Cards */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
          3 Milestone Reward Tiers
        </span>

        {REWARD_TIERS.map((tier) => {
          const isUnlocked = currentStrikes >= tier.strike || totalVisits >= tier.strike;
          const isRedeemed = loyalty.customer.redeemedRewardIds?.includes(tier.id);

          return (
            <div
              key={tier.id}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                isRedeemed
                  ? 'bg-stone-50 border-stone-200 opacity-75'
                  : isUnlocked
                  ? 'bg-amber-50/90 border-amber-300 shadow-xs'
                  : 'bg-stone-50/50 border-stone-200/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isRedeemed
                      ? 'bg-stone-200 text-stone-600'
                      : isUnlocked
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-stone-200 text-stone-400'
                  }`}
                >
                  {tier.strike === 5 ? (
                    <Gift className="w-4 h-4" />
                  ) : tier.strike === 7 ? (
                    <Percent className="w-4 h-4" />
                  ) : (
                    <Utensils className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-stone-900 leading-none">
                      {tier.name}
                    </h4>
                    <span className="text-[10px] font-bold text-stone-500">
                      (Strike {tier.strike})
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">
                    {tier.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pl-2">
                {isRedeemed ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                    REDEEMED
                  </span>
                ) : isUnlocked ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    UNLOCKED ✓
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                    {tier.strike - currentStrikes} left
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
