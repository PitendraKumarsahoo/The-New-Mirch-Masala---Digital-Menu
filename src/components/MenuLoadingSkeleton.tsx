export function MenuLoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-4 animate-pulse">
      {/* Skeleton Header Area */}
      <div className="flex items-center justify-between pt-2 pb-1">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-200/80" />
          <div className="space-y-1.5">
            <div className="w-36 h-5 rounded-md bg-slate-200/90" />
            <div className="w-24 h-3 rounded-md bg-slate-200/60" />
          </div>
        </div>
        <div className="w-18 h-6 rounded-full bg-slate-200/70" />
      </div>

      {/* Skeleton Search Bar */}
      <div className="w-full h-11 rounded-2xl bg-slate-200/80 shadow-2xs" />

      {/* Skeleton Category Pills */}
      <div className="flex gap-2 overflow-x-hidden pt-1">
        <div className="w-16 h-8 rounded-full bg-orange-200/60 shrink-0" />
        <div className="w-20 h-8 rounded-full bg-slate-200/80 shrink-0" />
        <div className="w-18 h-8 rounded-full bg-slate-200/80 shrink-0" />
        <div className="w-22 h-8 rounded-full bg-slate-200/80 shrink-0" />
      </div>

      {/* Skeleton Veg Filter */}
      <div className="w-full h-9 rounded-xl bg-slate-200/60" />

      {/* Skeleton Dish Cards List */}
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4, 5].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-3 border border-slate-100 flex items-center gap-3 shadow-2xs"
          >
            {/* Thumbnail Placeholder */}
            <div className="w-18 h-18 rounded-xl bg-slate-200/80 shrink-0" />
            {/* Text lines */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-28 h-4 rounded-md bg-slate-200/90" />
                <div className="w-14 h-4 rounded-md bg-slate-200/70" />
              </div>
              <div className="w-44 h-3 rounded-md bg-slate-200/60" />
              <div className="flex items-center justify-between pt-1">
                <div className="w-16 h-4 rounded-md bg-orange-200/70" />
                <div className="w-16 h-4 rounded-md bg-slate-200/60" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
