/**
 * Architecture definitions for future Google Business Profile API integration.
 *
 * NOTE: The official Google Business Profile API allows business managers
 * to retrieve reviews and post replies (accounts.locations.reviews).
 * It does NOT allow automated creation of customer reviews on behalf of consumers.
 * Customer reviews must be submitted directly by users via the official Google review URL.
 */

export interface GoogleBusinessProfileAccount {
  name: string; // accounts/{accountId}
  accountName: string;
  type: 'PERSONAL' | 'LOCATION_GROUP' | 'ORGANIZATION';
  verificationState?: 'VERIFIED' | 'UNVERIFIED';
}

export interface GoogleBusinessProfileLocation {
  name: string; // locations/{locationId}
  storeCode?: string;
  title: string;
  address?: {
    addressLines: string[];
    locality: string;
    postalCode: string;
    administrativeArea: string;
  };
  metadata?: {
    mapsUri?: string;
    newReviewUri?: string; // Direct official review URL
  };
}

export interface GoogleBusinessReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
    isAnonymous?: boolean;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface GoogleBusinessConnectionState {
  restaurantId: string;
  isConnected: boolean;
  accountId?: string;
  locationId?: string;
  locationTitle?: string;
  officialReviewUri?: string;
  lastSyncTime?: string;
}
