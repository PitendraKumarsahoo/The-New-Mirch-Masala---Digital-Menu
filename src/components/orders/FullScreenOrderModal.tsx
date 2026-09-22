import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { MenuItem } from '../../types';
import { RESTAURANT_INFO } from '../../data/menuData';
import {
  useTableOrder,
  parseOrderItemKey,
  getPortionPrices,
  PortionType,
} from '../../services/tableOrderService';
import { useCustomerPreferences } from '../../services/customerProfileService';
import {
  createPlacedOrder,
  usePlacedOrders,
  PlacedOrder,
  OrderStatus,
  updateOrderStatus,
  advanceOrderToNextStep,
} from '../../services/orderHistoryService';
import { auth } from '../../config/firebase';
import { OrderStatusTracker } from '../OrderStatusTracker';
import { LiveOrderStatusModal } from './LiveOrderStatusModal';
import { SPICE_LEVEL_CONFIG } from '../../types/profile';
import { ImageWithFallback } from '../ImageWithFallback';
import { VegBadge } from '../VegBadge';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Copy,
  Check,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Clock,
  ShieldCheck,
  ChefHat,
  ShoppingBag,
  Receipt,
  MapPin,
  Flame,
  Cloud,
  Loader2,
  User as UserIcon,
} from 'lucide-react';

interface FullScreenOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMenuItems: MenuItem[];
  onSelectDish?: (item: MenuItem) => void;
  onNavigateToProfileOrders?: () => void;
}

