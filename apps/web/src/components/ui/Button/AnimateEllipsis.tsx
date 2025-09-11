interface AnimatedEllipsisProps {
  el?: string;
}

export const AnimatedEllipsis = ({ el = "\u2022" }: AnimatedEllipsisProps) => (
  <span className="inline-flex">
    <span className={`
      animate-bounce
      [animation-delay:-0.3s]
    `}>{el}</span>
    <span className={`
      animate-bounce
      [animation-delay:-0.15s]
    `}>{el}</span>
    <span className="animate-bounce">{el}</span>
  </span>
);
