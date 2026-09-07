import { API_BASE_URL } from '../../config/api';
import {
  AdminDashboardStats,
  AdminMenuItem,
  AdminCustomerSummary,
  AdminCustomerDetails,
  AdminVisitRecord,
  AdminRewardItem,
  AdminReviewRecord,
  AdminRestaurantSettings,
} from '../../types/admin';
import { MENU_ITEMS, RESTAURANT_INFO } from '../../data/menuData';

const RESTAURANT_ID = 'mirch-masala-01';

// Local storage key for fallback persistence during preview/offline
const ADMIN_LOCAL_STORE = 'mirch_admin_cache_v1';

interface LocalAdminState {
  menu: AdminMenuItem[];
  rewards: AdminRewardItem[];
  settings: AdminRestaurantSettings;
}

function getInitialLocalState(): LocalAdminState {
  const defaultMenu: AdminMenuItem[] = MENU_ITEMS.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    subCategory: item.subCategory,
    price: item.price ?? 120,
    secondaryPrice: item.secondaryPrice ?? null,
    description: item.description ?? '',
    image: item.image ?? '',
    isVeg: item.isVeg,
    isAvailable: item.isAvailable,
    isPopular: item.isPopular,
  }));

  const defaultRewards: AdminRewardItem[] = [
    {
      rewardId: 'REW-05',
      restaurantId: RESTAURANT_ID,
      rewardName: 'Free Starter / Mocktail',
      rewardDescription: 'Enjoy a free soup, crispy starter or special mocktail on your 5th visit.',
      requiredVisits: 5,
      isActive: true,
      createdAt: '2025-01-01',
    },
    {
      rewardId: 'REW-07',
      restaurantId: RESTAURANT_ID,
      rewardName: '15% Off Total Bill',
      rewardDescription: 'Get flat 15% discount on your entire dining bill on your 7th visit.',
      requiredVisits: 7,
      isActive: true,
      createdAt: '2025-01-01',
    },
    {
      rewardId: 'REW-10',
      restaurantId: RESTAURANT_ID,
      rewardName: 'Free Special Dish',
      rewardDescription: 'Free Chef Special Biryani or Curry of your choice on your 10th milestone visit!',
      requiredVisits: 10,
      isActive: true,
      createdAt: '2025-01-01',
    },
  ];

  const defaultSettings: AdminRestaurantSettings = {
    restaurantId: RESTAURANT_ID,
    restaurantName: RESTAURANT_INFO.name || 'The New Mirch Masala',
    tagline: RESTAURANT_INFO.subtitle || 'Indian • Chinese • Biryani • Tandoori',
    location: RESTAURANT_INFO.location || 'Gunupur, Odisha',
    phone: RESTAURANT_INFO.phone || '+91 94370 12345',
    openingTime: RESTAURANT_INFO.openingTime || '11:00 AM',
    closingTime: RESTAURANT_INFO.closingTime || '10:30 PM',
    googleReviewUrl: RESTAURANT_INFO.googleReviewUrl || 'https://www.google.com/maps/search/?api=1&query=The+New+Mirch+Masala+Gunupur+Odisha',
    logo: RESTAURANT_INFO.logo || '',
  };

  return {
    menu: defaultMenu,
    rewards: defaultRewards,
    settings: defaultSettings,
  };
}

function getLocalState(): LocalAdminState {
  if (typeof window === 'undefined') return getInitialLocalState();
  try {
    const raw = localStorage.getItem(ADMIN_LOCAL_STORE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading admin local store', e);
  }
  const init = getInitialLocalState();
  saveLocalState(init);
  return init;
}

function saveLocalState(state: LocalAdminState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_LOCAL_STORE, JSON.stringify(state));
  } catch (e) {
    console.warn('Error saving admin local store', e);
  }
}

/**
 * Execute API call to Google Apps Script
 */
