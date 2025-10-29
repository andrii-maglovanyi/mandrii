"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { RichText } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { CardFooter } from "./Components/CardFooter";
import { CardHeader } from "./Components/CardHeader";
import { CardMetadata } from "./Components/CardMetadata";

interface MapMobileCardInterface {
  venue: GetPublicVenuesQuery["venues"][number];
}

/**
 * Mobile-optimized expandable venue card for map view.
 * Shows venue details in a bottom sheet that can expand to full screen.
 *
 * @param {MapMobileCardInterface} props - Component props.
 * @returns {JSX.Element} The bottom card component.
 */
export function MapMobileCard({ venue }: Readonly<MapMobileCardInterface>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [innerHeight, setInnerHeight] = useState<null | number>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const i18n = useI18n();
  const locale = useLocale() as Locale;

  const description = (locale === "uk" ? venue.description_uk : venue.description_en) || "";

  useEffect(() => {
    const handleResize = () => {
      setInnerHeight(window.innerHeight - 64);
    };

    if (isExpanded) {
      handleResize();
      window.addEventListener("resize", handleResize);
    } else {
      setInnerHeight(null);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (isExpanded && cardRef.current) {
      cardRef.current.scrollTop = 0;
    }
  }, [isExpanded]);

  const toggle = () => setIsExpanded((prev) => !prev);

  return (
    <div
      className={`
        fixed right-0 bottom-0 left-0 z-30 overflow-hidden rounded-t-2xl
        border-neutral-hover bg-surface shadow-lg transition-all duration-500
        ease-in-out
        md:hidden
        ${isExpanded ? "" : `border-t`}
      `}
      style={{
        height: isExpanded && innerHeight ? `${innerHeight}px` : "33vh",
      }}
    >
      <button
        aria-label={isExpanded ? i18n("Collapse venue details") : i18n("Expand venue details")}
        className={`
          flex h-10 w-full cursor-pointer items-center justify-center
          hover:bg-on-surface/5
        `}
        onClick={toggle}
      >
        {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>

      <div className="h-full overflow-scroll overflow-y-auto pt-2 pb-20" ref={cardRef}>
        <div className="px-8">
          <CardHeader venue={venue} />

          <h3
            className={`
              mb-2 line-clamp-2 text-lg font-bold text-primary transition-colors
              group-hover/card:underline
              sm:text-xl
            `}
          >
            <Link href={`/venues/${venue.slug}`}>{venue.name}</Link>
          </h3>

          {description && <RichText className={`
            prose max-w-none
            dark:prose-invert
          `}>{description}</RichText>}

          <CardMetadata variant="map" venue={venue} />
          <CardFooter venue={venue} />
        </div>
      </div>
    </div>
  );
}
