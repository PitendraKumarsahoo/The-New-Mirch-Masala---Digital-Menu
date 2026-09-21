import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { MenuItem } from '../../types';
import { VegBadge } from '../VegBadge';
import { ImageWithFallback } from '../ImageWithFallback';
import {
  getPortionPrices,
  PortionType,
  useTableOrder,
} from '../../services/tableOrderService';

interface PortionSelectionModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPortion?: (item: MenuItem, portion: PortionType) => void;
  currentHalfQty?: number;
  currentFullQty?: number;
  onIncrementPortion?: (item: MenuItem, portion: PortionType) => void;
  onDecrementPortion?: (item: MenuItem, portion: PortionType) => void;
}

export const PortionSelectionModal: React.FC<PortionSelectionModalProps> = ({
  item,
  isOpen,
  onClose,
  onSelectPortion,
  currentHalfQty,
  currentFullQty,
  onIncrementPortion,
  onDecrementPortion,
}) => {
  const { addDish, decrement, getPortions } = useTableOrder();

  // ESC key to close
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

  if (!isOpen || !item) return null;

  const { fullPrice, halfPrice } = getPortionPrices(item);
  const livePortions = getPortions(item.id);
  const effectiveHalfQty = currentHalfQty ?? livePortions.half;
  const effectiveFullQty = currentFullQty ?? livePortions.full;

  const handleAdd = (e: React.MouseEvent, portion: PortionType) => {
    e.stopPropagation();
    if (onSelectPortion) {
      onSelectPortion(item, portion);
    } else {
      addDish(item, portion);
    }
  };

  const handleIncrement = (e: React.MouseEvent, portion: PortionType) => {
    e.stopPropagation();
    if (onIncrementPortion) {
      onIncrementPortion(item, portion);
    } else if (onSelectPortion) {
      onSelectPortion(item, portion);
    } else {
      addDish(item, portion);
    }
  };

  const handleDecrement = (e: React.MouseEvent, portion: PortionType) => {
    e.stopPropagation();
    if (onDecrementPortion) {
      onDecrementPortion(item, portion);
    } else {
      decrement(item.id, portion);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="portion-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', damping: 26, stiffness: 340 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Header with Dish Snapshot */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between gap-3 bg-stone-50/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-200">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                category={item.category}
                isVeg={item.isVeg}
                size="sm"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-1 left-1 bg-white/90 p-0.5 rounded shadow-xs">
                <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
              </div>
            </div>

            <div className="min-w-0">
              <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                Choose Portion Size
              </span>
              <h3
                id="portion-modal-title"
                className="text-sm sm:text-base font-black text-stone-900 truncate"
              >
                {item.name}
              </h3>
              <p className="text-[11px] text-stone-500 truncate">
                {item.category} {item.subCategory ? `• ${item.subCategory}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close portion selector"
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Portion Choices */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto no-scrollbar">
          <p className="text-xs text-stone-500 font-medium">
            Select Half or Full portion for this dish:
          </p>

          {/* Option 1: Half Portion Card */}
          <div
            className={`rounded-2xl p-3.5 border transition-all duration-200 ${
              effectiveHalfQty > 0
                ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                : 'bg-stone-50/80 border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900 text-white">
                    Half Portion
                  </span>
                  {effectiveHalfQty > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      {effectiveHalfQty} in order
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Individual serving • Ideal for 1 person
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base sm:text-lg font-black text-stone-900 block">
                  ₹{halfPrice}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">per half plate</span>
              </div>
            </div>

            {/* Actions for Half */}
            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-600">
                {effectiveHalfQty > 0 ? `Subtotal: ₹${halfPrice * effectiveHalfQty}` : 'Select quantity'}
              </span>

              {effectiveHalfQty > 0 ? (
                <div className="inline-flex items-center bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                  <button
                    type="button"
                    onClick={(e) => handleDecrement(e, 'half')}
                    className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 text-stone-700 active:scale-95 transition-colors cursor-pointer"
                    aria-label={`Decrease half portion of ${item.name}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-stone-900">
                    {effectiveHalfQty}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleIncrement(e, 'half')}
                    className="w-7 h-7 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white active:scale-95 transition-colors cursor-pointer"
                    aria-label={`Increase half portion of ${item.name}`}
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleAdd(e, 'half')}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Half (₹{halfPrice})</span>
                </button>
              )}
            </div>
          </div>

          {/* Option 2: Full Portion Card */}
          <div
            className={`rounded-2xl p-3.5 border transition-all duration-200 ${
              effectiveFullQty > 0
                ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                : 'bg-stone-50/80 border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-600 text-white">
                    Full Portion
                  </span>
                  {effectiveFullQty > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3 stroke-[3]" />
                      {effectiveFullQty} in order
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Full portion • Great for sharing & hearty appetite
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-base sm:text-lg font-black text-stone-900 block">
                  ₹{fullPrice}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">per full plate</span>
              </div>
            </div>

            {/* Actions for Full */}
            <div className="mt-3 pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-600">
                {effectiveFullQty > 0 ? `Subtotal: ₹${fullPrice * effectiveFullQty}` : 'Select quantity'}
              </span>

              {effectiveFullQty > 0 ? (
                <div className="inline-flex items-center bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
                  <button
                    type="button"
                    onClick={(e) => handleDecrement(e, 'full')}
                    className="w-7 h-7 flex items-center justify-center hover:bg-stone-100 text-stone-700 active:scale-95 transition-colors cursor-pointer"
                    aria-label={`Decrease full portion of ${item.name}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-stone-900">
                    {effectiveFullQty}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleIncrement(e, 'full')}
                    className="w-7 h-7 flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white active:scale-95 transition-colors cursor-pointer"
                    aria-label={`Increase full portion of ${item.name}`}
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => handleAdd(e, 'full')}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Full (₹{fullPrice})</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer Done / Close */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs tracking-wide cursor-pointer transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};
