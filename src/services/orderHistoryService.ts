import { useState, useEffect, useCallback } from 'react';
import { MenuItem } from '../types';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItemRecord {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  isVeg?: boolean;
  portion?: 'half' | 'full';
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  label: string;
  description?: string;
}

export interface PlacedOrder {
  orderId: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  tableNumber: string;
  createdAt: string;
  status: OrderStatus;
  statusUpdatedAt: string;
  items: OrderItemRecord[];
  totalPortionsCount: number;
  subtotalPrice: number;
  taxGst?: number;
  grandTotalPrice: number;
  spiceLevel?: string;
  specialInstructions?: string;
  channel: 'website' | 'whatsapp';
  timeline: OrderTimelineEvent[];
}

export const ORDER_STATUS_STEPS: Array<{
  status: OrderStatus;
  label: string;
  shortLabel: string;
  description: string;
  stepNumber: number;
}> = [
  {
    status: 'received',
    label: 'Order Received',
    shortLabel: 'Received',
    description: 'Order confirmed by restaurant staff and queued for the kitchen.',
    stepNumber: 1,
  },
  {
    status: 'preparing',
    label: 'In Kitchen',
    shortLabel: 'Preparing',
    description: 'Chef is preparing your dishes fresh and hot with your preferred spice level.',
    stepNumber: 2,
  },
  {
    status: 'ready',
    label: 'Ready to Serve',
    shortLabel: 'Ready',
    description: 'Dishes are plated and hot! Staff is bringing them to your table.',
    stepNumber: 3,
  },
  {
    status: 'completed',
    label: 'Served & Delivered',
    shortLabel: 'Served',
    description: 'Dishes delivered to your table. Enjoy your delicious dining experience!',
    stepNumber: 4,
  },
];

const ORDERS_STORAGE_KEY = 'mirch_past_orders_v1';
export const EVENT_ORDERS_UPDATED = 'mirch_placed_orders_updated';

// Helper for initial seed orders if user opens app with no orders yet
const INITIAL_SEED_ORDERS: PlacedOrder[] = [
  {
    orderId: 'MM-4281',
    tableNumber: 'Table 4',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    status: 'completed',
    statusUpdatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    items: [
      {
        id: 'biryani-chicken-dum',
        name: 'Chicken Dum Biryani',
        price: 240,
        quantity: 2,
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      },
      {
        id: 'starter-paneer-tikka',
        name: 'Paneer Tikka',
        price: 210,
        quantity: 1,
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80',
      },
    ],
    totalPortionsCount: 3,
    subtotalPrice: 690,
    grandTotalPrice: 690,
    spiceLevel: 'medium',
    specialInstructions: 'Please serve hot with extra raita',
    channel: 'website',
    timeline: [
      {
        status: 'received',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        label: 'Order Received',
        description: 'Staff confirmed order for Table 4',
      },
      {
        status: 'preparing',
        timestamp: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
        label: 'In Kitchen',
        description: 'Chef started preparation',
      },
      {
        status: 'ready',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        label: 'Ready to Serve',
        description: 'Plated and ready for server pickup',
      },
      {
        status: 'completed',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        label: 'Served & Enjoy',
        description: 'Served hot to Table 4',
      },
    ],
  },
];

/**
 * Get all placed orders from localStorage
 */
export function getPlacedOrders(): PlacedOrder[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [...INITIAL_SEED_ORDERS];
  }
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial demo order so tab is rich on first load
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_ORDERS));
      return [...INITIAL_SEED_ORDERS];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [...INITIAL_SEED_ORDERS];
  } catch {
    return [...INITIAL_SEED_ORDERS];
  }
}

/**
 * Save placed orders to localStorage and notify listeners
 */
export function savePlacedOrders(orders: PlacedOrder[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(
      new CustomEvent(EVENT_ORDERS_UPDATED, { detail: orders })
    );
  } catch {
    // ignore quota errors
  }
}

export interface CreateOrderInput {
  tableNumber: string;
  items: OrderItemRecord[];
  subtotalPrice: number;
  taxGst?: number;
  grandTotalPrice: number;
  spiceLevel?: string;
  specialInstructions?: string;
  channel?: 'website' | 'whatsapp';
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}

/**
 * Create a new placed order and persist to localStorage
 */
