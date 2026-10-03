import { Customer, Visit, LoyaltyStatus, RewardTier, RewardRedemption, LoyaltyConfig, ReviewOfferConfig } from '../types';
import { LOYALTY_CONFIG, DEFAULT_REWARD_TIERS, DEFAULT_REVIEW_OFFER } from '../config/loyaltyConfig';
import {
  lookupCustomerInFirestore,
  saveCustomerToFirestore,
  recordVerifiedVisitInFirestore,
  fetchCustomerVisitsFromFirestore,
  fetchLoyaltyConfigFromFirestore,
  saveLoyaltyConfigToFirestore,
} from './firebaseDbService';

const LOCAL_SESSION_KEY = 'mirch_customer_session_v1';
const LOCAL_STORE_KEY = 'mirch_loyalty_local_db_v2';

export interface CustomerSession {
  customerId: string;
  phone: string;
  name: string;
  restaurantId: string;
}

export interface LoyaltyApiResponse<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
  alreadyVerified?: boolean;
}

/**
 * Normalizes Indian mobile number to clean 10-digit format
 */
export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned.length === 10 ? cleaned : '';
}

/**
 * Formats 10-digit phone for Indian display: +91 98765 43210
 */
export function formatPhoneForDisplay(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  if (norm.length !== 10) return phone;
  return `+91 ${norm.slice(0, 5)} ${norm.slice(5)}`;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kolkata timezone
 */
export function getTodayKolkataDate(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Returns YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Returns current time formatted as hh:mm a in Asia/Kolkata timezone
 */
export function getKolkataTimeFormatted(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

/* =========================================================================
   LOCAL REPOSITORY (Ensures instant resilience, offline support & smooth testing)
   ========================================================================= */

interface LocalLoyaltyDB {
  customers: Customer[];
  visits: Visit[];
  redemptions: Array<{
    redemptionId: string;
    customerId: string;
    restaurantId: string;
    rewardName: string;
    rewardTierId?: string;
    redeemedAt: string;
    verifiedBy: string;
  }>;
}

/**
 * Seed initial realistic demo accounts for instant testing of 5th, 7th, and 10th strike milestones
 */
function getInitialSeedDB(): LocalLoyaltyDB {
  return {
    customers: [],
    visits: [],
    redemptions: [],
  };
}

function getLocalDB(): LocalLoyaltyDB {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { customers: [], visits: [], redemptions: [] };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORE_KEY);
    if (!raw) {
      const initial: LocalLoyaltyDB = { customers: [], visits: [], redemptions: [] };
      saveLocalDB(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    const fakeIds = new Set(['CUS-AMIT88', 'CUS-PRIYA77', 'CUS-ROHAN99', 'CUS-A89F12', 'CUS-B72D45', 'CUS-C33E98']);
    const cleanCustomers = (parsed.customers || []).filter(
      (c: any) => c && !fakeIds.has(c.customerId) && !c.name?.toLowerCase().includes('amit sharma') && !c.name?.toLowerCase().includes('priya patel')
    );
    const cleanVisits = (parsed.visits || []).filter(
      (v: any) => v && !fakeIds.has(v.customerId)
    );
    const cleanRedemptions = (parsed.redemptions || []).filter(
      (r: any) => r && !fakeIds.has(r.customerId)
    );
    const cleanDB: LocalLoyaltyDB = {
      customers: cleanCustomers,
      visits: cleanVisits,
      redemptions: cleanRedemptions,
    };
    saveLocalDB(cleanDB);
    return cleanDB;
  } catch {
    return { customers: [], visits: [], redemptions: [] };
  }
}

function saveLocalDB(db: LocalLoyaltyDB) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(LOCAL_STORE_KEY, JSON.stringify(db));
  } catch {
    // Ignore quota errors
  }
}

const LOCAL_LOYALTY_CONFIG_KEY = 'mirch_custom_loyalty_config_v1';

let inMemoryLoyaltyConfig: LoyaltyConfig | null = null;

/**
 * Returns active loyalty configuration (customized by Admin/Owner or default).
 * Checks memory, then localStorage, then LOYALTY_CONFIG fallback.
 */
export function getActiveLoyaltyConfig(): LoyaltyConfig {
  if (inMemoryLoyaltyConfig) {
    return inMemoryLoyaltyConfig;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(LOCAL_LOYALTY_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LoyaltyConfig;
        if (parsed && Array.isArray(parsed.rewardTiers) && parsed.rewardTiers.length > 0) {
          inMemoryLoyaltyConfig = parsed;
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  inMemoryLoyaltyConfig = LOYALTY_CONFIG;
  return LOYALTY_CONFIG;
}

/**
 * Fetches latest loyalty configuration from Cloud Firestore and caches locally.
 */
export async function loadLoyaltyConfigFromFirestore(): Promise<LoyaltyConfig> {
  try {
    const cloudConfig = await fetchLoyaltyConfigFromFirestore();
    if (cloudConfig) {
      inMemoryLoyaltyConfig = cloudConfig;
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LOCAL_LOYALTY_CONFIG_KEY, JSON.stringify(cloudConfig));
      }
      return cloudConfig;
    }
  } catch (err) {
    console.warn('[LoyaltyService] Load loyalty config error:', err);
  }
  return getActiveLoyaltyConfig();
}

/**
 * Updates loyalty configuration (e.g. customized 10, 20, 30 strikes, discounts, free cold drink)
 * Saves to both Cloud Firestore and local storage.
 */
export async function updateCustomLoyaltyConfig(newConfig: LoyaltyConfig): Promise<boolean> {
  inMemoryLoyaltyConfig = newConfig;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(LOCAL_LOYALTY_CONFIG_KEY, JSON.stringify(newConfig));
    } catch {
      // Ignore
    }
  }

  // Persist to Cloud Firestore
  return await saveLoyaltyConfigToFirestore(newConfig);
}

