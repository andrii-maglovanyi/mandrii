import clsx from "clsx";
import { AtSign, Crown, Globe, MapPin, PenTool, Phone, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

import { ActionButton, RichText } from "~/components/ui"; // ensure Button component exists
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { sendToMixpanel } from "~/lib/mixpanel";
import { GetPublicVenuesQuery } from "~/types";
import { UUID } from "~/types/uuid";

import { ClaimOwnershipDialog } from "./ClaimOwnershipDialog";
import { InfoLine } from "./InfoLine";

interface ListCardProps {
  onClick: () => void;
  selectedId: null | UUID;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const ListCard = ({ onClick, selectedId, venue }: ListCardProps) => {
  const i18n = useI18n();
  const { address, description_en, description_uk, emails, id, name, phone_numbers, slug, website } = venue;
  const { openCustomDialog } = useDialog();
  const { data: profileData } = useSession();
  const { showSuccess } = useNotifications();

  const locale = useLocale();

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const url = `${window.location.origin}/map/${slug}`;
    sendToMixpanel("Clicked Share Venue", { slug });
    navigator.clipboard.writeText(url);

    showSuccess(i18n("Copied venue URL"));
  };

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    openCustomDialog({
      children: <ClaimOwnershipDialog venue={venue} />,
    });
  };

  return (
    <div className="flex flex-col pt-[2px] pb-2" id={String(id)} key={id.toString()}>
      <section
        aria-label={`Venue: ${name}`}
        className={clsx(
          `
            flex w-full overflow-x-hidden rounded-md border-2 bg-on-surface/5
            transition-colors duration-200
            hover:bg-on-surface/10
            lg:text-base
          `,
          selectedId === id ? "border-on-surface" : "border-transparent",
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        tabIndex={0}
      >
        <div className="flex w-full flex-col">
          <div className="mt-1.5 mr-1.5 flex justify-end space-x-2">
            {profileData && profileData.user.id === venue.owner_id ? (
              <ActionButton
                aria-label={i18n("Manage your venue")}
                icon={<PenTool size={18} />}
                onClick={handleOwnerClick}
                size="sm"
              />
            ) : (
              <ActionButton
                aria-label={i18n("Are you an owner?")}
                className="group"
                icon={<Crown className={`
                  stroke-amber-500
                  group-hover:fill-amber-500
                `} size={18} />}
                onClick={handleOwnerClick}
                size="sm"
              />
            )}
            <ActionButton
              aria-label={i18n("Share this venue")}
              className="group"
              icon={<Share2 className="group-hover:fill-neutral" size={18} />}
              onClick={handleShareClick}
              size="sm"
            />
          </div>

          <div className="mb-2 px-4">
            <h3 className="text-lg font-semibold">{name}</h3>

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
      </section>
    </div>
  );
};
