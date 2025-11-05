import { BadgeCheck, PenTool, Share2 } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { ActionButton, Tooltip } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { shareItem } from "~/lib/share";
import { UrlHelper } from "~/lib/url-helper";
import { Event_Status_Enum, GetPublicEventsQuery, Locale } from "~/types";

interface CardHeaderProps {
  event: GetPublicEventsQuery["events"][number];
  hideUntilHover?: boolean;
}

export const CardHeader = ({ event, hideUntilHover = false }: CardHeaderProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { data: profileData } = useUser();
  const router = useRouter();
  const { showSuccess } = useNotifications();
  const { iconName, label } = constants.eventTypes[event.type as keyof typeof constants.eventTypes];

  const handleShareClick = async (e: React.MouseEvent) =>
    shareItem(e, {
      cb: () => {
        showSuccess(i18n("Copied event URL"));
      },
      item: {
        text: i18n("Check out this event on {appHost}", { appHost: UrlHelper.getHostname() }),
        title: event.title,
        url: `${window.location.origin}/events/${event.slug}`,
      },
    });

  const handleManageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sendToMixpanel("Clicked Manage Event", { slug: event.slug });

    router.push(`/user-directory/events/${event.slug}`);
  };

  const renderEventControls = () => {
    if (event.status === Event_Status_Enum.Active) {
      return (
        <div className="flex items-center gap-2">
          {profileData?.role === "admin" && (
            <ActionButton
              aria-label={i18n("Manage event")}
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

    // Check if user can manage this event:
    // 1. Admin users can manage any event
    // 2. Owner can manage (event.owner_id matches user)
    // 3. Creator can manage if no owner claimed it (event.user_id matches user AND owner_id is null)
    const canManage =
      profileData &&
      (profileData.role === "admin" ||
        profileData.id === event.owner_id ||
        (profileData.id === event.user_id && !event.owner_id));

    return (
      <div className="flex items-center gap-1">
        {canManage && (
          <ActionButton
            aria-label={i18n("Manage event")}
            className="group"
            icon={<PenTool className={hideUntilHover ? `
              hidden
              group-hover/card:flex
            ` : ""} size={18} />}
            onClick={handleManageClick}
            size="sm"
            variant="ghost"
          />
        )}
        <ActionButton
          aria-label={i18n("Share this event")}
          className="group"
          icon={<Share2 className={hideUntilHover ? `
            hidden
            group-hover/card:flex
          ` : ""} size={18} />}
          onClick={handleShareClick}
          size="sm"
          variant="ghost"
        />
        {Boolean(event.owner_id) && (
          <Tooltip label={i18n("Verified event")} position="left">
            <BadgeCheck className={`
              stroke-green-600
              dark:stroke-green-400
            `} />
          </Tooltip>
        )}
      </div>
    );
  };

  return (
    <div className="mb-2 flex h-8 justify-between gap-2">
      <div className={`
        flex h-full min-w-0 flex-1 items-center gap-1 text-sm text-on-surface
      `}>
        {getIcon(iconName, { size: 18 })}
        <span className="block min-w-0 flex-1 truncate">{label[locale]}</span>

        {renderEventControls()}
      </div>
    </div>
  );
};
