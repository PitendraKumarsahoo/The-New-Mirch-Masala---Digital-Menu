import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  PlacedOrder,
  ORDER_STATUS_STEPS,
  getPlacedOrders,
} from '../../services/orderHistoryService';
import { useTableOrder } from '../../services/tableOrderService';
import { MenuItem } from '../../types';
import { RESTAURANT_INFO } from '../../data/menuData';
import {
  MessageCircle,
  RotateCcw,
  Clock,
  Check,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  Receipt,
  Copy,
  ArrowRight,
  ExternalLink,
  Flame,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';

interface OrderHistoryProps {
  onBrowseMenu: () => void;
  customerId?: string;
  allMenuItems?: MenuItem[];
  onOpenOrderModal?: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  onBrowseMenu,
  customerId,
  allMenuItems = [],
  onOpenOrderModal,
}) => {
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reorderedFeedback, setReorderedFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(false);

  const { increment, addDish } = useTableOrder();

  // Fetch WhatsApp order logs from Firestore with local persistence fallback
  const fetchOrderHistory = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Fetch live orders collection from Firestore
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);

      const firestoreOrders: PlacedOrder[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as PlacedOrder;
        firestoreOrders.push(data);
      });

      setIsCloudConnected(true);

      // 2. Fetch local storage orders for offline / instant sync
      const localOrders = getPlacedOrders();

      // Merge and deduplicate by orderId
      const orderMap = new Map<string, PlacedOrder>();

      // Load firestore orders first
      for (const order of firestoreOrders) {
        if (order.orderId) {
          orderMap.set(order.orderId, order);
        }
      }

      // Merge local orders (ensures immediate visibility for newly placed orders)
      for (const order of localOrders) {
        if (order.orderId && !orderMap.has(order.orderId)) {
          orderMap.set(order.orderId, order);
        }
      }

      const combined = Array.from(orderMap.values());

      // Filter specifically for WhatsApp orders or user orders
      const whatsappLogs = combined.filter((order) => {
        const isWhatsAppChannel = order.channel === 'whatsapp' || !order.channel;
        if (customerId && order.customerId) {
          return isWhatsAppChannel && order.customerId === customerId;
        }
        return isWhatsAppChannel;
      });

      // Sort by newest first
      whatsappLogs.sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      setOrders(whatsappLogs);
    } catch (err) {
      console.warn('[OrderHistory] Firestore fetch error, using local logs:', err);
      // Fallback to local storage orders
      const localOrders = getPlacedOrders();
      setOrders(localOrders.filter((o) => o.channel === 'whatsapp' || !o.channel));
      setIsCloudConnected(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchOrderHistory();
  }, [fetchOrderHistory]);

  // Filtered list
  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return order.status === 'received' || order.status === 'preparing' || order.status === 'ready';
    }
    if (filter === 'completed') {
      return order.status === 'completed';
    }
    return true;
  });

  // 1-Tap Quick Re-order favorite meals into active cart
  const handleQuickReorder = (order: PlacedOrder) => {
    // Look up items in allMenuItems or order item snapshot
    const itemMap = new Map(allMenuItems.map((m) => [m.id, m]));

    for (const item of order.items) {
      const fullItem = itemMap.get(item.id);
      const key = item.portion ? `${item.id}__${item.portion}` : item.id;

      if (fullItem) {
        for (let i = 0; i < item.quantity; i++) {
          if (item.portion) {
            addDish(fullItem, item.portion);
          } else {
            addDish(fullItem);
          }
        }
      } else {
        for (let i = 0; i < item.quantity; i++) {
          increment(key);
        }
      }
    }

    setReorderedFeedback(order.orderId);
    setTimeout(() => {
      setReorderedFeedback(null);
      if (onOpenOrderModal) {
        onOpenOrderModal();
      } else {
        onBrowseMenu();
      }
    }, 1200);
  };

  // Direct Re-order via WhatsApp
  const handleDirectWhatsAppReorder = (order: PlacedOrder) => {
    const cleanPhone = (RESTAURANT_INFO.phone || '+91 94370 12345').replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemsText = order.items
      .map((it) => {
        const portionTag = it.portion === 'half' ? '*(Half Portion)*' : it.portion === 'full' ? '*(Full Portion)*' : '';
        return `• *${it.name}* ${portionTag} x${it.quantity} — ₹${it.price * it.quantity}`;
      })
      .join('\n');

    const message = [
      `🍛 *REPEAT ORDER — ${RESTAURANT_INFO.name}*`,
      `📍 *Table Number:* ${order.tableNumber || 'Table 4'}`,
      `🕒 *Order Time:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `🔁 *Re-ordering from Previous Order #${order.orderId}*`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `🍽️ *ORDERED ITEMS:*`,
      itemsText,
      `━━━━━━━━━━━━━━━━━━━━`,
      `💰 *TOTAL BILL AMOUNT:* ₹${order.grandTotalPrice.toLocaleString('en-IN')}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Sent via Customer Order History. Please prepare this order for ${order.tableNumber}. Thank you!_`,
    ].join('\n');

    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Copy order slip
  const handleCopySlip = (order: PlacedOrder) => {
    const lines = [
      `🍛 The New Mirch Masala - WhatsApp Order #${order.orderId}`,
      `📍 Table: ${order.tableNumber} | ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `----------------------------------------`,
      ...order.items.map((it) => `• ${it.name} x${it.quantity} = ₹${it.price * it.quantity}`),
      `----------------------------------------`,
      `Grand Total: ₹${order.grandTotalPrice.toLocaleString('en-IN')}`,
    ];
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopiedId(order.orderId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Strip with Firestore Sync Status & Manual Refresh */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 leading-tight">
              WhatsApp Order History
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <p className="text-[10px] text-stone-500">
                {isCloudConnected ? 'Synced with Firestore Database' : 'Local Storage Cache'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchOrderHistory}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 active:scale-95 transition-all cursor-pointer border border-stone-200/60"
          title="Refresh orders from Firestore"
          aria-label="Refresh orders"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            filter === 'active'
              ? 'bg-white text-emerald-800 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
            filter === 'completed'
              ? 'bg-white text-stone-900 shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs animate-pulse space-y-3"
            >
              <div className="flex justify-between items-center pb-2 border-b border-stone-100">
                <div className="h-4 bg-stone-200 rounded w-28" />
                <div className="h-4 bg-stone-200 rounded w-16" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-stone-100 rounded w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <MessageCircle className="w-8 h-8 fill-emerald-600 text-white" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-stone-900">
              No WhatsApp Order History Yet
            </h4>
            <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              When you place an order via WhatsApp, your detailed receipts, table numbers, and meal logs are saved here in Firestore for fast 1-tap re-ordering!
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowseMenu}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Browse Menu & Order</span>
          </button>
        </div>
      )}

      {/* Orders List */}
      {!isLoading && filteredOrders.length > 0 && (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;
            const isReordered = reorderedFeedback === order.orderId;
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.article
                key={order.orderId}
                layout
                className="bg-white rounded-3xl border border-stone-200/90 shadow-frosted-card overflow-hidden hover:border-emerald-300/80 transition-all"
              >
                {/* Order Top Bar */}
                <div className="p-4 border-b border-stone-100 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <MessageCircle className="w-3 h-3 fill-emerald-600 text-emerald-50" />
                        WhatsApp Order
                      </span>

                      <span className="text-xs font-bold text-stone-800">
                        #{order.orderId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">{order.tableNumber}</span>
                      <span>•</span>
                      <span>{formattedDate} at {formattedTime}</span>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      order.status === 'completed'
                        ? 'bg-stone-100 text-stone-700'
                        : order.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Ordered Items Preview */}
                <div className="p-4 space-y-2">
                  <div className="space-y-1.5">
                    {order.items.slice(0, isExpanded ? order.items.length : 3).map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {item.quantity}x
                          </span>
                          <span className="font-semibold text-stone-800 truncate">
                            {item.name}
                          </span>
                          {item.portion && (
                            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded uppercase">
                              {item.portion}
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-stone-900 shrink-0 ml-2">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}

                    {order.items.length > 3 && !isExpanded && (
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(order.orderId)}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 pt-1 cursor-pointer block"
                      >
                        + {order.items.length - 3} more items...
                      </button>
                    )}
                  </div>

                  {/* Bill Total Row */}
                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Total Bill
                      </span>
                      <span className="text-base font-black text-emerald-700 leading-tight">
                        ₹{order.grandTotalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Quick Re-Order Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopySlip(order)}
                        title="Copy Order Slip"
                        className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all cursor-pointer"
                      >
                        {copiedId === order.orderId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectWhatsAppReorder(order)}
                        title="Send directly to WhatsApp"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all cursor-pointer border border-emerald-200/60"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-emerald-600 text-emerald-50" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickReorder(order)}
                        disabled={isReordered}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer ${
                          isReordered
                            ? 'bg-emerald-600 text-white'
                            : 'bg-orange-600 hover:bg-orange-700 text-white'
                        }`}
                      >
                        {isReordered ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Re-Order Meal</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
};
