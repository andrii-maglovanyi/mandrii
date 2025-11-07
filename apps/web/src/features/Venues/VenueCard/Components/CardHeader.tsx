import { BadgeCheck, Calendar, Crown, PenTool, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { ActionButton, Tooltip } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { shareItem } from "~/lib/share";
import { UrlHelper } from "~/lib/url-helper";
import { GetPublicVenuesQuery, Locale, Venue_Status_Enum } from "~/types";

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

  const hasEvents = Boolean(venue.events_aggregate?.aggregate?.count);

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
        text: i18n("Check out this venue on {appHost}", { appHost: UrlHelper.getHostname() }),
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
    if (venue.status === Venue_Status_Enum.Active) {
      return (
        <div className="flex items-center gap-2">
          {profileData?.role === "admin" && (
            <ActionButton
              aria-label={i18n("Manage venue")}
              className="group"
              icon={<PenTool size={18} />}
              onClick={handleManageClick}
              size="sm"
              variant="ghost"
            />
          )}
        </div>
      );
    }

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

        {hasEvents && (
          <Link
            className={`bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors`}
            href={`/venues/${venue.slug}#Events`}
            onClick={(e) => {
              e.stopPropagation();
              sendToMixpanel("Clicked Venue Events Badge", { slug: venue.slug });
            }}
          >
            <Calendar size={12} />
            <span>{i18n("Events")}</span>
          </Link>
        )}
      </div>

      {renderVenueControls()}
    </div>
  );
};
