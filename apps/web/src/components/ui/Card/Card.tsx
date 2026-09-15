import type { MouseEventHandler } from "react";

import clsx from "clsx";

import { Link } from "~/i18n/navigation";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  linkLabel?: string;
  onLinkClick?: MouseEventHandler<HTMLAnchorElement>;
}

export const Card = ({ children, className, href, linkLabel, onLinkClick }: CardProps) => {
  return (
    <div className={clsx("relative min-w-0", className)}>
      {href && (
        <Link
          aria-label={linkLabel}
          className="pointer-events-auto absolute inset-0 z-10"
          href={href}
          onClick={onLinkClick}
        />
      )}
      <div className="pointer-events-none z-20 w-full min-w-0">
        <div
          className={`
            h-full
            [&_[data-menu-overlay]]:pointer-events-auto
            [&_[role='listbox']]:pointer-events-auto
            [&_[role='option']]:pointer-events-auto
            [&_a]:pointer-events-auto
            [&_button]:pointer-events-auto
            [&_input]:pointer-events-auto
            [&_label]:pointer-events-auto
            [&_select]:pointer-events-auto
            [&_textarea]:pointer-events-auto
          `}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
