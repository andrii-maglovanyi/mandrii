type TabBadgeProps = {
  count: number;
};

export const TabBadge = ({ count }: TabBadgeProps) => {
  if (count < 1) return null;

  return (
    <span
      aria-hidden
      className="bg-primary/10 text-primary pointer-events-none absolute top-1 right-px inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};
