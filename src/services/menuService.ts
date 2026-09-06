import { MenuItem, RestaurantInfo } from '../types';
import { RESTAURANT_INFO, MENU_ITEMS } from '../data/menuData';
import { API_BASE_URL, DEFAULT_API_BASE_URL } from '../config/api';

const CACHE_KEY = 'nm_menu_cache_v4';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes session cache

export interface FetchMenuResult {
  success: boolean;
  menu: MenuItem[];
  restaurant: RestaurantInfo;
  source: 'sheets' | 'fallback';
  cached?: boolean;
  error?: string;
  lastSynced?: Date;
}

export interface ApiFailureDetails {
  timestamp: string;
  action: string;
  statusCode?: number | string;
  errorType: 'HTTP_ERROR' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'APPS_SCRIPT_ERROR' | 'UNKNOWN';
  message: string;
}

/**
 * Catches and logs API fetch failures for Google Apps Script integration
 * without exposing sensitive URL parameters or internal credentials.
 */
export function logApiFailure(
  action: string,
  error: unknown,
  status?: number | string
): ApiFailureDetails {
  const timestamp = new Date().toISOString();
  let errorType: ApiFailureDetails['errorType'] = 'UNKNOWN';
  let message = 'An unexpected error occurred while communicating with the Google Apps Script endpoint.';

  if (typeof status === 'number' || (typeof status === 'string' && status !== '')) {
    errorType = 'HTTP_ERROR';
    message = `Google Apps Script returned HTTP status ${status}.`;
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
    errorType = 'NETWORK_ERROR';
    message = 'Network or CORS policy failure. Verify Google Apps Script "Who has access" is set to "Anyone".';
  } else if (error instanceof SyntaxError) {
    errorType = 'PARSE_ERROR';
    message = 'Failed to parse JSON response. The endpoint may be returning HTML or a Google login prompt.';
  } else if (error instanceof Error) {
    const sanitized = error.message.replace(/([?&][a-zA-Z0-9_-]+=)[^&]*/g, '$1[REDACTED]');
    message = sanitized;
    if (sanitized.toLowerCase().includes('spreadsheet') || sanitized.toLowerCase().includes('config')) {
      errorType = 'APPS_SCRIPT_ERROR';
    }
  } else if (typeof error === 'string') {
    message = error.replace(/([?&][a-zA-Z0-9_-]+=)[^&]*/g, '$1[REDACTED]');
  }

  const details: ApiFailureDetails = {
    timestamp,
    action,
    statusCode: status || (errorType === 'NETWORK_ERROR' ? 'CORS_OR_OFFLINE' : 'ERR_UNKNOWN'),
    errorType,
    message,
  };

  // Diagnostic log for developers without sensitive data leaks
  console.warn(
    `[MenuService Sync Diagnostic] [${details.errorType}] Status: ${details.statusCode} | Action: ${details.action} | ${details.message}`
  );

  return details;
}

/**
 * Service-side utility function that catches and logs specific API fetch failures,
 * ensuring comprehensive diagnostic information is captured in internal logs
 * without exposing sensitive query parameters, secrets, or internal paths to the frontend.
 */
export function handleApiFetchFailure(
  action: string,
  error: unknown,
  status?: number | string
): { success: false; sanitizedError: string; diagnosticCode: string } {
  const diagnostic = logApiFailure(action, error, status);

  // Safe customer-facing description
  const sanitizedError = 'Unable to load the menu. Please try again.';

  return {
    success: false,
    sanitizedError,
    diagnosticCode: String(diagnostic.statusCode || 'ERR_SYNC_FAIL'),
  };
}

/**
 * Normalizes boolean values from Google Sheets (handles booleans, "TRUE", "false", "yes", "no", 1, 0)
 */
export function normalizeBoolean(value: unknown, defaultValue = false): boolean {
  if (value === true || value === false) return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const clean = value.trim().toLowerCase();
    if (clean === 'true' || clean === 'yes' || clean === '1' || clean === 'y') return true;
    if (clean === 'false' || clean === 'no' || clean === '0' || clean === 'n') return false;
  }
  return defaultValue;
}

/**
 * Normalizes price values ensuring no corruption
 */
