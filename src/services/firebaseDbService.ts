/**
 * Firebase Firestore Cloud Database Service
 * The New Mirch Masala — Digital Menu, Ordering & Loyalty Platform
 * 
 * Provides cloud data persistence, automatic seed synchronization,
 * and real-time listeners for Vercel, local development, and cloud hosting.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { MenuItem, RestaurantInfo, Customer, Visit, LoyaltyConfig, RewardTier, ReviewOfferConfig } from '../types';
import { MENU_ITEMS, RESTAURANT_INFO } from '../data/menuData';
import { LOYALTY_CONFIG, DEFAULT_REWARD_TIERS, DEFAULT_REVIEW_OFFER } from '../config/loyaltyConfig';
import { PlacedOrder } from './orderHistoryService';
import { Review } from '../types/review';

// ----------------------------------------------------------------------
// Collections References
// ----------------------------------------------------------------------
export const COLLECTIONS = {
  MENU: 'menuItems',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  VISITS: 'visits',
  REWARDS: 'rewards',
  REDEMPTIONS: 'redemptions',
  REVIEWS: 'reviews',
  SETTINGS: 'restaurantSettings',
};

// ----------------------------------------------------------------------
// 1. MENU MANAGEMENT & AUTO-SEEDING
// ----------------------------------------------------------------------

/**
 * Loads menu items from Firestore. If the collection is empty,
 * it automatically seeds from MENU_ITEMS so the app works immediately.
 */
export async function fetchMenuItemsFromFirestore(): Promise<{
  menu: MenuItem[];
  restaurant: RestaurantInfo;
  source: 'firestore' | 'fallback';
}> {
  try {
    const menuRef = collection(db, COLLECTIONS.MENU);
    const snap = await getDocs(menuRef);

    if (snap.empty) {
      console.log('[Firestore] Menu collection is empty. Auto-seeding initial menu items...');
      // Seed initial menu items in background
      seedMenuItemsToFirestore().catch((err) =>
        console.warn('[Firestore] Background seeding warning:', err)
      );
      return {
        menu: MENU_ITEMS,
        restaurant: RESTAURANT_INFO,
        source: 'fallback',
      };
    }

    const menu: MenuItem[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      menu.push({
        id: docSnap.id,
        name: data.name || '',
        category: data.category || 'Special',
        subCategory: data.subCategory,
        description: data.description || '',
        price: data.price !== undefined ? data.price : null,
        secondaryPrice: data.secondaryPrice !== undefined ? data.secondaryPrice : null,
        isVeg: Boolean(data.isVeg),
        isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
        status: data.status,
        isPopular: Boolean(data.isPopular),
        image: data.image || '',
        spicyLevel: data.spicyLevel,
      });
    });

    // Fetch restaurant settings
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'config');
    const settingsSnap = await getDoc(settingsRef);
    const restaurant: RestaurantInfo = settingsSnap.exists()
      ? (settingsSnap.data() as RestaurantInfo)
      : RESTAURANT_INFO;

    return {
      menu: menu.length > 0 ? menu : MENU_ITEMS,
      restaurant,
      source: 'firestore',
    };
  } catch (error) {
    console.warn('[Firestore] Error fetching menu from Firestore, using local fallback:', error);
    return {
      menu: MENU_ITEMS,
      restaurant: RESTAURANT_INFO,
      source: 'fallback',
    };
  }
}

/**
 * Seeds all menu items into Firestore
 */
export async function seedMenuItemsToFirestore(): Promise<void> {
  try {
    for (const item of MENU_ITEMS) {
      const itemRef = doc(db, COLLECTIONS.MENU, item.id);
      await setDoc(itemRef, { ...item, updatedAt: serverTimestamp() }, { merge: true });
    }
    // Also seed restaurant info
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'config');
    await setDoc(settingsRef, { ...RESTAURANT_INFO, updatedAt: serverTimestamp() }, { merge: true });
    console.log('[Firestore] Menu items and settings successfully seeded!');
  } catch (error) {
    console.error('[Firestore] Failed seeding menu items:', error);
  }
}

/**
 * Updates a single menu item in Firestore (e.g. from Admin dashboard)
 */
