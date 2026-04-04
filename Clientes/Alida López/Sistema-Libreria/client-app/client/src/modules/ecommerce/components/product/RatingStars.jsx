// client/src/components/RatingStars.jsx
export default function RatingStars({ rating, size = 'md', interactive = false, onRatingChange }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };
  
  const sizeSpacing = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1',
    xl: 'gap-1.5'
  };
  
  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };
  
  return (
    <div className={`flex items-center ${sizeSpacing[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          disabled={!interactive}
          className={`${sizes[size]} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <span className={`${star <= rating ? 'text-yellow-400' : 'text-gray-200'} transition-colors`}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}