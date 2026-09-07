import { LoyaltyConfig, RewardTier } from '../types';

/**
 * REWARD MILESTONE TIERS:
 * 1. 5th Strike  => ₹50 OFF Bill Reward
 * 2. 7th Strike  => 20% Discount on Total Bill
 * 3. 10th Strike => Special Offer: 40% OFF or 1 Free Special Dish
 */
export const REWARD_TIERS: RewardTier[] = [
  {
    strike: 5,
    id: 'reward-tier-5',
    name: '₹50 OFF Dining Bill',
    description: 'Flat ₹50 discount on your dining bill',
    shortBadge: '₹50 OFF',
    discountType: 'flat',
    discountAmount: 50,
  },
  {
    strike: 7,
    id: 'reward-tier-7',
    name: '20% Bill Discount',
    description: '20% discount on your entire dining bill',
    shortBadge: '20% OFF',
    discountType: 'percentage',
    discountAmount: 20,
  },
  {
    strike: 10,
    id: 'reward-tier-10',
    name: 'Special: 40% OFF or Free Dish',
    description: '40% discount or 1 special dish free of choice',
    shortBadge: '40% OFF / Free Dish',
    discountType: 'special',
    discountAmount: 40,
  },
];

/**
 * LOYALTY RULE CONFIGURATION (Phase 4)
 * 1 verified restaurant visit = 1 loyalty visit.
 * Target: 10 verified visits = 1 reward
 */
export const rewardVisitTarget = 10;

export const LOYALTY_CONFIG: LoyaltyConfig = {
  rewardVisitTarget,
  visitsRequired: rewardVisitTarget,
  rewardName: 'Free Reward',
  rewardDescription: 'Available after 10 visits',
  rewardTiers: REWARD_TIERS,
};

export const STAFF_PASSCODE_DEFAULT = 'mirchowner123';