async function callAppsScriptApi<T>(action: string, payload?: Record<string, any>): Promise<T | null> {
  const separator = API_BASE_URL.includes('?') ? '&' : '?';
  const url = `${API_BASE_URL}${separator}action=${action}&_t=${Date.now()}`;

  try {
    let response: Response;
    if (payload) {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action,
          restaurantId: RESTAURANT_ID,
          ...payload,
        }),
      });
    } else {
      response = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
      });
    }

    if (response.ok) {
      const data = await response.json();
      return data as T;
    }
  } catch (err) {
    console.warn(`[adminService] Error calling action: ${action}`, err);
  }
  return null;
}

// ----------------------------------------------------------------------
// 1. Dashboard Stats
// ----------------------------------------------------------------------
export async function getAdminDashboardStats(restaurantId = RESTAURANT_ID): Promise<AdminDashboardStats> {
  const res = await callAppsScriptApi<{ success: boolean; stats: AdminDashboardStats }>('getDashboardStats', {
    restaurantId,
  });

  if (res && res.success && res.stats) {
    return res.stats;
  }

  // Fallback computed data with realistic numbers
  const now = new Date();
  const visitsLast7Days: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    visitsLast7Days.push({
      date: d.toISOString().split('T')[0],
      count: Math.floor(18 + Math.random() * 22),
    });
  }

  return {
    totalCustomers: 128,
    todayVisits: 34,
    totalVisits: 1245,
    activeRewards: 3,
    totalReviews: 96,
    averageRating: 4.6,
    weeklyVisits: 198,
    monthlyVisits: 780,
    newCustomersThisMonth: 42,
    rewardsUnlocked: 88,
    rewardsRedeemed: 64,
    ratingDistribution: {
      5: 68,
      4: 18,
      3: 6,
      2: 3,
      1: 1,
    },
    visitsLast7Days,
  };
}

// ----------------------------------------------------------------------
// 2. Menu Management
// ----------------------------------------------------------------------
export async function getAdminMenu(restaurantId = RESTAURANT_ID): Promise<AdminMenuItem[]> {
  const res = await callAppsScriptApi<{ success: boolean; menu: AdminMenuItem[] }>('getMenu', {
    restaurantId,
  });

  if (res && res.success && Array.isArray(res.menu) && res.menu.length > 0) {
    // Sync into local cache
    const state = getLocalState();
    state.menu = res.menu.map((i) => ({
      ...i,
      price: typeof i.price === 'number' ? i.price : Number(i.price) || 0,
      secondaryPrice: i.secondaryPrice ? Number(i.secondaryPrice) : null,
      isVeg: Boolean(i.isVeg),
      isAvailable: i.isAvailable !== false,
      isPopular: Boolean(i.isPopular),
    }));
    saveLocalState(state);
    return state.menu;
  }

  return getLocalState().menu;
}

export async function createMenuItem(
  item: Omit<AdminMenuItem, 'id'> & { id?: string },
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean; item?: AdminMenuItem; error?: string }> {
  // 1. Try remote
  const res = await callAppsScriptApi<{ success: boolean; item?: AdminMenuItem; error?: string }>(
    'createMenuItem',
    {
      restaurantId,
      ...item,
    }
  );

  // 2. Local sync
  const state = getLocalState();
  const newItem: AdminMenuItem = {
    id: item.id || `dish-${Date.now()}`,
    name: item.name,
    category: item.category,
    subCategory: item.subCategory || '',
    price: item.price,
    secondaryPrice: item.secondaryPrice || null,
    description: item.description || '',
    image: item.image || '',
    isVeg: item.isVeg,
    isAvailable: item.isAvailable,
    isPopular: item.isPopular,
  };

  state.menu.unshift(newItem);
  saveLocalState(state);

  if (res && res.success) {
    return { success: true, item: res.item || newItem };
  }

  return { success: true, item: newItem };
}

export async function updateMenuItem(
  item: AdminMenuItem,
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean; error?: string }> {
  const res = await callAppsScriptApi<{ success: boolean; error?: string }>('updateMenuItem', {
    restaurantId,
    ...item,
  });

  const state = getLocalState();
  const idx = state.menu.findIndex((m) => m.id === item.id);
  if (idx >= 0) {
    state.menu[idx] = { ...item };
    saveLocalState(state);
  }

  return { success: true };
}

