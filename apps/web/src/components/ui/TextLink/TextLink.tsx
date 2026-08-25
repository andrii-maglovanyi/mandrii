import clsx from "clsx";
import { type ComponentProps } from "react";

import { Link } from "~/i18n/navigation";

type TextLinkProps = ComponentProps<typeof Link>;

/** A lightweight action link for secondary navigation. */
export const TextLink = ({ className, ...props }: TextLinkProps) => (
  <Link
    {...props}
    className={clsx(
      "text-primary hover:text-primary-hover inline-flex items-center gap-1.5 text-sm font-medium transition-colors",
      className,
    )}
  />
);
