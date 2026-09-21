import React, { useState, useMemo } from 'react';
import { MenuItem } from '../../types';
import { VegBadge } from '../VegBadge';
import { ImageWithFallback } from '../ImageWithFallback';
import { useCustomerPreferences } from '../../services/customerProfileService';
import { useTableOrder } from '../../services/tableOrderService';
import { SPICE_LEVEL_CONFIG } from '../../types/profile';
import {
  Heart,
  UtensilsCrossed,
  Trash2,
  ArrowRight,
  Flame,
  Plus,
  Minus,
  Check,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
} from 'lucide-react';

interface FavoriteDishesTabProps {
  favoriteIds: string[];
  allMenuItems: MenuItem[];
  onToggleFavorite: (dishId: string) => void;
  onSelectDish: (item: MenuItem) => void;
  onBrowseMenu: () => void;
}

export const FavoriteDishesTab: React.FC<FavoriteDishesTabProps> = ({
  favoriteIds,
  allMenuItems,
  onToggleFavorite,
  onSelectDish,
  onBrowseMenu,
}) => {
  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [addedAllSuccess, setAddedAllSuccess] = useState(false);

  const { removeFavorite, preferences } = useCustomerPreferences();
  const { getQuantity, increment, decrement, totalItemsCount } = useTableOrder();

  // Map favorite IDs to MenuItem objects
  const favoriteItems = useMemo(() => {
    const itemMap = new Map<string, MenuItem>();
    for (const item of allMenuItems) {
      itemMap.set(item.id, item);
    }
    return favoriteIds
      .map((id) => itemMap.get(id))
      .filter((item): item is MenuItem => Boolean(item));
  }, [favoriteIds, allMenuItems]);

  const filteredItems = useMemo(() => {
    if (filter === 'veg') return favoriteItems.filter((i) => i.isVeg);
    if (filter === 'non-veg') return favoriteItems.filter((i) => !i.isVeg);
    return favoriteItems;
  }, [favoriteItems, filter]);

  // Add all favorites to active table order
  const handleAddAllToOrder = () => {
    favoriteItems.forEach((dish) => {
      if (dish.isAvailable) {
        if (getQuantity(dish.id) === 0) {
          increment(dish.id);
        }
      }
    });
    setAddedAllSuccess(true);
    setTimeout(() => setAddedAllSuccess(false), 2500);
  };

  // Empty state when customer has not saved any favorites yet
  if (favoriteItems.length === 0) {
    return (
      <div className="py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
          <Heart className="w-8 h-8 stroke-[1.5]" />
        </div>
        <div className="space-y-1 max-w-xs mx-auto">
          <h3 className="text-base font-bold text-stone-900">No Saved Favorites Yet</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Browse our authentic North Indian menu and tap the heart icon on any dish to save it here for fast reordering.
          </p>
        </div>
        <button
          type="button"
          onClick={onBrowseMenu}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <span>Explore Menu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Info Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 leading-tight">
              My Saved Favorites ({favoriteItems.length})
            </h3>
            <p className="text-[11px] text-stone-500">
              Dishes you bookmarked • One-tap add to your table order
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddAllToOrder}
          className="px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          {addedAllSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Added to Order!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order All Favorites</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Tabs (All / Pure Veg / Non-Veg) */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex p-1 bg-stone-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            All ({favoriteItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('veg')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'veg'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-stone-500 hover:text-emerald-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Pure Veg
          </button>
          <button
            type="button"
            onClick={() => setFilter('non-veg')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              filter === 'non-veg'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-stone-500 hover:text-rose-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Non-Veg
          </button>
        </div>

        {totalItemsCount > 0 && (
          <span className="text-[11px] text-stone-500 font-medium">
            Active Order: <strong className="text-orange-600">{totalItemsCount} dishes</strong>
          </span>
        )}
      </div>

      {/* List of Favorite Dishes */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
          const orderQty = getQuantity(item.id);
          const unitPrice = Number(item.price) || 0;

          const hasSecondary =
            typeof item.secondaryPrice === 'number' &&
            !isNaN(item.secondaryPrice) &&
            item.secondaryPrice > 0;
          const priceDisplay = hasSecondary
            ? `₹${item.price} / ₹${item.secondaryPrice}`
            : `₹${item.price}`;

          return (
            <div
              key={item.id}
              id={`favorite-dish-${item.id}`}
              className="group bg-white rounded-2xl p-3 border border-stone-200/80 shadow-2xs hover:border-orange-200 transition-all space-y-2.5"
            >
              {/* Upper row: Thumbnail + Dish Details + Remove from favorites */}
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectDish(item)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectDish(item);
                    }
                  }}
                  className="relative w-16 h-16 sm:w-18 sm:h-18 shrink-0 rounded-xl overflow-hidden bg-stone-100 cursor-pointer shadow-2xs border border-stone-100"
                  title={`View details for ${item.name}`}
                >
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    category={item.category}
                    isVeg={item.isVeg}
                    size="sm"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-xs p-0.5 rounded shadow-2xs">
                    <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
                  </div>
                </div>

                {/* Dish Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectDish(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectDish(item);
                        }
                      }}
                      className="font-bold text-xs sm:text-sm text-stone-900 truncate group-hover:text-orange-600 transition-colors cursor-pointer"
                    >
                      {item.name}
                    </h4>
                    {item.isPopular && (
                      <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 flex-wrap">
                    <span className="font-semibold text-stone-800">{priceDisplay}</span>
                    <span>•</span>
                    <span className="truncate">{item.category}</span>
                    {item.spicyLevel && (
                      <>
                        <span>•</span>
                        <span>{'🌶️'.repeat(item.spicyLevel)}</span>
                      </>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-[10px] text-stone-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Remove from favorites (Heart) */}
                <button
                  type="button"
                  onClick={() => removeFavorite(item.id)}
                  className="p-1.5 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                  title="Remove from favorites"
                  aria-label={`Remove ${item.name} from favorites`}
                >
                  <Heart className="w-4 h-4 fill-rose-500" />
                </button>
              </div>

              {/* Lower row: Add to Table Order / Stepper */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-500">
                  {orderQty > 0 ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In table order ({orderQty} portions = ₹{unitPrice * orderQty})
                    </span>
                  ) : (
                    'Not in active order'
                  )}
                </span>

                {/* Action: ADD or Stepper for Table Order */}
                {item.isAvailable ? (
                  orderQty > 0 ? (
                    <div className="inline-flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                      <button
                        type="button"
                        onClick={() => decrement(item.id)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                        aria-label={`Decrease ${item.name}`}
                      >
                        {orderQty === 1 ? (
                          <Trash2 className="w-3 h-3 text-rose-500" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </button>
                      <span className="w-7 text-center text-xs font-black text-stone-900">
                        {orderQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(item.id)}
                        className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                        aria-label={`Increase ${item.name}`}
                      >
                        <Plus className="w-3 h-3 stroke-[2.5]" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => increment(item.id)}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Add to Table Order</span>
                    </button>
                  )
                ) : (
                  <span className="text-xs text-stone-400 font-medium">Currently Sold Out</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Spice note indicator from customer preferences */}
      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs text-stone-600">
        <span>Dining Spice Preference</span>
        <span className="font-bold text-amber-800">
          {SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'].label}{' '}
          {SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'].peppers}
        </span>
      </div>
    </div>
  );
};
