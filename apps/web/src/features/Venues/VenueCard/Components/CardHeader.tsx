import { BadgeCheck, Crown, PenTool, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { ActionButton, Tooltip } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { GetPublicVenuesQuery, Locale } from "~/types";

import { ClaimOwnershipDialog } from "../../ClaimOwnershipDialog";

interface CardHeaderProps {
  hideUntilHover?: boolean;
  venue: GetPublicVenuesQuery["venues"][number];
}

export const CardHeader = ({ hideUntilHover = false, venue }: CardHeaderProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { data: profileData } = useUser();
  const { openCustomDialog } = useDialog();
  const router = useRouter();
  const { showSuccess } = useNotifications();
  const { iconName, label } = constants.categories[venue.category as keyof typeof constants.categories];

  const handleOwnerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sendToMixpanel("Clicked Claim Ownership", { slug: venue.slug });

    openCustomDialog({
      children: <ClaimOwnershipDialog venue={venue} />,
    });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${globalThis.location.origin}/venues/${venue.slug}`;
    sendToMixpanel("Clicked Share Venue", { slug: venue.slug });
    navigator.clipboard.writeText(url);

    showSuccess(i18n("Copied venue URL"));
  };

  const handleManageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sendToMixpanel("Clicked Manage Venue", { slug: venue.slug });

    router.push(`/user-directory/venues/${venue.slug}`);
  };

  return (
    <div className="mb-2 flex h-8 justify-between">
      <div className={`text-on-surface flex h-full items-center gap-1 text-sm`}>
        {getIcon(iconName, { className: "flex-shrink-0", size: 16 })}
        {label[locale]}
      </div>

      <div className="flex items-center gap-1">
        {profileData && (profileData.id === venue.owner_id || profileData.id === venue.user_id) ? (
          <ActionButton
            aria-label={i18n("Edit venue")}
            className="group"
            icon={<PenTool className={hideUntilHover ? `hidden group-hover/card:flex` : ""} size={18} />}
            onClick={handleManageClick}
            size="sm"
            variant="ghost"
          />
        ) : (
          <div className={hideUntilHover ? `hidden group-hover/card:flex` : ""}>
            <ActionButton
              aria-label={i18n("I own this venue")}
              className="group"
              icon={
                <Crown
                  className={`stroke-amber-600 group-hover:fill-amber-600 dark:stroke-amber-400 dark:group-hover:fill-amber-400`}
                  size={18}
                />
              }
              onClick={handleOwnerClick}
              size="sm"
              variant="ghost"
            />
          </div>
        )}
        <ActionButton
          aria-label={i18n("Share this venue")}
          className="group"
          icon={<Share2 className={hideUntilHover ? `hidden group-hover/card:flex` : ""} size={18} />}
          onClick={handleShareClick}
          size="sm"
          variant="ghost"
        />
        {venue.owner_id ? (
          <Tooltip label={i18n("Verified venue with owner")} position="left">
            <BadgeCheck className={`stroke-green-600 dark:stroke-green-400`} />
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
};
