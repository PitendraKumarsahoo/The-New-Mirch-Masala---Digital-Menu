import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';

const ORDER_STORAGE_KEY = 'mirch_table_order_v1';
const EVENT_ORDER_UPDATED = 'mirch_table_order_updated';
export const EVENT_ITEM_ADDED_TO_ORDER = 'mirch_item_added_to_order';

export type PortionType = 'half' | 'full';

export interface OrderToastPayload {
  id: string;
  dishId: string;
  name: string;
  portion?: PortionType;
  price: number;
  quantity: number;
  totalQuantity: number;
  image?: string;
  isVeg?: boolean;
  timestamp: number;
}

export interface TableOrderItem {
  dishId: string;
  quantity: number;
  portion?: PortionType;
}

export interface TableOrderState {
  items: Record<string, number>; // itemKey -> quantity (e.g., 'biryani-chicken', 'biryani-chicken__half', 'biryani-chicken__full')
  selectedTable: string;
  lastUpdated: string;
}

const DEFAULT_ORDER_STATE: TableOrderState = {
  items: {},
  selectedTable: 'Table 4',
  lastUpdated: new Date().toISOString(),
};

/**
 * Check if a dish has dual prices (Full and Half)
 */
export function hasDualPortion(item: MenuItem | null | undefined): boolean {
  if (!item) return false;
  return (
    typeof item.secondaryPrice === 'number' &&
    !isNaN(item.secondaryPrice) &&
    item.secondaryPrice > 0 &&
    typeof item.price === 'number' &&
    item.price > 0 &&
    item.price !== item.secondaryPrice
  );
}

/**
 * Get effective prices for Full and Half
 */
export function getPortionPrices(item: MenuItem): { fullPrice: number; halfPrice: number } {
  const p1 = Number(item.price) || 0;
  const p2 = typeof item.secondaryPrice === 'number' ? Number(item.secondaryPrice) : p1;
  return {
    fullPrice: Math.max(p1, p2),
    halfPrice: Math.min(p1, p2),
  };
}

/**
 * Build unique item key for storage
 */
export function buildOrderItemKey(dishId: string, portion?: PortionType): string {
  if (!dishId) return '';
  if (portion === 'half') return `${dishId}__half`;
  if (portion === 'full') return `${dishId}__full`;
  return dishId;
}

/**
 * Parse item key into dishId and portion
 */
export function parseOrderItemKey(key: string): { dishId: string; portion?: PortionType } {
  if (key.endsWith('__half')) {
    return { dishId: key.slice(0, -6), portion: 'half' };
  }
  if (key.endsWith('__full')) {
    return { dishId: key.slice(0, -6), portion: 'full' };
  }
  return { dishId: key };
}

/**
 * Dispatch toast notification event when item is added
 */
export function triggerOrderToast(payload: OrderToastPayload): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<OrderToastPayload>(EVENT_ITEM_ADDED_TO_ORDER, { detail: payload })
  );
}

/**
 * Get current table order from localStorage
 */
export function getTableOrder(): TableOrderState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_ORDER_STATE };
  }
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_ORDER_STATE };
    const parsed = JSON.parse(raw);
    const cleanItems: Record<string, number> = {};
    if (parsed.items && typeof parsed.items === 'object') {
      for (const [id, qty] of Object.entries(parsed.items)) {
        const num = Number(qty);
        if (id && !isNaN(num) && num > 0) {
          cleanItems[id] = num;
        }
      }
    }
    return {
      items: cleanItems,
      selectedTable: parsed.selectedTable || 'Table 4',
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch {
    return { ...DEFAULT_ORDER_STATE };
  }
}

/**
 * Save table order to localStorage and dispatch update event
 */
export function saveTableOrder(order: TableOrderState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const updated: TableOrderState = {
      ...order,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent(EVENT_ORDER_UPDATED, { detail: updated })
    );
  } catch {
    // ignore quota errors
  }
}

/**
 * Get breakdown of portions for a specific dish
 */
export function getDishPortions(dishId: string): {
  half: number;
  full: number;
  single: number;
  total: number;
} {
  if (!dishId) return { half: 0, full: 0, single: 0, total: 0 };
  const order = getTableOrder();
  const half = order.items[`${dishId}__half`] || 0;
  const full = order.items[`${dishId}__full`] || 0;
  const single = order.items[dishId] || 0;
  return {
    half,
    full,
    single,
    total: half + full + single,
  };
}

