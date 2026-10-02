import { UtensilsCrossed, Gift, Star, User } from 'lucide-react';
import { BottomNavTab } from '../types';

interface BottomNavigationProps {
  activeTab: BottomNavTab;
  onTabSelect: (tab: BottomNavTab) => void;
}

export function BottomNavigation({
  activeTab,
  onTabSelect,
}: BottomNavigationProps) {
  const tabs = [
    { id: 'menu' as const, label: 'Menu', icon: UtensilsCrossed },
    { id: 'rewards' as const, label: 'Rewards', icon: Gift },
    { id: 'review' as const, label: 'Review', icon: Star },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 flex justify-center pointer-events-none">
      <nav
        className="w-full max-w-[340px] bg-white/90 backdrop-blur-xl border border-white/60 rounded-full shadow-frosted-float h-16 flex items-center justify-around px-3 pointer-events-auto ring-1 ring-slate-900/5"
        aria-label="Main navigation"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabSelect(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all duration-150 relative min-h-[44px] min-w-[56px] focus:outline-hidden ${
                isActive
                  ? 'text-emerald-700'
                  : 'text-slate-800 opacity-40 hover:opacity-75'
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.5px] text-emerald-700' : 'stroke-[2px]'
                }`}
              />

              <span
                className={`text-[10px] tracking-tight ${
                  isActive ? 'font-black text-emerald-700' : 'font-semibold text-slate-700'
                }`}
              >
                {tab.label}
              </span>

              {isActive ? (
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-0.5" />
              ) : (
                <div className="w-1.5 h-1.5 mt-0.5 opacity-0" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

