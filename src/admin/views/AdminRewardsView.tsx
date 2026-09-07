import React, { useState } from 'react';
import {
  Award,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Gift,
  Sparkles,
} from 'lucide-react';
import { AdminRewardItem } from '../../types/admin';
import { RewardEditorModal } from '../components/RewardEditorModal';
import { ConfirmationModal } from '../components/ConfirmationModal';

interface AdminRewardsViewProps {
  rewards: AdminRewardItem[];
  onSaveReward: (reward: Omit<AdminRewardItem, 'rewardId' | 'restaurantId'> & { rewardId?: string }) => Promise<void>;
  onToggleActive: (rewardId: string, isActive: boolean) => Promise<void>;
}

export const AdminRewardsView: React.FC<AdminRewardsViewProps> = ({
  rewards,
  onSaveReward,
  onToggleActive,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<AdminRewardItem | null>(null);

  // Deactivate confirmation modal
  const [deactivatingReward, setDeactivatingReward] = useState<AdminRewardItem | null>(null);
  const [isConfirmingToggle, setIsConfirmingToggle] = useState(false);

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
      // Prompt confirmation before deactivating
      setDeactivatingReward(reward);
    } else {
      // Activating can proceed immediately
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Loyalty Rewards & Milestones</span>
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Configure dining rewards unlocked by repeat visits (5th, 7th, 10th visit milestones).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reward</span>
        </button>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rewards.map((reward) => {
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
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                          : 'bg-stone-800 border-stone-700 text-stone-400'
                      }`}
                    >
                      {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(reward)}
                      title="Edit Reward Tier"
                      className="p-1.5 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold text-xs mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{reward.requiredVisits} Verified Visits Required</span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight mt-1">{reward.rewardName}</h3>
                <p className="text-xs text-stone-400 mt-2 leading-relaxed">
                  {reward.rewardDescription || 'Milestone perk for loyal diners.'}
                </p>
              </div>

              {/* Toggle active / inactive footer */}
              <div className="mt-5 pt-3.5 border-t border-stone-800/80 flex items-center justify-between">
                <span className="text-xs text-stone-400">
                  {isActive ? 'Status: Active for Diners' : 'Status: Hidden'}
                </span>

                <button
                  type="button"
                  onClick={() => handleTriggerToggle(reward)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
    </div>
  );
};
