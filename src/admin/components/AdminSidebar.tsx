import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  CalendarCheck,
  Award,
  Star,
  Settings,
  ExternalLink,
  LogOut,
  ChevronRight,
  Sparkles,
  UserCheck,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export type AdminTab =
  | 'dashboard'
  | 'menu'
  | 'customers'
  | 'visits'
  | 'rewards'
  | 'reviews'
  | 'settings'
  | 'staff'
  | 'audit';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout, canAccessTab } = useAdminAuth();

  const allNavItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'visits', label: 'Visits', icon: CalendarCheck },
    { id: 'rewards', label: 'Rewards', icon: Award },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'staff', label: 'Staff & Access', icon: UserCheck, badge: 'Owner' },
    { id: 'audit', label: 'Security Audit', icon: Activity, badge: 'Owner' },
    { id: 'settings', label: 'Restaurant Settings', icon: Settings },
  ];

  // Filter items according to the authenticated user's permissions
  const visibleNavItems = allNavItems.filter((item) => canAccessTab(item.id));

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-stone-900 border-r border-stone-800 text-stone-200 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-stone-100 text-sm truncate">The New Mirch Masala</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-amber-400 font-medium">Portal</span>
              <span className="text-[10px] text-stone-500">•</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-800 text-stone-400 rounded">
                {user?.role || 'STAFF'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`admin-nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10 font-semibold'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge && !isActive && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stone-800 text-stone-400">
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-stone-950 opacity-75" />}
            </button>
          );
        })}
      </nav>

      {/* Quick Access to Customer Menu & Staff Terminal */}
      <div className="p-3 mx-3 mb-3 bg-stone-950/60 border border-stone-800/80 rounded-xl space-y-2">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-1">
          Quick Links
        </p>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:text-amber-400 hover:bg-stone-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            Live Customer Menu
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-stone-800 rounded text-stone-400">/</span>
        </a>
        <a
          href="/staff"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/staff');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-stone-300 hover:text-amber-400 hover:bg-stone-900 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Staff Terminal
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-stone-800 rounded text-stone-400">/staff</span>
        </a>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-stone-800 flex items-center justify-between bg-stone-950/40">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-stone-200 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-stone-500 truncate">{user?.role || 'STAFF'}</p>
          </div>
        </div>

        <button
          id="admin-logout-btn"
          onClick={logout}
          title="Sign Out"
          className="p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