/**
 * Calculates current strikes ladder, unlocked rewards, next milestone, and today's visit status.
 * Dynamically supports any strike milestones (e.g. 10, 20, 30 strikes, or any custom strike numbers).
 */
export function computeLoyaltyObject(
  customer: Customer,
  visits: Visit[],
  configOverride?: LoyaltyConfig
): LoyaltyStatus {
  const activeConfig = configOverride || getActiveLoyaltyConfig();
  const tiers = (activeConfig.rewardTiers && activeConfig.rewardTiers.length > 0)
    ? activeConfig.rewardTiers.filter(t => t.isActive !== false)
    : DEFAULT_REWARD_TIERS;

  // Find max strike milestone among active tiers
  const maxTierStrike = tiers.reduce((max, t) => Math.max(max, t.strike), 10);
  const visitsRequired = Math.max(activeConfig.visitsRequired || 10, maxTierStrike);
  const totalVisits = customer.totalVisits || 0;

  // Current progress in the strike cycle (0 to visitsRequired)
  const currentCycleStrikes = totalVisits === 0
    ? 0
    : (totalVisits % visitsRequired === 0 ? visitsRequired : totalVisits % visitsRequired);

  const redeemed = customer.redeemedRewardIds || [];

  // Evaluate unlocked tiers
  const unlockedTiers: RewardTier[] = [];
  for (const tier of tiers) {
    // Check if customer reached this strike milestone in current cycle or total visits
    const reached = currentCycleStrikes >= tier.strike || totalVisits >= tier.strike;
    if (reached && !redeemed.includes(tier.id)) {
      unlockedTiers.push(tier);
    }
  }

  // Sort tiers ascending by strike
  const sortedTiers = [...tiers].sort((a, b) => a.strike - b.strike);

  // Determine next reward tier
  let nextRewardTier: RewardTier | null = null;
  let remainingForNextReward = 0;
  for (const tier of sortedTiers) {
    if (currentCycleStrikes < tier.strike) {
      nextRewardTier = tier;
      remainingForNextReward = tier.strike - currentCycleStrikes;
      break;
    }
  }

  // If already reached all tiers in current cycle, wrap to first tier of next cycle
  if (!nextRewardTier && sortedTiers.length > 0) {
    nextRewardTier = sortedTiers[0];
    remainingForNextReward = (visitsRequired - currentCycleStrikes) + sortedTiers[0].strike;
  }

  const todayStr = getTodayKolkataDate();
  let todayStatus: 'NOT_RECORDED' | 'VERIFIED' | 'PENDING' = 'NOT_RECORDED';

  for (const v of visits) {
    if (v.visitDate === todayStr) {
      if (v.status === 'VERIFIED') {
        todayStatus = 'VERIFIED';
        break;
      } else if (v.status === 'PENDING') {
        todayStatus = 'PENDING';
      }
    }
  }

  return {
    customer,
    totalVisits,
    currentVisits: currentCycleStrikes,
    visitsRequired,
    progressVisits: currentCycleStrikes,
    remainingVisits: Math.max(0, visitsRequired - currentCycleStrikes),
    availableRewards: unlockedTiers.length,
    unlockedTiers,
    nextRewardTier,
    remainingForNextReward,
    isRewardUnlocked: unlockedTiers.length > 0,
    rewardName: activeConfig.rewardName || 'Dining Strikes Milestone Rewards',
    rewardDescription: activeConfig.rewardDescription || 'Milestone perks for loyal diners',
    todayVisitStatus: todayStatus,
    lastVisitDateFormatted: customer.lastVisitAt || undefined,
    config: activeConfig,
  };
}

