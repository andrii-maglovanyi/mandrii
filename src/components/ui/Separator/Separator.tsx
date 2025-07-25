type SeparatorProps = {
  className?: string;
  text?: string;
  variant?: "full" | "margin" | "tight";
};

const variantClasses = {
  full: "w-full",
  margin: "w-[80%] mx-auto",
  tight: "w-fit mx-auto px-4",
};

export const Separator = ({
  className = "",
  text,
  variant = "full",
}: SeparatorProps) => {
  return (
    <div
      className={`
        relative my-3 text-center text-sm text-nowrap text-neutral-500
        select-none
        ${variantClasses[variant]}
        ${className}
        before:absolute before:inset-y-1/2 before:left-0 before:h-px
        before:w-full before:border-t before:border-neutral-500/50
      `}
      data-testid="separator"
    >
      {text && <span className="relative z-10 bg-surface px-3">{text}</span>}
    </div>
  );
};
