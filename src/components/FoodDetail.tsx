import { useEffect } from 'react';
import { X, ArrowLeft, Flame, Sparkles } from 'lucide-react';
import { MenuItem } from '../types';
import { VegBadge } from './VegBadge';
import { ImageWithFallback } from './ImageWithFallback';

interface FoodDetailProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function FoodDetail({ item, onClose }: FoodDetailProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const hasSecondary =
    typeof item.secondaryPrice === 'number' &&
    !isNaN(item.secondaryPrice) &&
    item.secondaryPrice > 0;

  const priceDisplay = hasSecondary
    ? `₹${item.price} / ₹${item.secondaryPrice}`
    : `₹${item.price}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-detail-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-[0_24px_60px_-12px_rgba(15,23,42,0.18)] overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col animate-in slide-in-from-bottom duration-300 border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Control Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to menu"
            className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold backdrop-blur-md shadow-md active:scale-95 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="pointer-events-auto p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md shadow-md active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Large Food Image Hero */}
        <div className="relative -mt-16 w-full aspect-16/11 bg-slate-900">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            category={item.category}
            isVeg={item.isVeg}
            size="lg"
            className="w-full h-full object-cover"
          />

          {!item.isAvailable && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white">
              <span className="px-3 py-1 bg-slate-100 text-slate-900 font-extrabold text-xs uppercase tracking-widest rounded-md shadow-md">
                SOLD OUT
              </span>
              <p className="mt-1.5 text-xs text-slate-300">
                Currently unavailable today
              </p>
            </div>
          )}
        </div>

        {/* Detail Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Category & Veg/Non-Veg Tag Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <div className="flex items-center gap-2">
              <VegBadge isVeg={item.isVeg} size="md" showLabel={true} />

              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {item.category} {item.subCategory ? `• ${item.subCategory}` : ''}
              </span>
            </div>

            {/* Availability Status Badge */}
            {item.isAvailable ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Available
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                SOLD OUT
              </span>
            )}
          </div>

          {/* Dish Name */}
          <h2
            id="food-detail-title"
            className="text-2xl font-black text-slate-800 tracking-tight mt-1 uppercase"
          >
            {item.name}
          </h2>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">
              {priceDisplay}
            </span>
          </div>

          {/* Highlights & Spiciness */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {item.isPopular && (
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-200/70">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" />
                <span>Mirch Masala Pick</span>
              </div>
            )}

            {item.spicyLevel && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                <span>Spice:</span>
                <span className="font-bold">
                  {item.spicyLevel === 1 ? 'Mild' : item.spicyLevel === 2 ? 'Medium Spicy' : 'Fiery Hot'}
                </span>
                <span>{'🌶️'.repeat(item.spicyLevel)}</span>
              </div>
            )}

            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
              >
                <Sparkles className="w-3 h-3 text-orange-500" />
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Description & Ingredients
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              {item.description}
            </p>
          </div>

          {/* Notice: Menu Only notice */}
          <div className="mt-5 p-3 rounded-2xl bg-orange-50/60 border border-orange-200/50 text-center">
            <p className="text-xs font-medium text-orange-900">
              Please convey your order directly to our dining staff or call our counter.
            </p>
          </div>

          {/* Close/Back Button */}
          <div className="mt-5 pt-3">
            <button
              type="button"
              id="close-food-detail-btn"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
