import clsx from "clsx";

type SeparatorProps = {
  align?: "center" | "left" | "right";
  className?: string;
  text?: string;
  variant?: "full" | "margin" | "tight";
};

const variantClasses = {
  full: "w-full",
  margin: "w-[80%] mx-auto",
  tight: "w-fit mx-auto px-4",
};

const alignClasses = {
  center: "justify-center",
  left: "justify-start",
  right: "justify-end",
};

export const Separator = ({ align = "center", className = "", text, variant = "full" }: SeparatorProps) => {
  return (
    <div className={`
      relative flex items-center py-3
      ${variantClasses[variant]}
      ${className}
    `} data-testid="separator">
      <div className={clsx("min-w-2 border-t border-neutral-500/30", align !== "left" && `
        grow
      `)} />
      {text && (
        <span
          className={clsx(
            `flex px-3 text-sm text-nowrap text-neutral-500 select-none`,
            variant === "full" && alignClasses[align],
          )}
        >
          {text}
        </span>
      )}
      <div className={clsx("min-w-2 border-t border-neutral-500/30", align !== "right" && `
        grow
      `)} />
    </div>
  );
};
