import { LoyaltyConfig, RewardTier, ReviewOfferConfig } from '../types';

/**
 * DEFAULT REWARD MILESTONE TIERS (Fully customizable by Admin/Owner):
 * 1. 10th Strike => Free Cold Drink / Beverage
 * 2. 20th Strike => 20% Discount on Total Bill
 * 3. 30th Strike => Special Offer: 40% OFF or 1 Free Special Dish
 */
export const DEFAULT_REWARD_TIERS: RewardTier[] = [
  {
    strike: 10,
    id: 'reward-tier-10',
    name: 'Free Chilled Cold Drink',
    description: '1 complimentary chilled cold drink of your choice with your meal',
    shortBadge: 'Free Cold Drink',
    discountType: 'free_item',
    freeItemName: 'Cold Drink',
    isActive: true,
  },
  {
    strike: 20,
    id: 'reward-tier-20',
    name: '20% Bill Discount',
    description: '20% discount on your entire dining bill',
    shortBadge: '20% OFF',
    discountType: 'percentage',
    discountAmount: 20,
    isActive: true,
  },
  {
    strike: 30,
    id: 'reward-tier-30',
    name: 'Special: 40% OFF or Free Dish',
    description: '40% discount or 1 special dish free of choice',
    shortBadge: '40% OFF / Free Dish',
    discountType: 'special',
    discountAmount: 40,
    isActive: true,
  },
];

/**
 * DEFAULT REVIEW OFFER CONFIGURATION:
 * Admin/Owner can fully customize what offer/perk is given on the Review Page
 */
export const DEFAULT_REVIEW_OFFER: ReviewOfferConfig = {
  isEnabled: true,
  title: 'Google Review Special Perk',
  rewardType: 'free_item',
  rewardValue: 'Free Chilled Cold Drink',
  description: 'Share your dining feedback on Google to enjoy 1 Free Cold Drink at billing!',
  terms: 'Show verified Google review screen to staff before bill generation.',
  badgeText: 'FREE COLD DRINK',
};

// Backwards-compatible export for existing components
export const REWARD_TIERS: RewardTier[] = [...DEFAULT_REWARD_TIERS];

/**
 * LOYALTY RULE CONFIGURATION (Customizable up to 10, 20, 30 strikes)
 * 1 verified restaurant visit = 1 strike.
 * Target: Max strikes in cycle (defaults to 30)
 */
export const rewardVisitTarget = 30;

export const LOYALTY_CONFIG: LoyaltyConfig = {
  rewardVisitTarget,
  visitsRequired: rewardVisitTarget,
  rewardName: 'Dining Strikes Milestone Rewards',
  rewardDescription: 'Unlock Free Cold Drinks, 20% OFF, and 40% OFF as you dine',
  rewardTiers: DEFAULT_REWARD_TIERS,
  reviewOffer: DEFAULT_REVIEW_OFFER,
};

export const STAFF_PASSCODE_DEFAULT = 'mirchowner123';