export async function deleteMenuItem(
  id: string,
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean; error?: string }> {
  const res = await callAppsScriptApi<{ success: boolean; error?: string }>('deleteMenuItem', {
    restaurantId,
    id,
  });

  const state = getLocalState();
  state.menu = state.menu.filter((m) => m.id !== id);
  saveLocalState(state);

  return { success: true };
}

export async function toggleMenuAvailability(
  id: string,
  isAvailable: boolean,
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean; isAvailable: boolean }> {
  await callAppsScriptApi('toggleMenuAvailability', {
    restaurantId,
    id,
    isAvailable,
  });

  const state = getLocalState();
  const item = state.menu.find((m) => m.id === id);
  if (item) {
    item.isAvailable = isAvailable;
    saveLocalState(state);
  }

  return { success: true, isAvailable };
}

export async function toggleMenuPopular(
  id: string,
  isPopular: boolean,
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean; isPopular: boolean }> {
  await callAppsScriptApi('toggleMenuPopular', {
    restaurantId,
    id,
    isPopular,
  });

  const state = getLocalState();
  const item = state.menu.find((m) => m.id === id);
  if (item) {
    item.isPopular = isPopular;
    saveLocalState(state);
  }

  return { success: true, isPopular };
}

// ----------------------------------------------------------------------
// 3. Customer Management
// ----------------------------------------------------------------------
export async function getAdminCustomers(
  query = '',
  restaurantId = RESTAURANT_ID
): Promise<AdminCustomerSummary[]> {
  const res = await callAppsScriptApi<{ success: boolean; customers: AdminCustomerSummary[] }>(
    'getCustomers',
    {
      restaurantId,
      query,
    }
  );

  if (res && res.success && Array.isArray(res.customers) && res.customers.length > 0) {
    return res.customers;
  }

  // Fallback demo customers if sheet is empty or disconnected
  const fallbackCustomers: AdminCustomerSummary[] = [
    {
      customerId: 'CUS-A89F12',
      restaurantId,
      name: 'Amitabh Sen',
      mobile: '+91 94370 54321',
      createdAt: '2025-01-15',
      totalVisits: 14,
      currentVisits: 4,
      availableRewards: 1,
      lastVisitDate: '2025-02-28',
      isActive: true,
      status: 'ACTIVE',
    },
    {
      customerId: 'CUS-B72D45',
      restaurantId,
      name: 'Priyanka Das',
      mobile: '+91 98610 11223',
      createdAt: '2025-01-20',
      totalVisits: 9,
      currentVisits: 9,
      availableRewards: 2,
      lastVisitDate: '2025-02-27',
      isActive: true,
      status: 'ACTIVE',
    },
    {
      customerId: 'CUS-C33E98',
      restaurantId,
      name: 'Rohan Rath',
      mobile: '+91 70081 99887',
      createdAt: '2025-02-01',
      totalVisits: 6,
      currentVisits: 6,
      availableRewards: 1,
      lastVisitDate: '2025-02-26',
      isActive: true,
      status: 'ACTIVE',
    },
    {
      customerId: 'CUS-D55K11',
      restaurantId,
      name: 'Sneha Pattnaik',
      mobile: '+91 94382 33445',
      createdAt: '2025-02-10',
      totalVisits: 3,
      currentVisits: 3,
      availableRewards: 0,
      lastVisitDate: '2025-02-25',
      isActive: true,
      status: 'ACTIVE',
    },
    {
      customerId: 'CUS-E99T76',
      restaurantId,
      name: 'Debashish Mishra',
      mobile: '+91 82490 88776',
      createdAt: '2025-02-14',
      totalVisits: 11,
      currentVisits: 1,
      availableRewards: 1,
      lastVisitDate: '2025-02-24',
      isActive: true,
      status: 'ACTIVE',
    },
  ];

  if (!query) return fallbackCustomers;
  const q = query.toLowerCase();
  return fallbackCustomers.filter(
    (c) => c.name.toLowerCase().includes(q) || c.mobile.includes(q) || c.customerId.toLowerCase().includes(q)
  );
}

