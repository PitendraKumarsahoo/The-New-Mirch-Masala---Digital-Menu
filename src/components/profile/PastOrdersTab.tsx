import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  usePlacedOrders,
  PlacedOrder,
  ORDER_STATUS_STEPS,
} from '../../services/orderHistoryService';
import { useTableOrder } from '../../services/tableOrderService';
import { OrderStatusStepper } from '../orders/OrderStatusStepper';
import { LiveOrderStatusModal } from '../orders/LiveOrderStatusModal';
import { VegBadge } from '../VegBadge';
import {
  ShoppingBag,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Copy,
  Check,
  CheckCircle2,
  ChefHat,
  BellRing,
  ExternalLink,
  Trash2,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

interface PastOrdersTabProps {
  onBrowseMenu: () => void;
  customerId?: string;
}

export const PastOrdersTab: React.FC<PastOrdersTabProps> = ({
  onBrowseMenu,
  customerId,
}) => {
  const {
    orders,
    activeOrders,
    completedOrders,
    advanceStep,
    deleteOrder,
  } = usePlacedOrders();

  const { increment } = useTableOrder();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<PlacedOrder | null>(null);
  const [reorderedFeedback, setReorderedFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (filter === 'active') {
      return (
        order.status === 'received' ||
        order.status === 'preparing' ||
        order.status === 'ready'
      );
    }
    if (filter === 'completed') {
      return order.status === 'completed';
    }
    return true;
  });

  // Reorder dishes into current table order
  const handleReorder = (order: PlacedOrder) => {
    for (const item of order.items) {
      const key = item.portion ? `${item.id}__${item.portion}` : item.id;
      for (let i = 0; i < item.quantity; i++) {
        increment(key);
      }
    }
    setReorderedFeedback(order.orderId);
    setTimeout(() => {
      setReorderedFeedback(null);
      onBrowseMenu();
    }, 1200);
  };

  const handleCopySlip = (order: PlacedOrder) => {
    const lines = [
      `🍛 The New Mirch Masala - Order #${order.orderId}`,
      `📍 ${order.tableNumber} | Status: ${order.status.toUpperCase()}`,
      `🕒 ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Order Received
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200/80 px-2 py-0.5 rounded-full">
            <ChefHat className="w-3 h-3 text-orange-600 animate-bounce" />
            In Kitchen
          </span>
        );
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full shadow-xs">
            <BellRing className="w-3 h-3 text-emerald-600 animate-pulse" />
            Ready to Serve
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Served & Completed
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Tab Header Banner */}
      <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-2xs">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Past & Active Orders
            </h2>
            <p className="text-[11px] text-stone-500">
              Orders placed on website & WhatsApp • Stored locally
            </p>
          </div>
        </div>

        {activeOrders.length > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {activeOrders.length} Live
          </span>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 bg-stone-100/80 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xs text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-800">
              {filter === 'active'
                ? 'No active orders in progress'
                : filter === 'completed'
                ? 'No completed orders yet'
                : 'No past orders recorded'}
            </h3>
            <p className="text-[11px] text-stone-400 mt-1 max-w-xs mx-auto">
              Whenever you place an order on the website or via WhatsApp, it will be saved here with live step-by-step kitchen status.
            </p>
          </div>
          <button
            type="button"
            onClick={onBrowseMenu}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>Browse Menu & Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.orderId;
            const isActive =
              order.status === 'received' ||
              order.status === 'preparing' ||
              order.status === 'ready';

            return (
              <div
                key={order.orderId}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isActive
                    ? 'border-orange-300 ring-2 ring-orange-500/15 shadow-sm'
                    : 'border-stone-200/80 shadow-2xs hover:border-stone-300'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-stone-900">
                          #{order.orderId}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                          {order.tableNumber}
                        </span>
                        {order.channel === 'whatsapp' ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                            <MessageCircle className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                            WhatsApp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-200">
                            Website
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>
                          {new Date(order.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(order.status)}
                      <span className="text-xs font-black text-stone-900">
                        ₹{order.grandTotalPrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Step-by-step Visual Progress (Compact Stepper) */}
                  <div className="pt-1 pb-1">
                    <OrderStatusStepper
                      order={order}
                      compact={true}
                      showStaffControls={isActive}
                      onAdvanceStep={() => advanceStep(order.orderId)}
                    />
                  </div>

                  {/* Quick Preview of Dishes */}
                  <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50/80 px-3 py-2 rounded-xl">
                    <span className="font-medium truncate max-w-[200px]">
                      {order.items.map((it) => `${it.name} (${it.quantity})`).join(', ')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.orderId)
                      }
                      className="text-stone-500 hover:text-stone-900 text-[11px] font-bold flex items-center gap-0.5 shrink-0 ml-2 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide' : 'Details'}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100 bg-stone-50/50 p-4 space-y-3"
                    >
                      {/* Detailed Item List */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                          Ordered Items ({order.totalPortionsCount} portions)
                        </span>
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200/70 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {typeof item.isVeg === 'boolean' && (
                                <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
                              )}
                              <span className="font-semibold text-stone-800 truncate">
                                {item.name}
                              </span>
                              {item.portion && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
                                  {item.portion}
                                </span>
                              )}
                              <span className="text-stone-400 font-mono text-[11px]">
                                x{item.quantity}
                              </span>
                            </div>
                            <span className="font-bold text-stone-900">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="bg-white p-3 rounded-xl border border-stone-200/70 space-y-1 text-xs text-stone-600">
                        <div className="flex justify-between font-bold text-stone-900">
                          <span>Total Amount</span>
                          <span className="text-orange-600">₹{order.grandTotalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        {order.spiceLevel && (
                          <div className="flex justify-between text-[11px] text-stone-500">
                            <span>Spice Setting</span>
                            <span className="font-bold capitalize">{order.spiceLevel}</span>
                          </div>
                        )}
                        {order.specialInstructions && (
                          <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                            <span className="font-bold">Instructions: </span>
                            <span>{order.specialInstructions}</span>
                          </div>
                        )}
                        <div className="border-t border-stone-100 pt-1.5 flex justify-between font-black text-stone-900 text-sm">
                          <span>Total</span>
                          <span className="text-orange-600">
                            ₹{order.grandTotalPrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setTrackingOrder(order)}
                          className="py-2 px-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Track Live</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="py-2 px-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          {reorderedFeedback === order.orderId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Added to Cart!</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reorder</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopySlip(order)}
                          className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1"
                        >
                          {copiedId === order.orderId ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Slip</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Order Tracker Modal */}
      {trackingOrder && (
        <LiveOrderStatusModal
          order={trackingOrder}
          isOpen={Boolean(trackingOrder)}
          onClose={() => setTrackingOrder(null)}
        />
      )}
    </div>
  );
};
