import React from 'react';
import { Tag, Sparkles, CheckCircle, Clock, Gift, Percent, Utensils } from 'lucide-react';
import { LoyaltyStatus } from '../../types';

interface RewardCardProps {
  loyalty: LoyaltyStatus;
}

export const RewardCard: React.FC<RewardCardProps> = ({ loyalty }) => {
  const { unlockedTiers, availableRewards, nextRewardTier, remainingForNextReward } = loyalty;
  const hasRewards = availableRewards > 0;

  return (
    <div
      id="reward-summary-card"
      className={`rounded-3xl border p-5 transition-all ${
        hasRewards
          ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg border-amber-400'
          : 'bg-white border-stone-200 text-stone-900 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Tag className={`w-4 h-4 ${hasRewards ? 'text-amber-200' : 'text-amber-600'}`} />
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                hasRewards ? 'text-amber-100' : 'text-stone-500'
              }`}
            >
              Your Milestone Rewards
            </span>
          </div>

          <h3 className="text-xl font-black leading-tight">
            {hasRewards
              ? `${availableRewards} Active Reward ${availableRewards === 1 ? 'Voucher' : 'Vouchers'}`
              : 'Rewards Progress'}
          </h3>

          <p className={`text-xs ${hasRewards ? 'text-amber-100/90' : 'text-stone-500'} max-w-xs`}>
            {hasRewards
              ? 'Present your phone number to restaurant staff during billing to apply your discount.'
              : nextRewardTier
              ? `Complete ${remainingForNextReward} more dine-in visit(s) to unlock ${nextRewardTier.name}.`
              : 'Dine in and earn 1 strike per day.'}
          </p>
        </div>

        <div
          className={`px-3 py-1.5 rounded-full text-xs font-bold text-center shrink-0 ${
            hasRewards ? 'bg-white text-amber-700 shadow-sm' : 'bg-stone-100 text-stone-600'
          }`}
        >
          {hasRewards ? `${availableRewards} Available` : 'In Progress'}
        </div>
      </div>

      {/* Unlocked Active Voucher Pills */}
      {hasRewards && (
        <div className="mt-3.5 pt-3 border-t border-white/20 space-y-2">
          <span className="text-[10px] font-bold text-amber-100 uppercase tracking-wider block">
            Ready to Redeem at Billing:
          </span>
          <div className="space-y-1.5">
            {unlockedTiers.map((tier) => (
              <div
                key={tier.id}
                className="bg-black/20 backdrop-blur-xs rounded-xl p-2.5 flex items-center justify-between border border-white/20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    {tier.strike === 5 ? (
                      <Gift className="w-3.5 h-3.5 text-white" />
                    ) : tier.strike === 7 ? (
                      <Percent className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Utensils className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block leading-none">
                      {tier.name}
                    </span>
                    <span className="text-[10px] text-amber-200">
                      Strike {tier.strike} Milestone
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-bold bg-white text-orange-700 px-2.5 py-0.5 rounded-full shadow-xs">
                  {tier.shortBadge}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer info */}
      <div
        className={`mt-3.5 pt-2.5 border-t text-xs flex items-center justify-between ${
          hasRewards ? 'border-amber-400/50 text-amber-100' : 'border-stone-100 text-stone-500'
        }`}
      >
        <div className="flex items-center gap-1.5 text-[11px]">
          {hasRewards ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" />
              <span>Valid for dine-in billing verification</span>
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Milestones: 5 strikes (₹50 OFF) • 7 strikes (20% OFF) • 10 strikes (40% OFF / Free Dish)</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