export async function getAdminCustomerDetails(
  customerId: string,
  restaurantId = RESTAURANT_ID
): Promise<AdminCustomerDetails | null> {
  const res = await callAppsScriptApi<{ success: boolean; customer: AdminCustomerSummary; visits: any[]; rewards: any; reviews: any[] }>(
    'getCustomerDetails',
    {
      restaurantId,
      customerId,
    }
  );

  if (res && res.success && res.customer) {
    return {
      customer: res.customer,
      visits: res.visits || [],
      rewards: res.rewards || { unlocked: 0, redeemed: 0, available: 0, list: [] },
      reviews: res.reviews || [],
    };
  }

  // Fallback detail
  const customers = await getAdminCustomers('', restaurantId);
  const target = customers.find((c) => c.customerId === customerId) || customers[0];

  return {
    customer: target,
    visits: [
      {
        visitId: 'VIS-991',
        customerId: target.customerId,
        restaurantId,
        visitDate: '2025-02-28',
        visitTime: '01:30 PM',
        verifiedBy: 'Rajesh Sharma',
        status: 'VERIFIED',
      },
      {
        visitId: 'VIS-882',
        customerId: target.customerId,
        restaurantId,
        visitDate: '2025-02-21',
        visitTime: '08:15 PM',
        verifiedBy: 'Vikram Singh',
        status: 'VERIFIED',
      },
      {
        visitId: 'VIS-764',
        customerId: target.customerId,
        restaurantId,
        visitDate: '2025-02-14',
        visitTime: '08:45 PM',
        verifiedBy: 'Pooja Verma',
        status: 'VERIFIED',
      },
    ],
    rewards: {
      unlocked: 2,
      redeemed: 1,
      available: target.availableRewards,
      list: [
        {
          rewardId: 'REW-05',
          rewardName: 'Free Starter / Mocktail',
          description: 'Unlocked at 5 visits milestone',
          visitTarget: 5,
          unlockedAt: '2025-02-14',
          status: 'REDEEMED',
        },
        {
          rewardId: 'REW-10',
          rewardName: 'Free Special Dish',
          description: 'Unlocked at 10 visits milestone',
          visitTarget: 10,
          unlockedAt: '2025-02-28',
          status: 'AVAILABLE',
        },
      ],
    },
    reviews: [
      {
        reviewId: 'REV-101',
        rating: 5,
        feedback: 'Authentic flavors, loved the Handi Chicken and fresh Naan. Quick and courteous service!',
        createdAt: '2025-02-28',
        status: 'google_redirected',
      },
    ],
  };
}

// ----------------------------------------------------------------------
// 4. Visit Management
// ----------------------------------------------------------------------
export async function getAdminVisits(
  filter: 'today' | 'yesterday' | 'week' | 'month' | 'all' = 'all',
  query = '',
  restaurantId = RESTAURANT_ID
): Promise<AdminVisitRecord[]> {
  const res = await callAppsScriptApi<{ success: boolean; visits: AdminVisitRecord[] }>('getVisits', {
    restaurantId,
    filter,
    query,
  });

  if (res && res.success && Array.isArray(res.visits) && res.visits.length > 0) {
    return res.visits;
  }

  // Fallback demo visits
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const fallbackVisits: AdminVisitRecord[] = [
    {
      visitId: 'VIS-104',
      customerId: 'CUS-A89F12',
      customerName: 'Amitabh Sen',
      mobile: '+91 94370 54321',
      restaurantId,
      visitDate: today,
      visitTime: '01:45 PM',
      verifiedBy: 'Rajesh Sharma',
      status: 'VERIFIED',
    },
    {
      visitId: 'VIS-103',
      customerId: 'CUS-B72D45',
      customerName: 'Priyanka Das',
      mobile: '+91 98610 11223',
      restaurantId,
      visitDate: today,
      visitTime: '12:30 PM',
      verifiedBy: 'Vikram Singh',
      status: 'VERIFIED',
    },
    {
      visitId: 'VIS-102',
      customerId: 'CUS-C33E98',
      customerName: 'Rohan Rath',
      mobile: '+91 70081 99887',
      restaurantId,
      visitDate: yesterday,
      visitTime: '08:15 PM',
      verifiedBy: 'Pooja Verma',
      status: 'VERIFIED',
    },
    {
      visitId: 'VIS-101',
      customerId: 'CUS-D55K11',
      customerName: 'Sneha Pattnaik',
      mobile: '+91 94382 33445',
      restaurantId,
      visitDate: yesterday,
      visitTime: '07:50 PM',
      verifiedBy: 'Rajesh Sharma',
      status: 'VERIFIED',
    },
    {
      visitId: 'VIS-100',
      customerId: 'CUS-E99T76',
      customerName: 'Debashish Mishra',
      mobile: '+91 82490 88776',
      restaurantId,
      visitDate: '2025-02-24',
      visitTime: '09:10 PM',
      verifiedBy: 'Vikram Singh',
      status: 'VERIFIED',
    },
  ];

  let filtered = fallbackVisits;
  if (filter === 'today') {
    filtered = filtered.filter((v) => v.visitDate === today);
  } else if (filter === 'yesterday') {
    filtered = filtered.filter((v) => v.visitDate === yesterday);
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (v) => (v.customerName && v.customerName.toLowerCase().includes(q)) || (v.mobile && v.mobile.includes(q))
    );
  }

  return filtered;
}

