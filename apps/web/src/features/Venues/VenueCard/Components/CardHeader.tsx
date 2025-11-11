import { clsx } from "clsx";
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
import { shareItem } from "~/lib/share";
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

  const handleShareClick = async (e: React.MouseEvent) =>
    shareItem(e, {
      cb: () => {
        showSuccess(i18n("Copied venue URL"));
      },
      item: {
        text: `${venue.category} • ${venue.name} • ${venue.city}, ${venue.country}`,
        title: venue.name,
        url: `${window.location.origin}/venues/${venue.slug}`,
      },
    });

  const handleManageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sendToMixpanel("Clicked Manage Venue", { slug: venue.slug });

    router.push(`/user-directory/venues/${venue.slug}`);
  };

  const renderVenueControls = () => {
    // Check if user can manage this venue:
    // 1. Admin users can manage any venue
    // 2. Owner can manage (venue.owner_id matches user)
    // 3. Creator can manage if no owner claimed it (venue.user_id matches user AND owner_id is null)
    const canManage =
      profileData &&
      (profileData.role === "admin" ||
        profileData.id === venue.owner_id ||
        (profileData.id === venue.user_id && !venue.owner_id));

    return (
      <div className="flex items-center gap-1">
        {canManage ? (
          <ActionButton
            aria-label={i18n("Manage venue")}
            className="group"
            icon={<PenTool className={hideUntilHover ? `hidden group-hover/card:flex` : ""} size={18} />}
            onClick={handleManageClick}
            size="sm"
            variant="ghost"
          />
        ) : (
          <div className={clsx(hideUntilHover && "hidden", `group-hover/card:flex`)}>
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
        {Boolean(venue.owner_id) && (
          <Tooltip label={i18n("Verified venue")} position="left">
            <BadgeCheck className={`stroke-green-600 dark:stroke-green-400`} />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="mb-2 flex h-8 justify-between gap-2">
      <div className={`text-on-surface flex h-full min-w-0 flex-1 items-center gap-1 text-sm`}>
        {getIcon(iconName, { size: 18 })}
        <span className="block min-w-0 flex-1 truncate">{label[locale]}</span>
      </div>

      {renderVenueControls()}
    </div>
  );
};
