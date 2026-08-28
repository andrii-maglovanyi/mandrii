import { PenTool, Share2, UserStar } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

import { ActionButton, Tooltip } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { constants } from "~/lib/constants";
import { getIcon } from "~/lib/icons/icons";
import { sendToMixpanel } from "~/lib/mixpanel";
import { shareItem } from "~/lib/share";
import { Event_Status_Enum, GetPublicEventsQuery, Locale } from "~/types";

interface CardHeaderProps {
  event: GetPublicEventsQuery["events"][number];
  hideUntilHover?: boolean;
  /** Full views can add actions without exposing them on search and map cards. */
  viewActions?: ReactNode;
  /** Full views use their owner action area for settings instead of a profile shortcut. */
  hideCurrentOwnerProfileAction?: boolean;
  showManageAction?: boolean;
}

export const CardHeader = ({
  event,
  hideUntilHover = false,
  hideCurrentOwnerProfileAction = false,
  showManageAction = true,
  viewActions,
}: CardHeaderProps) => {
  const i18n = useI18n();
  const locale = useLocale() as Locale;
  const { data: profileData } = useUser();
  const router = useRouter();
  const { showSuccess } = useNotifications();
  const { iconName, label } = constants.eventTypes[event.type as keyof typeof constants.eventTypes];
  const canShare = [Event_Status_Enum.Active, Event_Status_Enum.Archived, Event_Status_Enum.Completed].includes(
    event.status,
  );

  const handleShareClick = async (e: React.MouseEvent) => {
    const title = locale === "uk" ? event.title_uk : event.title_en;

    shareItem(e, {
      cb: () => {
        showSuccess(i18n("Copied event URL"));
      },
      item: {
        text: `${event.type} • ${title} • ${event.city}, ${event.country}`,
        title: title,
        url: `${window.location.origin}/events/${event.slug}`,
      },
    });
  };

  const handleManageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    sendToMixpanel("Clicked Manage Event", { slug: event.slug });

    router.push(`/user-directory/events/${event.slug}`);
  };

  const renderEventControls = () => {
    // Check if user can manage this event:
    // 1. Admin users can manage any event
    // 2. Owner can manage (event.owner_id matches user)
    // 3. Creator can manage if no owner claimed it (event.user_id matches user AND owner_id is null)
    const canManage =
      profileData &&
      (profileData.role === "admin" ||
        profileData.id === event.owner_id ||
        (profileData.id === event.user_id && !event.owner_id));
    // Keep the existing, stricter card-level rule for active events, while
    // still rendering share, owner, and view-specific controls for them.
    const canShowManageAction = event.status === Event_Status_Enum.Active ? profileData?.role === "admin" : canManage;

    return (
      <div className="flex items-center gap-1">
        {canShowManageAction && showManageAction && (
          <ActionButton
            aria-label={i18n("Manage event")}
            className="group"
            icon={<PenTool className={hideUntilHover ? `hidden group-hover/card:flex` : ""} size={18} />}
            onClick={handleManageClick}
            size="sm"
            variant="ghost"
          />
        )}
        {canShare && (
          <ActionButton
            aria-label={i18n("Share this event")}
            className="group"
            icon={<Share2 className={hideUntilHover ? `hidden group-hover/card:flex` : ""} size={20} />}
            onClick={handleShareClick}
            size="sm"
            variant="ghost"
          />
        )}
        {viewActions}
        {Boolean(event.owner_id) && !(profileData?.id === event.owner_id && hideCurrentOwnerProfileAction) && (
          <ActionButton
            aria-label={profileData?.id === event.owner_id ? i18n("You own this event") : i18n("Verified owner")}
            className="cursor-pointer"
            icon={<UserStar size={20} />}
            onClick={(eventClick) => {
              eventClick.preventDefault();
              eventClick.stopPropagation();
              router.push(`/users/${event.owner_id}`);
            }}
            type="button"
            variant="ghost"
          />
        )}
      </div>
    );
  };

  return (
    <div className="mb-2 flex h-8 justify-between gap-2">
      <div className={`text-on-surface flex h-full min-w-0 flex-1 items-center gap-1 text-sm`}>
        {getIcon(iconName, { size: 18 })}
        <span className="block min-w-0 flex-1 truncate">{label[locale]}</span>

        {renderEventControls()}
      </div>
    </div>
  );
};
