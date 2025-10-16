import { AtSign, ChevronDown, ChevronUp, Globe, MapPin, Phone, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { ActionButton, RichText } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { GetPublicVenuesQuery } from "~/types";

import { InfoLine } from "./InfoLine";

interface BottomCardInterface {
  venue: GetPublicVenuesQuery["venues"][number];
}

export function BottomCard({ venue }: Readonly<BottomCardInterface>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [innerHeight, setInnerHeight] = useState<null | number>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const i18n = useI18n();

  const locale = useLocale();

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

  const { address, description_en, description_uk, emails, name, phone_numbers, slug, website } = venue;

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
      <button className={`
        flex h-[40px] w-full cursor-pointer items-center justify-center
      `} onClick={toggle}>
        {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>

      <div className="h-full overflow-y-auto pt-2 pb-6" ref={cardRef}>
        <div className="mb-2 px-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{name}</h3>
            <ActionButton
              aria-label={i18n("Share this venue")}
              icon={<Share2 size={18} />}
              onClick={() => {
                const url = `${globalThis.location.origin}/map/${slug}`;
                sendToMixpanel("Clicked Share Venue (Mobile)", { slug });

                navigator.clipboard.writeText(url);
              }}
              size="sm"
              tooltipPosition="left"
            />
          </div>

          <RichText as="p">
            {((locale === "en" ? description_en : description_uk) ?? "").replaceAll("\n", "<br />")}
          </RichText>
        </div>

        <div className="mt-4 flex flex-col text-sm">
          <InfoLine icon={<Globe size={16} />} info={website} isLink tooltipText="Copy website" />
          <InfoLine icon={<AtSign size={16} />} info={emails?.join(", ")} tooltipText="Copy email" />
          <InfoLine icon={<Phone size={16} />} info={phone_numbers?.join(", ")} tooltipText="Copy phone number" />
          <InfoLine icon={<MapPin size={16} />} info={address} tooltipText="Copy address" />
        </div>
      </div>
    </div>
  );
}
