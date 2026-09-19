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
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(globalRaw) };
      }
      return { ...DEFAULT_PREFERENCES };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      favoriteDishIds: Array.isArray(parsed.favoriteDishIds) ? parsed.favoriteDishIds : [],
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
 * Toggle favorite dish status
 */
export function toggleFavoriteDish(
  dishId: string,
  customerId?: string
): { isFavorite: boolean; favorites: string[] } {
  if (!dishId) return { isFavorite: false, favorites: [] };

  const current = getCustomerPreferences(customerId);
  const exists = current.favoriteDishIds.includes(dishId);
  const updatedFavorites = exists
    ? current.favoriteDishIds.filter((id) => id !== dishId)
    : [...current.favoriteDishIds, dishId];

  const updatedPrefs: CustomerPreferences = {
    ...current,
    favoriteDishIds: updatedFavorites,
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

  return {
    preferences,
    favoriteDishIds: preferences.favoriteDishIds,
    isFavorite: checkIsFav,
    toggleFavorite: toggleFav,
    setSpiceLevel: setSpice,
    setDietaryPreference: setDietary,
    setSpecialInstructions: setInstructions,
  };
}
