import { DietaryFilter } from '../types';
import { VegBadge } from './VegBadge';

interface VegNonVegFilterProps {
  activeFilter: DietaryFilter;
  onChange: (filter: DietaryFilter) => void;
  vegCount: number;
  nonVegCount: number;
  totalCount: number;
}

export function VegNonVegFilter({
  activeFilter,
  onChange,
  vegCount,
  nonVegCount,
  totalCount,
}: VegNonVegFilterProps) {
  return (
    <div className="flex items-center justify-between px-5 py-2 bg-slate-50/70 border-b border-slate-100 text-xs text-slate-500">
      <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
        Filter:
      </span>
      <div className="flex items-center gap-1 bg-slate-200/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => onChange('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-white text-slate-800 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => onChange('veg')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            activeFilter === 'veg'
              ? 'bg-white text-green-700 shadow-2xs ring-1 ring-green-500/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <VegBadge isVeg={true} size="sm" />
          <span>Veg ({vegCount})</span>
        </button>
        <button
          type="button"
          onClick={() => onChange('non-veg')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            activeFilter === 'non-veg'
              ? 'bg-white text-red-700 shadow-2xs ring-1 ring-red-500/20'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <VegBadge isVeg={false} size="sm" />
          <span>Non-Veg ({nonVegCount})</span>
        </button>
      </div>
    </div>
  );
}
