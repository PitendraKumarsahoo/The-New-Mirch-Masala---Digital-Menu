import { DietaryFilter } from '../types';
import { LayoutGrid, Rows3, SlidersHorizontal } from 'lucide-react';

interface VegNonVegFilterProps {
  activeFilter: DietaryFilter;
  onChange: (filter: DietaryFilter) => void;
  vegCount?: number;
  nonVegCount?: number;
  totalCount?: number;
  layoutMode?: 'grid' | 'list';
  onToggleLayout?: () => void;
}

export function VegNonVegFilter({
  activeFilter,
  onChange,
  layoutMode = 'grid',
  onToggleLayout,
}: VegNonVegFilterProps) {
  const handleVegClick = () => {
    onChange(activeFilter === 'veg' ? 'all' : 'veg');
  };

  const handleNonVegClick = () => {
    onChange(activeFilter === 'non-veg' ? 'all' : 'non-veg');
  };

  return (
    <div className="flex items-center justify-between px-5 py-2.5 bg-white border-b border-slate-100">
      {/* Left: Veg / Non-Veg Filters */}
      <div className="flex items-center gap-2">
        {/* Veg Only Button */}
        <button
          type="button"
          id="filter-veg-only-btn"
          onClick={handleVegClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            activeFilter === 'veg'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-500 shadow-2xs ring-1 ring-emerald-500/20'
              : 'bg-white text-emerald-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Veg Only</span>
        </button>

        {/* Non-Veg Button */}
        <button
          type="button"
          id="filter-non-veg-btn"
          onClick={handleNonVegClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            activeFilter === 'non-veg'
              ? 'bg-red-50 text-red-800 border-red-500 shadow-2xs ring-1 ring-red-500/20'
              : 'bg-white text-red-700 border-slate-200 hover:border-red-300 hover:bg-red-50/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span>Non-Veg</span>
        </button>
      </div>

      {/* Right: Layout Toggle (Double Photo Grid / List) & Filter Action */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          id="layout-toggle-btn"
          onClick={onToggleLayout}
          title={layoutMode === 'grid' ? 'Switch to single column list' : 'Switch to double photo grid'}
          aria-label={layoutMode === 'grid' ? 'Switch to single column list' : 'Switch to double photo grid'}
          className={`p-1.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
            layoutMode === 'grid'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {layoutMode === 'grid' ? (
            <LayoutGrid className="w-4 h-4" />
          ) : (
            <Rows3 className="w-4 h-4" />
          )}
        </button>

        <button
          type="button"
          id="filter-options-btn"
          onClick={() => {
            // Cycle through dietary filters
            if (activeFilter === 'all') onChange('veg');
            else if (activeFilter === 'veg') onChange('non-veg');
            else onChange('all');
          }}
          title="Filter options"
          aria-label="Filter options"
          className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
