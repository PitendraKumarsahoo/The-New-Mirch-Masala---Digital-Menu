import { useState, useEffect, useCallback } from 'react';
import { CustomerPreferences, SpicePreferenceLevel, DietaryPreference } from '../types/profile';
import { getCustomerSession } from './loyaltyService';

const PREFERENCES_STORAGE_KEY = 'mirch_customer_preferences_v2';
const EVENT_PREFERENCES_UPDATED = 'mirch_preferences_updated';

const DEFAULT_PREFERENCES: CustomerPreferences = {
  spiceLevel: 'medium',
  dietaryPreference: 'all',
  specialInstructions: '',
  favoriteDishIds: [],
  favoriteQuantities: {},
  lastUpdated: new Date().toISOString(),
};

function getStorageKey(customerId?: string): string {
  const activeId = customerId || getCustomerSession()?.customerId;
  return activeId ? `${PREFERENCES_STORAGE_KEY}_${activeId}` : PREFERENCES_STORAGE_KEY;
}

/**
 * Retrieve saved customer preferences from localStorage
 */
export function getCustomerPreferences(customerId?: string): CustomerPreferences {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_PREFERENCES };
  }

  try {
    const key = getStorageKey(customerId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // Also check fallback global key if user just logged in
      const globalRaw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (globalRaw) {
        const parsedGlobal = JSON.parse(globalRaw);
        const favIds = Array.isArray(parsedGlobal.favoriteDishIds) ? parsedGlobal.favoriteDishIds : [];
        const quantities: Record<string, number> = { ...(parsedGlobal.favoriteQuantities || {}) };
        for (const id of favIds) {
          if (!quantities[id] || quantities[id] < 1) quantities[id] = 1;
        }
        return {
          ...DEFAULT_PREFERENCES,
          ...parsedGlobal,
          favoriteDishIds: favIds,
          favoriteQuantities: quantities,
        };
      }
      return { ...DEFAULT_PREFERENCES };
    }
    const parsed = JSON.parse(raw);
    const favIds = Array.isArray(parsed.favoriteDishIds) ? parsed.favoriteDishIds : [];
    const quantities: Record<string, number> = { ...(parsed.favoriteQuantities || {}) };
    for (const id of favIds) {
      if (!quantities[id] || quantities[id] < 1) quantities[id] = 1;
    }
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      favoriteDishIds: favIds,
      favoriteQuantities: quantities,
    };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Persist customer preferences to localStorage and notify listeners
 */
export function saveCustomerPreferences(
  prefs: CustomerPreferences,
  customerId?: string
): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    const key = getStorageKey(customerId);
    const updated: CustomerPreferences = {
      ...prefs,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(updated));
    // Also save to global key for seamless guest -> logged-in experience
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));

    window.dispatchEvent(
      new CustomEvent(EVENT_PREFERENCES_UPDATED, { detail: updated })
    );
  } catch {
    // Ignore quota errors
  }
}

/**
 * Check if a dish is in favorites
 */
export function isDishFavorite(dishId: string, customerId?: string): boolean {
  if (!dishId) return false;
  const prefs = getCustomerPreferences(customerId);
  return prefs.favoriteDishIds.includes(dishId);
}

/**
 * Get all favorite dish IDs
 */
export function getFavoriteDishIds(customerId?: string): string[] {
  return getCustomerPreferences(customerId).favoriteDishIds;
}

/**
 * Get favorite quantity for a dish (returns 0 if not favorite, defaults to 1 if favorite)
 */
export function getFavoriteQuantity(dishId: string, customerId?: string): number {
  if (!dishId) return 0;
  const prefs = getCustomerPreferences(customerId);
  if (!prefs.favoriteDishIds.includes(dishId)) return 0;
  return prefs.favoriteQuantities?.[dishId] || 1;
}

/**
 * Update quantity for a favorite dish (if <= 0, removes from favorites)
 */
