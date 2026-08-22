import clsx from "clsx";
import { type ReactNode } from "react";

interface SectionCardProps {
  as?: "aside" | "section";
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  titleClassName?: string;
}

/**
 * A consistently styled panel for related content on detail pages.
 *
 * Unlike `Card`, this component does not provide a link overlay and is safe for
 * interactive content such as inputs, lists, and buttons.
 */
export const SectionCard = ({
  as: Component = "section",
  children,
  className,
  title,
  titleClassName,
}: SectionCardProps) => (
  <Component
    className={clsx(
      "group/card border-primary/0 bg-surface-tint/50 hover:border-primary/20 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg lg:text-base",
      className,
    )}
  >
    {title && <h3 className={clsx("mt-2 text-lg font-semibold", titleClassName)}>{title}</h3>}
    {children}
  </Component>
);
