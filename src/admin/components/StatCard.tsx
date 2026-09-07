import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'amber' | 'emerald' | 'blue' | 'purple' | 'orange' | 'rose';
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  accentColor = 'amber',
  trend,
  onClick,
}) => {
  const colorStyles = {
    amber: {
      iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    blue: {
      iconBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    purple: {
      iconBg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
      badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    orange: {
      iconBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
      badge: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    rose: {
      iconBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
  }[accentColor];

  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl bg-stone-900 border border-stone-800 transition-all ${
        onClick ? 'hover:border-stone-700 hover:bg-stone-850 cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${colorStyles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`px-1.5 py-0.5 rounded-md font-semibold border ${colorStyles.badge}`}>
              {trend}
            </span>
          )}
          {subtext && <span className="text-stone-400 truncate">{subtext}</span>}
        </div>
      )}
    </div>
  );
};