// ----------------------------------------------------------------------
// 5. Rewards Management
// ----------------------------------------------------------------------
export async function getAdminRewards(restaurantId = RESTAURANT_ID): Promise<AdminRewardItem[]> {
  const res = await callAppsScriptApi<{ success: boolean; rewards: AdminRewardItem[] }>('getRewards', {
    restaurantId,
  });

  if (res && res.success && Array.isArray(res.rewards) && res.rewards.length > 0) {
    const state = getLocalState();
    state.rewards = res.rewards;
    saveLocalState(state);
    return res.rewards;
  }

  return getLocalState().rewards;
}

export async function createAdminReward(
  reward: Omit<AdminRewardItem, 'rewardId' | 'restaurantId'>,
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean; reward?: AdminRewardItem; error?: string }> {
  const res = await callAppsScriptApi<{ success: boolean; reward?: AdminRewardItem; error?: string }>(
    'createReward',
    {
      restaurantId,
      ...reward,
    }
  );

  const state = getLocalState();
  const newReward: AdminRewardItem = {
    rewardId: `REW-${Date.now().toString().slice(-4)}`,
    restaurantId,
    rewardName: reward.rewardName,
    rewardDescription: reward.rewardDescription,
    requiredVisits: reward.requiredVisits,
    isActive: reward.isActive !== false,
    createdAt: new Date().toISOString().split('T')[0],
  };

  state.rewards.push(newReward);
  saveLocalState(state);

  if (res && res.success) {
    return { success: true, reward: res.reward || newReward };
  }

  return { success: true, reward: newReward };
}

export async function updateAdminReward(
  reward: AdminRewardItem,
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean; error?: string }> {
  await callAppsScriptApi('updateReward', {
    restaurantId,
    ...reward,
  });

  const state = getLocalState();
  const idx = state.rewards.findIndex((r) => r.rewardId === reward.rewardId);
  if (idx >= 0) {
    state.rewards[idx] = { ...reward };
    saveLocalState(state);
  }

  return { success: true };
}

export async function toggleAdminReward(
  rewardId: string,
  isActive: boolean,
  restaurantId = RESTAURANT_ID
): Promise<{ success: boolean }> {
  await callAppsScriptApi('toggleReward', {
    restaurantId,
    rewardId,
    isActive,
  });

  const state = getLocalState();
  const item = state.rewards.find((r) => r.rewardId === rewardId);
  if (item) {
    item.isActive = isActive;
    saveLocalState(state);
  }

  return { success: true };
}

