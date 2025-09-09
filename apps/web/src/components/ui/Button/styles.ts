import { commonClass } from "../styles";

export const baseClass = `inline-flex cursor-pointer items-center justify-center rounded-md ${commonClass}`;

export const variantClasses = {
  featured:
    "from-primary text-surface font-medium to-secondary rounded-xl bg-gradient-to-r shadow-lg shadow-primary/50 transition-transform duration-300 ease-in-out hover:scale-105",
  filled: {
    neutral: "bg-neutral text-surface hover:bg-neutral-hover disabled:bg-neutral-disabled disabled:text-surface/80",
    primary: "bg-primary text-surface hover:bg-primary-hover disabled:bg-primary-disabled disabled:text-surface/80",
  },
  ghost: {
    neutral:
      "bg-transparent text-on-surface hover:bg-neutral-500/20 disabled:text-neutral-disabled disabled:hover:bg-transparent",
    primary:
      "bg-transparent text-primary hover:bg-primary/20 disabled:text-primary-disabled disabled:hover:bg-transparent",
  },
  outlined: {
    neutral:
      "border border-neutral text-neutral hover:bg-surface-tint/20 disabled:border-neutral-disabled disabled:text-neutral-disabled disabled:hover:bg-transparent",
    primary:
      "border border-primary text-primary hover:bg-primary/20 disabled:border-primary-disabled disabled:text-primary-disabled disabled:hover:bg-transparent",
  },
};
