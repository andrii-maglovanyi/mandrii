"use client";

import clsx from "clsx";
import { type ComponentProps, type MouseEvent, type ReactNode, useEffect, useState } from "react";

import { Link } from "~/i18n/navigation";

export type SegmentedNavigationItem = {
  current?: boolean;
  href: ComponentProps<typeof Link>["href"];
  label: ReactNode;
};

type SegmentedNavigationProps = {
  ariaLabel: string;
  className?: string;
  items: readonly SegmentedNavigationItem[];
};

/** Navigation between closely related pages, styled as a compact segmented control. */
export const SegmentedNavigation = ({ ariaLabel, className, items }: SegmentedNavigationProps) => {
  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.current),
  );
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;

    setActiveIndex(index);
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={ariaLabel}
      className={clsx("border-primary/20 bg-surface relative inline-flex rounded-xl border p-1", className)}
    >
      <span
        aria-hidden
        className="bg-primary pointer-events-none absolute inset-y-1 left-1 rounded-lg shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
          width: `calc((100% - 0.5rem) / ${items.length})`,
        }}
      />
      <ul
        className="relative z-10 grid items-stretch"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ current = false, href, label }, index) => (
          <li className="min-w-0" key={String(href)}>
            <Link
              aria-current={current ? "page" : undefined}
              className={clsx(
                "focus-visible:outline-primary flex min-h-10 w-full !max-w-none items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold no-underline transition-colors after:!hidden hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                current ? "text-surface hover:text-surface" : "text-neutral hover:text-on-surface",
              )}
              href={href}
              onClick={(event) => handleClick(event, index)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
