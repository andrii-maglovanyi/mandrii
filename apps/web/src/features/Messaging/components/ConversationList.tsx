import clsx from "clsx";
import { useLocale } from "next-intl";

import { AnimatedEllipsis, Separator } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { getSenderColour, getSenderInitials } from "~/lib/messaging/sender";

import type { Conversation } from "../types";

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
  selectedConversationId: null | string;
}

function formatConversationTimestamp(timestamp: null | string, locale: string) {
  if (!timestamp) return null;

  const date = new Date(timestamp);
  const today = new Date();
  const calendarDay = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  const daysAgo = Math.floor((calendarDay(today) - calendarDay(date)) / 86_400_000);
  const dateLocale = locale === "uk" ? "uk-UA" : "en-GB";

  if (daysAgo === 0) return new Intl.DateTimeFormat(dateLocale, { hour: "2-digit", minute: "2-digit" }).format(date);
  if (daysAgo > 0 && daysAgo < 7) return new Intl.DateTimeFormat(dateLocale, { weekday: "short" }).format(date);
  return new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "2-digit", year: "2-digit" }).format(date);
}

export const ConversationList = ({
  conversations,
  isLoading,
  onSelect,
  selectedConversationId,
}: ConversationListProps) => {
  const i18n = useI18n();
  const locale = useLocale();

  if (isLoading) {
    return (
      <div aria-live="polite" className="flex min-h-20 items-center justify-center">
        <AnimatedEllipsis size="md" />
      </div>
    );
  }
  if (!conversations.length) return <p className="text-on-surface/70 text-sm">{i18n("No conversations yet")}</p>;

  const renderRows = (conversationItems: Conversation[]) =>
    conversationItems.map((conversation) => {
      const name = conversation.user_name ?? i18n("Customer");
      const senderColour = getSenderColour(name);
      const lastMessageTime = formatConversationTimestamp(conversation.last_message_at, locale);
      const isArchived = Boolean(conversation.archived_at);

      return (
        <button
          className={clsx(
            "hover:bg-on-surface/5 active:bg-on-surface/10 flex min-h-14 w-full touch-manipulation items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
            selectedConversationId === conversation.id && "bg-primary/10",
            isArchived && "opacity-70",
          )}
          key={conversation.id}
          onClick={() => onSelect(conversation.id)}
          type="button"
        >
          <div
            aria-hidden="true"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-tight text-white ${senderColour.avatarClassName}`}
          >
            {getSenderInitials(name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-medium">{name}</p>
              <div className="flex shrink-0 items-center gap-2">
                {lastMessageTime && (
                  <time className="text-on-surface/60 text-xs" dateTime={conversation.last_message_at ?? undefined}>
                    {lastMessageTime}
                  </time>
                )}
                {Number(conversation.unread_count) > 0 && (
                  <span
                    aria-label={i18n("Unread messages")}
                    className="bg-secondary text-on-surface flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs"
                  >
                    {Number(conversation.unread_count) > 99 ? "99+" : conversation.unread_count}
                  </span>
                )}
              </div>
            </div>
            {conversation.last_message_deleted ? (
              <p className="text-on-surface/50 mt-0.5 truncate text-xs italic">{i18n("Deleted message")}</p>
            ) : conversation.last_message_body ? (
              <p className="text-on-surface/60 mt-0.5 truncate text-xs">{conversation.last_message_body}</p>
            ) : null}
          </div>
        </button>
      );
    });

  const activeConversations = conversations.filter((conversation) => !conversation.archived_at);
  const archivedConversations = conversations.filter((conversation) => conversation.archived_at);

  return (
    <div className="-mx-4 mt-4 mb-2 flex flex-col">
      {activeConversations.length > 0 && (
        <section>
          <Separator align="left" text={i18n("Active")} />
          {renderRows(activeConversations)}
        </section>
      )}
      {archivedConversations.length > 0 && (
        <section>
          <Separator align="left" text={i18n("Archived")} />
          {renderRows(archivedConversations)}
        </section>
      )}
    </div>
  );
};
