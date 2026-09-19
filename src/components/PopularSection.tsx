import React from 'react';
import { Flame, ChevronRight, Heart, Plus, Minus } from 'lucide-react';
import { MenuItem } from '../types';
import { VegBadge } from './VegBadge';
import { ImageWithFallback } from './ImageWithFallback';
import { useCustomerPreferences } from '../services/customerProfileService';

interface PopularSectionProps {
  popularItems: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

export function PopularSection({ popularItems, onSelectItem }: PopularSectionProps) {
  const {
    isFavorite,
    toggleFavorite,
    getQuantity,
    incrementQuantity,
    decrementQuantity,
  } = useCustomerPreferences();

  if (popularItems.length === 0) return null;

  return (
    <section className="py-4 border-b border-slate-100 bg-slate-50/40">
      <div className="px-5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              Popular Today
            </h2>
          </div>
        </div>
        <span className="text-orange-600 text-[11px] font-bold">
          Chef's Picks
        </span>
      </div>

      {/* Horizontal Compact Scroll of Popular Cards */}
      <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar scroll-smooth snap-x snap-mandatory pb-1">
        {popularItems.map((item) => {
          const isFav = isFavorite(item.id);
          const qty = getQuantity(item.id);

          const hasSecondary =
            typeof item.secondaryPrice === 'number' &&
            !isNaN(item.secondaryPrice) &&
            item.secondaryPrice > 0;
          const priceDisplay = hasSecondary
            ? `₹${item.price} / ₹${item.secondaryPrice}`
            : `₹${item.price}`;

          return (
            <article
              key={item.id}
              id={`popular-item-${item.id}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(item)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectItem(item);
                }
              }}
              aria-label={`View details for ${item.name}, ${priceDisplay}`}
              className="group snap-start shrink-0 min-w-[150px] max-w-[165px] bg-white p-3 rounded-2xl shadow-frosted-card border border-slate-100/90 hover:shadow-frosted-card-hover hover:border-orange-200/70 transition-all duration-250 text-left flex flex-col justify-between active:scale-[0.98] focus:outline-hidden cursor-pointer select-none"
            >
              <div>
                {/* Image Container */}
                <div className="relative w-full h-22 rounded-xl overflow-hidden mb-2 bg-slate-100">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    category={item.category}
                    isVeg={item.isVeg}
                    size="md"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-xs p-1 rounded-md shadow-2xs">
                    <VegBadge isVeg={item.isVeg} size="sm" />
                  </div>

                  {/* Favorite Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    aria-label={isFav ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
                    className={`absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-transform active:scale-75 cursor-pointer ${
                      isFav
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-black/35 text-white/90 hover:bg-black/60 backdrop-blur-[2px]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white stroke-white' : 'stroke-white'}`} />
                  </button>

                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[9px] tracking-wider rounded-sm uppercase">
                        Sold Out
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="text-[12px] font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                  {item.name}
                </p>

                {/* Subcategory / tag */}
                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                  {item.subCategory || item.category}
                </p>
              </div>

              {/* Price & Add / Quantity Stepper Controls */}
              <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                <div>
                  <p className="text-[11px] font-bold text-stone-900 leading-tight">
                    {priceDisplay}
                  </p>
                  {qty > 1 && (
                    <p className="text-[9px] text-emerald-600 font-bold leading-tight">
                      Total: ₹{(Number(item.price) || 0) * qty}
                    </p>
                  )}
                </div>

                {item.isAvailable ? (
                  qty > 0 ? (
                    <div
                      className="inline-flex items-center bg-orange-600 text-white rounded-lg shadow-2xs overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          decrementQuantity(item.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center hover:bg-orange-700 active:bg-orange-800 transition-colors cursor-pointer"
                        aria-label={`Decrease ${item.name}`}
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="px-1 text-[10px] font-black min-w-[16px] text-center">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          incrementQuantity(item.id);
                        }}
                        className="w-5 h-5 flex items-center justify-center hover:bg-orange-700 active:bg-orange-800 transition-colors cursor-pointer"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementQuantity(item.id);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[10px] border border-orange-200/80 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center gap-0.5"
                      aria-label={`Add ${item.name}`}
                    >
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                      <span>ADD</span>
                    </button>
                  )
                ) : (
                  <span className="text-[9px] text-slate-400 font-medium">Sold Out</span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