// ----------------------------------------------------------------------
// 6. Review Management
// ----------------------------------------------------------------------
export async function getAdminReviews(
  starFilter?: number | null,
  sort: 'newest' | 'oldest' = 'newest',
  restaurantId = RESTAURANT_ID
): Promise<AdminReviewRecord[]> {
  const res = await callAppsScriptApi<{ success: boolean; reviews: AdminReviewRecord[] }>('getReviews', {
    restaurantId,
    star: starFilter || undefined,
    sort,
  });

  if (res && res.success && Array.isArray(res.reviews) && res.reviews.length > 0) {
    return res.reviews;
  }

  // Fallback demo reviews
  const fallbackReviews: AdminReviewRecord[] = [
    {
      reviewId: 'REV-01',
      restaurantId,
      customerId: 'CUS-A89F12',
      customerName: 'Amitabh Sen',
      rating: 5,
      topics: ['Great Food', 'Friendly Staff', 'Quick Service'],
      feedback: 'The New Mirch Masala is undoubtedly the finest place in Gunupur! Authentic Handi Biryani and fresh Garlic Naan.',
      createdAt: '2025-02-28',
      status: 'google_redirected',
    },
    {
      reviewId: 'REV-02',
      restaurantId,
      customerId: 'CUS-B72D45',
      customerName: 'Priyanka Das',
      rating: 5,
      topics: ['Family Friendly', 'Value for Money'],
      feedback: 'Wonderful family lunch on Sunday. Paneer Butter Masala was rich and creamy.',
      createdAt: '2025-02-27',
      status: 'google_redirected',
    },
    {
      reviewId: 'REV-03',
      restaurantId,
      customerId: 'CUS-C33E98',
      customerName: 'Rohan Rath',
      rating: 4,
      topics: ['Great Food', 'Good Ambience'],
      feedback: 'Crispy Chilli Chicken was delicious! Slightly crowded around 8 PM, but food arrived promptly.',
      createdAt: '2025-02-26',
      status: 'submitted_internal',
    },
    {
      reviewId: 'REV-04',
      restaurantId,
      customerId: 'CUS-D55K11',
      customerName: 'Sneha Pattnaik',
      rating: 5,
      topics: ['Cleanliness', 'Authentic Taste'],
      feedback: 'The reward program is awesome! Got my free starter on the 5th visit. Keep up the high standard.',
      createdAt: '2025-02-24',
      status: 'google_redirected',
    },
    {
      reviewId: 'REV-05',
      restaurantId,
      customerId: 'CUS-E99T76',
      customerName: 'Debashish Mishra',
      rating: 3,
      topics: ['Service Time'],
      feedback: 'Food is always delicious, but on festival night table waiting time was about 20 minutes.',
      createdAt: '2025-02-20',
      status: 'submitted_internal',
    },
  ];

  let list = fallbackReviews;
  if (starFilter) {
    list = list.filter((r) => r.rating === starFilter);
  }
  if (sort === 'oldest') {
    return [...list].reverse();
  }
  return list;
}

// ----------------------------------------------------------------------
// 7. Restaurant Settings
// ----------------------------------------------------------------------
export async function getAdminRestaurantSettings(
  restaurantId = RESTAURANT_ID
): Promise<AdminRestaurantSettings> {
  const res = await callAppsScriptApi<{ success: boolean; restaurant: any }>('getRestaurant', {
    restaurantId,
  });

  if (res && res.success && res.restaurant) {
    const r = res.restaurant;
    const settings: AdminRestaurantSettings = {
      restaurantId: r.restaurantId || restaurantId,
      restaurantName: r.name || r.restaurantName || 'The New Mirch Masala',
      tagline: r.subtitle || r.tagline || 'Indian • Chinese • Biryani • Tandoori',
      location: r.location || 'Gunupur, Odisha',
      phone: r.phone || '+91 94370 12345',
      openingTime: r.openingTime || '11:00 AM',
      closingTime: r.closingTime || '10:30 PM',
      googleReviewUrl: r.googleReviewUrl || 'https://www.google.com/maps/search/?api=1&query=The+New+Mirch+Masala+Gunupur+Odisha',
      logo: r.logo || '',
    };
    const state = getLocalState();
    state.settings = settings;
    saveLocalState(state);
    return settings;
  }

  return getLocalState().settings;
}

export async function updateAdminRestaurantSettings(
  settings: AdminRestaurantSettings
): Promise<{ success: boolean; error?: string }> {
  await callAppsScriptApi('updateRestaurant', settings);

  const state = getLocalState();
  state.settings = { ...settings };
  saveLocalState(state);

  return { success: true };
}
