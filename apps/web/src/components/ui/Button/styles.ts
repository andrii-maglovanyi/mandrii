import { commonClass } from "../styles";

export const baseClass = `inline-flex whitespace-nowrap cursor-pointer items-center justify-center rounded-md ${commonClass}`;

export const variantClasses = {
  featured:
    "from-primary text-surface font-medium to-secondary rounded-xl bg-gradient-to-r transition-transform duration-300 ease-in-out hover:scale-105 z-10",
  filled: {
    danger: "bg-danger text-white hover:bg-danger-hover disabled:bg-danger-disabled disabled:text-surface/80",
    neutral: "bg-neutral text-surface hover:bg-neutral-hover disabled:bg-neutral-disabled disabled:text-surface/80",
    primary: "bg-primary text-surface hover:bg-primary-hover disabled:bg-primary-disabled disabled:text-surface/80",
  },
  ghost: {
    danger:
      "bg-transparent text-danger hover:bg-danger/10 disabled:text-danger-disabled disabled:hover:bg-transparent ",
    neutral:
      "bg-transparent text-on-surface hover:bg-neutral-500/20 disabled:text-neutral-disabled disabled:hover:bg-transparent",
    primary:
      "bg-transparent text-primary hover:bg-primary/20 disabled:text-primary-disabled disabled:hover:bg-transparent",
  },
  outlined: {
    danger:
      "border border-danger text-danger hover:bg-danger/20 disabled:border-danger-disabled disabled:text-danger-disabled disabled:hover:bg-transparent",
    neutral:
      "border border-neutral text-neutral hover:bg-surface-tint/40 disabled:border-neutral-disabled disabled:text-neutral-disabled disabled:hover:bg-transparent",
    primary:
      "border border-primary text-primary hover:bg-primary/20 disabled:border-primary-disabled disabled:text-primary-disabled disabled:hover:bg-transparent",
  },
};
