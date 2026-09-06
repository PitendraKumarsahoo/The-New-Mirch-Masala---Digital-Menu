interface VegBadgeProps {
  isVeg: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VegBadge({ isVeg, size = 'md', showLabel = false }: VegBadgeProps) {
  const sizeClasses = {
    sm: {
      outer: 'w-3.5 h-3.5 border-[1.5px] p-[1.5px]',
      inner: 'w-1.5 h-1.5',
      text: 'text-[10px]',
    },
    md: {
      outer: 'w-4 h-4 border-[1.5px] p-[2px]',
      inner: 'w-2 h-2',
      text: 'text-xs',
    },
    lg: {
      outer: 'w-5 h-5 border-2 p-[2.5px]',
      inner: 'w-2.5 h-2.5',
      text: 'text-sm font-medium',
    },
  }[size];

  const colorClasses = isVeg
    ? {
        border: 'border-emerald-600 bg-emerald-50/50',
        dot: 'bg-emerald-600 rounded-full',
        labelColor: 'text-emerald-700',
        text: 'Pure Veg',
      }
    : {
        border: 'border-red-600 bg-red-50/50',
        dot: 'bg-red-600 rounded-full',
        labelColor: 'text-red-700',
        text: 'Non-Veg',
      };

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0" aria-label={colorClasses.text}>
      <div
        className={`flex items-center justify-center rounded-[3px] ${sizeClasses.outer} ${colorClasses.border}`}
      >
        <div className={`${sizeClasses.inner} ${colorClasses.dot}`} />
      </div>
      {showLabel && (
        <span className={`${sizeClasses.text} ${colorClasses.labelColor} font-medium`}>
          {colorClasses.text}
        </span>
      )}
    </div>
  );
}
