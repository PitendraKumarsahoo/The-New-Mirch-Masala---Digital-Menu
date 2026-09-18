import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  CalendarCheck,
  Award,
  MoreHorizontal,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminBottomNavProps {
  currentTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  onOpenMoreMenu: () => void;
}

export const AdminBottomNav: React.FC<AdminBottomNavProps> = ({
  currentTab,
  onNavigate,
  onOpenMoreMenu,
}) => {
  const items: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'visits', label: 'Visits', icon: CalendarCheck },
    { id: 'rewards', label: 'Rewards', icon: Award },
  ];

  const isMoreActive =
    currentTab === 'reviews' ||
    currentTab === 'settings' ||
    currentTab === 'staff' ||
    currentTab === 'audit';

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/98 backdrop-blur-md border-t border-stone-800 px-2 py-1.5 flex items-center justify-around text-stone-300">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
              isActive ? 'text-amber-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* More Button */}
      <button
        onClick={onOpenMoreMenu}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
          isMoreActive ? 'text-amber-400 font-semibold' : 'text-stone-400 hover:text-stone-200'
        }`}
      >
        <MoreHorizontal className={`w-5 h-5 mb-0.5 ${isMoreActive ? 'text-amber-400' : 'text-stone-400'}`} />
        <span>More</span>
      </button>
    </nav>
  );
};