export const FullScreenOrderModal: React.FC<FullScreenOrderModalProps> = ({
  isOpen,
  onClose,
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
  const { activeOrders, refreshOrders, isCloudConnected } = usePlacedOrders();

  const [copiedSlip, setCopiedSlip] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<PlacedOrder | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Framer Motion drag controls for downward drag-to-dismiss gesture
  const dragControls = useDragControls();

  // Active tracked kitchen order
  const activeOrder = useMemo(() => {
    return activeOrders.length > 0 ? activeOrders[0] : null;
  }, [activeOrders]);

  // Keep trackingOrder synchronized with real-time updates from Firestore
  useEffect(() => {
    if (trackingOrder) {
      const live = activeOrders.find((o) => o.orderId === trackingOrder.orderId);
      if (live && (live.status !== trackingOrder.status || live.statusUpdatedAt !== trackingOrder.statusUpdatedAt)) {
        setTrackingOrder(live);
      }
    }
  }, [activeOrders, trackingOrder]);

  // Timed Simulation Workflow
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
    }, 13000);

    return () => clearTimeout(timer);
  }, [activeOrder?.orderId, activeOrder?.status, isSimulating, refreshOrders, trackingOrder]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  // Favorites mapped
  const favoriteItemsList = useMemo(() => {
    const itemMap = new Map<string, MenuItem>();
    for (const item of allMenuItems) {
      itemMap.set(item.id, item);
    }
    return (favoriteDishIds || [])
      .map((id) => itemMap.get(id))
      .filter((item): item is MenuItem => Boolean(item));
  }, [allMenuItems, favoriteDishIds]);

  // Price calculations (Clear calculation, zero GST)
  const { subtotalPrice, grandTotalPrice } = useMemo(() => {
    let subtotal = 0;
    for (const { unitPrice, quantity } of orderedItemsList) {
      subtotal += unitPrice * quantity;
    }
    return {
      subtotalPrice: subtotal,
      grandTotalPrice: subtotal,
    };
  }, [orderedItemsList]);

  // Restaurant Phone
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

  // Formatted Order Slip Text
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
      ...orderedItemsList.map(({ displayName, unitPrice, quantity, portion }) => {
        const itemTotal = unitPrice * quantity;
        const portionStr = portion ? `[${portion.toUpperCase()}] ` : '';
        return `• ${portionStr}${displayName} x${quantity} = ₹${itemTotal}`;
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

  // WhatsApp formatted message and link
  const { whatsAppUrl } = useMemo(() => {
    const spiceInfo = SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'];
    let cleanPhone = restaurantPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    } else if (cleanPhone.length === 0) {
      cleanPhone = '919437012345';
    }

    const itemsText = orderedItemsList
      .map(({ displayName, unitPrice, quantity, portion }) => {
        const itemTotal = unitPrice * quantity;
        const portionTag = portion === 'half' ? '*(Half Portion)*' : portion === 'full' ? '*(Full Portion)*' : '';
        return `• *${displayName}* ${portionTag} x${quantity} — ₹${itemTotal}`;
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
      `🍽️ *ORDERED ITEMS WITH SIZES:*`,
      itemsText,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📦 *Total Items:* ${totalPortionsCount} portions (${orderedItemsList.length} dishes)`,
      `💳 *Grand Total:* ₹${grandTotalPrice.toLocaleString('en-IN')}`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `_Sent via The New Mirch Masala Digital Menu. Please confirm our order. Thank you!_`,
    ];

    const message = lines.join('\n');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    return { whatsAppUrl: url };
  }, [
    preferences,
    restaurantPhone,
    selectedTable,
    orderedItemsList,
    totalPortionsCount,
    grandTotalPrice,
  ]);

  // Place order directly on website (Dine-In Kitchen Queue with Firestore sync)
  const handlePlaceWebsiteOrder = async () => {
    if (orderedItemsList.length === 0 || isPlacingOrder) return;
    setIsPlacingOrder(true);

    try {
      const currentUser = auth.currentUser;
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
        customerId: currentUser?.uid,
        customerName:
          currentUser?.displayName ||
          (currentUser?.email ? currentUser.email.split('@')[0] : undefined),
        customerEmail: currentUser?.email || undefined,
        customerPhone: currentUser?.phoneNumber || preferences.phone || undefined,
      });

      clear();
      refreshOrders();
      setTrackingOrder(placed);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Place order via WhatsApp & Save to History
  const handlePlaceWhatsAppOrder = () => {
    if (orderedItemsList.length === 0) return;

    const currentUser = auth.currentUser;
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
      customerId: currentUser?.uid,
      customerName:
        currentUser?.displayName ||
        (currentUser?.email ? currentUser.email.split('@')[0] : undefined),
      customerEmail: currentUser?.email || undefined,
      customerPhone: currentUser?.phoneNumber || preferences.phone || undefined,
    });

    clear();
    refreshOrders();
    setTrackingOrder(placed);
    window.open(whatsAppUrl, '_blank');
  };

  // Copy Slip
  const handleCopySlip = async () => {
    try {
      await navigator.clipboard.writeText(formattedSlipText);
      setCopiedSlip(true);
      setTimeout(() => setCopiedSlip(false), 2400);
    } catch {
      // fallback
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="full-screen-order-modal-title"
          id="full-screen-order-modal-overlay"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/85 backdrop-blur-md transition-opacity p-0 sm:p-4 select-none"
          onClick={(e) => {
            // Direct backdrop click calls onClose directly without navigation reliance
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              onClose();
            }
          }}
        >
          {/* Prominent Fixed Close 'X' Button at top-right corner of the overlay */}
          <button
            type="button"
            id="full-screen-order-overlay-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close order modal"
            className="fixed top-3 right-3 sm:top-5 sm:right-5 z-60 flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-stone-900/95 hover:bg-black text-white hover:text-orange-400 border border-white/20 shadow-2xl backdrop-blur-md transition-all active:scale-95 cursor-pointer group"
          >
            <X className="w-5 h-5 text-stone-300 group-hover:text-orange-400 group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-xs font-bold tracking-wide">Close</span>
          </button>

          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.02, bottom: 0.8 }}
            onDragEnd={(_, info) => {
              // Smooth downward dismiss if dragged past 75px or with downward flick velocity
              if (info.offset.y > 75 || info.velocity.y > 220) {
                onClose();
              }
            }}
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 360 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-white sm:rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden touch-pan-y relative"
          >
            {/* Top Tactile Drag Handle Bar for mobile drag-to-dismiss gesture */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="w-full pt-3 pb-2 flex flex-col items-center justify-center bg-stone-900 cursor-grab active:cursor-grabbing shrink-0 touch-none select-none border-b border-stone-800/90 group"
              title="Pull down or tap to dismiss"
            >
              <div className="w-12 h-1.5 bg-stone-500 group-hover:bg-stone-400 group-active:bg-orange-400 rounded-full transition-colors" />
              <span className="text-[9px] font-bold text-stone-400 mt-1 uppercase tracking-widest flex items-center gap-1 group-hover:text-stone-300">
                <span>Pull down or tap to dismiss</span>
              </span>
            </div>

            {/* Top Header (drag-enabled on non-button areas) */}
            <div
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                dragControls.start(e);
              }}
              className="px-4 py-3 sm:px-6 bg-stone-900 text-white flex items-center justify-between shrink-0 shadow-sm cursor-grab active:cursor-grabbing touch-none select-none"
            >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <UtensilsCrossed className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="full-screen-order-modal-title"
                  className="text-base sm:text-lg font-black text-white leading-tight tracking-tight"
                >
                  Your Dining Table Order
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <Cloud className="w-3 h-3" />
                  <span>Firestore Synced</span>
                </span>
                {auth.currentUser && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <UserIcon className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{auth.currentUser.displayName || auth.currentUser.email}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                {totalPortionsCount > 0
                  ? `${totalPortionsCount} portions across ${orderedItemsList.length} dishes • ${selectedTable}`
                  : `Dining at ${selectedTable}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {orderedItemsList.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-rose-400 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Clear entire order"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close order modal"
              className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dining Table Selector Strip */}
        <div
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button')) return;
            dragControls.start(e);
          }}
          className="px-4 py-2.5 sm:px-6 bg-stone-50 border-b border-stone-200/80 shrink-0 select-none cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orange-600" />
              <span>Select Dining Table / Pickup</span>
            </span>
            <span className="text-[11px] font-bold text-orange-600">
              Active: {selectedTable}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Family Table 8', 'Takeaway'].map(
              (tbl) => (
                <button
                  key={tbl}
                  type="button"
                  onClick={() => setTable(tbl)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedTable === tbl
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {tbl}
                </button>
              )
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 no-scrollbar">
          {/* Active Live Kitchen Order Banner (if one exists) */}
          {activeOrder && (
            <div className="bg-orange-50/90 rounded-2xl p-3.5 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ChefHat className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    Kitchen Progress Tracker ({activeOrder.orderId})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTrackingOrder(activeOrder);
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                >
                  View Details
                </button>
              </div>

              <OrderStatusTracker
                order={activeOrder}
                compact={false}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating((prev) => !prev)}
                onAdvanceStep={() => {
                  advanceOrderToNextStep(activeOrder.orderId);
                  refreshOrders();
                }}
                onSelectStatus={(st) => {
                  updateOrderStatus(activeOrder.orderId, st);
                  refreshOrders();
                }}
                onViewDetails={() => setTrackingOrder(activeOrder)}
              />
            </div>
          )}

          {/* List of Ordered Dishes */}
          {orderedItemsList.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100/70 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="max-w-xs mx-auto">
                <h3 className="text-base font-black text-stone-900">Your table order is empty</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Explore our menu and tap <strong>ADD</strong> on any dish to choose portions and assemble your waiter order slip.
                </p>
              </div>

              {/* Quick Add from Saved Favorites */}
              {favoriteItemsList.length > 0 && (
                <div className="text-left bg-stone-50 rounded-2xl p-4 border border-stone-200 max-w-md mx-auto">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                      <span>Saved Favorites ({favoriteItemsList.length})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        favoriteItemsList.forEach((dish) => increment(dish.id));
                      }}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                    >
                      Add All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                    {favoriteItemsList.map((fav) => (
                      <div
                        key={fav.id}
                        className="flex items-center justify-between bg-white px-3 py-2 rounded-xl text-xs border border-stone-200/70"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <VegBadge isVeg={fav.isVeg} size="sm" showLabel={false} />
                          <span className="font-bold text-stone-800 truncate max-w-[170px]">
                            {fav.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => increment(fav.id)}
                          className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-black text-stone-800 uppercase tracking-wider">
                  Dishes & Selected Portions ({totalPortionsCount})
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  Item Subtotal
                </span>
              </div>

              {orderedItemsList.map(({ key, item, quantity, portion, unitPrice, displayName }) => {
                const itemTotal = unitPrice * quantity;

                return (
                  <div
                    key={key}
                    className="bg-stone-50/90 rounded-2xl p-3 border border-stone-200/80 flex items-center gap-3 transition-colors hover:border-orange-200"
                  >
                    {/* Dish Image */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (onSelectDish) {
                          onSelectDish(item);
                          onClose();
                        }
                      }}
                      className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-stone-200 cursor-pointer border border-stone-200"
                    >
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        category={item.category}
                        isVeg={item.isVeg}
                        size="sm"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-xs p-0.5 rounded shadow-2xs">
                        <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
                      </div>
                    </div>

                    {/* Dish Details & Price Type Tag */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                          {item.name}
                        </h4>

                        {/* Distinct Price Type Badges (Half / Full / Standard) */}
                        {portion === 'half' ? (
                          <span className="shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30">
                            Half Portion
                          </span>
                        ) : portion === 'full' ? (
                          <span className="shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-600 text-white shadow-2xs">
                            Full Portion
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                            Standard
                          </span>
                        )}
                      </div>

                      {/* Pricing calculation line */}
                      <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-2">
                        <span>₹{unitPrice} per plate</span>
                        <span className="text-stone-300">•</span>
                        <span className="font-semibold text-stone-700">
                          {quantity} × ₹{unitPrice} = ₹{itemTotal}
                        </span>
                      </div>
                    </div>

                    {/* Stepper & Calculated Price */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* Stepper */}
                      <div className="inline-flex items-center bg-white rounded-xl p-0.5 border border-stone-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => decrement(key)}
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                          aria-label={`Decrease ${displayName}`}
                        >
                          {quantity === 1 ? (
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Minus className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <span className="w-8 text-center text-xs font-black text-stone-900">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => increment(key)}
                          className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                          aria-label={`Increase ${displayName}`}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="w-14 text-right">
                        <span className="text-xs sm:text-sm font-black text-stone-900">
                          ₹{itemTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Transparent Calculation Breakdown Box */}
          {orderedItemsList.length > 0 && (
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/80">
                <span className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-orange-600" />
                  <span>Total Order Calculation</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Zero Tax / No GST
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between items-center">
                  <span>Dishes & Portions Total ({totalPortionsCount} portions)</span>
                  <span className="font-bold text-stone-900">
                    ₹{subtotalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-stone-500">
                  <span>GST / Additional Taxes</span>
                  <span className="text-stone-700 font-bold">₹0.00 (Direct Pricing)</span>
                </div>

                {preferences.spiceLevel && (
                  <div className="flex justify-between items-center text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span>Spice Level Note</span>
                    </span>
                    <span className="text-amber-700 font-bold">
                      {SPICE_LEVEL_CONFIG[preferences.spiceLevel].label} ({SPICE_LEVEL_CONFIG[preferences.spiceLevel].peppers})
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-stone-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wide block">
                    Total Amount To Pay
                  </span>
                  <span className="text-[10px] text-stone-400">
                    Final bill amount for {selectedTable}
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-orange-600">
                  ₹{grandTotalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions Strip */}
        {orderedItemsList.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200 shrink-0 space-y-2.5">
            {/* Primary Action: Place Dine-In Order */}
            <button
              type="button"
              onClick={handlePlaceWebsiteOrder}
              disabled={isPlacingOrder}
              id="full-screen-order-btn-place"
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-black text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting to Kitchen (Firestore)...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  <span>
                    Place Dine-In Order ({totalPortionsCount} portions • ₹{grandTotalPrice.toLocaleString('en-IN')})
                  </span>
                </>
              )}
            </button>

            {/* Secondary Action: Order via WhatsApp */}
            <button
              type="button"
              onClick={handlePlaceWhatsAppOrder}
              id="full-screen-order-btn-whatsapp"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Order via WhatsApp & Save to History</span>
            </button>

            {/* Utility Row: Copy Slip & Keep Browsing */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleCopySlip}
                id="full-screen-order-btn-copy-slip"
                className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedSlip ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
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
                onClick={onClose}
                id="full-screen-order-btn-keep-browsing"
                className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-black active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Keep Browsing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : modalContent}

      {/* Live Order Tracker Modal */}
      <LiveOrderStatusModal
        order={trackingOrder}
        isOpen={Boolean(trackingOrder)}
        onClose={() => setTrackingOrder(null)}
        onViewPastOrders={onNavigateToProfileOrders}
      />
    </>
  );
};
