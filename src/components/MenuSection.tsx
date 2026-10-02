import { MenuItem, MenuCategory, isMenuItemUnavailable } from '../types';
import { FoodCard } from './FoodCard';
import { FoodGridCard } from './FoodGridCard';
import { SearchX, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence, type Variants } from 'motion/react';

interface MenuSectionProps {
  items: MenuItem[];
  selectedCategory: MenuCategory;
  searchQuery: string;
  onSelectItem: (item: MenuItem) => void;
  onResetSearch: () => void;
  isLoading?: boolean;
  layoutMode?: 'grid' | 'list';
}

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.min(i * 0.03, 0.35),
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

function MenuSkeletonOverlay({ layoutMode = 'grid' }: { layoutMode?: 'grid' | 'list' }) {
  return (
    <motion.div
      key="menu-skeleton-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-30 bg-slate-50/92 backdrop-blur-[2px] px-5 py-4 space-y-3 pointer-events-none"
      aria-label="Loading menu dishes..."
    >
      {/* Category header skeleton */}
      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 pt-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-3.5 bg-orange-300 rounded-full animate-pulse" />
          <div className="h-4 bg-slate-200/90 rounded-md w-28 animate-pulse" />
        </div>
        <div className="h-3 bg-slate-200/70 rounded-md w-12 animate-pulse" />
      </div>

      {/* Dish card skeleton placeholders */}
      {layoutMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white/90 rounded-2xl border border-slate-100/80 shadow-2xs overflow-hidden animate-pulse flex flex-col"
            >
              <div className="aspect-[4/3] w-full bg-slate-200/70" />
              <div className="p-2.5 space-y-2">
                <div className="h-3.5 bg-slate-200/90 rounded-md w-3/4" />
                <div className="h-2.5 bg-slate-200/50 rounded-md w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <div className="h-3 bg-slate-200/70 rounded w-10" />
                  <div className="h-4 bg-slate-200/80 rounded w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="bg-white/90 rounded-2xl p-3 border border-slate-100/80 shadow-2xs flex gap-3.5 items-center animate-pulse"
            >
              <div className="w-20 h-20 rounded-xl bg-slate-200/70 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2 py-0.5">
                <div className="h-3.5 bg-slate-200/90 rounded-md w-3/4" />
                <div className="h-2.5 bg-slate-200/50 rounded-md w-1/2" />
                <div className="flex items-center justify-between pt-1">
                  <div className="h-3.5 bg-slate-200/80 rounded-md w-14" />
                  <div className="h-4 w-16 bg-slate-200/60 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function MenuSection({
  items,
  selectedCategory,
  searchQuery,
  onSelectItem,
  onResetSearch,
  isLoading = false,
  layoutMode = 'grid',
}: MenuSectionProps) {
  // Empty state handling
  if (items.length === 0 && !isLoading) {
    return (
      <div className="py-16 px-5 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center text-orange-600 mb-3 border border-orange-100 shadow-2xs">
          <SearchX className="w-8 h-8 opacity-80" />
        </div>
        <h3 className="text-base font-bold text-slate-800">
          {searchQuery ? 'No dishes found' : 'No menu items available.'}
        </h3>
        <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
          {searchQuery
            ? `We couldn't find any dishes matching "${searchQuery}". Check the spelling or try searching for another item.`
            : 'Please check back soon.'}
        </p>
        {searchQuery && (
          <button
            type="button"
            id="try-another-search-btn"
            onClick={onResetSearch}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try another search</span>
          </button>
        )}
      </div>
    );
  }

  // Authentic dishes subheader bar
  const subheader = (
    <div className="flex items-center justify-between text-[11px] text-slate-400 px-5 pt-2.5 pb-1 font-medium select-none">
      <span>
        Showing <span className="font-bold text-slate-700">{items.length}</span> authentic dishes
      </span>
      <span className="text-slate-500">Tap dish for culinary details</span>
    </div>
  );

  // If in 'All' category and not searching, group by category for an authentic menu experience
  const shouldGroup = selectedCategory === 'All' && !searchQuery.trim();

  if (shouldGroup) {
    // Group items by category in the order they appear
    const categoryGroups = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    let globalIndex = 0;

    return (
      <div className="relative min-h-[360px]">
        {/* Subtle Skeleton Loader Overlay */}
        <AnimatePresence>
          {isLoading && <MenuSkeletonOverlay layoutMode={layoutMode} />}
        </AnimatePresence>

        {subheader}

        <div className="px-5 py-3 space-y-6">
          {Object.entries(categoryGroups).map(([catName, groupItems]) => (
            <section key={catName} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 pt-1">
                <h3 className="text-[13px] font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
                  <span className="w-1.5 h-3.5 bg-orange-600 rounded-full" />
                  {catName}
                </h3>
                <span className="text-[11px] font-bold text-slate-400">
                  {groupItems.length} {groupItems.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {/* Dishes list: 2-column double photo grid OR 1-column list */}
              {layoutMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {groupItems.map((item) => {
                    const itemIndex = globalIndex++;
                    const isUnavailable = isMenuItemUnavailable(item);
                    return (
                      <motion.div
                        key={`${selectedCategory}-${item.id}`}
                        custom={itemIndex}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="relative"
                      >
                        <FoodGridCard item={item} onSelect={onSelectItem} />
                        {isUnavailable && (
                          <div
                            data-testid={`unavailable-overlay-${item.id}`}
                            className="absolute inset-0 rounded-2xl bg-white/45 pointer-events-none flex items-start justify-end p-2.5 z-10 border border-slate-200/60"
                            aria-label={`${item.name} is currently unavailable`}
                          >
                            <span
                              data-testid="unavailable-badge"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase bg-rose-600 text-white shadow-xs"
                            >
                              Unavailable
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {groupItems.map((item) => {
                    const itemIndex = globalIndex++;
                    const isUnavailable = isMenuItemUnavailable(item);
                    return (
                      <motion.div
                        key={`${selectedCategory}-${item.id}`}
                        custom={itemIndex}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="relative"
                      >
                        <FoodCard item={item} onSelect={onSelectItem} />
                        {isUnavailable && (
                          <div
                            data-testid={`unavailable-overlay-${item.id}`}
                            className="absolute inset-0 rounded-2xl bg-white/45 pointer-events-none flex items-start justify-end p-2.5 z-10 border border-slate-200/60"
                            aria-label={`${item.name} is currently unavailable`}
                          >
                            <span
                              data-testid="unavailable-badge"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase bg-rose-600 text-white shadow-xs"
                            >
                              Unavailable
                            </span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    );
  }

  // Filtered / Searched view
  return (
    <div className="relative min-h-[360px]">
      {/* Subtle Skeleton Loader Overlay */}
      <AnimatePresence>
        {isLoading && <MenuSkeletonOverlay layoutMode={layoutMode} />}
      </AnimatePresence>

      {subheader}

      <div className="px-5 py-3 space-y-3">
        {/* Category header / search summary */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-[13px] font-bold text-slate-800 tracking-wide uppercase flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-orange-600 rounded-full" />
            {searchQuery ? `Search Results` : selectedCategory}
          </h3>
          <span className="text-[11px] font-bold text-orange-600">
            {items.length} {items.length === 1 ? 'dish' : 'dishes'}
          </span>
        </div>

        {/* Dish cards: 2-column double photo grid OR 1-column list */}
        {layoutMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {items.map((item, index) => {
              const isUnavailable = isMenuItemUnavailable(item);
              return (
                <motion.div
                  key={`${selectedCategory}-${item.id}`}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="relative"
                >
                  <FoodGridCard item={item} onSelect={onSelectItem} />
                  {isUnavailable && (
                    <div
                      data-testid={`unavailable-overlay-${item.id}`}
                      className="absolute inset-0 rounded-2xl bg-white/45 pointer-events-none flex items-start justify-end p-2.5 z-10 border border-slate-200/60"
                      aria-label={`${item.name} is currently unavailable`}
                    >
                      <span
                        data-testid="unavailable-badge"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase bg-rose-600 text-white shadow-xs"
                      >
                        Unavailable
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, index) => {
              const isUnavailable = isMenuItemUnavailable(item);
              return (
                <motion.div
                  key={`${selectedCategory}-${item.id}`}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  className="relative"
                >
                  <FoodCard item={item} onSelect={onSelectItem} />
                  {isUnavailable && (
                    <div
                      data-testid={`unavailable-overlay-${item.id}`}
                      className="absolute inset-0 rounded-2xl bg-white/45 pointer-events-none flex items-start justify-end p-2.5 z-10 border border-slate-200/60"
                      aria-label={`${item.name} is currently unavailable`}
                    >
                      <span
                        data-testid="unavailable-badge"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wide uppercase bg-rose-600 text-white shadow-xs"
                      >
                        Unavailable
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