/* =========================================================================
   SESSION PERSISTENCE (Auto-Login on same device next day/time)
   ========================================================================= */

export function saveCustomerSession(session: CustomerSession): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  }
}

export function getCustomerSession(): CustomerSession | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCustomerSession(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  }
}

/* =========================================================================
   CUSTOMER ACCOUNT ACTIONS (Registration, Password Login, Auto-Login)
   ========================================================================= */

/**
 * Register a new customer with Name, Phone and Password
 */
export async function registerCustomer(
  name: string,
  rawPhone: string,
  password?: string,
  restaurantId = 'mirch-masala-01'
): Promise<{ success: boolean; customer?: Customer; loyalty?: LoyaltyStatus; isNew?: boolean; error?: string }> {
  const trimmedName = name.trim();
  const phone = normalizePhoneNumber(rawPhone);
  const cleanPassword = (password || '').trim();

  if (!trimmedName || trimmedName.length < 2) {
    return { success: false, error: 'Please enter your full name (minimum 2 characters).' };
  }
  if (!phone || phone.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
  }
  if (!cleanPassword || cleanPassword.length < 4) {
    return { success: false, error: 'Please set a secure password (minimum 4 characters).' };
  }

  // 1. Check and save to Cloud Firestore
  try {
    const cloudCust = await lookupCustomerInFirestore(phone);
    if (cloudCust) {
      saveCustomerSession({
        customerId: cloudCust.customerId,
        phone: cloudCust.phone,
        name: cloudCust.name,
        restaurantId: cloudCust.restaurantId || restaurantId,
      });

      // Sync into local DB for instant offline/preview resilience
      const db = getLocalDB();
      const existingIdx = db.customers.findIndex(
        (c) => c.phone === phone || c.customerId === cloudCust.customerId
      );
      const storedCustomer: Customer = {
        ...cloudCust,
        mobile: cloudCust.mobile || phone,
        phone: cloudCust.phone || phone,
        isActive: true,
        password: cleanPassword,
      };
      if (existingIdx >= 0) {
        db.customers[existingIdx] = storedCustomer;
      } else {
        db.customers.push(storedCustomer);
      }
      saveLocalDB(db);

      return {
        success: true,
        customer: storedCustomer,
        loyalty: computeLoyaltyObject(storedCustomer, []),
        isNew: false,
      };
    }
  } catch (err) {
    console.warn('[LoyaltyService] Firestore check notice:', err);
  }

  // 2. Resilient local fallback
  const db = getLocalDB();
  let customer = db.customers.find(
    (c) => c.phone === phone && (!c.restaurantId || c.restaurantId === restaurantId)
  );

  let isNew = false;
  if (!customer) {
    isNew = true;
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
    customer = {
      customerId: `CUS-${randomHex}`,
      name: trimmedName,
      mobile: phone,
      phone,
      password: cleanPassword,
      restaurantId,
      createdAt: new Date().toISOString(),
      totalVisits: 0,
      currentVisits: 0,
      availableRewards: 0,
      redeemedRewardIds: [],
      isActive: true,
      status: 'ACTIVE',
    };
    db.customers.push(customer);
  } else {
    // Existing customer updating name or setting password
    customer.name = trimmedName;
    customer.password = cleanPassword;
    customer.mobile = customer.mobile || phone;
    customer.isActive = true;
  }
  saveLocalDB(db);

  // Synchronize customer profile to Cloud Firestore
  saveCustomerToFirestore(customer).catch((err) =>
    console.warn('[LoyaltyService] Firestore customer sync note:', err)
  );

  saveCustomerSession({
    customerId: customer.customerId,
    phone: customer.phone,
    name: customer.name,
    restaurantId: customer.restaurantId,
  });

  const customerVisits = db.visits.filter((v) => v.customerId === customer?.customerId);
  const loyalty = computeLoyaltyObject(customer, customerVisits);

  return {
    success: true,
    customer,
    loyalty,
    isNew,
  };
}

