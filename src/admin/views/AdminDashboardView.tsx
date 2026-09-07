import React from 'react';
import {
  Users,
  CalendarCheck,
  Award,
  Star,
  UtensilsCrossed,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AdminDashboardStats, AdminVisitRecord } from '../../types/admin';
import { StatCard } from '../components/StatCard';
import { DashboardCharts } from '../components/DashboardCharts';
import { AdminTab } from '../components/AdminSidebar';

interface AdminDashboardViewProps {
  stats: AdminDashboardStats;
  recentVisits: AdminVisitRecord[];
  onNavigate: (tab: AdminTab) => void;
  onOpenAddDish: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  stats,
  recentVisits,
  onNavigate,
  onOpenAddDish,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner / Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-stone-900 to-stone-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Restaurant Operations
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
            Welcome back, Rajesh!
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 max-w-xl">
            Live overview of The New Mirch Masala. Real-time updates synced with Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAddDish}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>

          <button
            onClick={() => onNavigate('visits')}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4 text-amber-400" />
            <span>View Today's Visits</span>
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards from Section 3 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          subtext="Registered Diners"
          trend="+12% mo"
          icon={Users}
          accentColor="amber"
          onClick={() => onNavigate('customers')}
        />
        <StatCard
          title="Today's Visits"
          value={stats.todayVisits}
          subtext="Verified Today"
          icon={CalendarCheck}
          accentColor="emerald"
          onClick={() => onNavigate('visits')}
        />
        <StatCard
          title="Total Visits"
          value={stats.totalVisits.toLocaleString()}
          subtext="All Time"
          icon={TrendingUp}
          accentColor="blue"
          onClick={() => onNavigate('visits')}
        />
        <StatCard
          title="Active Rewards"
          value={stats.activeRewards}
          subtext="Milestone Tiers"
          icon={Award}
          accentColor="purple"
          onClick={() => onNavigate('rewards')}
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          subtext="Diner Feedback"
          icon={Star}
          accentColor="orange"
          onClick={() => onNavigate('reviews')}
        />
        <StatCard
          title="Avg Rating"
          value={`${stats.averageRating} ★`}
          subtext="Customer Trust"
          icon={Star}
          accentColor="rose"
          onClick={() => onNavigate('reviews')}
        />
      </div>

      {/* Charts Section */}
      <DashboardCharts stats={stats} />

      {/* Two Column Section: Recent Visits & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Visits (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Recent Customer Visits</span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">Latest dine-in & takeout check-ins</p>
            </div>
            <button
              onClick={() => onNavigate('visits')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5 font-semibold">Customer</th>
                  <th className="pb-2.5 font-semibold">Mobile</th>
                  <th className="pb-2.5 font-semibold">Date & Time</th>
                  <th className="pb-2.5 font-semibold">Staff Verified</th>
                  <th className="pb-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {recentVisits.slice(0, 5).map((v) => (
                  <tr key={v.visitId} className="hover:bg-stone-800/40 transition-colors">
                    <td className="py-2.5 font-medium text-stone-200">
                      {v.customerName || v.customerId}
                    </td>
                    <td className="py-2.5 font-mono text-stone-400">{v.mobile || '—'}</td>
                    <td className="py-2.5 text-stone-400">
                      {v.visitDate} <span className="text-stone-500">• {v.visitTime}</span>
                    </td>
                    <td className="py-2.5 text-stone-300">{v.verifiedBy}</td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                        {v.status || 'VERIFIED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Management Shortcuts (1 col) */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2 mb-3">
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              <span>Quick Owner Actions</span>
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigate('menu')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-stone-200">Manage Menu & Stock</p>
                  <p className="text-[11px] text-stone-500">Update prices, dishes, or out-of-stock items</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => onNavigate('rewards')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-stone-200">Adjust Loyalty Rewards</p>
                  <p className="text-[11px] text-stone-500">Edit required visits or promotional tiers</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-stone-950 hover:bg-stone-800 border border-stone-800 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-stone-200">Store Hours & Details</p>
                  <p className="text-[11px] text-stone-500">Opening hours, phone number, Google Maps link</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-800">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-stone-300 flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-400">Need staff assistance?</p>
                <p className="text-[11px] text-stone-400">Staff verify visits via Staff Terminal</p>
              </div>
              <a
                href="/staff"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', '/staff');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="px-2.5 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg text-[11px] transition-transform hover:scale-105"
              >
                Terminal
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
