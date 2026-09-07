import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  ExternalLink,
  LogOut,
  Sparkles,
  RefreshCw,
  Database,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  currentTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onRefresh,
  isRefreshing,
  onOpenMobileMenu,
  isMobileMenuOpen,
  currentTab,
  onNavigate,
}) => {
  const { user, logout } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 py-3.5 flex items-center justify-between text-stone-100">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 -ml-1 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-stone-400 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Google Sheets Sync Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <Database className="w-3 h-3" />
          <span>Google Sheets Connected</span>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh Data from Google Sheets"
            className="p-2 text-stone-400 hover:text-amber-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        )}

        {/* Customer Site Preview */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white text-xs font-medium rounded-lg transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Customer Menu</span>
        </a>

        {/* Staff Terminal Link */}
        <a
          href="/staff"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, '', '/staff');
            window.dispatchEvent(new PopStateEvent('popstate'));
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xs:inline">Staff Terminal</span>
          <span className="xs:hidden">Terminal</span>
        </a>

        {/* Mobile Log Out */}
        <button
          onClick={logout}
          title="Sign Out"
          className="lg:hidden p-2 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