/**
 * Login existing customer with Phone and Password
 */
export async function loginCustomer(
  rawPhone: string,
  password?: string,
  restaurantId = 'mirch-masala-01'
): Promise<{ success: boolean; customer?: Customer; loyalty?: LoyaltyStatus; error?: string }> {
  const phone = normalizePhoneNumber(rawPhone);
  const cleanPassword = (password || '').trim();

  if (!phone || phone.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Please enter your account password.' };
  }

  // Check local DB
  const db = getLocalDB();
  const customer = db.customers.find(
    (c) => c.phone === phone && (!c.restaurantId || c.restaurantId === restaurantId)
  );

  if (!customer) {
    return {
      success: false,
      error: 'No account found with this phone number. Please create an account first.',
    };
  }

  // Password verification: if customer has password set, verify it
  if (customer.password && customer.password !== cleanPassword) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.',
    };
  }

  // If customer didn't have password set previously, set it now
  if (!customer.password) {
    customer.password = cleanPassword;
    saveLocalDB(db);
  }

  // Save session so they stay logged in on subsequent visits!
  saveCustomerSession({
    customerId: customer.customerId,
    phone: customer.phone,
    name: customer.name,
    restaurantId: customer.restaurantId,
  });

  const customerVisits = db.visits.filter((v) => v.customerId === customer.customerId);
  const loyalty = computeLoyaltyObject(customer, customerVisits);

  return {
    success: true,
    customer,
    loyalty,
  };
}

/**
 * Fetch fresh customer and loyalty status
 */
