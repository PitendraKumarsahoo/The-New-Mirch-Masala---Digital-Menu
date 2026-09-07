/**
 * Phase 5 - Review Types & Interfaces
 */

export type ReviewStatus =
  | 'submitted_internal'
  | 'google_redirected'
  | 'google_failed'
  | 'google_confirmed';

export interface Review {
  reviewId: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1 to 5 stars
  topics: string[];
  feedback: string;
  createdAt: string; // ISO format
  googleReviewUrl: string;
  status: ReviewStatus;
  wasAutoOpened?: boolean;
}

export interface ReviewSubmissionInput {
  restaurantId: string;
  customerId?: string;
  customerName?: string;
  rating: number; // 1 to 5
  topics?: string[];
  feedback?: string;
  autoPostToGoogle?: boolean;
}

export interface GoogleReviewConfig {
  restaurantId: string;
  googleReviewUrl: string;
  isConfigured: boolean;
  businessProfileConnected?: boolean;
  businessProfileAccountId?: string;
  businessProfileLocationId?: string;
}

export type ReviewTopic =
  | 'Great Taste'
  | 'Fresh Food'
  | 'Good Service'
  | 'Friendly Staff'
  | 'Clean Restaurant'
  | 'Good Value'
  | 'Nice Ambience'
  | 'Fast Service';
