import React, { useState, useEffect } from 'react';
import { X, Award, Check } from 'lucide-react';
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
  const [requiredVisits, setRequiredVisits] = useState<string>('5');
  const [rewardDescription, setRewardDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reward) {
      setRewardName(reward.rewardName || '');
      setRequiredVisits(reward.requiredVisits ? String(reward.requiredVisits) : '5');
      setRewardDescription(reward.rewardDescription || '');
      setIsActive(reward.isActive !== false);
    } else {
      setRewardName('');
      setRequiredVisits('5');
      setRewardDescription('');
      setIsActive(true);
    }
    setErrors({});
  }, [reward, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!rewardName.trim()) errs.rewardName = 'Reward name is required.';

    const visits = parseInt(requiredVisits, 10);
    if (!requiredVisits || isNaN(visits) || visits <= 0) {
      errs.requiredVisits = 'Required visits must be a positive number (e.g. 5, 7, 10).';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        rewardId: reward ? reward.rewardId : undefined,
        rewardName: rewardName.trim(),
        rewardDescription: rewardDescription.trim(),
        requiredVisits: parseInt(requiredVisits, 10),
        isActive,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {reward ? 'Edit Reward Tier' : 'Create New Reward Tier'}
              </h2>
              <p className="text-xs text-stone-400">
                {reward ? `ID: ${reward.rewardId}` : 'Customer milestone loyalty incentive'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Reward Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={rewardName}
              onChange={(e) => setRewardName(e.target.value)}
              placeholder="e.g. Free Starter or Mocktail"
              required
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            {errors.rewardName && <p className="text-red-400 text-xs mt-1">{errors.rewardName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Required Visits Milestone <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={requiredVisits}
              onChange={(e) => setRequiredVisits(e.target.value)}
              placeholder="5"
              required
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
            {errors.requiredVisits && <p className="text-red-400 text-xs mt-1">{errors.requiredVisits}</p>}
            <p className="text-[11px] text-stone-500 mt-1">
              Number of verified visits required by diner to unlock this milestone perk.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5">
              Description & Terms (Optional)
            </label>
            <textarea
              rows={3}
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              placeholder="Valid for dine-in. Choice of any soup, crispy starter, or fresh beverage."
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-stone-950 border border-stone-800">
            <div>
              <p className="text-xs font-semibold text-stone-200">
                {isActive ? 'Reward Status: Active' : 'Reward Status: Inactive'}
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-semibold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{reward ? 'Update Reward' : 'Save Reward'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