export async function getLoyaltyStatus(
  customerId?: string,
  rawPhone?: string,
  restaurantId = 'mirch-masala-01'
): Promise<{ success: boolean; customer?: Customer; loyalty?: LoyaltyStatus; recentVisits?: Visit[]; error?: string }> {
  const phone = rawPhone ? normalizePhoneNumber(rawPhone) : '';

  // 1. Try Cloud Firestore lookup
  if (phone) {
    try {
      const cloudCust = await lookupCustomerInFirestore(phone);
      if (cloudCust) {
        const db = getLocalDB();
        const localCust = db.customers.find(
          (c) => c.customerId === cloudCust.customerId || c.phone === cloudCust.phone
        );
        const fullCustomer: Customer = {
          ...cloudCust,
          password: localCust?.password || cloudCust.password,
          redeemedRewardIds: localCust?.redeemedRewardIds || [],
        };
        const visits = await fetchCustomerVisitsFromFirestore(phone);
        const loyalty = computeLoyaltyObject(fullCustomer, visits.length > 0 ? visits : db.visits.filter(v => v.customerId === fullCustomer.customerId));

        return {
          success: true,
          customer: fullCustomer,
          loyalty,
          recentVisits: visits.slice(0, 5),
        };
      }
    } catch {
      // Fallback to local DB
    }
  }

  // 2. Local fallback
  const db = getLocalDB();
  const customer = db.customers.find(
    (c) =>
      (customerId && c.customerId === customerId) ||
      (phone && c.phone === phone && (!c.restaurantId || c.restaurantId === restaurantId))
  );

  if (!customer) {
    return { success: false, error: 'Customer not found.' };
  }

  const visits = db.visits
    .filter((v) => v.customerId === customer.customerId)
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  const loyalty = computeLoyaltyObject(customer, visits);

  return {
    success: true,
    customer,
    loyalty,
    recentVisits: visits.slice(0, 5),
  };
}

/**
 * Staff Verification: Search customer by mobile number
 */
export async function searchCustomerForStaff(
  rawPhone: string,
  restaurantId = 'mirch-masala-01'
): Promise<{ success: boolean; customer?: Customer; loyalty?: LoyaltyStatus; recentVisits?: Visit[]; error?: string }> {
  const phone = normalizePhoneNumber(rawPhone);
  if (!phone || phone.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
  }

  // 1. Try Cloud Firestore lookup
  try {
    const cloudCust = await lookupCustomerInFirestore(phone);
    if (cloudCust) {
      const db = getLocalDB();
      const localCust = db.customers.find((c) => c.phone === phone);
      const fullCustomer: Customer = {
        ...cloudCust,
        redeemedRewardIds: localCust?.redeemedRewardIds || [],
      };
      const visits = await fetchCustomerVisitsFromFirestore(phone);
      const loyalty = computeLoyaltyObject(fullCustomer, visits);
      return {
        success: true,
        customer: fullCustomer,
        loyalty,
        recentVisits: visits,
      };
    }
  } catch {
    // Continue to local lookup
  }

  // 2. Local lookup
  return getLoyaltyStatus(undefined, phone, restaurantId);
}

import { getStoredAuthToken } from '../admin/services/adminAuthService';

/**
 * Staff Verification: Verify Customer Dine-In Eat
 * Enforces Anti-Fraud Rule: Maximum 1 valid strike per customer per day in Asia/Kolkata timezone!
 * Authenticated staff session required; credentials are never passed in plaintext.
 */
