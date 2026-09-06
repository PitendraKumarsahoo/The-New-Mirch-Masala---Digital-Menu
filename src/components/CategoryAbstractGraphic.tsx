import { useMemo } from 'react';
import {
  Flame,
  Soup,
  Salad,
  Fish,
  Wheat,
  Leaf,
  Egg,
  Sparkles,
  CupSoda,
  UtensilsCrossed,
  Drumstick,
  CircleDot,
  Utensils,
  Sun,
  Layers,
} from 'lucide-react';

interface CategoryAbstractGraphicProps {
  category?: string;
  isVeg?: boolean;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface CategoryTheme {
  icon: typeof Flame;
  subIcon?: typeof Sparkles;
  bgGradient: string;
  accentBg: string;
  iconColor: string;
  tagColor: string;
  tagText: string;
  patternType: 'stars' | 'waves' | 'steam' | 'botanical' | 'circles' | 'sun' | 'geometric';
}

export function CategoryAbstractGraphic({
  category = 'Dish',
  isVeg = false,
  name,
  className = '',
  size = 'md',
}: CategoryAbstractGraphicProps) {
  const theme: CategoryTheme = useMemo(() => {
    const cat = category.toLowerCase().trim();

    if (cat.includes('biryani')) {
      return {
        icon: UtensilsCrossed,
        subIcon: Sparkles,
        bgGradient: 'from-amber-600/20 via-orange-500/15 to-yellow-600/25 bg-amber-50/60',
        accentBg: 'bg-amber-500/15 border-amber-300/40 text-amber-700',
        iconColor: 'text-amber-700',
        tagColor: 'text-amber-800 bg-amber-100/80 border-amber-200',
        tagText: 'Royal Basmati',
        patternType: 'stars',
      };
    }

    if (cat.includes('chicken') || cat.includes('tandoori')) {
      return {
        icon: Drumstick,
        subIcon: Flame,
        bgGradient: 'from-orange-600/20 via-red-500/15 to-amber-700/25 bg-orange-50/60',
        accentBg: 'bg-orange-500/15 border-orange-300/40 text-orange-700',
        iconColor: 'text-orange-600',
        tagColor: 'text-orange-800 bg-orange-100/80 border-orange-200',
        tagText: 'Tandoor & Grill',
        patternType: 'geometric',
      };
    }

    if (cat.includes('mutton')) {
      return {
        icon: Flame,
        subIcon: Sparkles,
        bgGradient: 'from-rose-700/20 via-red-600/15 to-orange-800/25 bg-rose-50/60',
        accentBg: 'bg-rose-500/15 border-rose-300/40 text-rose-700',
        iconColor: 'text-rose-700',
        tagColor: 'text-rose-800 bg-rose-100/80 border-rose-200',
        tagText: 'Rich Masala',
        patternType: 'stars',
      };
    }

    if (cat.includes('fish') || cat.includes('prawn')) {
      return {
        icon: Fish,
        subIcon: Sparkles,
        bgGradient: 'from-sky-600/20 via-cyan-500/15 to-teal-700/25 bg-sky-50/60',
        accentBg: 'bg-sky-500/15 border-sky-300/40 text-sky-700',
        iconColor: 'text-sky-600',
        tagColor: 'text-sky-800 bg-sky-100/80 border-sky-200',
        tagText: 'Coastal Catch',
        patternType: 'waves',
      };
    }

    if (cat.includes('paneer') || cat.includes('vegetable')) {
      return {
        icon: Leaf,
        subIcon: Sparkles,
        bgGradient: 'from-emerald-600/20 via-teal-500/15 to-green-700/25 bg-emerald-50/60',
        accentBg: 'bg-emerald-500/15 border-emerald-300/40 text-emerald-700',
        iconColor: 'text-emerald-600',
        tagColor: 'text-emerald-800 bg-emerald-100/80 border-emerald-200',
        tagText: 'Pure Garden',
        patternType: 'botanical',
      };
    }

    if (cat.includes('mushroom')) {
      return {
        icon: Layers,
        subIcon: Leaf,
        bgGradient: 'from-amber-700/20 via-stone-600/15 to-yellow-800/25 bg-stone-50/60',
        accentBg: 'bg-amber-600/15 border-amber-300/40 text-amber-800',
        iconColor: 'text-amber-800',
        tagColor: 'text-stone-800 bg-amber-100/80 border-amber-200',
        tagText: 'Earth & Herb',
        patternType: 'circles',
      };
    }

    if (cat.includes('noodle') || cat.includes('fried rice')) {
      return {
        icon: UtensilsCrossed,
        subIcon: Flame,
        bgGradient: 'from-orange-500/20 via-amber-500/15 to-red-600/20 bg-orange-50/60',
        accentBg: 'bg-orange-500/15 border-orange-300/40 text-orange-700',
        iconColor: 'text-orange-600',
        tagColor: 'text-orange-800 bg-orange-100/80 border-orange-200',
        tagText: 'Wok Tossed',
        patternType: 'steam',
      };
    }

    if (cat.includes('soup')) {
      return {
        icon: Soup,
        subIcon: Sparkles,
        bgGradient: 'from-amber-500/20 via-orange-400/15 to-yellow-600/20 bg-amber-50/60',
        accentBg: 'bg-amber-500/15 border-amber-300/40 text-amber-700',
        iconColor: 'text-amber-600',
        tagColor: 'text-amber-800 bg-amber-100/80 border-amber-200',
        tagText: 'Warm Broth',
        patternType: 'steam',
      };
    }

    if (cat.includes('salad')) {
      return {
        icon: Salad,
        subIcon: Leaf,
        bgGradient: 'from-lime-600/20 via-emerald-500/15 to-teal-600/20 bg-lime-50/60',
        accentBg: 'bg-lime-500/15 border-lime-300/40 text-lime-700',
        iconColor: 'text-lime-700',
        tagColor: 'text-emerald-800 bg-lime-100/80 border-lime-200',
        tagText: 'Crisp & Fresh',
        patternType: 'botanical',
      };
    }

    if (cat.includes('roll') || cat.includes('pakoda')) {
      return {
        icon: Flame,
        subIcon: Sparkles,
        bgGradient: 'from-amber-500/25 via-yellow-500/20 to-orange-600/20 bg-amber-50/60',
        accentBg: 'bg-amber-500/15 border-amber-300/40 text-amber-700',
        iconColor: 'text-amber-700',
        tagColor: 'text-amber-800 bg-amber-100/80 border-amber-200',
        tagText: 'Crispy Snack',
        patternType: 'sun',
      };
    }

    if (cat.includes('papad')) {
      return {
        icon: Sun,
        subIcon: CircleDot,
        bgGradient: 'from-yellow-500/25 via-amber-400/20 to-orange-500/20 bg-yellow-50/60',
        accentBg: 'bg-yellow-500/15 border-yellow-300/40 text-yellow-700',
        iconColor: 'text-amber-600',
        tagColor: 'text-amber-800 bg-yellow-100/80 border-yellow-200',
        tagText: 'Crunchy Roast',
        patternType: 'sun',
      };
    }

    if (cat.includes('drink')) {
      return {
        icon: CupSoda,
        subIcon: Sparkles,
        bgGradient: 'from-cyan-500/20 via-sky-400/15 to-blue-600/25 bg-cyan-50/60',
        accentBg: 'bg-cyan-500/15 border-cyan-300/40 text-cyan-700',
        iconColor: 'text-cyan-600',
        tagColor: 'text-cyan-800 bg-cyan-100/80 border-cyan-200',
        tagText: 'Chilled Refreshment',
        patternType: 'circles',
      };
    }

    if (cat.includes('egg')) {
      return {
        icon: Egg,
        subIcon: Sparkles,
        bgGradient: 'from-yellow-400/25 via-amber-400/20 to-orange-500/20 bg-yellow-50/60',
        accentBg: 'bg-yellow-500/15 border-yellow-300/40 text-yellow-700',
        iconColor: 'text-amber-600',
        tagColor: 'text-amber-800 bg-yellow-100/80 border-yellow-200',
        tagText: 'Savory Egg',
        patternType: 'sun',
      };
    }

    if (cat.includes('meals')) {
      return {
        icon: UtensilsCrossed,
        subIcon: Wheat,
        bgGradient: 'from-amber-600/20 via-orange-500/15 to-yellow-600/25 bg-amber-50/60',
        accentBg: 'bg-amber-500/15 border-amber-300/40 text-amber-700',
        iconColor: 'text-amber-700',
        tagColor: 'text-amber-800 bg-amber-100/80 border-amber-200',
        tagText: 'Deluxe Thali',
        patternType: 'stars',
      };
    }

    // Default fallback
    return {
      icon: isVeg ? Leaf : Utensils,
      subIcon: Sparkles,
      bgGradient: 'from-slate-200/40 via-orange-100/30 to-amber-100/40 bg-slate-50',
      accentBg: 'bg-orange-500/15 border-orange-300/40 text-orange-700',
      iconColor: isVeg ? 'text-emerald-600' : 'text-orange-600',
      tagColor: 'text-slate-700 bg-white/90 border-slate-200',
      tagText: isVeg ? 'Vegetarian' : 'Chef Special',
      patternType: 'geometric',
    };
  }, [category, isVeg]);

  const IconComponent = theme.icon;
  const SubIconComponent = theme.subIcon;

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden select-none bg-gradient-to-br ${theme.bgGradient} ${className}`}
      role="img"
      aria-label={`${category} placeholder illustration`}
    >
      {/* Abstract Vector Patterns Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 160"
        preserveAspectRatio="none"
      >
        <defs>
          <radialGradient id="abstract-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        {theme.patternType === 'stars' && (
          <g className={theme.iconColor}>
            <circle cx="80" cy="80" r="60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="80" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            <line x1="80" y1="10" x2="80" y2="150" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
            <line x1="10" y1="80" x2="150" y2="80" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 4" />
            <polygon points="80,30 84,76 130,80 84,84 80,130 76,84 30,80 76,76" fill="currentColor" opacity="0.15" />
          </g>
        )}

        {theme.patternType === 'waves' && (
          <g className={theme.iconColor}>
            <path d="M 0,40 Q 40,20 80,40 T 160,40" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <path d="M 0,80 Q 40,60 80,80 T 160,80" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <path d="M 0,120 Q 40,100 80,120 T 160,120" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <circle cx="120" cy="50" r="18" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          </g>
        )}

        {theme.patternType === 'steam' && (
          <g className={theme.iconColor}>
            <path d="M 50,130 C 40,90 70,70 60,30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            <path d="M 80,140 C 70,100 100,80 90,20" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <path d="M 110,130 C 100,90 130,70 120,30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        )}

        {theme.patternType === 'botanical' && (
          <g className={theme.iconColor}>
            <circle cx="80" cy="80" r="55" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <path d="M 80,25 Q 110,50 80,80 Q 50,50 80,25 Z" fill="currentColor" opacity="0.15" />
            <path d="M 80,80 Q 110,110 80,135 Q 50,110 80,80 Z" fill="currentColor" opacity="0.15" />
            <circle cx="80" cy="80" r="28" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          </g>
        )}

        {theme.patternType === 'circles' && (
          <g className={theme.iconColor}>
            <circle cx="80" cy="80" r="65" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="80" cy="80" r="25" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="35" cy="45" r="8" fill="currentColor" opacity="0.1" />
            <circle cx="125" cy="115" r="12" fill="currentColor" opacity="0.1" />
          </g>
        )}

        {theme.patternType === 'sun' && (
          <g className={theme.iconColor}>
            <circle cx="80" cy="80" r="35" fill="currentColor" opacity="0.12" />
            <circle cx="80" cy="80" r="50" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 80 + Math.cos(rad) * 55;
              const y1 = 80 + Math.sin(rad) * 55;
              const x2 = 80 + Math.cos(rad) * 68;
              const y2 = 80 + Math.sin(rad) * 68;
              return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />;
            })}
          </g>
        )}

        {theme.patternType === 'geometric' && (
          <g className={theme.iconColor}>
            <rect x="25" y="25" width="110" height="110" rx="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="80" cy="80" r="42" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="80" cy="80" r="20" fill="currentColor" opacity="0.08" />
          </g>
        )}
      </svg>

      {/* Center Frosted Glass Emblem */}
      <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center">
        <div
          className={`relative flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-md shadow-[0_4px_16px_rgba(15,23,42,0.08)] border border-white/90 ${
            size === 'lg'
              ? 'w-16 h-16 sm:w-20 sm:h-20 mb-3'
              : size === 'sm'
              ? 'w-9 h-9 mb-1'
              : 'w-11 h-11 sm:w-12 sm:h-12 mb-1.5'
          }`}
        >
          <IconComponent
            className={`${theme.iconColor} ${
              size === 'lg' ? 'w-8 h-8 sm:w-10 sm:h-10' : size === 'sm' ? 'w-4.5 h-4.5' : 'w-5 h-5 sm:w-6 sm:h-6'
            }`}
          />

          {SubIconComponent && size !== 'sm' && (
            <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-white shadow-xs border border-white flex items-center justify-center">
              <SubIconComponent className={`w-2.5 h-2.5 ${theme.iconColor}`} />
            </div>
          )}
        </div>

        {/* Themed Sub-label / Tag */}
        <div className="flex flex-col items-center">
          <span
            className={`font-extrabold uppercase tracking-wider rounded-full px-2 py-0.5 border shadow-2xs ${
              theme.tagColor
            } ${
              size === 'lg'
                ? 'text-xs px-3 py-1 font-bold'
                : size === 'sm'
                ? 'text-[8px] leading-tight max-w-[70px] truncate'
                : 'text-[9px] leading-none'
            }`}
          >
            {theme.tagText}
          </span>

          {size === 'lg' && (
            <span className="mt-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              {category} Specialty
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
