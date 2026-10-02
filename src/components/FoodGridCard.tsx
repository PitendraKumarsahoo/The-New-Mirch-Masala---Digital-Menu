import React, { useState } from 'react';
import { MenuItem, isMenuItemUnavailable } from '../types';
import { VegBadge } from './VegBadge';
import { ImageWithFallback } from './ImageWithFallback';
import { Flame, Heart, ArrowRight, Plus, Minus } from 'lucide-react';
import { useCustomerPreferences } from '../services/customerProfileService';
import {
  useTableOrder,
  hasDualPortion,
  getPortionPrices,
} from '../services/tableOrderService';
import { PortionSelectionModal } from './orders/PortionSelectionModal';

interface FoodGridCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function FoodGridCard({ item, onSelect }: FoodGridCardProps) {
  const { isFavorite, toggleFavorite } = useCustomerPreferences();
  const { getQuantity, increment, decrement, addDish, getDishPortionCounts } = useTableOrder();
  const [isPortionModalOpen, setIsPortionModalOpen] = useState(false);

  const isFav = isFavorite(item.id);
  const qty = getQuantity(item.id);

  const isUnavailable = isMenuItemUnavailable(item);
  const isAvailable = !isUnavailable;

  const isDual = hasDualPortion(item);
  const portionCounts = getDishPortionCounts(item.id);
  const totalPortionQty = isDual ? portionCounts.total : qty;
  const portionPrices = getPortionPrices(item);

  const priceDisplay = isDual
    ? `₹${portionPrices.halfPrice} / ₹${portionPrices.fullPrice}`
    : item.price
    ? `₹${item.price}`
    : 'Price on request';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (isDual) {
      setIsPortionModalOpen(true);
    } else {
      addDish(item);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    if (isDual) {
      setIsPortionModalOpen(true);
    } else {
      decrement(item.id);
    }
  };

  return (
    <>
      <article
        id={`food-grid-card-${item.id}`}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${item.name}, ${priceDisplay}`}
        onClick={() => onSelect(item)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(item);
          }
        }}
        className={`group relative bg-white rounded-2xl border transition-all duration-250 cursor-pointer overflow-hidden flex flex-col justify-between active:scale-[0.98] select-none shadow-frosted-card hover:shadow-frosted-card-hover hover:border-orange-200/80 ${
          isAvailable
            ? 'border-slate-100/90'
            : 'border-slate-100/80 opacity-75 grayscale-[0.3]'
        }`}
      >
        {/* Upper Image Section */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            category={item.category}
            isVeg={item.isVeg}
            size="md"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top-Left Overlays: Veg/Non-Veg + HOT Tag */}
          <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
            <div className="bg-white/95 backdrop-blur-xs p-0.5 rounded-sm shadow-2xs">
              <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
            </div>

            {(item.isPopular || (item.spicyLevel && item.spicyLevel >= 2)) && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
                <Flame className="w-2.5 h-2.5 fill-white" />
                <span>HOT</span>
              </span>
            )}
          </div>

          {/* Top-Right Favorite Heart */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
            className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-transform active:scale-75 cursor-pointer ${
              isFav
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-black/35 text-white/90 hover:bg-black/60 hover:text-white backdrop-blur-[2px]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFav ? 'fill-white stroke-white' : 'stroke-white'
              }`}
            />
          </button>

          {/* Bottom-Right Price Badge */}
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-xs text-white font-extrabold text-[11px] tracking-tight shadow-xs">
            {isDual ? `₹${portionPrices.halfPrice}+` : `₹${item.price ?? '—'}`}
          </span>

          {/* Unavailable Overlay on Image */}
          {isUnavailable && (
            <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] flex items-center justify-center p-1 text-center z-10">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold text-[9px] uppercase tracking-wider rounded-xs shadow-xs">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Lower Details Section */}
        <div className="p-2.5 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-[13px] text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors">
              {item.name}
            </h4>

            <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
              {item.description || item.subCategory || `${item.category} specialty dish`}
            </p>
          </div>

          {/* Card Footer: Popular tag & Details link / Quick add */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100/70 mt-2">
            <div className="flex items-center gap-1">
              {item.isPopular ? (
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  POPULAR
                </span>
              ) : item.spicyLevel ? (
                <span className="text-[11px]" title={`Spicy level: ${item.spicyLevel}`}>
                  🌶️
                </span>
              ) : (
                <span className="text-[9px] text-slate-400 font-medium">
                  {item.category}
                </span>
              )}
            </div>

            {isAvailable ? (
              totalPortionQty > 0 ? (
                isDual ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPortionModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-600 text-white font-bold text-[10px] shadow-2xs active:scale-95 transition-all"
                  >
                    <span>{portionCounts.total}</span>
                    <span className="text-[8px] uppercase text-orange-200">Edit</span>
                  </button>
                ) : (
                  <div
                    className="inline-flex items-center bg-orange-600 text-white rounded-lg shadow-2xs overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={handleDecrement}
                      className="w-5 h-5 flex items-center justify-center hover:bg-orange-700 active:bg-orange-800 transition-colors"
                      aria-label={`Decrease ${item.name}`}
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="px-1 text-[10px] font-black min-w-[16px] text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className="w-5 h-5 flex items-center justify-center hover:bg-orange-700 active:bg-orange-800 transition-colors"
                      aria-label={`Increase ${item.name}`}
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-emerald-700 group-hover:text-emerald-800 inline-flex items-center gap-0.5 transition-colors">
                    Details
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-5 h-5 rounded-md bg-orange-50 hover:bg-orange-100 text-orange-700 flex items-center justify-center border border-orange-200/80 active:scale-95 transition-all shadow-2xs"
                    title={`Add ${item.name}`}
                    aria-label={`Add ${item.name}`}
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              )
            ) : (
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Unavailable
              </span>
            )}
          </div>
        </div>
      </article>

      {/* Portion Selection Modal */}
      {isDual && isPortionModalOpen && (
        <PortionSelectionModal
          item={item}
          isOpen={isPortionModalOpen}
          onClose={() => setIsPortionModalOpen(false)}
        />
      )}
    </>
  );
}
