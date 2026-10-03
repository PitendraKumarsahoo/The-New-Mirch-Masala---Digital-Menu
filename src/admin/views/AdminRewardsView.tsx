import React, { useState } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Gift,
  Sparkles,
  Lock,
  CupSoda,
  Percent,
  IndianRupee,
  Utensils,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { AdminRewardItem } from '../../types/admin';
import { RewardEditorModal } from '../components/RewardEditorModal';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminRewardsViewProps {
  rewards: AdminRewardItem[];
  onSaveReward: (reward: Omit<AdminRewardItem, 'rewardId' | 'restaurantId'> & { rewardId?: string }) => Promise<void>;
  onToggleActive: (rewardId: string, isActive: boolean) => Promise<void>;
  onDeleteReward?: (rewardId: string) => Promise<void>;
}

export const AdminRewardsView: React.FC<AdminRewardsViewProps> = ({
  rewards,
  onSaveReward,
  onToggleActive,
  onDeleteReward,
}) => {
  const { isOwner, hasPermission } = useAdminAuth();
  const canManageRewards = isOwner || hasPermission('rewards.create') || hasPermission('rewards.update');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<AdminRewardItem | null>(null);

  // Deactivate confirmation modal
  const [deactivatingReward, setDeactivatingReward] = useState<AdminRewardItem | null>(null);
  const [isConfirmingToggle, setIsConfirmingToggle] = useState(false);

  // Delete confirmation modal
  const [deletingReward, setDeletingReward] = useState<AdminRewardItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick preset applying
  const [isApplyingPreset, setIsApplyingPreset] = useState(false);

  const handleOpenAdd = () => {
    setEditingReward(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (reward: AdminRewardItem) => {
    setEditingReward(reward);
    setIsEditorOpen(true);
  };

  const handleTriggerToggle = (reward: AdminRewardItem) => {
    if (reward.isActive) {
      setDeactivatingReward(reward);
    } else {
      onToggleActive(reward.rewardId, true);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingReward) return;
    setIsConfirmingToggle(true);
    try {
      await onToggleActive(deactivatingReward.rewardId, false);
      setDeactivatingReward(null);
    } finally {
      setIsConfirmingToggle(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingReward || !onDeleteReward) return;
    setIsDeleting(true);
    try {
      await onDeleteReward(deletingReward.rewardId);
      setDeletingReward(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // 1-Click apply standard 10-20-30 strikes ladder
  const handleApply102030Ladder = async () => {
    if (!canManageRewards) return;
    setIsApplyingPreset(true);
    try {
      const presets: Array<Omit<AdminRewardItem, 'rewardId' | 'restaurantId'>> = [
        {
          rewardName: 'Free Chilled Cold Drink',
          rewardDescription: '1 complimentary chilled cold drink of your choice with your meal.',
          requiredVisits: 10,
          discountType: 'free_item',
          freeItemName: 'Cold Drink',
          shortBadge: 'Free Cold Drink',
          isActive: true,
        },
        {
          rewardName: '20% Bill Discount',
          rewardDescription: '20% discount on your entire dining bill at billing.',
          requiredVisits: 20,
          discountType: 'percentage',
          discountAmount: 20,
          shortBadge: '20% OFF',
          isActive: true,
        },
        {
          rewardName: 'Special: 40% OFF or Free Dish',
          rewardDescription: '40% discount or 1 special dish free of choice.',
          requiredVisits: 30,
          discountType: 'special',
          discountAmount: 40,
          shortBadge: '40% OFF / Free Dish',
          isActive: true,
        },
      ];

      for (const p of presets) {
        await onSaveReward(p);
      }
    } finally {
      setIsApplyingPreset(false);
    }
  };

  const renderRewardIcon = (reward: AdminRewardItem) => {
    if (reward.discountType === 'free_item') {
      return <CupSoda className="w-5 h-5 text-amber-400" />;
    }
    if (reward.discountType === 'percentage') {
      return <Percent className="w-5 h-5 text-amber-400" />;
    }
    if (reward.discountType === 'flat') {
      return <IndianRupee className="w-5 h-5 text-amber-400" />;
    }
    return <Utensils className="w-5 h-5 text-amber-400" />;
  };

  // Sort rewards ascending by strike count
  const sortedRewards = [...rewards].sort((a, b) => a.requiredVisits - b.requiredVisits);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Loyalty Strikes & Milestone Rewards</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Admin/Owner full customization: Add 10, 20, 30 strikes, customize discounts (% or ₹ off), or free cold drinks/dishes. Persists directly to Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManageRewards && (
            <button
              onClick={handleApply102030Ladder}
              disabled={isApplyingPreset}
              title="Apply 10 Strikes (Free Cold Drink), 20 Strikes (20% OFF), 30 Strikes (40% OFF)"
              className="px-3.5 py-2.5 bg-stone-850 hover:bg-stone-800 border border-stone-700 text-amber-400 hover:text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isApplyingPreset ? 'Setting...' : '10-20-30 Strikes Preset'}</span>
            </button>
          )}

          {canManageRewards ? (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Milestone</span>
            </button>
          ) : (
            <div className="px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-400 flex items-center gap-2 shrink-0">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Editing rewards requires Manager/Owner role</span>
            </div>
          )}
        </div>
      </div>

      {/* Overview Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-stone-900 to-stone-900 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Customer Strikes Journey: {sortedRewards.map(r => `${r.requiredVisits} Strikes (${r.shortBadge || r.rewardName})`).join(' → ') || 'No rewards configured'}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Customers earn 1 strike per verified dine-in visit. When they reach these milestones, vouchers unlock on their phone.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-300 font-mono">
          Cloud Firestore: <span className="text-emerald-400 font-bold">LIVE SYNCED</span>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedRewards.map((reward) => {
          const isActive = reward.isActive !== false;
          return (
            <div
              key={reward.rewardId}
              className={`p-5 rounded-2xl bg-stone-900 border transition-all flex flex-col justify-between ${
                isActive ? 'border-stone-800 hover:border-stone-700' : 'border-stone-850 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                    {renderRewardIcon(reward)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                          : 'bg-stone-800 border-stone-700 text-stone-400'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    {canManageRewards ? (
                      <>
                        <button
                          onClick={() => handleOpenEdit(reward)}
                          title="Edit Reward Tier"
                          className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {onDeleteReward && (
                          <button
                            onClick={() => setDeletingReward(reward)}
                            title="Delete Milestone"
                            className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="p-1.5 text-stone-600" title="Read-only access">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{reward.requiredVisits} Strikes Milestone</span>
                  </div>

                  {reward.shortBadge && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-stone-800 text-amber-200 border border-stone-700">
                      {reward.shortBadge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-tight mt-1">{reward.rewardName}</h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  {reward.rewardDescription || 'Milestone perk for loyal diners.'}
                </p>

                {reward.discountType === 'free_item' && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <CupSoda className="w-3.5 h-3.5" />
                    <span>Free Item: {reward.freeItemName || 'Cold Drink'}</span>
                  </div>
                )}

                {reward.discountType === 'percentage' && reward.discountAmount && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Discount: {reward.discountAmount}% OFF entire bill</span>
                  </div>
                )}

                {reward.discountType === 'flat' && reward.discountAmount && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-cyan-300 font-semibold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Cash Off: ₹{reward.discountAmount} flat bill discount</span>
                  </div>
                )}
              </div>

              {/* Toggle active / inactive footer */}
              <div className="mt-5 pt-3.5 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  {isActive ? 'Status: Unlocked for Diners' : 'Status: Hidden from Diners'}
                </span>

                <button
                  type="button"
                  disabled={!canManageRewards}
                  onClick={() => canManageRewards && handleTriggerToggle(reward)}
                  title={!canManageRewards ? 'Permission required to toggle reward status' : isActive ? 'Click to deactivate' : 'Click to activate'}
                  className={`relative inline-flex h-5 w-10 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    !canManageRewards ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    isActive ? 'bg-emerald-500' : 'bg-stone-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reward Editor Modal */}
      <RewardEditorModal
        isOpen={isEditorOpen}
        reward={editingReward}
        onClose={() => setIsEditorOpen(false)}
        onSave={onSaveReward}
      />

      {/* Confirmation Modal Before Deactivating */}
      <ConfirmationModal
        isOpen={!!deactivatingReward}
        title="Deactivate Reward Tier"
        message={`Are you sure you want to deactivate "${deactivatingReward?.rewardName}"? Diners will no longer see this reward option on their loyalty reward screen.`}
        confirmText="Deactivate"
        confirmVariant="warning"
        isConfirming={isConfirmingToggle}
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivatingReward(null)}
      />

      {/* Confirmation Modal Before Deleting */}
      <ConfirmationModal
        isOpen={!!deletingReward}
        title="Delete Milestone Reward"
        message={`Are you sure you want to permanently delete "${deletingReward?.rewardName}" (${deletingReward?.requiredVisits} strikes)? This will remove it from the customer loyalty ladder and Firestore.`}
        confirmText="Delete Milestone"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingReward(null)}
      />
    </div>
  );
};