export async function updateMenuItemInFirestore(
  itemId: string,
  updates: Partial<MenuItem>
): Promise<boolean> {
  try {
    const itemRef = doc(db, COLLECTIONS.MENU, itemId);
    await setDoc(itemRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.error(`[Firestore] Failed to update menu item ${itemId}:`, error);
    return false;
  }
}

/**
 * Directly updates the price and optional secondary price of a menu item in Firestore `menuItems/{itemId}`
 */
export async function updateMenuItemPriceDirectlyInFirestore(
  itemId: string,
  price: number,
  secondaryPrice?: number | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const itemRef = doc(db, COLLECTIONS.MENU, itemId);
    const updatePayload: Record<string, any> = {
      price,
      updatedAt: serverTimestamp(),
    };
    if (secondaryPrice !== undefined) {
      updatePayload.secondaryPrice = secondaryPrice;
    }
    await setDoc(itemRef, updatePayload, { merge: true });
    console.log(`[Firestore] Successfully updated price for item ${itemId} to ₹${price}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Firestore] Direct price update failed for item ${itemId}:`, err);
    return { success: false, error: err?.message || 'Failed to update price in Firestore' };
  }
}

/**
 * Subscribes to live menu item changes in Firestore
 */
export function subscribeToMenuItems(callback: (items: MenuItem[]) => void): Unsubscribe {
  const menuRef = collection(db, COLLECTIONS.MENU);
  return onSnapshot(
    menuRef,
    (snap) => {
      if (snap.empty) {
        callback(MENU_ITEMS);
        return;
      }
      const items: MenuItem[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          name: data.name || '',
          category: data.category || 'Special',
          subCategory: data.subCategory,
          description: data.description || '',
          price: data.price !== undefined ? data.price : null,
          secondaryPrice: data.secondaryPrice !== undefined ? data.secondaryPrice : null,
          isVeg: Boolean(data.isVeg),
          isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
          status: data.status,
          isPopular: Boolean(data.isPopular),
          image: data.image || '',
          spicyLevel: data.spicyLevel,
        });
      });
      callback(items);
    },
    (err) => {
      console.warn('[Firestore] Live menu subscription notice:', err);
    }
  );
}

// ----------------------------------------------------------------------
// 2. ORDER HISTORY & KITCHEN ORDERS
// ----------------------------------------------------------------------

/**
 * Saves a new placed order into Firestore
 */
export async function saveOrderToFirestore(order: PlacedOrder): Promise<boolean> {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, order.orderId);
    await setDoc(
      orderRef,
      {
        ...order,
        syncedToCloud: true,
        cloudCreatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.warn('[Firestore] Could not save order to Firestore directly:', error);
    return false;
  }
}

/**
 * Updates order status in Firestore
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: string,
  extra?: Record<string, any>
): Promise<boolean> {
  try {
    const orderRef = doc(db, COLLECTIONS.ORDERS, orderId);
    await updateDoc(orderRef, {
      status,
      statusUpdatedAt: new Date().toISOString(),
      ...(extra || {}),
    });
    return true;
  } catch (error) {
    console.warn(`[Firestore] Could not update order ${orderId}:`, error);
    return false;
  }
}

/**
 * Subscribes to live orders in Firestore with client-side timestamp sorting
 */
export function subscribeToOrders(callback: (orders: PlacedOrder[]) => void): Unsubscribe {
  const ordersRef = collection(db, COLLECTIONS.ORDERS);
  return onSnapshot(
    ordersRef,
    (snap) => {
      const orders: PlacedOrder[] = [];
      snap.forEach((docSnap) => {
        orders.push(docSnap.data() as PlacedOrder);
      });
      // Sort client-side by createdAt descending
      orders.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      callback(orders);
    },
    (err) => {
      console.warn('[Firestore] Orders subscription notice:', err);
    }
  );
}

// ----------------------------------------------------------------------
// 3. CUSTOMER LOYALTY, STRIKES & VISITS
// ----------------------------------------------------------------------

/**
 * Looks up customer by normalized 10-digit phone number in Firestore
 */
export async function lookupCustomerInFirestore(phone: string): Promise<Customer | null> {
  try {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const custRef = doc(db, COLLECTIONS.CUSTOMERS, cleanPhone);
    const snap = await getDoc(custRef);
    if (snap.exists()) {
      return snap.data() as Customer;
    }
    return null;
  } catch (error) {
    console.warn('[Firestore] Customer lookup error:', error);
    return null;
  }
}

/**
 * Creates or updates customer profile in Firestore
 */
