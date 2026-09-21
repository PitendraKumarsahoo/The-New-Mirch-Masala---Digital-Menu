import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PlacedOrder,
  OrderStatus,
  advanceOrderToNextStep,
  updateOrderStatus,
} from '../../services/orderHistoryService';
import { OrderStatusTracker } from '../OrderStatusTracker';
import { VegBadge } from '../VegBadge';
import {
  X,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  Copy,
  Check,
  ChefHat,
  ArrowRight,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface LiveOrderStatusModalProps {
  order: PlacedOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onViewPastOrders?: () => void;
}

export const LiveOrderStatusModal: React.FC<LiveOrderStatusModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewPastOrders,
}) => {
  const [copied, setCopied] = useState(false);
  const [localOrder, setLocalOrder] = useState<PlacedOrder | null>(order);
  const [isSimulating, setIsSimulating] = useState(false);

  // Keep local copy synced
  React.useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  // Timed simulation if toggled on inside modal
  React.useEffect(() => {
    if (!localOrder || !isSimulating || localOrder.status === 'completed') return;
    const timer = setTimeout(() => {
      const updated = advanceOrderToNextStep(localOrder.orderId);
      if (updated) {
        setLocalOrder(updated);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [localOrder, isSimulating]);

  if (!isOpen || !localOrder) return null;

  const handleAdvance = () => {
    const updated = advanceOrderToNextStep(localOrder.orderId);
    if (updated) {
      setLocalOrder(updated);
    }
  };

  const handleSelectStatus = (status: OrderStatus) => {
    const updated = updateOrderStatus(localOrder.orderId, status);
    if (updated) {
      setLocalOrder(updated);
    }
  };

  const handleCopySlip = () => {
    const lines = [
      `🍛 The New Mirch Masala - Order #${localOrder.orderId}`,
      `📍 ${localOrder.tableNumber} | Status: ${localOrder.status.toUpperCase()}`,
      `🕒 ${new Date(localOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `----------------------------------------`,
      ...localOrder.items.map((it) => `• ${it.name} x${it.quantity} = ₹${it.price * it.quantity}`),
      `----------------------------------------`,
      `Grand Total: ₹${localOrder.grandTotalPrice.toLocaleString('en-IN')}`,
    ];
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="live-order-tracker-title"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/80 backdrop-blur-xs p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-stone-200/80 text-left max-h-[90vh] flex flex-col no-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Indicator */}
          <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-3 shrink-0" />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="live-order-tracker-title" className="text-sm font-bold text-stone-900 leading-tight">
                    Order #{localOrder.orderId}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                    {localOrder.tableNumber}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Placed at {new Date(localOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Live Step-by-Step Tracker
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close tracker"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-0.5 no-scrollbar">
            {/* Step-by-step Visual Progress Tracker */}
            <OrderStatusTracker
              order={localOrder}
              showControls={true}
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating((prev) => !prev)}
              onAdvanceStep={handleAdvance}
              onSelectStatus={handleSelectStatus}
            />

            {/* Order Items List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Order Items ({localOrder.totalPortionsCount} portions)
                </h4>
                <button
                  type="button"
                  onClick={handleCopySlip}
                  className="text-[11px] font-bold text-stone-600 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Slip</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1.5">
                {localOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs"
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
                      <span className="text-[11px] text-stone-400 font-mono">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-stone-900 shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-stone-50/60 rounded-2xl p-3 border border-stone-200/60 flex justify-between items-center text-xs">
              <span className="font-bold text-stone-700">Total Order Amount</span>
              <span className="font-black text-orange-600 text-base">
                ₹{localOrder.grandTotalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="border-t border-stone-100 pt-3 space-y-2 shrink-0">
            <div className="grid grid-cols-2 gap-2">
              {onViewPastOrders && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewPastOrders();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-stone-600" />
                  <span>View All Past Orders</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer col-span-1 shadow-md shadow-orange-600/20"
              >
                <span>Back to Menu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
