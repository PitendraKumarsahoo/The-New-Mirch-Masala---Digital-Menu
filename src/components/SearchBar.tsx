import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount?: number;
  isFiltering?: boolean;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  resultCount,
  isFiltering,
}: SearchBarProps) {
  return (
    <div className="px-5 py-3 bg-white/90 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-100 shadow-2xs">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          id="menu-search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search dishes..."
          className="w-full h-11 pl-10 pr-10 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-sm placeholder:text-slate-400 rounded-2xl border border-slate-200/60 focus:border-orange-500/80 focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            id="clear-search-btn"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 active:scale-95 transition-all"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dynamic search hint / match counter */}
      {isFiltering && (
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>
            Searching for <span className="font-bold text-slate-800">"{searchQuery}"</span>
          </span>
          <span className="font-bold text-orange-600">
            {resultCount} {resultCount === 1 ? 'dish' : 'dishes'} found
          </span>
        </div>
      )}
    </div>
  );
}