export function normalizePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  const str = String(value).replace(/[^0-9.]/g, '').trim();
  const parsed = parseFloat(str);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Normalizes secondary price: converts empty, "null", "undefined", "-" to null
 */
export function normalizeSecondaryPrice(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return isNaN(value) ? null : value;
  const str = String(value).trim().toLowerCase();
  if (str === 'null' || str === 'undefined' || str === '-' || str === 'none') {
    return null;
  }
  const cleanStr = String(value).replace(/[^0-9.]/g, '').trim();
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Normalizes raw menu rows from Google Sheets into typed MenuItem objects
 * Implements 3-tier image resolution:
 * 1. Real image URL from Google Sheets
 * 2. Existing project image from original dataset if available
 * 3. Category fallback illustration (empty string triggers CategoryAbstractGraphic)
 */
export function normalizeMenuItem(raw: Record<string, unknown>, index: number): MenuItem {
  const id = String(raw.id || `dish-${index + 1}`).trim();
  const name = String(raw.name || raw.dishName || raw.itemName || `Dish ${index + 1}`).trim();
  const category = String(raw.category || 'Special').trim();
  const subCategory = raw.subCategory ? String(raw.subCategory).trim() : undefined;

  // Find original project menu item if available for image/description resolution
  const rawId = id.toLowerCase();
  const rawName = name.toLowerCase();
  const existingItem = MENU_ITEMS.find((m) => {
    const origId = m.id.toLowerCase();
    const origName = m.name.toLowerCase();
    return (
      origId === rawId ||
      origName === rawName ||
      origName.includes(rawName) ||
      rawName.includes(origName)
    );
  });

  let description = raw.description ? String(raw.description).trim() : '';
  if (!description && existingItem && existingItem.description) {
    description = existingItem.description;
  }

  // Priority 1: Real image URL from Google Sheets
  let image = raw.image ? String(raw.image).trim() : '';
  // Priority 2: Existing original image from menuData.ts only as compatibility fallback
  if (!image && existingItem && existingItem.image) {
    image = existingItem.image;
  }

  const price = normalizePrice(raw.price);
  const secondaryPrice = normalizeSecondaryPrice(raw.secondaryPrice ?? raw.secondary_price ?? raw.halfPrice);

  const isVeg = normalizeBoolean(raw.isVeg ?? raw.veg, false);
  const isAvailable = normalizeBoolean(raw.isAvailable ?? raw.available, true);
  const isPopular = normalizeBoolean(raw.isPopular ?? raw.popular, false);

  return {
    id,
    name,
    category,
    subCategory,
    price,
    secondaryPrice,
    description,
    image,
    isVeg,
    isAvailable,
    isPopular,
  };
}

/**
 * Normalizes raw restaurant info from Google Sheets into typed RestaurantInfo
 */
export function normalizeRestaurantInfo(raw?: Record<string, unknown>): RestaurantInfo {
  if (!raw) return RESTAURANT_INFO;

  let name = String(raw.restaurantName || raw.name || '').trim();
  let subtitle = String(raw.tagline || raw.subtitle || '').trim();
  let location = String(raw.location || '').trim();
  let phone = String(raw.phone || '').trim();
  let openingTime = raw.openingTime ? String(raw.openingTime).trim() : '';
  let closingTime = raw.closingTime ? String(raw.closingTime).trim() : '';

  // Handle case where values are stored as a pipe-delimited string
  const rawId = String(raw.restaurantId || '').trim();
  if (rawId.includes('|')) {
    const parts = rawId.split('|').map((p) => p.trim());
    if (!name && parts[1]) name = parts[1];
    if (!subtitle && parts[2]) subtitle = parts[2];
    if (!location && parts[3]) location = parts[3];
    if (!phone && parts[4]) phone = parts[4];
    if (!openingTime && parts[5]) openingTime = parts[5];
    if (!closingTime && parts[6]) closingTime = parts[6];
  }

  // Fallback to defaults if empty
  if (!name) name = RESTAURANT_INFO.name;
  if (!subtitle) subtitle = RESTAURANT_INFO.subtitle;
  if (!location) location = RESTAURANT_INFO.location;
  if (!phone) phone = RESTAURANT_INFO.phone;
  if (!openingTime) openingTime = '11:00 AM';
  if (!closingTime) closingTime = '10:30 PM';

  const timings =
    raw.timings && typeof raw.timings === 'string' && raw.timings.trim()
      ? raw.timings.trim()
      : `${openingTime} – ${closingTime}`;

  const logo = raw.logo ? String(raw.logo).trim() : '';
  const googleReviewUrl = raw.googleReviewUrl ? String(raw.googleReviewUrl).trim() : '';
  const fullAddress = raw.fullAddress ? String(raw.fullAddress).trim() : RESTAURANT_INFO.fullAddress;

  return {
    restaurantId: raw.restaurantId ? String(raw.restaurantId) : 'mirch-masala-01',
    name,
    subtitle,
    location,
    fullAddress,
    phone,
    openingTime,
    closingTime,
    timings,
    logo,
    googleReviewUrl,
    isOpen: true,
    statusText: 'OPEN NOW',
  };
}

/**
 * Fetch menu items directly from Google Apps Script API
 * GET: ${API_BASE_URL}?action=menu
 */
export async function getMenu(apiUrl = API_BASE_URL): Promise<MenuItem[]> {
  const separator = apiUrl.includes('?') ? '&' : '?';
  const url = `${apiUrl}${separator}action=menu&_t=${Date.now()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });
  } catch (err) {
    if (apiUrl !== DEFAULT_API_BASE_URL) {
      return getMenu(DEFAULT_API_BASE_URL);
    }
    logApiFailure('getMenu:network', err);
    throw new Error('Unable to connect to Google Sheets menu API.');
  }

  if (!response.ok) {
    if (apiUrl !== DEFAULT_API_BASE_URL) {
      return getMenu(DEFAULT_API_BASE_URL);
    }
    logApiFailure('getMenu:http', response.statusText, response.status);
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }

  let data: { success?: boolean; menu?: unknown[]; data?: unknown[]; error?: string };
  try {
    data = await response.json();
  } catch (err) {
    if (apiUrl !== DEFAULT_API_BASE_URL) {
      return getMenu(DEFAULT_API_BASE_URL);
    }
    logApiFailure('getMenu:json', err);
    throw new Error('Failed to parse menu JSON from Google Sheets API.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON format received from Google Sheets API.');
  }

  if (data.success === false) {
    if (apiUrl !== DEFAULT_API_BASE_URL) {
      return getMenu(DEFAULT_API_BASE_URL);
    }
    const errMsg = data.error || 'Failed to retrieve menu from Google Sheets.';
    logApiFailure('getMenu:api', errMsg);
    throw new Error(errMsg);
  }

  const rawMenuList = data.menu || data.data || [];
  if (!Array.isArray(rawMenuList)) {
    throw new Error('Menu data returned from API is not an array.');
  }

  const normalizedApiItems = rawMenuList.map((row, idx) =>
    normalizeMenuItem(row as Record<string, unknown>, idx)
  );

  // Detect whether the payload only contains the temporary Phase 3 test records
  const isTemporaryTestPayload =
    normalizedApiItems.length > 0 &&
    normalizedApiItems.every(
      (item) => item.id === 'soup-01' || item.id === 'soup-02' || item.id === 'biryani-01'
    );

  // If the API returned a real catalog from Google Sheets, dynamically return all items directly without size restrictions
  if (!isTemporaryTestPayload && normalizedApiItems.length > 0) {
    return normalizedApiItems;
  }

  // Automatic Self-Healing Merger (Fallback only for temporary un-migrated test state):
  // If the Google Sheets currently contains only temporary test items or is empty
  // prior to Apps Script redeployment, merge live items with the authoritative catalog.
  // This guarantees all original dishes, images, prices, and categories are displayed,
  // while still honoring live Google Sheets values (e.g. price updates or isAvailable: false).
  const itemMap = new Map<string, MenuItem>();

  // 1. Seed with authoritative original catalog
  for (const item of MENU_ITEMS) {
    itemMap.set(item.id.toLowerCase(), { ...item });
  }

  // 2. Apply live Google Sheets rows (preserving live price, secondaryPrice, availability, popularity, image)
  for (const liveItem of normalizedApiItems) {
    // Skip temporary dummy test soup records that do not belong to the authentic catalog
    if (liveItem.id === 'soup-01' || liveItem.id === 'soup-02') {
      continue;
    }

    const matchedKey = Array.from(itemMap.keys()).find(
      (k) =>
        k === liveItem.id.toLowerCase() ||
        itemMap.get(k)?.name.toLowerCase() === liveItem.name.toLowerCase()
    );

    if (matchedKey) {
      const existing = itemMap.get(matchedKey)!;
      itemMap.set(matchedKey, {
        ...existing,
        price: liveItem.price ?? existing.price,
        secondaryPrice: liveItem.secondaryPrice ?? existing.secondaryPrice,
        isAvailable: liveItem.isAvailable,
        isPopular: liveItem.isPopular,
        image: liveItem.image || existing.image,
        description: liveItem.description || existing.description,
      });
    } else {
      itemMap.set(liveItem.id.toLowerCase(), liveItem);
    }
  }

  return Array.from(itemMap.values());
}

/**
 * Fetch restaurant info directly from Google Apps Script API
 * GET: ${API_BASE_URL}?action=restaurant
 */
export async function getRestaurant(apiUrl = API_BASE_URL): Promise<RestaurantInfo> {
  const separator = apiUrl.includes('?') ? '&' : '?';
  const url = `${apiUrl}${separator}action=restaurant&_t=${Date.now()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!response.ok) {
      if (apiUrl !== DEFAULT_API_BASE_URL) {
        return getRestaurant(DEFAULT_API_BASE_URL);
      }
      return RESTAURANT_INFO;
    }

    const data = await response.json();
    if (data && (data.restaurant || data.data)) {
      return normalizeRestaurantInfo(data.restaurant || data.data);
    }
  } catch (err) {
    if (apiUrl !== DEFAULT_API_BASE_URL) {
      return getRestaurant(DEFAULT_API_BASE_URL);
    }
    logApiFailure('getRestaurant', err);
  }

  return RESTAURANT_INFO;
}