export function createPlacedOrder(input: CreateOrderInput): PlacedOrder {
  const currentOrders = getPlacedOrders();
  const now = new Date().toISOString();
  const orderNumber = Math.floor(1000 + Math.random() * 9000);
  const orderId = `MM-${orderNumber}`;

  const totalPortions = input.items.reduce((acc, item) => acc + item.quantity, 0);

  const newOrder: PlacedOrder = {
    orderId,
    tableNumber: input.tableNumber || 'Table 4',
    createdAt: now,
    status: 'received',
    statusUpdatedAt: now,
    items: input.items,
    totalPortionsCount: totalPortions,
    subtotalPrice: input.subtotalPrice,
    taxGst: input.taxGst || 0,
    grandTotalPrice: input.grandTotalPrice,
    spiceLevel: input.spiceLevel || 'medium',
    specialInstructions: input.specialInstructions || '',
    channel: input.channel || 'website',
    customerId: input.customerId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    timeline: [
      {
        status: 'received',
        timestamp: now,
        label: 'Order Received',
        description: `Order placed via ${input.channel === 'whatsapp' ? 'WhatsApp' : 'Website'} for ${input.tableNumber}`,
      },
    ],
  };

  const updatedOrders = [newOrder, ...currentOrders];
  savePlacedOrders(updatedOrders);
  return newOrder;
}

/**
 * Update order status (used by restaurant staff / kitchen or simulator)
 */
export function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): PlacedOrder | null {
  const currentOrders = getPlacedOrders();
  const orderIndex = currentOrders.findIndex((o) => o.orderId === orderId);
  if (orderIndex === -1) return null;

  const order = currentOrders[orderIndex];
  const now = new Date().toISOString();

  // Find step config for description
  const stepConfig = ORDER_STATUS_STEPS.find((s) => s.status === newStatus);
  const defaultLabel = stepConfig ? stepConfig.label : newStatus;
  const defaultDesc = note || (stepConfig ? stepConfig.description : `Status updated to ${newStatus}`);

  const updatedTimeline = [
    ...order.timeline,
    {
      status: newStatus,
      timestamp: now,
      label: defaultLabel,
      description: defaultDesc,
    },
  ];

  const updatedOrder: PlacedOrder = {
    ...order,
    status: newStatus,
    statusUpdatedAt: now,
    timeline: updatedTimeline,
  };

  const updatedList = [...currentOrders];
  updatedList[orderIndex] = updatedOrder;
  savePlacedOrders(updatedList);

  return updatedOrder;
}

/**
 * Advance order to the next sequential step
 */
export function advanceOrderToNextStep(orderId: string): PlacedOrder | null {
  const currentOrders = getPlacedOrders();
  const order = currentOrders.find((o) => o.orderId === orderId);
  if (!order) return null;

  const statusSequence: OrderStatus[] = ['received', 'preparing', 'ready', 'completed'];
  const currentIndex = statusSequence.indexOf(order.status);
  if (currentIndex === -1 || currentIndex >= statusSequence.length - 1) {
    return order; // Already completed or cancelled
  }

  const nextStatus = statusSequence[currentIndex + 1];
  return updateOrderStatus(orderId, nextStatus);
}

/**
 * Delete a single order from history
 */
export function deletePlacedOrder(orderId: string): boolean {
  const currentOrders = getPlacedOrders();
  const filtered = currentOrders.filter((o) => o.orderId !== orderId);
  if (filtered.length === currentOrders.length) return false;
  savePlacedOrders(filtered);
  return true;
}

/**
 * Clear all past orders
 */
export function clearAllPlacedOrders(): void {
  savePlacedOrders([]);
}

/**
 * Get currently active order (most recent order in received / preparing / ready)
 */
export function getMostRecentActiveOrder(): PlacedOrder | null {
  const orders = getPlacedOrders();
  return (
    orders.find(
      (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
    ) || null
  );
}

/**
 * React Hook for placed orders with cross-tab and event synchronization
 */
export function usePlacedOrders() {
  const [orders, setOrders] = useState<PlacedOrder[]>(getPlacedOrders);

  const refreshOrders = useCallback(() => {
    setOrders(getPlacedOrders());
  }, []);

  useEffect(() => {
    refreshOrders();

    const handleCustomEvent = () => refreshOrders();
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === ORDERS_STORAGE_KEY) {
        refreshOrders();
      }
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshOrders();
      }
    };

    window.addEventListener(EVENT_ORDERS_UPDATED, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener(EVENT_ORDERS_UPDATED, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshOrders]);

  const activeOrders = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  );
  const completedOrders = orders.filter((o) => o.status === 'completed');

  return {
    orders,
    activeOrders,
    completedOrders,
    createOrder: createPlacedOrder,
    updateStatus: updateOrderStatus,
    advanceStep: advanceOrderToNextStep,
    deleteOrder: deletePlacedOrder,
    clearAll: clearAllPlacedOrders,
    refreshOrders,
  };
}
