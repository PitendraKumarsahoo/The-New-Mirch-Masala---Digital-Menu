import { useRef, useEffect, useState, useCallback } from 'react';
import { MenuCategory } from '../types';
import { Flame, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryTabsProps {
  categories?: readonly string[] | string[];
  selectedCategory: MenuCategory;
  onSelectCategory: (category: MenuCategory) => void;
  categoryItemCounts?: Record<string, number>;
}

export function CategoryTabs({
  categories = ['All'],
  selectedCategory,
  onSelectCategory,
  categoryItemCounts,
}: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll boundary state to show/hide carousel indicators & buttons
  const checkScrollBounds = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    // Allow small tolerance of 2px
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    checkScrollBounds();
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkScrollBounds();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollBounds);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [checkScrollBounds, categories]);

  // Smooth scroll left by carousel chunk
  const scrollCarouselLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -180,
        behavior: 'smooth',
      });
    }
  };

  // Smooth scroll right by carousel chunk
  const scrollCarouselRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 180,
        behavior: 'smooth',
      });
    }
  };

  // Auto-scroll active category tab into centered visible view
  useEffect(() => {
    if (activeBtnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeBtnRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Check if button is outside or near the edges
      if (
        buttonRect.left < containerRect.left + 32 ||
        buttonRect.right > containerRect.right - 32
      ) {
        button.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
    // Recheck scroll bounds after auto-scrolling
    const timer = setTimeout(checkScrollBounds, 350);
    return () => clearTimeout(timer);
  }, [selectedCategory, checkScrollBounds]);

  return (
    <div
      className="bg-white/95 backdrop-blur-xl border-b border-slate-100/90 py-2.5 px-3 sm:px-4 shadow-2xs sticky top-[67px] z-20 select-none relative group"
      role="region"
      aria-label="Category Carousel"
    >
      <div className="relative flex items-center">
        {/* Left Overflow Gradient Fade & Carousel Scroll Button */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 inset-y-0 z-10 flex items-center pr-6 bg-gradient-to-r from-white via-white/90 to-transparent pointer-events-none"
            >
              <button
                type="button"
                onClick={scrollCarouselLeft}
                aria-label="Scroll categories left"
                className="pointer-events-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-stone-700 shadow-md border border-stone-200/80 flex items-center justify-center hover:bg-stone-50 hover:text-stone-900 active:scale-90 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Overflow Gradient Fade & Carousel Scroll Button */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 inset-y-0 z-10 flex items-center pl-6 bg-gradient-to-l from-white via-white/90 to-transparent pointer-events-none"
            >
              <button
                type="button"
                onClick={scrollCarouselRight}
                aria-label="Scroll categories right"
                className="pointer-events-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-stone-700 shadow-md border border-stone-200/80 flex items-center justify-center hover:bg-stone-50 hover:text-stone-900 active:scale-90 transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Scroll Track with Smooth Physics */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 w-full"
          role="tablist"
          aria-label="Menu categories"
          tabIndex={0}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryItemCounts ? categoryItemCounts[cat] : undefined;

            return (
              <button
                key={cat}
                ref={isSelected ? activeBtnRef : null}
                role="tab"
                id={`category-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                aria-selected={isSelected}
                onClick={() => onSelectCategory(cat)}
                className={`relative flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors duration-150 shrink-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${
                  isSelected
                    ? 'text-white'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                }`}
              >
                {/* Smooth Animated Active Pill Background Indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryCarouselPill"
                    transition={{
                      type: 'spring',
                      stiffness: 420,
                      damping: 32,
                    }}
                    className="absolute inset-0 rounded-full bg-orange-600 shadow-md shadow-orange-600/25 -z-10"
                  />
                )}

                {/* Non-selected border / background */}
                {!isSelected && (
                  <div className="absolute inset-0 rounded-full border border-stone-200/80 bg-stone-50/50 -z-10" />
                )}

                {/* Icons */}
                {cat === 'Popular' && (
                  <Flame
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected
                        ? 'text-white fill-white'
                        : 'text-orange-600 fill-orange-500'
                    }`}
                  />
                )}
                {cat === 'All' && (
                  <Sparkles
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isSelected ? 'text-orange-200' : 'text-stone-400'
                    }`}
                  />
                )}

                {/* Category Label */}
                <span className="relative z-10 tracking-tight">{cat}</span>

                {/* Item Count Badge */}
                {typeof count === 'number' && count > 0 && cat !== 'All' && (
                  <span
                    className={`relative z-10 text-[9px] px-1.5 py-0.2 rounded-full font-black leading-tight transition-colors ${
                      isSelected
                        ? 'bg-white/25 text-white'
                        : 'bg-stone-200/80 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
