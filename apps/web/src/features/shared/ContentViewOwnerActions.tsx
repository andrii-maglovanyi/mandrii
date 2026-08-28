"use client";

import { MessageCircle, Settings } from "lucide-react";

import { ActionButton } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

interface ContentViewOwnerActionsProps {
  onOpenChat?: () => void;
  onOpenSettings?: () => void;
  unreadChatCount?: number;
}

/**
 * Compact actions shown in the identity row of a full venue or event view.
 * Keeping these separate from card actions prevents management controls from
 * leaking into search, map, and masonry cards.
 */
export const ContentViewOwnerActions = ({
  onOpenChat,
  onOpenSettings,
  unreadChatCount = 0,
}: ContentViewOwnerActionsProps) => {
  const i18n = useI18n();

  if (!onOpenChat && !onOpenSettings) return null;

  return (
    <div className="flex items-center gap-1">
      {onOpenChat && (
        <div className="relative">
          <ActionButton
            aria-label={i18n("Chat")}
            icon={<MessageCircle size={20} />}
            onClick={onOpenChat}
            size="sm"
            variant="ghost"
          />
          {unreadChatCount > 0 && (
            <span
              aria-label={i18n("{count} unread messages", { count: unreadChatCount })}
              className="bg-primary text-on-primary pointer-events-none absolute -top-1 -right-1 grid min-h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] leading-4 font-semibold"
            >
              {unreadChatCount > 99 ? "99+" : unreadChatCount}
            </span>
          )}
        </div>
      )}
      {onOpenSettings && (
        <ActionButton
          aria-label={i18n("Settings")}
          icon={<Settings size={20} />}
          onClick={onOpenSettings}
          variant="ghost"
        />
      )}
    </div>
  );
};