export async function verifyCustomerVisit(
  customerId: string,
  restaurantId = 'mirch-masala-01',
  verifiedBy = 'Staff'
): Promise<{
  success: boolean;
  message?: string;
  alreadyVerified?: boolean;
  customer?: Customer;
  loyalty?: LoyaltyStatus;
  visit?: Visit;
  error?: string;
}> {
  if (!customerId) {
    return { success: false, error: 'Customer ID is required.' };
  }

  const token = getStoredAuthToken();

  // 1. Call Secure Server Endpoint if token exists
  if (token) {
    try {
      const serverRes = await fetch('/api/staff/verify-visit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId,
          restaurantId,
        }),
      });

      const serverData = await serverRes.json().catch(() => ({}));
      if (serverRes.ok && serverData.success) {
        // Sync local cache with verified record
        const db = getLocalDB();
        const localCust = db.customers.find((c) => c.customerId === customerId);
        if (localCust) {
          localCust.totalVisits = serverData.customer?.totalVisits || (localCust.totalVisits || 0) + 1;
          localCust.lastVisitAt = `${serverData.visit.visitDate} ${serverData.visit.visitTime}`;
          db.visits.unshift(serverData.visit);
          saveLocalDB(db);
        }

        const customerVisits = db.visits.filter((v) => v.customerId === customerId);
        const loyalty = computeLoyaltyObject(localCust || serverData.customer, customerVisits);

        return {
          success: true,
          message: serverData.message || 'Dine-in verified! 1 Strike added.',
          customer: localCust || serverData.customer,
          loyalty,
          visit: serverData.visit,
        };
      } else if (serverData.alreadyVerified) {
        return {
          success: false,
          alreadyVerified: true,
          message: serverData.message || "Today's dine-in visit is already verified. Maximum 1 strike per day allowed.",
        };
      } else if (serverRes.status === 401 || serverRes.status === 403) {
        return {
          success: false,
          error: serverData.error || 'Authentication required: You do not have permission to verify visits.',
        };
      }
    } catch {
      // Fallback to local DB enforcement
    }
  }

  const todayStr = getTodayKolkataDate();
  const timeStr = getKolkataTimeFormatted();

  // Local fallback check
  const db = getLocalDB();
  const customer = db.customers.find((c) => c.customerId === customerId);
  if (!customer) {
    return { success: false, error: 'Customer not found.' };
  }

  const alreadyVisitedToday = db.visits.some(
    (v) =>
      v.customerId === customerId &&
      v.visitDate === todayStr &&
      v.status === 'VERIFIED' &&
      (!v.restaurantId || v.restaurantId === restaurantId)
  );

  if (alreadyVisitedToday) {
    return {
      success: false,
      alreadyVerified: true,
      message: "Today's dine-in visit is already verified. Maximum 1 strike per day allowed.",
    };
  }

  // Create verified visit
  const visitId = `VIS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const newVisit: Visit = {
    visitId,
    customerId,
    restaurantId,
    visitDate: todayStr,
    visitTime: timeStr,
    verifiedBy,
    status: 'VERIFIED',
  };
  db.visits.unshift(newVisit);

  customer.totalVisits = (customer.totalVisits || 0) + 1;
  customer.lastVisitAt = `${todayStr} ${timeStr}`;

  saveLocalDB(db);

  // Synchronize verified visit and strike to Cloud Firestore
  recordVerifiedVisitInFirestore({
    visitId: newVisit.visitId,
    customerId: newVisit.customerId,
    customerName: customer.name,
    phone: customer.phone,
    restaurantId: newVisit.restaurantId,
    visitDate: newVisit.visitDate,
    visitTime: newVisit.visitTime,
    verifiedBy: newVisit.verifiedBy,
    status: 'VERIFIED',
  }).catch((err) => console.warn('[LoyaltyService] Firestore visit sync note:', err));

  const customerVisits = db.visits.filter((v) => v.customerId === customerId);
  const loyalty = computeLoyaltyObject(customer, customerVisits);

  return {
    success: true,
    message: `Dine-in verified! 1 Strike added. Total: ${customer.totalVisits} strikes.`,
    customer,
    loyalty,
    visit: newVisit,
  };
}

/**
 * Staff Verification: Redeem Customer Reward (₹50 OFF, 20% Discount, or 40% OFF / Free Dish)
 */
export async function redeemCustomerReward(
  customerId: string,
  rewardTierId?: string,
  restaurantId = 'mirch-masala-01',
  verifiedBy = 'Staff'
): Promise<{ success: boolean; message?: string; customer?: Customer; loyalty?: LoyaltyStatus; error?: string }> {
  const db = getLocalDB();
  const customer = db.customers.find((c) => c.customerId === customerId);
  if (!customer) {
    return { success: false, error: 'Customer not found.' };
  }

  if (!customer.redeemedRewardIds) {
    customer.redeemedRewardIds = [];
  }

  const customerVisits = db.visits.filter((v) => v.customerId === customerId);
  const currentLoyalty = computeLoyaltyObject(customer, customerVisits);

  if (currentLoyalty.unlockedTiers.length === 0) {
    return { success: false, error: 'No available rewards to redeem.' };
  }

  // Select tier to redeem
  const tierToRedeem = rewardTierId
    ? currentLoyalty.unlockedTiers.find((t) => t.id === rewardTierId)
    : currentLoyalty.unlockedTiers[0];

  if (!tierToRedeem) {
    return { success: false, error: 'Selected reward is not unlocked or has already been redeemed.' };
  }

  customer.redeemedRewardIds.push(tierToRedeem.id);

  db.redemptions.push({
    redemptionId: `RED-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    customerId,
    restaurantId,
    rewardName: tierToRedeem.name,
    rewardTierId: tierToRedeem.id,
    redeemedAt: `${getTodayKolkataDate()} ${getKolkataTimeFormatted()}`,
    verifiedBy,
  });

  saveLocalDB(db);

  const updatedLoyalty = computeLoyaltyObject(customer, customerVisits);

  return {
    success: true,
    message: `Successfully redeemed ${tierToRedeem.name}!`,
    customer,
    loyalty: updatedLoyalty,
  };
}

