import React, { useState } from 'react';
import { Star, TrendingUp, Award, Calendar, Users } from 'lucide-react';
import { AdminDashboardStats } from '../../types/admin';

interface DashboardChartsProps {
  stats: AdminDashboardStats;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Visits Last 7 Days (Bar Chart)
  const visitsData = stats.visitsLast7Days || [];
  const maxVisitCount = Math.max(1, ...visitsData.map((d) => d.count));

  // 2. Rating Distribution (5 to 1)
  const dist = stats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const totalReviews = stats.totalReviews || 1;

  // Format short day (e.g. Mon, Tue)
  const formatDayName = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return dateStr.slice(-2);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart 1: Visits - Last 7 Days */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Visits — Last 7 Days</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Verified customer dining & takeout check-ins</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            {stats.weeklyVisits || visitsData.reduce((a, b) => a + b.count, 0)} visits this week
          </span>
        </div>

        {/* SVG Bar Chart */}
        <div className="relative pt-6 pb-2">
          {visitsData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-stone-500 text-xs">
              No recent visit records found
            </div>
          ) : (
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-1">
              {visitsData.map((item, idx) => {
                const heightPercent = Math.max(8, (item.count / maxVisitCount) * 100);
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center group relative h-full justify-end"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-7 px-2 py-1 bg-stone-950 border border-stone-700 text-amber-300 text-[11px] font-bold rounded shadow-lg pointer-events-none z-10 whitespace-nowrap">
                        {item.count} visits ({item.date})
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 cursor-pointer ${
                        isHovered
                          ? 'bg-amber-400 shadow-md shadow-amber-400/20'
                          : 'bg-amber-500/75 hover:bg-amber-500'
                      }`}
                    />

                    {/* Day label */}
                    <span className="text-[11px] text-stone-400 font-medium mt-2">
                      {formatDayName(item.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
          <span>Today: {stats.todayVisits} verified visits</span>
          <span>Target: 40+ visits/day</span>
        </div>
      </div>

      {/* Chart 2: Review Rating Distribution */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Review Rating Distribution</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">Based on real diner reviews from Google Sheets</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-amber-400">{stats.averageRating} ★</span>
            <span className="text-xs text-stone-400 block">{stats.totalReviews} total</span>
          </div>
        </div>

        {/* Rating Breakdown Bars */}
        <div className="space-y-2.5 py-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = (dist as Record<number, number>)[star] || 0;
            const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;

            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-stone-300 font-medium flex items-center gap-1 shrink-0">
                  {star} <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </span>

                <div className="flex-1 h-3 bg-stone-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      star >= 4 ? 'bg-amber-500' : star === 3 ? 'bg-yellow-600' : 'bg-orange-600'
                    }`}
                  />
                </div>

                <span className="w-8 text-right text-stone-400 font-mono text-[11px]">
                  {count}
                </span>
                <span className="w-10 text-right text-stone-400 font-mono text-[11px]">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Monthly Summary Footer */}
        <div className="mt-4 pt-3 border-t border-stone-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Diners: <strong className="text-stone-200">+{stats.newCustomersThisMonth}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Redeemed: <strong className="text-stone-200">{stats.rewardsRedeemed} perks</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
