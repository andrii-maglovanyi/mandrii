import { Star } from "lucide-react";

type ReviewStarsProps = {
  label?: string;
  rating: number;
  size?: number;
};

export const ReviewStars = ({ label, rating, size = 16 }: ReviewStarsProps) => (
  <span aria-label={label ?? `${rating} out of 5`} className="inline-flex text-amber-400" role="img">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star aria-hidden className={star <= rating ? "fill-current" : "text-on-surface/15"} key={star} size={size} />
    ))}
  </span>
);
