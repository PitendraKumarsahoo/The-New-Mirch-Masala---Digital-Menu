import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';
import {
  EVENT_ITEM_ADDED_TO_ORDER,
  OrderToastPayload,
} from '../../services/tableOrderService';
import { VegBadge } from '../VegBadge';
import { ImageWithFallback } from '../ImageWithFallback';

interface OrderToastProps {
  onOpenOrderDrawer?: () => void;
}

export const OrderToast: React.FC<OrderToastProps> = ({ onOpenOrderDrawer }) => {
  const [toast, setToast] = useState<OrderToastPayload | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleItemAdded = (e: Event) => {
      const customEvent = e as CustomEvent<OrderToastPayload>;
      if (customEvent.detail) {
        setToast(customEvent.detail);
        clearTimeout(timer);
        timer = setTimeout(() => {
          setToast(null);
        }, 3200);
      }
    };

    window.addEventListener(EVENT_ITEM_ADDED_TO_ORDER, handleItemAdded);
    return () => {
      window.removeEventListener(EVENT_ITEM_ADDED_TO_ORDER, handleItemAdded);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-[88px] sm:bottom-24 left-0 right-0 z-50 pointer-events-none flex justify-center px-4"
    >
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="pointer-events-auto max-w-md w-full sm:w-auto bg-stone-900/95 text-stone-100 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 shadow-2xl border border-stone-800/90 backdrop-blur-md flex items-center gap-3 select-none"
          >
            {/* Dish Thumbnail or Check Icon */}
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-stone-800 shrink-0 border border-stone-700/60">
              {toast.image ? (
                <ImageWithFallback
                  src={toast.image}
                  alt={toast.name}
                  category=""
                  isVeg={toast.isVeg ?? true}
                  size="sm"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-950/60 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                </div>
              )}
              {typeof toast.isVeg === 'boolean' && (
                <div className="absolute top-0.5 left-0.5 bg-black/60 p-0.5 rounded backdrop-blur-xs">
                  <VegBadge isVeg={toast.isVeg} size="sm" showLabel={false} />
                </div>
              )}
            </div>

            {/* Message Info */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Added to Table Order
                </span>
                {toast.portion && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {toast.portion === 'half' ? 'Half' : 'Full'}
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-white truncate mt-0.5">
                {toast.quantity > 1 ? `${toast.quantity}× ` : ''}
                {toast.name}
                <span className="ml-1.5 text-stone-300 font-normal text-[11px]">
                  • ₹{toast.price * toast.quantity}
                </span>
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {onOpenOrderDrawer && (
                <button
                  type="button"
                  onClick={() => {
                    setToast(null);
                    onOpenOrderDrawer();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
                >
                  <ShoppingBag className="w-3 h-3" />
                  <span className="whitespace-nowrap">View</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setToast(null)}
                aria-label="Close notification"
                className="w-7 h-7 rounded-xl flex items-center justify-center text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
