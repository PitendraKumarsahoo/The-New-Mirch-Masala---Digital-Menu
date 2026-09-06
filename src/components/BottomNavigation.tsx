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
    { id: 'menu' as const, label: 'MENU', icon: UtensilsCrossed },
    { id: 'rewards' as const, label: 'REWARDS', icon: Gift },
    { id: 'review' as const, label: 'REVIEW', icon: Star },
    { id: 'profile' as const, label: 'PROFILE', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 flex justify-center pointer-events-none">
      <nav
        className="w-full max-w-[340px] bg-white/85 backdrop-blur-xl border border-white/60 rounded-full shadow-frosted-float h-16 flex items-center justify-around px-3 pointer-events-auto ring-1 ring-slate-900/5"
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
                  ? 'text-orange-600'
                  : 'text-slate-800 opacity-40 hover:opacity-75'
              }`}
            >
              {isActive ? (
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mb-0.5" />
              ) : (
                <div className="w-1.5 h-1.5 mb-0.5 opacity-0" />
              )}
              
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'stroke-[2.5px] text-orange-600' : 'stroke-[2px]'
                }`}
              />
              
              <span
                className={`text-[9px] tracking-tighter ${
                  isActive ? 'font-black text-orange-600' : 'font-bold text-slate-800'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