export function setFavoriteQuantity(
  dishId: string,
  quantity: number,
  customerId?: string
): CustomerPreferences {
  if (!dishId) return getCustomerPreferences(customerId);
  const current = getCustomerPreferences(customerId);
  const quantities: Record<string, number> = { ...(current.favoriteQuantities || {}) };
  let favIds = [...current.favoriteDishIds];

  if (quantity <= 0) {
    favIds = favIds.filter((id) => id !== dishId);
    delete quantities[dishId];
  } else {
    if (!favIds.includes(dishId)) {
      favIds.push(dishId);
    }
    quantities[dishId] = quantity;
  }

  const updated: CustomerPreferences = {
    ...current,
    favoriteDishIds: favIds,
    favoriteQuantities: quantities,
  };
  saveCustomerPreferences(updated, customerId);
  return updated;
}

/**
 * Increment favorite quantity (+1)
 */
export function incrementFavoriteQuantity(
  dishId: string,
  customerId?: string
): CustomerPreferences {
  const current = getFavoriteQuantity(dishId, customerId);
  const nextQty = current > 0 ? current + 1 : 1;
  return setFavoriteQuantity(dishId, nextQty, customerId);
}

/**
 * Decrement favorite quantity (-1). If it reaches 0, removes from favorites
 */
export function decrementFavoriteQuantity(
  dishId: string,
  customerId?: string
): CustomerPreferences {
  const current = getFavoriteQuantity(dishId, customerId);
  const nextQty = Math.max(0, current - 1);
  return setFavoriteQuantity(dishId, nextQty, customerId);
}

/**
 * Explicitly remove a dish from favorites and its quantity
 */
export function removeFavoriteDish(
  dishId: string,
  customerId?: string
): CustomerPreferences {
  return setFavoriteQuantity(dishId, 0, customerId);
}

/**
 * Reset all favorite dish quantities to 1
 */
export function resetAllFavoriteQuantities(
  defaultQty = 1,
  customerId?: string
): CustomerPreferences {
  const current = getCustomerPreferences(customerId);
  const quantities: Record<string, number> = {};
  for (const id of current.favoriteDishIds) {
    quantities[id] = defaultQty;
  }
  const updated: CustomerPreferences = {
    ...current,
    favoriteQuantities: quantities,
  };
  saveCustomerPreferences(updated, customerId);
  return updated;
}

/**
 * Toggle favorite dish status
 */
export function toggleFavoriteDish(
  dishId: string,
  customerId?: string
): { isFavorite: boolean; favorites: string[] } {
  if (!dishId) return { isFavorite: false, favorites: [] };

  const current = getCustomerPreferences(customerId);
  const exists = current.favoriteDishIds.includes(dishId);
  const quantities: Record<string, number> = { ...(current.favoriteQuantities || {}) };

  let updatedFavorites: string[];
  if (exists) {
    updatedFavorites = current.favoriteDishIds.filter((id) => id !== dishId);
    delete quantities[dishId];
  } else {
    updatedFavorites = [...current.favoriteDishIds, dishId];
    quantities[dishId] = quantities[dishId] && quantities[dishId] > 0 ? quantities[dishId] : 1;
  }

  const updatedPrefs: CustomerPreferences = {
    ...current,
    favoriteDishIds: updatedFavorites,
    favoriteQuantities: quantities,
  };

  saveCustomerPreferences(updatedPrefs, customerId);

  return {
    isFavorite: !exists,
    favorites: updatedFavorites,
  };
}

/**
 * Update spice preference
 */
export function updateSpicePreference(
  spiceLevel: SpicePreferenceLevel,
  customerId?: string
): CustomerPreferences {
  const current = getCustomerPreferences(customerId);
  const updated: CustomerPreferences = {
    ...current,
    spiceLevel,
  };
  saveCustomerPreferences(updated, customerId);
  return updated;
}

/**
 * Update dietary preference
 */
export function updateDietaryPreference(
  dietaryPreference: DietaryPreference,
  customerId?: string
): CustomerPreferences {
  const current = getCustomerPreferences(customerId);
  const updated: CustomerPreferences = {
    ...current,
    dietaryPreference,
  };
  saveCustomerPreferences(updated, customerId);
  return updated;
}

/**
 * Update special cooking instructions
 */
