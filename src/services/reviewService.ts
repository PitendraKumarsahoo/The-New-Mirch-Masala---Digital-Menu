/**
 * Phase 5 - Review Service
 * 
 * Handles internal customer feedback submission, validation,
 * local resilience storage, and one-click Google Review redirect.
 */

import { Review, ReviewSubmissionInput, ReviewTopic, GoogleReviewConfig } from '../types/review';
import { API_BASE_URL } from '../config/api';
import { getCustomerSession } from './loyaltyService';
import { fetchGoogleReviewUrl } from './googleBusinessProfileService';

const LOCAL_REVIEWS_STORAGE_KEY = 'mirch_reviews_local_db_v1';

export const REVIEW_TOPICS: ReviewTopic[] = [
  'Great Taste',
  'Fresh Food',
  'Good Service',
  'Friendly Staff',
  'Clean Restaurant',
  'Good Value',
  'Nice Ambience',
  'Fast Service',
];

interface LocalReviewsDB {
  reviews: Review[];
  googleReviewUrlCache?: Record<string, string>;
}

function getLocalReviewsDB(): LocalReviewsDB {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { reviews: [] };
  }
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_STORAGE_KEY);
    if (!raw) {
      const init: LocalReviewsDB = {
        reviews: [
          {
            reviewId: 'REV-INIT-01',
            restaurantId: 'mirch-masala-01',
            customerId: 'CUS-AMIT88',
            customerName: 'Amit Sharma',
            rating: 5,
            topics: ['Great Taste', 'Fresh Food'],
            feedback: 'The Chicken Biryani and Tandoori Chicken are absolutely incredible. Best food in Gunupur!',
            createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
            googleReviewUrl: 'https://maps.google.com',
            status: 'submitted_internal',
          },
        ],
      };
      localStorage.setItem(LOCAL_REVIEWS_STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return { reviews: [] };
  }
}

function saveLocalReviewsDB(db: LocalReviewsDB): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_REVIEWS_STORAGE_KEY, JSON.stringify(db));
  }
}

/**
 * Retrieves the Google Review URL configuration for a restaurant.
 * Checks the Google Sheet / Restaurant row.
 */