/**
 * Get quantity for a specific dish or key
 */
export function getOrderItemQuantity(dishIdOrKey: string, portion?: PortionType): number {
  if (!dishIdOrKey) return 0;
  const order = getTableOrder();

  if (portion) {
    const key = buildOrderItemKey(dishIdOrKey, portion);
    return order.items[key] || 0;
  }

  // If exact key exists (e.g. 'dishId__half' or single 'dishId')
  if (typeof order.items[dishIdOrKey] === 'number') {
    // If it's a dual-portion item checked by base dishId, sum its variants
    const half = order.items[`${dishIdOrKey}__half`] || 0;
    const full = order.items[`${dishIdOrKey}__full`] || 0;
    return (order.items[dishIdOrKey] || 0) + half + full;
  }

  // Otherwise check if it has portion subkeys
  const half = order.items[`${dishIdOrKey}__half`] || 0;
  const full = order.items[`${dishIdOrKey}__full`] || 0;
  return half + full;
}

/**
 * Update quantity for a specific item key
 */
export function setOrderItemQuantity(
  dishIdOrKey: string,
  quantity: number,
  portion?: PortionType
): TableOrderState {
  if (!dishIdOrKey) return getTableOrder();
  const key = portion ? buildOrderItemKey(dishIdOrKey, portion) : dishIdOrKey;
  const current = getTableOrder();
  const updatedItems = { ...current.items };

  if (quantity <= 0) {
    delete updatedItems[key];
  } else {
    updatedItems[key] = quantity;
  }

  const updated: TableOrderState = {
    ...current,
    items: updatedItems,
  };
  saveTableOrder(updated);
  return updated;
}

/**
 * Increment dish quantity (+1)
 */
export function incrementOrderItem(dishIdOrKey: string, portion?: PortionType): TableOrderState {
  const key = portion ? buildOrderItemKey(dishIdOrKey, portion) : dishIdOrKey;
  const current = getTableOrder();
  const currentQty = current.items[key] || 0;
  return setOrderItemQuantity(key, currentQty + 1);
}

/**
 * Decrement dish quantity (-1). Removes if 0.
 */
export function decrementOrderItem(dishIdOrKey: string, portion?: PortionType): TableOrderState {
  const key = portion ? buildOrderItemKey(dishIdOrKey, portion) : dishIdOrKey;
  const current = getTableOrder();
  const currentQty = current.items[key] || 0;
  return setOrderItemQuantity(key, Math.max(0, currentQty - 1));
}

/**
 * Remove dish or specific portion key entirely from order
 */
export function removeOrderItem(dishIdOrKey: string, portion?: PortionType): TableOrderState {
  if (portion) {
    const key = buildOrderItemKey(dishIdOrKey, portion);
    return setOrderItemQuantity(key, 0);
  }
  // If no portion specified, remove the base key and both portions if any
  const current = getTableOrder();
  const updatedItems = { ...current.items };
  delete updatedItems[dishIdOrKey];
  delete updatedItems[`${dishIdOrKey}__half`];
  delete updatedItems[`${dishIdOrKey}__full`];

  const updated: TableOrderState = {
    ...current,
    items: updatedItems,
  };
  saveTableOrder(updated);
  return updated;
}

/**
 * Add a MenuItem with portion and trigger toast
 */
export function addDishToOrder(
  item: MenuItem,
  portion?: PortionType,
  quantityDelta: number = 1
): TableOrderState {
  const isDual = hasDualPortion(item);
  const actualPortion = isDual ? (portion || 'full') : undefined;
  const key = buildOrderItemKey(item.id, actualPortion);

  const current = getTableOrder();
  const currentQty = current.items[key] || 0;
  const newQty = currentQty + quantityDelta;

  const updated = setOrderItemQuantity(key, newQty);

  // Calculate unit price and display name
  const prices = getPortionPrices(item);
  const unitPrice = actualPortion === 'half' ? prices.halfPrice : prices.fullPrice;
  const portionLabel = actualPortion === 'half' ? 'Half' : actualPortion === 'full' ? 'Full' : undefined;

  // Trigger subtle toast notification
  triggerOrderToast({
    id: `${key}-${Date.now()}`,
    dishId: item.id,
    name: item.name,
    portion: actualPortion,
    price: unitPrice,
    quantity: quantityDelta,
    totalQuantity: newQty,
    image: item.image,
    isVeg: item.isVeg,
    timestamp: Date.now(),
  });

  return updated;
}