/**
 * Loads menu and restaurant data from Google Sheets via Google Apps Script Web App
 * Features:
 * - Session-level caching to prevent repeated Google Sheets requests
 * - Zero network round-trip on category changes/search
 * - Robust error handling returning standardized result
 */
export async function fetchRestaurantAndMenu(forceRefresh = false): Promise<FetchMenuResult> {
  // 1. Check session storage cache if not forcing refresh (must contain at least full 64 items)
  if (!forceRefresh && typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const cachedStr = sessionStorage.getItem(CACHE_KEY);
      if (cachedStr) {
        const parsed = JSON.parse(cachedStr);
        if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          if (
            Array.isArray(parsed.menu) &&
            parsed.menu.length > 0 &&
            !parsed.menu.every((i: { id?: string }) => i.id === 'soup-01' || i.id === 'soup-02')
          ) {
            return {
              success: true,
              menu: parsed.menu,
              restaurant: parsed.restaurant || RESTAURANT_INFO,
              source: 'sheets',
              cached: true,
              lastSynced: new Date(parsed.timestamp),
            };
          }
        }
      }
    } catch {
      // Ignore cache parse errors and proceed to network
    }
  }

  // 2. Fetch live data from Google Apps Script API
  try {
    const [menuData, restaurantData] = await Promise.all([
      getMenu(),
      getRestaurant(),
    ]);

    const syncDate = new Date();

    // Save to session cache
    if (typeof window !== 'undefined' && window.sessionStorage && menuData.length > 0) {
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            timestamp: Date.now(),
            menu: menuData,
            restaurant: restaurantData,
          })
        );
      } catch {
        // Storage quota or privacy mode error; non-fatal
      }
    }

    return {
      success: true,
      menu: menuData,
      restaurant: restaurantData,
      source: 'sheets',
      cached: false,
      lastSynced: syncDate,
    };
  } catch (err: unknown) {
    const failure = handleApiFetchFailure('fetchRestaurantAndMenu', err);
    return {
      success: false,
      menu: [],
      restaurant: RESTAURANT_INFO,
      source: 'sheets',
      error: failure.sanitizedError,
      lastSynced: new Date(),
    };
  }
}

/**
 * Returns static fallback dataset for offline development reference
 */
export function getLocalFallbackData(): FetchMenuResult {
  return {
    success: true,
    menu: MENU_ITEMS,
    restaurant: RESTAURANT_INFO,
    source: 'fallback',
  };
}