export async function saveCustomerToFirestore(customer: Customer): Promise<boolean> {
  try {
    const cleanPhone = customer.phone.replace(/\D/g, '').slice(-10);
    const custRef = doc(db, COLLECTIONS.CUSTOMERS, cleanPhone);
    await setDoc(custRef, { ...customer, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firestore] Save customer error:', error);
    return false;
  }
}

/**
 * Records a verified dine-in visit in Firestore
 */
export async function recordVerifiedVisitInFirestore(visit: {
  visitId: string;
  customerId: string;
  customerName?: string;
  phone: string;
  restaurantId: string;
  visitDate: string;
  visitTime: string;
  verifiedBy: string;
  status: 'VERIFIED';
}): Promise<boolean> {
  try {
    const cleanPhone = visit.phone.replace(/\D/g, '').slice(-10);
    const visitRef = doc(db, COLLECTIONS.VISITS, visit.visitId);
    await setDoc(visitRef, {
      ...visit,
      createdAt: serverTimestamp(),
    });

    // Increment customer visits in Firestore
    const custRef = doc(db, COLLECTIONS.CUSTOMERS, cleanPhone);
    const custSnap = await getDoc(custRef);
    if (custSnap.exists()) {
      const current = custSnap.data() as Customer;
      const newTotal = (current.totalVisits || 0) + 1;
      const newCurrent = (current.currentVisits || 0) + 1;
      const newAvailableRewards =
        newCurrent >= 10
          ? (current.availableRewards || 0) + 1
          : current.availableRewards || 0;

      await updateDoc(custRef, {
        totalVisits: newTotal,
        currentVisits: newCurrent,
        availableRewards: newAvailableRewards,
        lastVisitDate: visit.visitDate,
        updatedAt: serverTimestamp(),
      });
    }

    return true;
  } catch (error) {
    console.warn('[Firestore] Record visit error:', error);
    return false;
  }
}

/**
 * Fetches verified visits for a customer from Firestore
 */
export async function fetchCustomerVisitsFromFirestore(phone: string): Promise<Visit[]> {
  try {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const visitsRef = collection(db, COLLECTIONS.VISITS);
    const q = query(visitsRef, where('phone', '==', cleanPhone), orderBy('visitDate', 'desc'), limit(50));
    const snap = await getDocs(q);
    const visits: Visit[] = [];
    snap.forEach((docSnap) => {
      visits.push(docSnap.data() as Visit);
    });
    return visits;
  } catch (error) {
    console.warn('[Firestore] Fetch customer visits notice:', error);
    return [];
  }
}

// ----------------------------------------------------------------------
// 4. CUSTOMER REVIEWS
// ----------------------------------------------------------------------

/**
 * Submits a new customer review to Firestore
 */
export async function submitReviewToFirestore(review: Review): Promise<boolean> {
  try {
    const reviewRef = doc(db, COLLECTIONS.REVIEWS, review.reviewId);
    await setDoc(reviewRef, {
      ...review,
      createdAtServer: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.warn('[Firestore] Submit review error:', error);
    return false;
  }
}

/**
 * Fetches recent reviews from Firestore
 */
export async function fetchReviewsFromFirestore(): Promise<Review[]> {
  try {
    const reviewsRef = collection(db, COLLECTIONS.REVIEWS);
    const q = query(reviewsRef, orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const reviews: Review[] = [];
    snap.forEach((docSnap) => {
      reviews.push(docSnap.data() as Review);
    });
    return reviews;
  } catch (error) {
    console.warn('[Firestore] Fetch reviews error:', error);
    return [];
  }
}

// ----------------------------------------------------------------------
// 5. RESTAURANT SETTINGS
// ----------------------------------------------------------------------

/**
 * Fetches restaurant settings from Firestore
 */
export async function fetchRestaurantSettingsFromFirestore(): Promise<RestaurantInfo> {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'config');
    const snap = await getDoc(settingsRef);
    if (snap.exists()) {
      return snap.data() as RestaurantInfo;
    }
    return RESTAURANT_INFO;
  } catch (error) {
    console.warn('[Firestore] Fetch settings error:', error);
    return RESTAURANT_INFO;
  }
}

/**
 * Updates restaurant settings in Firestore
 */
export async function updateRestaurantSettingsInFirestore(
  updates: Partial<RestaurantInfo>
): Promise<boolean> {
  try {
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'config');
    await setDoc(settingsRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firestore] Update settings error:', error);
    return false;
  }
}

// ----------------------------------------------------------------------
// 6. DYNAMIC LOYALTY TIERS & REVIEW OFFERS (Owner/Admin Full Customization)
// ----------------------------------------------------------------------

/**
 * Fetches the active loyalty configuration (strikes ladder, discounts, free items)
 * from Firestore. If not yet created, seeds with defaults (10, 20, 30 strikes).
 */
export async function fetchLoyaltyConfigFromFirestore(): Promise<LoyaltyConfig> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'loyaltyConfig');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<LoyaltyConfig>;
      return {
        ...LOYALTY_CONFIG,
        ...data,
        rewardTiers: Array.isArray(data.rewardTiers) && data.rewardTiers.length > 0
          ? data.rewardTiers
          : DEFAULT_REWARD_TIERS,
        reviewOffer: data.reviewOffer || DEFAULT_REVIEW_OFFER,
      };
    }

    // Auto-seed to Firestore if first time
    await setDoc(docRef, {
      ...LOYALTY_CONFIG,
      updatedAt: serverTimestamp(),
    });
    return LOYALTY_CONFIG;
  } catch (error) {
    console.warn('[Firestore] Fetch loyalty config error:', error);
    return LOYALTY_CONFIG;
  }
}

