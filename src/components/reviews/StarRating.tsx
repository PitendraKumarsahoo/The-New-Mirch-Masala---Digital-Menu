import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number; // 0 means unselected
  onChange: (rating: number) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'lg',
  showLabel = true,
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const starSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const activeRating = hoverRating > 0 ? hoverRating : value;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center gap-2"
        role="radiogroup"
        aria-label="Star Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;

          return (
            <button
              key={star}
              type="button"
              id={`star-rating-btn-${star}`}
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star > 1 ? 's' : ''} - ${RATING_LABELS[star]}`}
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              className={`p-1 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer ${
                disabled ? 'cursor-not-allowed opacity-75' : 'hover:scale-110 active:scale-95'
              }`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                    : 'text-stone-300 hover:text-amber-200 stroke-[1.75]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span
          className={`text-xs font-bold transition-all duration-150 h-4 ${
            activeRating > 0 ? 'text-amber-700' : 'text-stone-400'
          }`}
        >
          {activeRating > 0 ? `${activeRating} Star${activeRating > 1 ? 's' : ''} • ${RATING_LABELS[activeRating]}` : 'Tap to rate (1 to 5 stars)'}
        </span>
      )}
    </div>
  );
};