export function updateSpecialInstructions(
  specialInstructions: string,
  customerId?: string
): CustomerPreferences {
  const current = getCustomerPreferences(customerId);
  const updated: CustomerPreferences = {
    ...current,
    specialInstructions,
  };
  saveCustomerPreferences(updated, customerId);
  return updated;
}

/**
 * Subscribe to customer preference changes across components
 */
export function subscribeToPreferences(
  callback: (prefs: CustomerPreferences) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent<CustomerPreferences>;
    callback(custom.detail || getCustomerPreferences());
  };

  window.addEventListener(EVENT_PREFERENCES_UPDATED, handler);
  return () => window.removeEventListener(EVENT_PREFERENCES_UPDATED, handler);
}

/**
 * React Hook to access and mutate customer preferences reactively
 */
export function useCustomerPreferences(customerId?: string) {
  const [preferences, setPreferences] = useState<CustomerPreferences>(() =>
    getCustomerPreferences(customerId)
  );

  useEffect(() => {
    setPreferences(getCustomerPreferences(customerId));
    const unsubscribe = subscribeToPreferences((updated) => {
      setPreferences(updated);
    });
    return unsubscribe;
  }, [customerId]);

  const toggleFav = useCallback(
    (dishId: string) => {
      return toggleFavoriteDish(dishId, customerId);
    },
    [customerId]
  );

  const checkIsFav = useCallback(
    (dishId: string) => {
      return preferences.favoriteDishIds.includes(dishId);
    },
    [preferences.favoriteDishIds]
  );

  const setSpice = useCallback(
    (level: SpicePreferenceLevel) => {
      const updated = updateSpicePreference(level, customerId);
      setPreferences(updated);
    },
    [customerId]
  );

  const setDietary = useCallback(
    (pref: DietaryPreference) => {
      const updated = updateDietaryPreference(pref, customerId);
      setPreferences(updated);
    },
    [customerId]
  );

  const setInstructions = useCallback(
    (instructions: string) => {
      const updated = updateSpecialInstructions(instructions, customerId);
      setPreferences(updated);
    },
    [customerId]
  );

  const getQty = useCallback(
    (dishId: string) => {
      if (!dishId) return 0;
      if (!preferences.favoriteDishIds.includes(dishId)) return 0;
      return preferences.favoriteQuantities?.[dishId] || 1;
    },
    [preferences.favoriteDishIds, preferences.favoriteQuantities]
  );

  const setQty = useCallback(
    (dishId: string, quantity: number) => {
      const updated = setFavoriteQuantity(dishId, quantity, customerId);
      setPreferences(updated);
      return updated;
    },
    [customerId]
  );

  const incrementQty = useCallback(
    (dishId: string) => {
      const updated = incrementFavoriteQuantity(dishId, customerId);
      setPreferences(updated);
      return updated;
    },
    [customerId]
  );

  const decrementQty = useCallback(
    (dishId: string) => {
      const updated = decrementFavoriteQuantity(dishId, customerId);
      setPreferences(updated);
      return updated;
    },
    [customerId]
  );

  const removeFav = useCallback(
    (dishId: string) => {
      const updated = removeFavoriteDish(dishId, customerId);
      setPreferences(updated);
      return updated;
    },
    [customerId]
  );

  const resetAllQuantities = useCallback(
    (defaultQty = 1) => {
      const updated = resetAllFavoriteQuantities(defaultQty, customerId);
      setPreferences(updated);
      return updated;
    },
    [customerId]
  );

  return {
    preferences,
    favoriteDishIds: preferences.favoriteDishIds,
    favoriteQuantities: preferences.favoriteQuantities || {},
    isFavorite: checkIsFav,
    toggleFavorite: toggleFav,
    getQuantity: getQty,
    setQuantity: setQty,
    incrementQuantity: incrementQty,
    decrementQuantity: decrementQty,
    removeFavorite: removeFav,
    resetQuantities: resetAllQuantities,
    setSpiceLevel: setSpice,
    setDietaryPreference: setDietary,
    setSpecialInstructions: setInstructions,
  };
}
