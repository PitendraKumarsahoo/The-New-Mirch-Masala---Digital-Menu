import React, { useState, useEffect } from 'react';
import { AdminMenuItem } from '../../types/admin';
import { updateMenuItemPriceDirectlyInFirestore } from '../../services/firebaseDbService';
import {
  X,
  IndianRupee,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface EditPriceModalProps {
  isOpen: boolean;
  item: AdminMenuItem | null;
  onClose: () => void;
  onPriceUpdated: (item: AdminMenuItem, newPrice: number, newSecondaryPrice: number | null) => void;
}

export const EditPriceModal: React.FC<EditPriceModalProps> = ({
  isOpen,
  item,
  onClose,
  onPriceUpdated,
}) => {
  const [price, setPrice] = useState<string>('');
  const [hasSecondary, setHasSecondary] = useState<boolean>(false);
  const [secondaryPrice, setSecondaryPrice] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (item) {
      setPrice(item.price !== null && item.price !== undefined ? String(item.price) : '');
      if (item.secondaryPrice !== null && item.secondaryPrice !== undefined) {
        setHasSecondary(true);
        setSecondaryPrice(String(item.secondaryPrice));
      } else {
        setHasSecondary(false);
        setSecondaryPrice('');
      }
      setError(null);
      setSuccess(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const currentPriceNum = Number(price);

  const adjustPrice = (delta: number) => {
    const current = Number(price) || 0;
    const next = Math.max(0, current + delta);
    setPrice(String(next));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid price (greater than or equal to 0).');
      return;
    }

    let numSecondary: number | null = null;
    if (hasSecondary && secondaryPrice.trim()) {
      numSecondary = Number(secondaryPrice);
      if (isNaN(numSecondary) || numSecondary < 0) {
        setError('Please enter a valid half / secondary price.');
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await updateMenuItemPriceDirectlyInFirestore(
        item.id,
        numPrice,
        numSecondary
      );

      if (res.success) {
        setSuccess(true);
        const updatedItem: AdminMenuItem = {
          ...item,
          price: numPrice,
          secondaryPrice: numSecondary,
        };
        onPriceUpdated(updatedItem, numPrice, numSecondary);
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setError(res.error || 'Failed to update price in Firestore.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected network error during price update.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-stone-100 flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-price-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 id="edit-price-title" className="text-base font-bold text-white leading-tight">
                Edit Menu Price
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Syncs directly to Firestore &lsquo;menuItems&rsquo;</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Dish Summary Card */}
          <div className="p-3.5 bg-stone-950 rounded-2xl border border-stone-800/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden flex items-center justify-center shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-amber-400 font-bold text-sm">₹</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-white truncate">{item.name}</p>
                <span
                  className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                    item.isVeg ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                  title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                />
              </div>
              <p className="text-xs text-stone-400">{item.category}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">Current Price</span>
              <span className="text-sm font-bold text-stone-300 font-mono">
                ₹{item.price}
                {item.secondaryPrice && (
                  <span className="text-xs text-stone-500 font-normal"> / ₹{item.secondaryPrice}</span>
                )}
              </span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Price updated successfully in Firestore database!</span>
            </div>
          )}

          {/* Standard Price Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider">
              Standard / Full Portion Price (₹) <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <span className="font-bold text-base text-amber-400">₹</span>
              </div>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 180"
                className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-base font-bold focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                autoFocus
              />
            </div>

            {/* Quick Adjustment Steppers */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-stone-500 font-medium mr-1">Quick Adjust:</span>
              {[-20, -10, +10, +20, +50].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => adjustPrice(delta)}
                  className="px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 text-xs font-mono font-semibold transition-all cursor-pointer border border-stone-700/60"
                >
                  {delta > 0 ? `+₹${delta}` : `-₹${Math.abs(delta)}`}
                </button>
              ))}
            </div>
          </div>

          {/* Secondary / Half Portion Price (Optional) */}
          <div className="space-y-2 pt-1 border-t border-stone-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Half / Secondary Portion Price (₹)
              </label>
              <button
                type="button"
                onClick={() => {
                  setHasSecondary(!hasSecondary);
                  if (hasSecondary) setSecondaryPrice('');
                }}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                {hasSecondary ? 'Remove Secondary Price' : '+ Add Half / Small Portion'}
              </button>
            </div>

            {hasSecondary && (
              <div className="relative animate-in fade-in duration-150">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <span className="font-bold text-sm text-stone-400">₹</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={secondaryPrice}
                  onChange={(e) => setSecondaryPrice(e.target.value)}
                  placeholder="e.g. 110 (optional)"
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Firestore Target Meta Info */}
          <div className="p-3 bg-stone-950/70 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Target: <code className="text-stone-300 font-mono">menuItems/{item.id}</code></span>
            </div>
            <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
              Live Cloud Update
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 text-sm font-bold shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Firestore...</span>
                </>
              ) : (
                <>
                  <IndianRupee className="w-4 h-4" />
                  <span>Update Price in Firestore</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
