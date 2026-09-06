import { MenuItem } from '../types';
import { VegBadge } from './VegBadge';
import { ImageWithFallback } from './ImageWithFallback';
import { Flame } from 'lucide-react';

interface FoodCardProps {
  key?: string | number;
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function FoodCard({ item, onSelect }: FoodCardProps) {
  const hasSecondary =
    typeof item.secondaryPrice === 'number' &&
    !isNaN(item.secondaryPrice) &&
    item.secondaryPrice > 0;

  const priceDisplay = hasSecondary
    ? `₹${item.price} / ₹${item.secondaryPrice}`
    : `₹${item.price}`;

  return (
    <article
      id={`food-card-${item.id}`}
      onClick={() => onSelect(item)}
      className={`group relative bg-white rounded-2xl p-3 border transition-all duration-250 cursor-pointer active:scale-[0.99] select-none shadow-frosted-card hover:shadow-frosted-card-hover hover:border-orange-200/70 ${
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

          {/* Price & Availability row */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-[12px] sm:text-[13px] font-bold text-slate-900">
                {priceDisplay}
              </span>
            </div>

            {item.isAvailable ? (
              <span className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-100 px-2 py-0.5 rounded tracking-wider uppercase">
                AVAILABLE
              </span>
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
