import { MenuItem, Visit, RewardTier, Customer } from '../types';

export type AdminRole = 'OWNER' | 'MANAGER' | 'STAFF';

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
  restaurantId: string;
  title: string;
  email?: string;
  phone?: string;
}

export interface AdminMenuItem {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  secondaryPrice?: number | null;
  description?: string;
  image?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular: boolean;
}

export interface AdminCustomerSummary {
  customerId: string;
  restaurantId: string;
  name: string;
  mobile: string;
  phone?: string;
  createdAt: string;
  totalVisits: number;
  currentVisits: number;
  availableRewards: number;
  lastVisitDate?: string;
  isActive: boolean;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AdminCustomerDetails {
  customer: AdminCustomerSummary;
  visits: Visit[];
  rewards: {
    unlocked: number;
    redeemed: number;
    available: number;
    list: Array<{
      rewardId: string;
      rewardName: string;
      description?: string;
      visitTarget?: number;
      unlockedAt?: string;
      status: string;
    }>;
  };
  reviews: Array<{
    reviewId: string;
    rating: number;
    feedback: string;
    createdAt: string;
    status: string;
  }>;
}

export interface AdminVisitRecord {
  visitId: string;
  customerId: string;
  customerName?: string;
  mobile?: string;
  restaurantId: string;
  visitDate: string; // YYYY-MM-DD
  visitTime: string; // hh:mm a
  verifiedBy: string;
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
}

export interface AdminRewardItem {
  rewardId: string;
  restaurantId: string;
  rewardName: string;
  rewardDescription: string;
  requiredVisits: number;
  isActive: boolean;
  status?: string;
  createdAt?: string;
}

export interface AdminReviewRecord {
  reviewId: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  rating: number;
  topics: string[];
  feedback: string;
  createdAt: string;
  googleReviewUrl?: string;
  status: 'submitted_internal' | 'google_redirected' | 'google_failed' | string;
}

export interface AdminRestaurantSettings {
  restaurantId: string;
  restaurantName: string;
  tagline: string;
  location: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  googleReviewUrl: string;
  logo: string;
}

export interface AdminDashboardStats {
  totalCustomers: number;
  todayVisits: number;
  totalVisits: number;
  activeRewards: number;
  totalReviews: number;
  averageRating: number;
  weeklyVisits: number;
  monthlyVisits: number;
  newCustomersThisMonth: number;
  rewardsUnlocked: number;
  rewardsRedeemed: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  visitsLast7Days: Array<{
    date: string;
    count: number;
  }>;
}
