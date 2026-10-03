import React, { useState, useEffect } from 'react';
import { X, Award, Check, CupSoda, Percent, IndianRupee, Utensils, Sparkles } from 'lucide-react';
import { AdminRewardItem } from '../../types/admin';

interface RewardEditorModalProps {
  isOpen: boolean;
  reward: AdminRewardItem | null; // null = creating new reward
  onClose: () => void;
  onSave: (rewardData: Omit<AdminRewardItem, 'rewardId' | 'restaurantId'> & { rewardId?: string }) => Promise<void>;
}

export const RewardEditorModal: React.FC<RewardEditorModalProps> = ({
  isOpen,
  reward,
  onClose,
  onSave,
}) => {
  const [rewardName, setRewardName] = useState('');
  const [requiredVisits, setRequiredVisits] = useState<string>('10');
  const [rewardDescription, setRewardDescription] = useState('');
  const [rewardType, setRewardType] = useState<'free_item' | 'percentage' | 'flat' | 'special'>('free_item');
  const [discountAmount, setDiscountAmount] = useState<string>('20');
  const [freeItemName, setFreeItemName] = useState<string>('Cold Drink');
  const [shortBadge, setShortBadge] = useState<string>('Free Cold Drink');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reward) {
      setRewardName(reward.rewardName || '');
      setRequiredVisits(reward.requiredVisits ? String(reward.requiredVisits) : '10');
      setRewardDescription(reward.rewardDescription || '');
      setRewardType(reward.discountType || 'free_item');
      setDiscountAmount(reward.discountAmount ? String(reward.discountAmount) : '20');
      setFreeItemName(reward.freeItemName || (reward.discountType === 'free_item' ? 'Cold Drink' : ''));
      setShortBadge(reward.shortBadge || (reward.requiredVisits ? `${reward.requiredVisits} Strikes` : 'Special Offer'));
      setIsActive(reward.isActive !== false);
    } else {
      setRewardName('Free Chilled Cold Drink');
      setRequiredVisits('10');
      setRewardDescription('1 complimentary chilled cold drink of your choice with your meal.');
      setRewardType('free_item');
      setDiscountAmount('20');
      setFreeItemName('Cold Drink');
      setShortBadge('Free Cold Drink');
      setIsActive(true);
    }
    setErrors({});
  }, [reward, isOpen]);

  // Auto-update short badge and name suggestions when type changes
  const applyPreset = (preset: {
    strikes: number;
    type: 'free_item' | 'percentage' | 'flat' | 'special';
    name: string;
    badge: string;
    amount?: number;
    item?: string;
    desc: string;
  }) => {
    setRequiredVisits(String(preset.strikes));
    setRewardType(preset.type);
    setRewardName(preset.name);
    setShortBadge(preset.badge);
    if (preset.amount) setDiscountAmount(String(preset.amount));
    if (preset.item) setFreeItemName(preset.item);
    setRewardDescription(preset.desc);
  };

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!rewardName.trim()) errs.rewardName = 'Reward name is required.';

    const visits = parseInt(requiredVisits, 10);
    if (!requiredVisits || isNaN(visits) || visits <= 0) {
      errs.requiredVisits = 'Strikes must be a positive number (e.g. 10, 20, 30).';
    }

    if (rewardType === 'percentage') {
      const pct = parseInt(discountAmount, 10);
      if (isNaN(pct) || pct <= 0 || pct > 100) {
        errs.discountAmount = 'Discount percentage must be between 1% and 100%.';
      }
    } else if (rewardType === 'flat') {
      const flat = parseInt(discountAmount, 10);
      if (isNaN(flat) || flat <= 0) {
        errs.discountAmount = 'Discount amount must be a positive rupee number.';
      }
    } else if (rewardType === 'free_item') {
      if (!freeItemName.trim()) {
        errs.freeItemName = 'Free item name is required (e.g. Cold Drink, Dessert).';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const parsedAmount = (rewardType === 'percentage' || rewardType === 'flat' || rewardType === 'special')
        ? parseInt(discountAmount, 10) || undefined
        : undefined;

      await onSave({
        rewardId: reward ? reward.rewardId : undefined,
        rewardName: rewardName.trim(),
        rewardDescription: rewardDescription.trim(),
        requiredVisits: parseInt(requiredVisits, 10),
        discountType: rewardType,
        discountAmount: parsedAmount,
        freeItemName: rewardType === 'free_item' ? freeItemName.trim() : undefined,
        shortBadge: shortBadge.trim() || `${requiredVisits} Strikes Offer`,
        isActive,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/85 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {reward ? 'Edit Milestone Reward' : 'Create Custom Milestone Reward'}
              </h2>
              <p className="text-xs text-stone-400">
                Configure strikes requirement (10, 20, 30 strikes) and reward offer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets Bar */}
        <div className="px-6 pt-4 pb-2 bg-stone-950/50 border-b border-stone-800/80">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-2">
            ⚡ Quick Strike Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  strikes: 10,
                  type: 'free_item',
                  name: 'Free Chilled Cold Drink',
                  badge: 'Free Cold Drink',
                  item: 'Cold Drink',
                  desc: '1 complimentary chilled cold drink of your choice with your meal.',
                })
              }
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-300 transition-colors cursor-pointer"
            >
              🥤 10 Strikes (Free Cold Drink)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  strikes: 20,
                  type: 'percentage',
                  name: '20% Off Total Bill',
                  badge: '20% OFF',
                  amount: 20,
                  desc: '20% discount on entire dining bill at billing.',
                })
              }
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-300 transition-colors cursor-pointer"
            >
              🏷️ 20 Strikes (20% OFF)
            </button>
            <button
              type="button"
              onClick={() =>
                applyPreset({
                  strikes: 30,
                  type: 'special',
                  name: 'Special: 40% OFF or Free Dish',
                  badge: '40% OFF / Free Dish',
                  amount: 40,
                  desc: '40% discount or 1 special chef biryani/dish free of choice.',
                })
              }
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-300 transition-colors cursor-pointer"
            >
              🎉 30 Strikes (40% OFF / Free Dish)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Strike count milestone */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Required Strikes Milestone <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={requiredVisits}
                onChange={(e) => setRequiredVisits(e.target.value)}
                placeholder="10"
                required
                className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm font-bold focus:outline-none focus:border-amber-500 transition-colors"
              />
              <div className="flex gap-1.5 shrink-0">
                {[10, 20, 30].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRequiredVisits(String(num))}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                      requiredVisits === String(num)
                        ? 'bg-amber-500 text-stone-950 border-amber-400'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
            {errors.requiredVisits && <p className="text-red-400 text-xs mt-1">{errors.requiredVisits}</p>}
            <p className="text-[11px] text-stone-500 mt-1">
              Number of verified visits (strikes) diner must earn to unlock this perk.
            </p>
          </div>

          {/* Reward Offer Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Reward / Offer Type <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setRewardType('free_item');
                  setFreeItemName('Cold Drink');
                  setShortBadge('Free Cold Drink');
                  if (!rewardName || rewardName.includes('Off')) setRewardName('Free Chilled Cold Drink');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  rewardType === 'free_item'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <CupSoda className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] leading-tight">Free Cold Drink / Item</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRewardType('percentage');
                  setDiscountAmount('20');
                  setShortBadge('20% OFF');
                  setRewardName('20% Off Total Bill');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  rewardType === 'percentage'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Percent className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] leading-tight">% Bill Discount</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRewardType('flat');
                  setDiscountAmount('100');
                  setShortBadge('₹100 OFF');
                  setRewardName('₹100 Off Dining Bill');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  rewardType === 'flat'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <IndianRupee className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] leading-tight">Flat ₹ Cash Off</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRewardType('special');
                  setDiscountAmount('40');
                  setShortBadge('40% OFF / Free Dish');
                  setRewardName('Special: 40% OFF or Free Dish');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  rewardType === 'special'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
              >
                <Utensils className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] leading-tight">Special Dish / Offer</span>
              </button>
            </div>
          </div>

          {/* Conditional field based on reward type */}
          {rewardType === 'free_item' ? (
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Free Item / Drink Name <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={freeItemName}
                  onChange={(e) => {
                    setFreeItemName(e.target.value);
                    setShortBadge(`Free ${e.target.value}`);
                  }}
                  placeholder="e.g. Cold Drink, Soft Drink, Ice Cream"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div className="flex gap-2 mt-1.5">
                {['Cold Drink', 'Soft Drink', 'Mocktail', 'Ice Cream', 'Starter'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setFreeItemName(item);
                      setShortBadge(`Free ${item}`);
                      setRewardName(`Free Chilled ${item}`);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] text-stone-300 transition-colors cursor-pointer"
                  >
                    + {item}
                  </button>
                ))}
              </div>
              {errors.freeItemName && <p className="text-red-400 text-xs mt-1">{errors.freeItemName}</p>}
            </div>
          ) : rewardType === 'percentage' ? (
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Discount Percentage (% OFF) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={discountAmount}
                  onChange={(e) => {
                    setDiscountAmount(e.target.value);
                    setShortBadge(`${e.target.value}% OFF`);
                  }}
                  placeholder="20"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <div className="flex gap-1.5 shrink-0">
                  {[10, 15, 20, 25, 30, 40].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setDiscountAmount(String(pct));
                        setShortBadge(`${pct}% OFF`);
                        setRewardName(`${pct}% Off Total Bill`);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 transition-colors cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              {errors.discountAmount && <p className="text-red-400 text-xs mt-1">{errors.discountAmount}</p>}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
                Discount Rupee Amount (₹ OFF) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={discountAmount}
                  onChange={(e) => {
                    setDiscountAmount(e.target.value);
                    setShortBadge(`₹${e.target.value} OFF`);
                  }}
                  placeholder="100"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <div className="flex gap-1.5 shrink-0">
                  {[50, 100, 150, 200, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setDiscountAmount(String(amt));
                        setShortBadge(`₹${amt} OFF`);
                        setRewardName(`₹${amt} Off Dining Bill`);
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 transition-colors cursor-pointer"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>
              {errors.discountAmount && <p className="text-red-400 text-xs mt-1">{errors.discountAmount}</p>}
            </div>
          )}

          {/* Reward Display Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Reward Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder="e.g. Free Chilled Cold Drink"
              required
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            {errors.rewardName && <p className="text-red-400 text-xs mt-1">{errors.rewardName}</p>}
          </div>

          {/* Short Badge */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Voucher / Pill Badge Text
            </label>
            <input
              type="text"
              value={shortBadge}
              onChange={(e) => setShortBadge(e.target.value)}
              placeholder="e.g. Free Cold Drink, 20% OFF, ₹100 OFF"
              className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Description & Terms (Optional)
            </label>
            <textarea
              rows={2}
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              placeholder="Valid for dine-in. Show phone number at billing."
              className="w-full px-3.5 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-950 border border-stone-800">
            <div>
              <p className="text-xs font-semibold text-stone-200">
                {isActive ? 'Reward Status: Active for Diners' : 'Reward Status: Inactive'}
              </p>
              <p className="text-[11px] text-stone-500">
                {isActive ? 'Diners can view and unlock this tier.' : 'Hidden from customer reward page.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? 'bg-amber-500' : 'bg-stone-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Firestore...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{reward ? 'Update Reward' : 'Save Reward to Firestore'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
