import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';
import { RESTAURANT_INFO } from '../data/menuData';
import {
  useTableOrder,
  parseOrderItemKey,
  getPortionPrices,
  PortionType,
} from '../services/tableOrderService';
import { useCustomerPreferences } from '../services/customerProfileService';
import {
  createPlacedOrder,
  usePlacedOrders,
  PlacedOrder,
  OrderStatus,
  updateOrderStatus,
  advanceOrderToNextStep,
} from '../services/orderHistoryService';
import { OrderStatusTracker } from './OrderStatusTracker';
import { LiveOrderStatusModal } from './orders/LiveOrderStatusModal';
import { OrderToast } from './orders/OrderToast';
import { SPICE_LEVEL_CONFIG } from '../types/profile';
import { ImageWithFallback } from './ImageWithFallback';
import { VegBadge } from './VegBadge';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  UtensilsCrossed,
  ArrowRight,
  Heart,
  Sparkles,
  MessageCircle,
  Clock,
  ShieldCheck,
  ChefHat,
  BellRing,
} from 'lucide-react';

interface MenuOrderBottomBarProps {
  allMenuItems: MenuItem[];
  onSelectDish?: (item: MenuItem) => void;
  onNavigateToProfileOrders?: () => void;
}

export const MenuOrderBottomBar: React.FC<MenuOrderBottomBarProps> = ({
  allMenuItems,
  onSelectDish,
  onNavigateToProfileOrders,
}) => {
  const {
    orderItems,
    selectedTable,
    totalItemsCount,
    totalPortionsCount,
    increment,
    decrement,
    setTable,
    clear,
  } = useTableOrder();

  const { preferences, favoriteDishIds } = useCustomerPreferences();
  const { activeOrders, refreshOrders } = usePlacedOrders();

  const [isOpen, setIsOpen] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<PlacedOrder | null>(null);

  // Order status tracker & simulation state
  const [isSimulating, setIsSimulating] = useState(true);
  const [isTrackerExpanded, setIsTrackerExpanded] = useState(false);
  const [dismissedTrackerOrderId, setDismissedTrackerOrderId] = useState<string | null>(null);

  // Active or recently tracked order
  const activeOrder = useMemo(() => {
    if (activeOrders.length > 0) {
      const first = activeOrders[0];
      if (first.orderId !== dismissedTrackerOrderId) return first;
    }
    return null;
  }, [activeOrders, dismissedTrackerOrderId]);

  // Timed Simulation Workflow: auto-advances through Received -> Preparing -> Ready -> Served
  useEffect(() => {
    if (!activeOrder || !isSimulating) return;
    if (activeOrder.status === 'completed' || activeOrder.status === 'cancelled') return;

    const timer = setTimeout(() => {
      const updated = advanceOrderToNextStep(activeOrder.orderId);
      if (updated) {
        refreshOrders();
        if (trackingOrder?.orderId === updated.orderId) {
          setTrackingOrder(updated);
        }
      }
    }, 13000); // Auto-advance step every 13 seconds

    return () => clearTimeout(timer);
  }, [activeOrder?.orderId, activeOrder?.status, isSimulating, refreshOrders, trackingOrder]);

  // Timestamp difference catch-up (if order has elapsed time on initial load or background)
  useEffect(() => {
    if (!activeOrder || !isSimulating) return;
    const elapsedSec = (Date.now() - new Date(activeOrder.createdAt).getTime()) / 1000;
    if (elapsedSec > 45 && activeOrder.status === 'ready') {
      const updated = advanceOrderToNextStep(activeOrder.orderId);
      if (updated) refreshOrders();
    } else if (elapsedSec > 26 && activeOrder.status === 'preparing') {
      const updated = advanceOrderToNextStep(activeOrder.orderId);
      if (updated) refreshOrders();
    } else if (elapsedSec > 12 && activeOrder.status === 'received') {
      const updated = advanceOrderToNextStep(activeOrder.orderId);
      if (updated) refreshOrders();
    }
  }, [activeOrder?.orderId, activeOrder?.status, isSimulating, refreshOrders]);

  // Direct state toggle handlers
  const handleSelectStatus = (status: OrderStatus) => {
    if (!activeOrder) return;
    const updated = updateOrderStatus(activeOrder.orderId, status);
    if (updated) {
      refreshOrders();
      if (trackingOrder?.orderId === activeOrder.orderId) {
        setTrackingOrder(updated);
      }
    }
  };

  const handleAdvanceStep = () => {
    if (!activeOrder) return;
    const updated = advanceOrderToNextStep(activeOrder.orderId);
    if (updated) {
      refreshOrders();
      if (trackingOrder?.orderId === activeOrder.orderId) {
        setTrackingOrder(updated);
      }
    }
  };

  // Pop animation trigger state
  const [popTrigger, setPopTrigger] = useState(0);
  const isFirstRender = useRef(true);
  const prevPortionsCount = useRef(totalPortionsCount);
  const prevFavsCount = useRef(favoriteDishIds?.length || 0);

  // Trigger subtle Framer Motion 'pop' animation whenever an item is added to the order or toggled as a favorite
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const currentFavs = favoriteDishIds?.length || 0;
    const portionsChanged = prevPortionsCount.current !== totalPortionsCount;
    const favsChanged = prevFavsCount.current !== currentFavs;

    if (portionsChanged || favsChanged) {
      setPopTrigger((prev) => prev + 1);
      prevPortionsCount.current = totalPortionsCount;
      prevFavsCount.current = currentFavs;
    }
  }, [totalPortionsCount, favoriteDishIds]);

  // Map order item IDs/portion keys to resolved MenuItem entries
  const orderedItemsList = useMemo(() => {
    const itemMap = new Map<string, MenuItem>();
    for (const item of allMenuItems) {
      itemMap.set(item.id, item);
    }
    const list: Array<{
      key: string;
      item: MenuItem;
      portion?: PortionType;
      unitPrice: number;
      quantity: number;
      displayName: string;
    }> = [];

    for (const [key, qty] of Object.entries(orderItems)) {
      if (qty > 0) {
        const { dishId, portion } = parseOrderItemKey(key);
        const dish = itemMap.get(dishId);
        if (dish) {
          const prices = getPortionPrices(dish);
          const unitPrice =
            portion === 'half'
              ? prices.halfPrice
              : portion === 'full'
              ? prices.fullPrice
              : (Number(dish.price) || 0);

          const displayName =
            portion === 'half'
              ? `${dish.name} (Half)`
              : portion === 'full'
              ? `${dish.name} (Full)`
              : dish.name;

          list.push({
            key,
            item: dish,
            portion,
            unitPrice,
            quantity: qty,
            displayName,
          });
        }
      }
    }
    return list;
  }, [allMenuItems, orderItems]);

  // Favorite items mapped
  const favoriteItemsList = useMemo(() => {
    const itemMap = new Map<string, MenuItem>();
    for (const item of allMenuItems) {
      itemMap.set(item.id, item);
    }
    return (favoriteDishIds || [])
      .map((id) => itemMap.get(id))
      .filter((item): item is MenuItem => Boolean(item));
  }, [allMenuItems, favoriteDishIds]);

  // Pricing calculations (GST removed completely)
  const { subtotalPrice, grandTotalPrice } = useMemo(() => {
    let subtotal = 0;
    for (const { unitPrice, quantity } of orderedItemsList) {
      subtotal += unitPrice * quantity;
    }
    return {
      subtotalPrice: subtotal,
      grandTotalPrice: subtotal, // Pure total, no GST
    };
  }, [orderedItemsList]);

  // Get active restaurant phone number (admin settings or default)
  const restaurantPhone = useMemo(() => {
    try {
      const adminData = localStorage.getItem('mirch_masala_admin_local_data_v1');
      if (adminData) {
        const parsed = JSON.parse(adminData);
        if (parsed?.settings?.phone) {
          return parsed.settings.phone;
        }
      }
    } catch {
      // ignore
    }
    return RESTAURANT_INFO.phone || '+91 94370 12345';
  }, []);

  // Pre-formatted Order Slip text (GST removed)
  const formattedSlipText = useMemo(() => {
    const spiceInfo = SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'];
    const lines = [
      `🍛 The New Mirch Masala - Dine-In Order Slip`,
      `📍 ${selectedTable} | ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `🌶️ Spice Preference: ${spiceInfo.label} (${spiceInfo.peppers})`,
      ...(preferences.specialInstructions
        ? [`📝 Instructions: ${preferences.specialInstructions}`]
        : []),
      `----------------------------------------`,
      ...orderedItemsList.map(({ displayName, unitPrice, quantity }) => {
        const itemTotal = unitPrice * quantity;
        return `• ${displayName} x${quantity} = ₹${itemTotal}`;
      }),
      `----------------------------------------`,
      `Total: ${totalPortionsCount} portions (${orderedItemsList.length} items)`,
      `Grand Total: ₹${grandTotalPrice.toLocaleString('en-IN')}`,
    ];
    return lines.join('\n');
  }, [
    preferences,
    selectedTable,
    orderedItemsList,
    totalPortionsCount,
    grandTotalPrice,
  ]);

  // Pre-formatted WhatsApp Message & Link (GST removed)
  const { whatsAppMessage, whatsAppUrl } = useMemo(() => {
    const spiceInfo = SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'];

    // Clean phone number for WhatsApp wa.me link
    let cleanPhone = restaurantPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone; // Prefix India country code
    } else if (cleanPhone.length === 0) {
      cleanPhone = '919437012345';
    }

    const itemsText = orderedItemsList
      .map(({ displayName, unitPrice, quantity }) => {
        const itemTotal = unitPrice * quantity;
        return `• *${displayName}* x${quantity} — ₹${itemTotal}`;
      })
      .join('\n');

    const lines = [
      `🍛 *NEW ORDER — ${RESTAURANT_INFO.name}*`,
      `📍 *Location / Table:* ${selectedTable}`,
      `🕒 *Order Time:* ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `🌶️ *Spice Level:* ${spiceInfo.label} (${spiceInfo.peppers})`,
      ...(preferences.specialInstructions
        ? [`📝 *Special Request:* ${preferences.specialInstructions}`]
        : []),
      `━━━━━━━━━━━━━━━━━━━━`,
      `🍽️ *ORDERED ITEMS:*`,
      itemsText,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📦 *Total Items:* ${totalPortionsCount} portions (${orderedItemsList.length} items)`,
      `💳 *Grand Total:* ₹${grandTotalPrice.toLocaleString('en-IN')}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Sent via The New Mirch Masala Digital Menu. Please confirm our order. Thank you!_`,
    ];

    const message = lines.join('\n');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    return {
      whatsAppMessage: message,
      whatsAppUrl: url,
    };
  }, [
    preferences,
    restaurantPhone,
    selectedTable,
    orderedItemsList,
    totalPortionsCount,
    grandTotalPrice,
  ]);

  // Place order directly on website (Dine-In Kitchen Queue)
  const handlePlaceWebsiteOrder = () => {
    if (orderedItemsList.length === 0) return;

    const placed = createPlacedOrder({
      tableNumber: selectedTable || 'Table 4',
      items: orderedItemsList.map(({ item, quantity, portion, unitPrice, displayName }) => ({
        id: item.id,
        name: displayName,
        portion,
        price: unitPrice,
        quantity,
        image: item.image,
        isVeg: item.isVeg,
      })),
      subtotalPrice,
      grandTotalPrice,
      spiceLevel: preferences.spiceLevel || 'medium',
      specialInstructions:
        preferences.specialInstructions ||
        (preferences.dietaryPreference && preferences.dietaryPreference !== 'all'
          ? `Diet: ${preferences.dietaryPreference}`
          : ''),
      channel: 'website',
    });

    clear();
    setIsOpen(false);
    setTrackingOrder(placed);
    refreshOrders();
  };

  // Place order via WhatsApp and persist to history
  const handlePlaceWhatsAppOrder = () => {
    if (orderedItemsList.length === 0) return;

    const placed = createPlacedOrder({
      tableNumber: selectedTable || 'Table 4',
      items: orderedItemsList.map(({ item, quantity, portion, unitPrice, displayName }) => ({
        id: item.id,
        name: displayName,
        portion,
        price: unitPrice,
        quantity,
        image: item.image,
        isVeg: item.isVeg,
      })),
      subtotalPrice,
      grandTotalPrice,
      spiceLevel: preferences.spiceLevel || 'medium',
      specialInstructions:
        preferences.specialInstructions ||
        (preferences.dietaryPreference && preferences.dietaryPreference !== 'all'
          ? `Diet: ${preferences.dietaryPreference}`
          : ''),
      channel: 'whatsapp',
    });

    clear();
    setIsOpen(false);
    refreshOrders();
    window.open(whatsAppUrl, '_blank', 'noopener,noreferrer');
    setTrackingOrder(placed);
  };

  // Copy order slip to clipboard for waiter
  const handleCopySlip = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(formattedSlipText);
      setCopiedSlip(true);
      setTimeout(() => setCopiedSlip(false), 2500);
    }
  };

  const displayCount = totalItemsCount > 0 ? totalItemsCount : (favoriteDishIds?.length || 0);
  const isFavoritesOnly = totalItemsCount === 0 && (favoriteDishIds?.length || 0) > 0;

  return (
    <>
      {/* 
        Active Order Visual Progress Tracker Bar & Floating Controls
      */}
      <div className="fixed bottom-[74px] left-4 right-4 sm:left-auto sm:right-6 z-40 flex flex-col sm:flex-row items-end gap-2.5 pointer-events-none">
        {/* Active Order Status Tracker Card / Docked Bar */}
        {activeOrder && (
          <div className="w-full sm:w-96 pointer-events-auto">
            {isTrackerExpanded ? (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              >
                <OrderStatusTracker
                  order={activeOrder}
                  compact={false}
                  isSimulating={isSimulating}
                  onToggleSimulation={() => setIsSimulating((prev) => !prev)}
                  onAdvanceStep={handleAdvanceStep}
                  onSelectStatus={handleSelectStatus}
                  onDismiss={() => setIsTrackerExpanded(false)}
                  onViewDetails={() => setTrackingOrder(activeOrder)}
                  className="shadow-2xl border-stone-800"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96 }}
                className="bg-stone-900/95 text-stone-100 rounded-2xl p-2.5 shadow-2xl border border-stone-800/90 backdrop-blur-md"
              >
                <OrderStatusTracker
                  order={activeOrder}
                  compact={true}
                  onAdvanceStep={handleAdvanceStep}
                  onSelectStatus={handleSelectStatus}
                  onViewDetails={() => setTrackingOrder(activeOrder)}
                />
                <div className="flex items-center justify-between pt-2 px-1 text-[10px] text-stone-400 border-t border-stone-800 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsSimulating((prev) => !prev)}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    title={
                      isSimulating
                        ? 'Click to pause simulation'
                        : 'Click to resume step simulation'
                    }
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-stone-500'
                      }`}
                    />
                    <span>{isSimulating ? 'Simulated Workflow: Active' : 'Workflow: Paused'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {activeOrder.status !== 'completed' && (
                      <button
                        type="button"
                        onClick={handleAdvanceStep}
                        className="text-orange-400 hover:text-orange-300 font-bold flex items-center gap-0.5 cursor-pointer"
                        title="Advance status to next stage"
                      >
                        <span>Next Step ➔</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsTrackerExpanded(true)}
                      className="text-stone-300 hover:text-white font-bold underline cursor-pointer"
                    >
                      Expand
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Small, Elegant Circular Floating Table Order Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          id="menu-floating-circular-order-btn"
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.06 }}
          className="relative w-14 h-14 rounded-full bg-stone-900 text-white shadow-2xl shadow-stone-950/40 border-2 border-orange-500/90 flex items-center justify-center cursor-pointer transition-shadow hover:shadow-orange-500/25 group focus:outline-hidden shrink-0 pointer-events-auto"
          aria-label={
            totalItemsCount > 0
              ? `View order: ${totalItemsCount} dishes, ₹${grandTotalPrice}`
              : isFavoritesOnly
              ? `View ${favoriteDishIds.length} saved favorites`
              : 'Open table order'
          }
          title={
            totalItemsCount > 0
              ? `${totalItemsCount} dishes in table order (₹${grandTotalPrice})`
              : isFavoritesOnly
              ? `${favoriteDishIds.length} saved favorites`
              : 'Table Dining Order'
          }
        >
          {/* Subtle Animated Ripple Ring on Pop */}
          {popTrigger > 0 && (
            <motion.span
              key={`ripple-${popTrigger}`}
              initial={{ scale: 0.85, opacity: 0.85 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 rounded-full border-2 border-orange-400 pointer-events-none"
            />
          )}

          {/* Elegant Circular Icon */}
          <div className="text-orange-400 group-hover:text-orange-300 transition-colors flex items-center justify-center">
            {isFavoritesOnly ? (
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" />
            ) : (
              <ShoppingBag className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>

          {/* Total Dish Count Container with Subtle Framer Motion 'Pop' Animation */}
          {displayCount > 0 && (
            <motion.div
              key={`dish-count-${popTrigger}-${displayCount}`}
              initial={{ scale: 1.45, y: -2 }}
              animate={{ scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 550,
                damping: 14,
              }}
              className={`absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 text-[11px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-stone-900 ${
                totalItemsCount > 0
                  ? 'bg-orange-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {displayCount}
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Expanded Full-height / Partial-screen Overlay Drawer (Opens on Click) */}
      <AnimatePresence>
        {isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="table-order-drawer-title"
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/75 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200/80 text-left max-h-[88vh] flex flex-col no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Drag Handle for Mobile */}
              <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3 shrink-0" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3
                        id="table-order-drawer-title"
                        className="text-sm font-bold text-stone-900 leading-tight"
                      >
                        Your Table Dining Order
                      </h3>
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Saved</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      {totalPortionsCount > 0
                        ? `${totalPortionsCount} portions across ${orderedItemsList.length} dishes • Persisted on device`
                        : 'Select dishes from the menu to build your order'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {totalItemsCount > 0 && (
                    <button
                      type="button"
                      onClick={clear}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1"
                      title="Clear current order"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    aria-label="Close order overlay"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table Selector */}
              <div className="py-2.5 shrink-0">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                  Select Dining Location / Table
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Family Table 8', 'Takeaway'].map(
                    (tbl) => (
                      <button
                        key={tbl}
                        type="button"
                        onClick={() => setTable(tbl)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                          selectedTable === tbl
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {tbl}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Scrollable List of Added Items */}
              <div className="flex-1 overflow-y-auto space-y-2.5 py-2 pr-1 no-scrollbar min-h-[140px]">
                {orderedItemsList.length === 0 ? (
                  <div className="text-center py-4 px-3 space-y-3">
                    {/* Active Kitchen Order Status Tracker inside Drawer */}
                    {activeOrder && (
                      <div className="text-left mb-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-stone-800 uppercase tracking-wider">
                            Active Kitchen Order
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Live Step Tracker
                          </span>
                        </div>
                        <OrderStatusTracker
                          order={activeOrder}
                          compact={false}
                          isSimulating={isSimulating}
                          onToggleSimulation={() => setIsSimulating((prev) => !prev)}
                          onAdvanceStep={handleAdvanceStep}
                          onSelectStatus={handleSelectStatus}
                          onViewDetails={() => {
                            setIsOpen(false);
                            setTrackingOrder(activeOrder);
                          }}
                        />
                      </div>
                    )}

                    <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-stone-700">Your table order is empty</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Tap &quot;+ Add&quot; on dishes in the menu to add portions to your waiter order slip.
                      </p>
                    </div>

                    {/* Quick favorites integration if customer has saved favorites */}
                    {favoriteItemsList.length > 0 && (
                      <div className="pt-2 text-left bg-orange-50/80 rounded-2xl p-3 border border-orange-200/70">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                            <span>Quick Add from Favorites ({favoriteItemsList.length})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              favoriteItemsList.forEach((dish) => increment(dish.id));
                            }}
                            className="text-[10px] font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                          >
                            Add All
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                          {favoriteItemsList.map((fav) => (
                            <div
                              key={fav.id}
                              className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl text-xs border border-orange-100"
                            >
                              <span className="truncate max-w-[180px] font-medium text-stone-800">
                                {fav.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => increment(fav.id)}
                                className="px-2 py-0.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  orderedItemsList.map(({ key, item, quantity, portion, unitPrice, displayName }) => {
                    const itemTotal = unitPrice * quantity;

                    return (
                      <div
                        key={key}
                        className="bg-stone-50/80 rounded-2xl p-2.5 border border-stone-200/70 flex items-center gap-2.5"
                      >
                        {/* Image Thumbnail */}
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            if (onSelectDish) {
                              onSelectDish(item);
                              setIsOpen(false);
                            }
                          }}
                          className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-stone-200 cursor-pointer"
                        >
                          <ImageWithFallback
                            src={item.image}
                            alt={item.name}
                            category={item.category}
                            isVeg={item.isVeg}
                            size="sm"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0.5 left-0.5 bg-white/90 backdrop-blur-xs p-0.5 rounded shadow-2xs">
                            <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs text-stone-900 truncate">
                              {item.name}
                            </h4>
                            {portion && (
                              <span className="shrink-0 text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
                                {portion}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            ₹{unitPrice} each
                          </div>
                        </div>

                        {/* Stepper & Price */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Stepper */}
                          <div className="inline-flex items-center bg-white rounded-xl p-0.5 border border-stone-200 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => decrement(key)}
                              className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                              aria-label={`Decrease ${displayName}`}
                            >
                              {quantity === 1 ? (
                                <Trash2 className="w-3 h-3 text-rose-500" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                            </button>
                            <span className="w-7 text-center text-xs font-black text-stone-900">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => increment(key)}
                              className="w-6 h-6 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                              aria-label={`Increase ${displayName}`}
                            >
                              <Plus className="w-3 h-3 stroke-[2.5]" />
                            </button>
                          </div>

                          {/* Calculated Subtotal */}
                          <div className="w-14 text-right">
                            <span className="text-xs font-black text-stone-900">
                              ₹{itemTotal}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Price Breakdown & Action Footer */}
              {orderedItemsList.length > 0 && (
                <div className="border-t border-stone-100 pt-3 space-y-2.5 shrink-0">
                  <div className="space-y-1 text-xs text-stone-600">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span className="font-bold text-stone-900">
                        ₹{subtotalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {preferences.spiceLevel && (
                      <div className="flex justify-between text-[11px] text-stone-500 pt-0.5">
                        <span>Spice Level (Profile)</span>
                        <span className="text-amber-700 font-bold">
                          {SPICE_LEVEL_CONFIG[preferences.spiceLevel].label}{' '}
                          {SPICE_LEVEL_CONFIG[preferences.spiceLevel].peppers}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-200/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-black text-stone-900 uppercase tracking-wide block">
                        Total To Pay
                      </span>
                      <span className="text-[10px] text-stone-400">
                        Items safely persisted across page refreshes
                      </span>
                    </div>
                    <span className="text-xl font-black text-orange-600">
                      ₹{grandTotalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Order Actions: Website Direct (Primary) & WhatsApp (Secondary) */}
                  <div className="space-y-2 pt-1">
                    {/* Primary Direct Website Dine-In Order */}
                    <button
                      type="button"
                      onClick={handlePlaceWebsiteOrder}
                      id="website-direct-order-btn"
                      className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-black text-xs shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Place Dine-In Order ({totalPortionsCount} portions • ₹{grandTotalPrice.toLocaleString('en-IN')})</span>
                    </button>

                    {/* Secondary WhatsApp Order (saves to local history & opens WhatsApp) */}
                    <button
                      type="button"
                      onClick={handlePlaceWhatsAppOrder}
                      id="whatsapp-order-btn"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white text-emerald-600" />
                      <span>Order via WhatsApp & Save to History</span>
                    </button>

                    {/* Secondary Actions: Waiter Slip Copy & Keep Browsing */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleCopySlip}
                        id="copy-waiter-slip-btn"
                        className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {copiedSlip ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Slip Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-stone-600" />
                            <span>Copy Waiter Slip</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        id="keep-browsing-order-btn"
                        className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span>Keep Browsing</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Order Tracker Modal */}
      <LiveOrderStatusModal
        order={trackingOrder}
        isOpen={Boolean(trackingOrder)}
        onClose={() => setTrackingOrder(null)}
        onViewPastOrders={onNavigateToProfileOrders}
      />

      {/* Item Added Toast Notification */}
      <OrderToast onOpenOrderDrawer={() => setIsOpen(true)} />
    </>
  );
};
