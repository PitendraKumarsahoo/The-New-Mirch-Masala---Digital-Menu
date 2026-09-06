import { useRef, useEffect } from 'react';
import { MenuCategory } from '../types';
import { Flame, Sparkles } from 'lucide-react';

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

  // Auto-scroll active category into visible view
  useEffect(() => {
    if (activeBtnRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = activeBtnRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
        button.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [selectedCategory]);

  return (
    <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 py-3 px-5 shadow-2xs sticky top-[67px] z-20">
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-0.5"
        role="tablist"
        aria-label="Menu categories"
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all duration-200 active:scale-95 shrink-0 ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {cat === 'Popular' && (
                <Flame
                  className={`w-3.5 h-3.5 ${
                    isSelected ? 'text-white fill-white' : 'text-orange-600 fill-orange-500'
                  }`}
                />
              )}
              {cat === 'All' && (
                <Sparkles
                  className={`w-3 h-3 ${
                    isSelected ? 'text-orange-100' : 'text-slate-400'
                  }`}
                />
              )}
              <span>{cat}</span>
              {typeof count === 'number' && count > 0 && cat !== 'All' && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black leading-tight ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500'
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
  );
}
