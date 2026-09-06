import { RefreshCw, UtensilsCrossed } from 'lucide-react';

interface MenuErrorStateProps {
  onRetry: () => void;
  isRetrying?: boolean;
}

export function MenuErrorState({ onRetry, isRetrying = false }: MenuErrorStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 min-h-[420px]">
      {/* Icon Emblem */}
      <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 mb-4 shadow-sm">
        <UtensilsCrossed className="w-7 h-7" />
      </div>

      {/* Clean customer-friendly messaging */}
      <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight uppercase mb-1">
        Unable to load the menu.
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-xs mb-6 leading-relaxed">
        Please try again.
      </p>

      {/* Action Button */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          id="retry-menu-fetch-btn"
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full py-3 px-5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Loading menu...' : 'Retry'}</span>
        </button>
      </div>
    </div>
  );
}
