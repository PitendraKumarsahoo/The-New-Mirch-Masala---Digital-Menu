export interface MenuItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number | null;
  secondaryPrice?: number | null;
  description?: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  spicyLevel?: 1 | 2 | 3; // 1 = Mild, 2 = Medium, 3 = Spicy
  tags?: string[];
}

export interface Restaurant {
  restaurantId: string;
  restaurantName: string;
  tagline?: string;
  location?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  googleReviewUrl?: string;
  logo?: string;
}

export type MenuCategory =
  | 'All'
  | 'Popular'
  | 'Soup'
  | 'Salad'
  | 'Papad'
  | 'Pakoda'
  | 'Roll'
  | 'Noodles'
  | 'Fried Rice'
  | 'Vegetable'
  | 'Mushroom'
  | 'Paneer'
  | 'Chicken'
  | 'Mutton'
  | 'Prawn'
  | 'Fish'
  | 'Egg'
  | 'Tandoori'
  | 'Biryani'
  | 'Meals'
  | 'Soft Drinks'
  | (string & {});

export type DietaryFilter = 'all' | 'veg' | 'non-veg';

export type BottomNavTab = 'menu' | 'rewards' | 'review' | 'profile';

export interface RewardTier {
  strike: number;
  id: string;
  name: string;
  description: string;
  shortBadge: string;
  discountType: 'flat' | 'percentage' | 'special';
  discountAmount?: number; // e.g. 50, 20, 40
}

export interface Customer {
  customerId: string;
  restaurantId: string;
  name: string;
  mobile: string;
  phone: string; // normalized 10-digit mobile number alias
  password?: string;
  createdAt: string;
  totalVisits: number;
  currentVisits?: number;
  availableRewards: number;
  redeemedRewardIds?: string[];
  lastVisitDate?: string;
  lastVisitAt?: string;
  isActive: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Visit {
  visitId: string;
  customerId: string;
  restaurantId: string;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // hh:mm A
  verifiedBy: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface LoyaltyTransaction {
  transactionId: string;
  restaurantId: string;
  customerId: string;
  type: 'VISIT' | 'REWARD_REDEEM';
  visitDate: string;
  verifiedAt: string;
  verifiedBy: string;
  rewardId?: string;
  notes?: string;
}

export interface Reward {
  rewardId: string;
  restaurantId: string;
  rewardName: string;
  description: string;
  visitTarget: number;
  status: 'ACTIVE' | 'AVAILABLE' | 'REDEEMED' | 'EXPIRED';
  createdAt?: string;
  unlockedAt?: string;
}

export interface RewardRedemption {
  redemptionId: string;
  customerId: string;
  restaurantId: string;
  rewardName: string;
  redeemedAt: string;
  verifiedBy: string;
  status: 'REDEEMED';
}

export interface LoyaltyConfig {
  rewardVisitTarget?: number;
  visitsRequired: number; // 10 visits for reward
  rewardName: string;
  rewardDescription: string;
  rewardTiers?: RewardTier[];
}

export interface LoyaltyStatus {
  customer: Customer;
  totalVisits: number;
  currentVisits: number;
  currentStrikes?: number;
  progressVisits?: number;
  visitsRequired: number;
  remainingVisits: number;
  availableRewards: number;
  isRewardUnlocked: boolean;
  rewardName: string;
  rewardDescription: string;
  todayVisitStatus: 'NOT_RECORDED' | 'VERIFIED' | 'PENDING';
  lastVisitDateFormatted?: string;
  unlockedTiers?: RewardTier[];
  nextRewardTier?: RewardTier | null;
  remainingForNextReward?: number;
  config: LoyaltyConfig;
}

export interface RestaurantInfo {
  restaurantId?: string;
  name: string;
  subtitle: string;
  location: string;
  fullAddress?: string;
  statusText?: string;
  isOpen?: boolean;
  timings: string;
  phone: string;
  openingTime?: string;
  closingTime?: string;
  googleReviewUrl?: string;
  logo?: string;
  googleBusinessProfileConnected?: boolean;
  googleBusinessProfileAccountId?: string;
  googleBusinessProfileLocationId?: string;
}

export * from './types/review';
export * from './types/googleBusinessProfile';

