import React, { useState, useMemo } from 'react';
import { MenuItem } from '../../types';
import { VegBadge } from '../VegBadge';
import { ImageWithFallback } from '../ImageWithFallback';
import { useCustomerPreferences } from '../../services/customerProfileService';
import { SPICE_LEVEL_CONFIG } from '../../types/profile';
import {
  Heart,
  UtensilsCrossed,
  Trash2,
  ArrowRight,
  Flame,
  Plus,
  Minus,
  Receipt,
  Copy,
  Check,
  Sparkles,
  X,
  RotateCcw,
  ShoppingBag,
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
  const [isSlipOpen, setIsSlipOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState('Table 4');
  const [copiedSlip, setCopiedSlip] = useState(false);

  const {
    preferences,
    getQuantity,
    incrementQuantity,
    decrementQuantity,
    setQuantity,
    removeFavorite,
    resetQuantities,
  } = useCustomerPreferences();

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

  // Calculations for total quantities and prices
  const { totalPortions, subtotalPrice, taxGst, grandTotalPrice } = useMemo(() => {
    let portions = 0;
    let subtotal = 0;

    for (const item of favoriteItems) {
      const qty = getQuantity(item.id) || 1;
      portions += qty;
      const unitPrice = Number(item.price) || 0;
      subtotal += unitPrice * qty;
    }

    const gst = Math.round(subtotal * 0.05); // 5% standard GST for restaurant dining in India
    const grandTotal = subtotal + gst;

    return {
      totalPortions: portions,
      subtotalPrice: subtotal,
      taxGst: gst,
      grandTotalPrice: grandTotal,
    };
  }, [favoriteItems, getQuantity]);

  // Copy Waiter Order Slip to Clipboard
  const handleCopySlip = () => {
    const spiceInfo = SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'];
    const lines = [
      `🍛 The New Mirch Masala - Dine-In Order Slip`,
      `📍 ${selectedTable} | ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      `🌶️ Spice Preference: ${spiceInfo.label} (${spiceInfo.peppers})`,
      ...(preferences.specialInstructions
        ? [`📝 Instructions: ${preferences.specialInstructions}`]
        : []),
      `----------------------------------------`,
      ...favoriteItems.map((item) => {
        const qty = getQuantity(item.id) || 1;
        const itemTotal = (Number(item.price) || 0) * qty;
        return `• ${item.name} x${qty} = ₹${itemTotal}`;
      }),
      `----------------------------------------`,
      `Items: ${totalPortions} portions (${favoriteItems.length} dishes)`,
      `Subtotal: ₹${subtotalPrice.toLocaleString('en-IN')}`,
      `GST (5%): ₹${taxGst.toLocaleString('en-IN')}`,
      `Total Estimate: ₹${grandTotalPrice.toLocaleString('en-IN')}`,
    ];

    const text = lines.join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSlip(true);
      setTimeout(() => setCopiedSlip(false), 2500);
    }
  };

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
          Tap the <span className="text-rose-600 font-semibold">❤️ heart icon</span> or <span className="text-orange-600 font-semibold">+ ADD</span> on any dish across our menu to curate your personalized favorites, adjust quantities (1x, 2x, 3x), and calculate your table order total.
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
    <div className="space-y-4" id="favorite-dishes-section">
      {/* Header & Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <span>Favorite Dishes</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-700">
              {favoriteItems.length} {favoriteItems.length === 1 ? 'Dish' : 'Dishes'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-orange-100 text-orange-800">
              {totalPortions} {totalPortions === 1 ? 'Portion' : 'Portions'}
            </span>
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Adjust quantities (+/-) and calculate your table dining total
          </p>
        </div>

        {/* Veg / Non-Veg filter toggle */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors cursor-pointer ${
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
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
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
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
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

      {/* List of Favorite Dishes with Interactive Quantity Stepper & Price Breakdown */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const qty = getQuantity(item.id) || 1;
          const unitPrice = Number(item.price) || 0;
          const itemTotal = unitPrice * qty;

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
              className="group bg-white rounded-2xl p-3.5 border border-stone-200/80 shadow-2xs hover:border-orange-200 transition-all space-y-3"
            >
              {/* Upper row: Thumbnail + Dish Details + Remove Heart Button */}
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

                {/* Remove Favorite Button */}
                <button
                  type="button"
                  onClick={() => removeFavorite(item.id)}
                  className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
                  title="Remove from favorites"
                  aria-label={`Remove ${item.name} from favorites`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Lower row: Quantity Stepper (1, 2, 3, 4...) & Calculated Item Subtotal */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                {/* Quantity Controls Stepper */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center bg-stone-100/90 rounded-xl p-0.5 border border-stone-200/80 shadow-2xs">
                    {/* Decrement Button */}
                    <button
                      type="button"
                      onClick={() => decrementQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer disabled:opacity-30"
                      title={qty === 1 ? 'Remove from favorites' : 'Decrease portion'}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      {qty === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Quantity Display */}
                    <span
                      className="w-8 text-center text-xs font-black text-stone-900"
                      title={`${qty} portions`}
                    >
                      {qty}
                    </span>

                    {/* Increment Button */}
                    <button
                      type="button"
                      onClick={() => incrementQuantity(item.id)}
                      className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center transition-all active:scale-90 shadow-2xs cursor-pointer"
                      title="Add one more portion"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Calculated Item Total */}
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block leading-tight">
                    {qty} × ₹{unitPrice}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-emerald-700">
                    ₹{itemTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Beautiful Order Total & Bill Breakdown Card */}
      <div className="bg-gradient-to-b from-stone-900 to-stone-950 rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-stone-800 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Favorite Order Summary
              </h4>
              <p className="text-[10px] text-stone-400">
                Calculated for {totalPortions} portions across {favoriteItems.length} dishes
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => resetQuantities(1)}
            className="text-[10px] text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
            title="Reset all dish quantities to 1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset 1x</span>
          </button>
        </div>

        {/* Breakdown details */}
        <div className="space-y-1.5 text-xs text-stone-300">
          <div className="flex items-center justify-between">
            <span className="text-stone-400">Items Subtotal</span>
            <span className="font-semibold text-stone-200">
              ₹{subtotalPrice.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-400">Restaurant GST (5%)</span>
            <span className="font-semibold text-stone-200">
              ₹{taxGst.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-800/80">
            <span>Customer Spice Level</span>
            <span className="text-amber-400 font-bold">
              {SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'].label} (
              {SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'].peppers})
            </span>
          </div>
        </div>

        {/* Grand Total Row */}
        <div className="pt-3 border-t border-stone-800 flex items-baseline justify-between">
          <div>
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider block">
              Estimated Total Price
            </span>
            <span className="text-[10px] text-stone-400">
              Inclusive of GST & portions
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-orange-400 tracking-tight">
              ₹{grandTotalPrice.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {/* Open Waiter Order Slip Modal */}
          <button
            type="button"
            onClick={() => setIsSlipOpen(true)}
            className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Generate Waiter Order Slip</span>
          </button>

          {/* Quick Copy Slip Text */}
          <button
            type="button"
            onClick={handleCopySlip}
            className="w-full py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-stone-700"
          >
            {copiedSlip ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Order Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-400" />
                <span>Copy Order for Waiter</span>
              </>
            )}
          </button>
        </div>

        {/* Browse more menu link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={onBrowseMenu}
            className="text-[11px] text-stone-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <span>Want to add more dishes to favorites?</span>
            <span className="underline font-semibold text-orange-400">Explore Menu</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Waiter Order Slip Modal */}
      {isSlipOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsSlipOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-100 text-left space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Dine-In Order Slip
                  </h3>
                  <p className="text-[10px] text-stone-500">
                    Show this directly to the restaurant server
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSlipOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Table Selection */}
            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 space-y-1.5">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Dining Location / Table
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Family Table 8', 'Takeaway'].map(
                  (tbl) => (
                    <button
                      key={tbl}
                      type="button"
                      onClick={() => setSelectedTable(tbl)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-colors cursor-pointer ${
                        selectedTable === tbl
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {tbl}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Itemized Order Slip Receipt */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 font-mono text-xs space-y-2">
              <div className="text-center pb-2 border-b border-stone-200">
                <p className="font-bold text-stone-900">THE NEW MIRCH MASALA</p>
                <p className="text-[10px] text-stone-500">
                  {selectedTable} • {new Date().toLocaleDateString()}
                </p>
              </div>

              {/* Items */}
              <div className="space-y-1.5 py-1">
                {favoriteItems.map((item) => {
                  const qty = getQuantity(item.id) || 1;
                  const itemPrice = (Number(item.price) || 0) * qty;
                  return (
                    <div key={item.id} className="flex justify-between items-start gap-2">
                      <span className="text-stone-800">
                        {qty}x {item.name}
                      </span>
                      <span className="font-bold text-stone-900 shrink-0">
                        ₹{itemPrice}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Spice & Instructions */}
              <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-600 space-y-0.5">
                <p>
                  <span className="font-bold text-stone-800">Spice Level:</span>{' '}
                  {SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'].label}{' '}
                  {SPICE_LEVEL_CONFIG[preferences.spiceLevel || 'medium'].peppers}
                </p>
                {preferences.specialInstructions && (
                  <p>
                    <span className="font-bold text-stone-800">Note:</span>{' '}
                    {preferences.specialInstructions}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-stone-300 space-y-1 text-stone-800">
                <div className="flex justify-between text-[11px]">
                  <span>Subtotal ({totalPortions} portions)</span>
                  <span>₹{subtotalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>GST (5%)</span>
                  <span>₹{taxGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 pt-1 border-t border-stone-300">
                  <span>Grand Total</span>
                  <span className="text-orange-600">
                    ₹{grandTotalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Slip Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleCopySlip}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedSlip ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Text Slip</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSlipOpen(false)}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