/**
 * Get demo preset customer list for quick testing
 */
export function getDemoCustomers(): Customer[] {
  return [];
}

/**
 * Fetches customer's full activity history including past visit dates and redemption history
 */
export async function fetchCustomerActivityHistory(
  customerId?: string,
  rawPhone?: string,
  restaurantId = 'mirch-masala-01'
): Promise<{
  success: boolean;
  visits: Visit[];
  redemptions: RewardRedemption[];
  customer?: Customer | null;
  error?: string;
}> {
  const phone = normalizePhoneNumber(rawPhone || '');

  // 1. Try server endpoint
  try {
    const params = new URLSearchParams();
    if (customerId) params.append('customerId', customerId);
    if (phone) params.append('phone', phone);
    if (restaurantId) params.append('restaurantId', restaurantId);

    const res = await fetch(`/api/customer/activity?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          success: true,
          visits: data.visits || [],
          redemptions: (data.redemptions || []).map((r: any) => ({
            ...r,
            status: r.status || 'REDEEMED',
          })),
          customer: data.customer || null,
        };
      }
    }
  } catch {
    // Network or preview offline fallback: seamlessly use local storage
  }

  // 2. Resilient local DB lookup
  const db = getLocalDB();
  let matchedCustomer: Customer | undefined;

  if (customerId) {
    matchedCustomer = db.customers.find(
      (c) => c.customerId === customerId && (!c.restaurantId || c.restaurantId === restaurantId)
    );
  }
  if (!matchedCustomer && phone) {
    matchedCustomer = db.customers.find(
      (c) => c.phone === phone && (!c.restaurantId || c.restaurantId === restaurantId)
    );
  }

  const effectiveCustId = matchedCustomer ? matchedCustomer.customerId : customerId;

  const visits = db.visits
    .filter(
      (v) =>
        (v.customerId === effectiveCustId || (matchedCustomer && v.customerId === matchedCustomer.customerId)) &&
        (!v.restaurantId || v.restaurantId === restaurantId)
    )
    .sort((a, b) => new Date(`${b.visitDate} ${b.visitTime || ''}`).getTime() - new Date(`${a.visitDate} ${a.visitTime || ''}`).getTime());

  const redemptions = (db.redemptions || [])
    .filter(
      (r) =>
        (r.customerId === effectiveCustId || (matchedCustomer && r.customerId === matchedCustomer.customerId)) &&
        (!r.restaurantId || r.restaurantId === restaurantId)
    )
    .map((r) => ({
      ...r,
      status: (r as any).status || 'REDEEMED',
    }))
    .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());

  return {
    success: true,
    visits,
    redemptions,
    customer: matchedCustomer || null,
  };
}
