import clsx from "clsx";
import { type HTMLAttributes, type ReactNode } from "react";

export type BadgeVariant = "danger" | "info" | "neutral" | "success" | "warning";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children?: ReactNode;
  icon?: ReactNode;
  iconOnly?: boolean;
  size?: "md" | "sm";
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  danger: "bg-red-600/75 text-surface dark:bg-red-400/75",
  info: "bg-blue-600/75 text-surface dark:bg-blue-400/75",
  neutral: "bg-slate-600/75 text-surface dark:bg-slate-400/75",
  success: "bg-green-600/75 text-surface dark:bg-green-400/75",
  warning: "bg-orange-600/75 text-surface dark:bg-orange-400/75",
};

const sizeClasses = {
  md: "px-2.5 py-1 text-[0.6875rem]",
  sm: "px-2 py-0.5 text-[0.625rem]",
};

/** A compact semantic label for statuses and small pieces of metadata. */
export const Badge = ({
  children,
  className,
  icon,
  iconOnly = false,
  size = "sm",
  variant = "neutral",
  ...rest
}: BadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center justify-center gap-1.5 rounded-md font-medium uppercase no-underline",
      variantClasses[variant],
      iconOnly ? "h-9 w-9 p-0" : sizeClasses[size],
      className,
    )}
    {...rest}
  >
    {icon}
    {!iconOnly && children}
  </span>
);
