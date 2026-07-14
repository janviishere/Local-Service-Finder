import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating, setRating, max = 5 }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        return (
          <button
            type="button"
            key={i}
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => setRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              size={28}
              fill={starValue <= (hover || rating) ? "#F59E0B" : "transparent"}
              color={starValue <= (hover || rating) ? "#F59E0B" : "#D1D5DB"}
            />
          </button>
        );
      })}
    </div>
  );
}
