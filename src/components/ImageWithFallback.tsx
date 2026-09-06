import { useState, useEffect } from 'react';
import { CategoryAbstractGraphic } from './CategoryAbstractGraphic';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  category?: string;
  isVeg?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ImageWithFallback({
  src,
  alt,
  className = '',
  category = 'Dish',
  isVeg = false,
  size = 'md',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset error and loading states whenever src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (hasError || !src) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <CategoryAbstractGraphic
          category={category}
          isVeg={isVeg}
          size={size}
          name={alt}
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {/* Themed Abstract Graphic placeholder visible while image is loading */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      >
        <CategoryAbstractGraphic
          category={category}
          isVeg={isVeg}
          size={size}
          name={alt}
        />
        {/* Subtle frosted shimmer wave over the placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
      </div>

      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
          if (src && typeof console !== 'undefined' && console.warn) {
            console.warn(`[Image Load Failed] "${alt}" (${category}):`, src);
          }
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 relative z-10 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
    </div>
  );
}
