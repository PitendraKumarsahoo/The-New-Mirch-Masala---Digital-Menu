import React, { useState, useMemo } from 'react';
import { MenuItem } from '../../types';
import { VegBadge } from '../VegBadge';
import { ImageWithFallback } from '../ImageWithFallback';
import { Heart, UtensilsCrossed, Trash2, ArrowRight, Flame } from 'lucide-react';

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

  if (favoriteItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/80 p-8 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Heart className="w-8 h-8 fill-rose-100 text-rose-500" />
        </div>
        <h3 className="text-base font-bold text-stone-900 tracking-tight">
          No Favorite Dishes Yet
        </h3>
        <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
          Tap the <span className="text-rose-600 font-semibold">❤️ heart icon</span> on any dish across our menu to curate your personalized favorites for fast ordering.
        </p>

        <button
          type="button"
          onClick={onBrowseMenu}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Explore Digital Menu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>Saved Dishes</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700">
              {favoriteItems.length}
            </span>
          </h3>
          <p className="text-[11px] text-stone-500">Quick access to your curated tastes</p>
        </div>

        {/* Veg / Non-Veg filter toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors ${
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
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
              filter === 'veg'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-stone-500 hover:text-emerald-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Veg
          </button>
          <button
            type="button"
            onClick={() => setFilter('non-veg')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
              filter === 'non-veg'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-stone-500 hover:text-rose-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Non-Veg
          </button>
        </div>
      </div>

      {/* List of Favorite Dishes */}
      <div className="space-y-2.5">
        {filteredItems.map((item) => {
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
              className="group bg-white rounded-2xl p-3 border border-stone-200/80 shadow-xs hover:border-rose-200 transition-all flex items-center gap-3.5"
            >
              {/* Thumbnail click opens details */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectDish(item)}
                className="relative w-18 h-18 shrink-0 rounded-xl overflow-hidden bg-stone-100 cursor-pointer"
                title={`View ${item.name}`}
              >
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  category={item.category}
                  isVeg={item.isVeg}
                  size="sm"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>

              {/* Dish Info */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectDish(item)}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <VegBadge isVeg={item.isVeg} size="sm" showLabel={false} />
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate group-hover:text-orange-600 transition-colors">
                    {item.name}
                  </h4>
                  {item.isPopular && (
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">{priceDisplay}</span>
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

              {/* Remove Favorite Button */}
              <button
                type="button"
                onClick={() => onToggleFavorite(item.id)}
                className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                title="Remove from favorites"
                aria-label={`Remove ${item.name} from favorites`}
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