/**
 * Saves customized loyalty configuration (10, 20, 30 strikes, discounts, free drinks/items)
 * directly into Firestore.
 */
export async function saveLoyaltyConfigToFirestore(config: LoyaltyConfig): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'loyaltyConfig');
    await setDoc(docRef, {
      ...config,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Also sync reward tiers to the rewards collection for admin rewards view
    if (Array.isArray(config.rewardTiers)) {
      for (const tier of config.rewardTiers) {
        const rewardRef = doc(db, COLLECTIONS.REWARDS, tier.id);
        await setDoc(rewardRef, {
          rewardId: tier.id,
          restaurantId: 'mirch-masala-01',
          rewardName: tier.name,
          rewardDescription: tier.description,
          requiredVisits: tier.strike,
          shortBadge: tier.shortBadge,
          discountType: tier.discountType,
          discountAmount: tier.discountAmount || 0,
          freeItemName: tier.freeItemName || '',
          isActive: tier.isActive !== false,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    }

    return true;
  } catch (error) {
    console.error('[Firestore] Save loyalty config error:', error);
    return false;
  }
}

/**
 * Fetches the active Google Review incentive offer (e.g. Free Cold Drink, 10% OFF, etc.)
 */
export async function fetchReviewOfferFromFirestore(): Promise<ReviewOfferConfig> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'reviewOffer');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as ReviewOfferConfig;
    }
    // Also check loyaltyConfig
    const loyaltyRef = doc(db, COLLECTIONS.SETTINGS, 'loyaltyConfig');
    const loyaltySnap = await getDoc(loyaltyRef);
    if (loyaltySnap.exists() && loyaltySnap.data()?.reviewOffer) {
      return loyaltySnap.data()?.reviewOffer as ReviewOfferConfig;
    }
    return DEFAULT_REVIEW_OFFER;
  } catch (error) {
    console.warn('[Firestore] Fetch review offer error:', error);
    return DEFAULT_REVIEW_OFFER;
  }
}

/**
 * Saves the customized Google Review offer into Firestore
 */
export async function saveReviewOfferToFirestore(offer: ReviewOfferConfig): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'reviewOffer');
    await setDoc(docRef, {
      ...offer,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Also sync to loyaltyConfig
    const loyaltyRef = doc(db, COLLECTIONS.SETTINGS, 'loyaltyConfig');
    await setDoc(loyaltyRef, {
      reviewOffer: offer,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('[Firestore] Save review offer error:', error);
    return false;
  }
}

/**
 * Real-time listener for loyalty configuration changes
 */
export function subscribeToLoyaltyConfig(
  callback: (config: LoyaltyConfig) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'loyaltyConfig');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<LoyaltyConfig>;
        callback({
          ...LOYALTY_CONFIG,
          ...data,
          rewardTiers: Array.isArray(data.rewardTiers) && data.rewardTiers.length > 0
            ? data.rewardTiers
            : DEFAULT_REWARD_TIERS,
          reviewOffer: data.reviewOffer || DEFAULT_REVIEW_OFFER,
        });
      }
    },
    (err) => {
      console.warn('[Firestore] Loyalty config listener notice:', err);
    }
  );
}