export async function getGoogleReviewConfig(
  restaurantId = 'mirch-masala-01'
): Promise<GoogleReviewConfig> {
  let fetchedUrl = '';
  let isConnected = false;
  let accountId = '';
  let locationId = '';

  try {
    const url = `${API_BASE_URL}?action=getGoogleReviewConfig&restaurantId=${encodeURIComponent(
      restaurantId
    )}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        fetchedUrl = (data.googleReviewUrl || '').trim();
        isConnected = Boolean(data.businessProfileConnected);
        accountId = data.businessProfileAccountId;
        locationId = data.businessProfileLocationId;
      }
    }
  } catch {
    // Network/offline: fall back to cached
    const db = getLocalReviewsDB();
    if (db.googleReviewUrlCache && db.googleReviewUrlCache[restaurantId]) {
      fetchedUrl = db.googleReviewUrlCache[restaurantId];
    }
  }

  // If not yet resolved from Apps Script or cache, use fetchGoogleReviewUrl
  if (!fetchedUrl) {
    try {
      const fallbackConfig = await fetchGoogleReviewUrl(restaurantId);
      if (fallbackConfig.googleReviewUrl) {
        fetchedUrl = fallbackConfig.googleReviewUrl;
        if (fallbackConfig.businessProfileConnected) {
          isConnected = fallbackConfig.businessProfileConnected;
        }
      }
    } catch {
      // Ignore
    }
  }

  // Cache url locally
  if (fetchedUrl) {
    const db = getLocalReviewsDB();
    if (!db.googleReviewUrlCache) db.googleReviewUrlCache = {};
    db.googleReviewUrlCache[restaurantId] = fetchedUrl;
    saveLocalReviewsDB(db);
  }

  return {
    restaurantId,
    googleReviewUrl: fetchedUrl,
    isConfigured: Boolean(fetchedUrl && fetchedUrl.length > 0),
    businessProfileConnected: isConnected,
    businessProfileAccountId: accountId,
    businessProfileLocationId: locationId,
  };
}

/**
 * Validates and submits customer review internally.
 * Sets status: 'submitted_internal'
 */
export async function submitReview(
  input: ReviewSubmissionInput
): Promise<{
  success: boolean;
  review?: Review;
  googleReviewUrl?: string;
  isConfigured?: boolean;
  error?: string;
}> {
  const restaurantId = (input.restaurantId || 'mirch-masala-01').trim();
  const rating = Number(input.rating);
  const feedback = (input.feedback || '').trim();
  const topics = Array.isArray(input.topics) ? input.topics.slice(0, 10) : [];

  // Validation Rules
  if (!rating || isNaN(rating) || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return {
      success: false,
      error: 'Please select a valid rating between 1 and 5 stars.',
    };
  }

  if (feedback.length > 1000) {
    return {
      success: false,
      error: 'Feedback exceeds the maximum limit of 1000 characters.',
    };
  }

  // Associate customer
  const session = getCustomerSession();
  const customerId = input.customerId || session?.customerId || 'GUEST-DINER';
  const customerName = (input.customerName || session?.name || 'Valued Diner').trim();

  // Get Google Review URL from configuration
  const config = await getGoogleReviewConfig(restaurantId);
  const googleReviewUrl = config.googleReviewUrl || '';

  // Generate Review entity
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const reviewId = `REV-${Date.now()}-${randomSuffix}`;
  const createdAt = new Date().toISOString();

  const newReview: Review = {
    reviewId,
    restaurantId,
    customerId,
    customerName,
    rating,
    topics,
    feedback,
    createdAt,
    googleReviewUrl,
    status: 'submitted_internal',
  };

  // 1. Send to Apps Script Web App API
  try {
    const apiUrl = `${API_BASE_URL}?action=submitReview`;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        restaurantId,
        customerId,
        customerName,
        rating,
        topics,
        feedback,
        googleReviewUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.review) {
        newReview.reviewId = data.review.reviewId || newReview.reviewId;
        newReview.googleReviewUrl = data.review.googleReviewUrl || newReview.googleReviewUrl;
      }
    }
  } catch {
    // Offline resilience: proceeds with local copy
  }

  // 2. Persist in local storage
  const db = getLocalReviewsDB();
  db.reviews.unshift(newReview);
  saveLocalReviewsDB(db);

  return {
    success: true,
    review: newReview,
    googleReviewUrl: newReview.googleReviewUrl,
    isConfigured: Boolean(newReview.googleReviewUrl),
  };
}

/**
 * Updates review status when the customer clicks "Post on Google"
 * Sets status: 'google_redirected'
 * NEVER claims 'google_posted' or 'google_confirmed'
 */
export async function markReviewRedirected(
  reviewId: string,
  restaurantId = 'mirch-masala-01'
): Promise<{ success: boolean; error?: string }> {
  if (!reviewId) return { success: false, error: 'reviewId is required' };

  // 1. Update in local storage
  const db = getLocalReviewsDB();
  const target = db.reviews.find((r) => r.reviewId === reviewId);
  if (target) {
    target.status = 'google_redirected';
    saveLocalReviewsDB(db);
  }

  // 2. Send update to Apps Script API
  try {
    const url = `${API_BASE_URL}?action=updateReviewStatus`;
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        reviewId,
        restaurantId,
        status: 'google_redirected',
      }),
    });
  } catch {
    // offline
  }

  return { success: true };
}

/**
 * Retrieves past reviews for a customer
 */
export async function getCustomerReviews(
  customerId: string,
  restaurantId = 'mirch-masala-01'
): Promise<{ success: boolean; reviews: Review[]; error?: string }> {
  if (!customerId) return { success: true, reviews: [] };

  try {
    const url = `${API_BASE_URL}?action=getCustomerReviews&customerId=${encodeURIComponent(
      customerId
    )}&restaurantId=${encodeURIComponent(restaurantId)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.reviews)) {
        return { success: true, reviews: data.reviews };
      }
    }
  } catch {
    // fallback to local
  }

  const db = getLocalReviewsDB();
  const matched = db.reviews.filter(
    (r) =>
      r.customerId === customerId &&
      (!r.restaurantId || r.restaurantId === restaurantId)
  );

  return { success: true, reviews: matched };
}
