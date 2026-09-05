import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number | null;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  totalRatings?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = true,
  totalRatings,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const currentScore = hoverRating !== null ? hoverRating : rating || 0;

  if (!interactive && (rating === null || rating === undefined)) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
        No ratings yet
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(currentScore);

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              className={`p-0.5 transition-transform duration-150 ${
                interactive
                  ? 'cursor-pointer hover:scale-125 focus:outline-none'
                  : 'cursor-default'
              }`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                    : 'fill-slate-100 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && rating !== null && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {rating.toFixed(1)}
          {totalRatings !== undefined && (
            <span className="text-xs font-normal text-slate-500 ml-1">
              ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </span>
          )}
        </span>
      )}
    </div>
  );
};

export default StarRating;
