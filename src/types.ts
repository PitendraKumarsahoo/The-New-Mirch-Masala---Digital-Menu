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
  name: string;
  phone: string;
  password?: string;
  restaurantId: string;
  createdAt: string;
  totalVisits: number;
  availableRewards: number;
  redeemedRewardIds?: string[];
  lastVisitAt?: string;
  status: 'ACTIVE' | 'INACTIVE';
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

export interface Reward {
  rewardId: string;
  customerId: string;
  restaurantId: string;
  rewardName: string;
  strikeRequired?: number;
  unlockedAt: string;
  status: 'AVAILABLE' | 'REDEEMED' | 'EXPIRED';
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
  visitsRequired: number; // 10 visits/strikes for full cycle
  rewardName: string;
  rewardDescription: string;
  rewardTiers: RewardTier[];
}

export interface LoyaltyStatus {
  customer: Customer;
  totalVisits: number;
  visitsRequired: number;
  progressVisits: number; // 1 to 10
  remainingVisits: number;
  availableRewards: number;
  unlockedTiers: RewardTier[];
  nextRewardTier?: RewardTier | null;
  remainingForNextReward: number;
  isRewardUnlocked: boolean;
  todayVisitStatus: 'NOT_RECORDED' | 'VERIFIED' | 'PENDING';
  lastVisitDateFormatted?: string;
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
}