/**
 * Set active dining table
 */
export function setSelectedDiningTable(table: string): TableOrderState {
  const current = getTableOrder();
  const updated: TableOrderState = {
    ...current,
    selectedTable: table,
  };
  saveTableOrder(updated);
  return updated;
}

/**
 * Clear the entire order
 */
export function clearTableOrder(): TableOrderState {
  const updated: TableOrderState = {
    ...DEFAULT_ORDER_STATE,
    items: {},
    lastUpdated: new Date().toISOString(),
  };
  saveTableOrder(updated);
  return updated;
}

/**
 * React Hook for real-time table order state across all components
 */
export function useTableOrder() {
  const [orderState, setOrderState] = useState<TableOrderState>(getTableOrder);

  useEffect(() => {
    setOrderState(getTableOrder());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TableOrderState>;
      if (customEvent.detail) {
        setOrderState(customEvent.detail);
      } else {
        setOrderState(getTableOrder());
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setOrderState(getTableOrder());
      }
    };

    window.addEventListener(EVENT_ORDER_UPDATED, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pageshow', handleVisibility);

    return () => {
      window.removeEventListener(EVENT_ORDER_UPDATED, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pageshow', handleVisibility);
    };
  }, []);

  const totalItemsCount = Object.keys(orderState.items).length;
  const totalPortionsCount = Object.values(orderState.items).reduce(
    (sum, qty) => sum + (Number(qty) || 0),
    0
  );

  const getQuantity = useCallback(
    (dishIdOrKey: string, portion?: PortionType) => getOrderItemQuantity(dishIdOrKey, portion),
    [orderState.items]
  );

  const getPortions = useCallback(
    (dishId: string) => getDishPortions(dishId),
    [orderState.items]
  );

  const increment = useCallback((dishIdOrKey: string, portion?: PortionType) => {
    const updated = incrementOrderItem(dishIdOrKey, portion);
    setOrderState(updated);
    return updated;
  }, []);

  const decrement = useCallback((dishIdOrKey: string, portion?: PortionType) => {
    const updated = decrementOrderItem(dishIdOrKey, portion);
    setOrderState(updated);
    return updated;
  }, []);

  const addDish = useCallback((item: MenuItem, portion?: PortionType, quantityDelta: number = 1) => {
    const updated = addDishToOrder(item, portion, quantityDelta);
    setOrderState(updated);
    return updated;
  }, []);

  const setQuantity = useCallback((dishIdOrKey: string, qty: number, portion?: PortionType) => {
    const updated = setOrderItemQuantity(dishIdOrKey, qty, portion);
    setOrderState(updated);
    return updated;
  }, []);

  const remove = useCallback((dishIdOrKey: string, portion?: PortionType) => {
    const updated = removeOrderItem(dishIdOrKey, portion);
    setOrderState(updated);
    return updated;
  }, []);

  const removeDishPortion = useCallback((dishId: string, portion: PortionType) => {
    const updated = decrementOrderItem(dishId, portion);
    setOrderState(updated);
    return updated;
  }, []);

  const getPortionCount = useCallback(
    (dishId: string, portion: PortionType) => getOrderItemQuantity(dishId, portion),
    [orderState.items]
  );

  const setTable = useCallback((table: string) => {
    const updated = setSelectedDiningTable(table);
    setOrderState(updated);
    return updated;
  }, []);

  const clear = useCallback(() => {
    const updated = clearTableOrder();
    setOrderState(updated);
    return updated;
  }, []);

  return {
    orderItems: orderState.items,
    selectedTable: orderState.selectedTable,
    totalItemsCount,
    totalPortionsCount,
    getQuantity,
    getPortions,
    getDishPortionCounts: getPortions,
    getPortionCount,
    removeDishPortion,
    increment,
    decrement,
    addDish,
    setQuantity,
    remove,
    setTable,
    clear,
  };
}
