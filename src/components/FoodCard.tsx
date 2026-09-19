import React from 'react';
import { MenuItem } from '../types';
import { VegBadge } from './VegBadge';
import { ImageWithFallback } from './ImageWithFallback';
import { Flame, Heart, Plus, Minus } from 'lucide-react';
import { useCustomerPreferences } from '../services/customerProfileService';

interface FoodCardProps {
  key?: string | number;
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function FoodCard({ item, onSelect }: FoodCardProps) {
  const {
    isFavorite,
    toggleFavorite,
    getQuantity,
    incrementQuantity,
    decrementQuantity,
  } = useCustomerPreferences();

  const isFav = isFavorite(item.id);
  const qty = getQuantity(item.id);

  const hasSecondary =
    typeof item.secondaryPrice === 'number' &&
    !isNaN(item.secondaryPrice) &&
    item.secondaryPrice > 0;

  const priceDisplay = hasSecondary
    ? `₹${item.price} / ₹${item.secondaryPrice}`
    : `₹${item.price}`;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    incrementQuantity(item.id);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    decrementQuantity(item.id);
  };

  return (
    <article
      id={`food-card-${item.id}`}
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
      className={`group relative bg-white rounded-2xl p-3 border transition-all duration-250 cursor-pointer active:scale-[0.99] select-none shadow-frosted-card hover:shadow-frosted-card-hover hover:border-orange-200/70 focus:outline-hidden focus:ring-2 focus:ring-orange-500/50 ${
        item.isAvailable
          ? 'border-slate-100/90'
          : 'border-slate-100/80 opacity-75 grayscale-[0.4]'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail Image */}
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.03)] border border-slate-100/60">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            category={item.category}
            isVeg={item.isVeg}
            size="sm"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Quick Heart Overlay on Image */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
            className={`absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-transform active:scale-75 cursor-pointer ${
              isFav
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-black/35 text-white/90 hover:bg-black/60 hover:text-white backdrop-blur-[2px]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFav ? 'fill-white stroke-white' : 'stroke-white'
              }`}
            />
          </button>

          {!item.isAvailable && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-bold text-[8px] uppercase tracking-wider rounded-xs">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
            <h4 className="font-bold text-[13px] sm:text-[14px] text-slate-800 truncate group-hover:text-orange-600 transition-colors">
              {item.name}
            </h4>
            {item.isPopular && (
              <span className="inline-flex items-center text-orange-500 shrink-0">
                <Flame className="w-3 h-3 fill-orange-500" />
              </span>
            )}
          </div>

          {/* Short Description */}
          {item.description && (
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate mb-1.5">
              {item.description}
            </p>
          )}

          {/* Price & Quantity / Add Controls row */}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex flex-col">
              <span className="text-[12px] sm:text-[13px] font-bold text-slate-900 leading-tight">
                {priceDisplay}
              </span>
              {qty > 1 && (
                <span className="text-[10px] text-emerald-600 font-semibold leading-tight">
                  Total: ₹{(Number(item.price) || 0) * qty}
                </span>
              )}
            </div>

            {item.isAvailable ? (
              qty > 0 ? (
                /* Quantity Stepper on Card */
                <div
                  className="inline-flex items-center bg-orange-600 text-white rounded-xl shadow-xs border border-orange-700/30 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="w-6 h-6 flex items-center justify-center hover:bg-orange-700 active:bg-orange-800 transition-colors cursor-pointer"
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-1.5 text-[11px] font-black min-w-[20px] text-center">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="w-6 h-6 flex items-center justify-center hover:bg-orange-700 active:bg-orange-800 transition-colors cursor-pointer"
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                /* + ADD Button on Card */
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] border border-orange-200/80 active:scale-95 transition-all shadow-2xs cursor-pointer"
                  aria-label={`Add ${item.name} to favorites and order`}
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                  <span>ADD</span>
                </button>
              )
            ) : (
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wider">
                SOLD OUT
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
