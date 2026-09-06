import { Sparkles, X, Clock } from 'lucide-react';
import { BottomNavTab } from '../types';

interface ComingSoonModalProps {
  tab: BottomNavTab | null;
  onClose: () => void;
}

export function ComingSoonModal({ tab, onClose }: ComingSoonModalProps) {
  if (!tab || tab === 'menu') return null;

  const tabDetails = {
    rewards: {
      title: 'Rewards & Points',
      desc: 'Dine-in loyalty rewards, stamp cards, and member discounts will be unlocked here.',
    },
    review: {
      title: 'Google Reviews',
      desc: 'Leave instant verified reviews and feedback for The New Mirch Masala.',
    },
    profile: {
      title: 'Customer Profile',
      desc: 'Save your favorite dishes, spice preferences, and past dining visits.',
    },
  }[tab];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.16)] border border-slate-100 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold border border-orange-200/60 mb-2 uppercase tracking-wider">
          <Clock className="w-3 h-3 text-orange-500" />
          Phase 2 Feature
        </span>

        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
          {tabDetails.title}
        </h3>

        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
            Coming in the next phase
          </p>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {tabDetails.desc}
          </p>
        </div>

        <button
          type="button"
          id="close-coming-soon-btn"
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
