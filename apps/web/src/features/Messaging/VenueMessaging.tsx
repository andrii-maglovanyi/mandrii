"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronRight,
  Maximize2,
  MessageCircle,
  MessagesSquare,
  Minimize2,
  Pencil,
  RefreshCw,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { ActionButton, AnimatedEllipsis, Button, RichText, SectionCard, Separator, Tooltip } from "~/components/ui";
import { PushNotifications } from "~/components/layout/PushNotifications/PushNotifications";
import { useDialog } from "~/contexts/DialogContext";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { getSenderColour } from "~/lib/messaging/sender";
import { UserProfilePreview } from "~/features/UserProfile/UserProfilePreview";
import {
  useConversationMessagingEventsSubscription,
  useConversationReactionEventsSubscription,
  useMessagingUnreadEventsSubscription,
  useVenueMessagingEventsSubscription,
} from "~/types/graphql.generated";
import { UUID } from "~/types/uuid";

import { Conversation, ConversationMessage } from "./types";
import { ConversationList } from "./components/ConversationList";
import { MessageActionsMenu, type MessageActionsMenuState } from "./components/MessageActionsMenu";
import { MessageComposer } from "./components/MessageComposer";
import { ParticipantAvatar } from "./components/ParticipantAvatar";
import { VenuePreview } from "./components/VenuePreview";
import { clsx } from "clsx";

type MessagingRole = "OWNER" | "USER";
type MessagingUpdateDetail = {
  conversationIds: string[];
  source: "conversation" | "inbox" | "venue";
  venueId?: string;
};

type MessagePage = {
  hasMore: boolean;
  messages: ConversationMessage[];
  nextCursor: null | string;
};

type ReviewTelegramDelivery = {
  attempts: number;
  delivered_at: null | string;
  last_error: null | string;
  next_attempt_at: string;
  status: "DELIVERED" | "FAILED" | "PENDING" | "PROCESSING";
};

const TELEGRAM_LOGO = "/static/telegram.svg";

function mergeMessages(...messageLists: ConversationMessage[][]) {
  const messagesById = new Map<string, ConversationMessage>();
  messageLists.flat().forEach((message) => messagesById.set(message.id, message));
  return [...messagesById.values()].sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime() || left.id.localeCompare(right.id),
  );
}

function sortConversations(conversations: Conversation[]) {
  return [...conversations].sort((left, right) => {
    if (Boolean(left.archived_at) !== Boolean(right.archived_at)) {
      return Number(Boolean(left.archived_at)) - Number(Boolean(right.archived_at));
    }
    const leftActivity = Date.parse(left.last_message_at ?? left.created_at);
    const rightActivity = Date.parse(right.last_message_at ?? right.created_at);
    return rightActivity - leftActivity || right.id.localeCompare(left.id);
  });
}

interface VenueMessagingProps {
  hasOwner: boolean;
  inbox?: boolean;
  initialRole: MessagingRole | null;
  initialTelegramLinked: boolean | null;
  initialTelegramReviewNotificationsEnabled?: boolean | null;
  venueId?: UUID;
  venueName?: string;
}

export const VenueMessaging = ({
  hasOwner,
  inbox = false,
  initialRole,
  initialTelegramLinked,
  initialTelegramReviewNotificationsEnabled = null,
  venueId,
  venueName,
}: VenueMessagingProps) => {
  const { data: currentUser, isAuthenticated, isLoading: isUserLoading } = useUser();
  const i18n = useI18n();
  const { openConfirmDialog, openCustomDialog } = useDialog();
  const locale = useLocale();
  const requestedConversationId = useSearchParams().get("conversation");
  const [role, setRole] = useState<MessagingRole | null>(initialRole);
  const [telegramLinked, setTelegramLinked] = useState<boolean | null>(initialTelegramLinked);
  const [telegramReviewNotificationsEnabled, setTelegramReviewNotificationsEnabled] = useState<boolean | null>(
    initialTelegramReviewNotificationsEnabled,
  );
  const [reviewTelegramDelivery, setReviewTelegramDelivery] = useState<null | ReviewTelegramDelivery>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [nextMessageCursor, setNextMessageCursor] = useState<null | string>(null);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(Boolean(initialRole));
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [isConversationMenuOpen, setIsConversationMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<ConversationMessage | null>(null);
  const [messageBeingEdited, setMessageBeingEdited] = useState<ConversationMessage | null>(null);
  const [messageError, setMessageError] = useState("");
  const [isArchivingConversation, setIsArchivingConversation] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [retryingTelegramMessageId, setRetryingTelegramMessageId] = useState<string | null>(null);
  const [isUnlinkingTelegram, setIsUnlinkingTelegram] = useState(false);
  const [isSavingTelegramReviewNotifications, setIsSavingTelegramReviewNotifications] = useState(false);
  const [isRetryingReviewTelegramDelivery, setIsRetryingReviewTelegramDelivery] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [reactionPicker, setReactionPicker] = useState<MessageActionsMenuState | null>(null);
  const selectedConversationIdRef = useRef<null | string>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldStickToLatestRef = useRef(true);
  const scrollRestoreRef = useRef<null | { height: number; top: number }>(null);
  const lastReadSyncRef = useRef("");
  const touchStartRef = useRef<null | { x: number; y: number }>(null);
  const conversationMenuCloseButtonRef = useRef<HTMLButtonElement>(null);
  const lastConversationEventRef = useRef<string | null>(null);
  const lastReactionEventRef = useRef<string | null>(null);
  const lastVenueEventRef = useRef<string | null>(null);
  const lastInboxEventRef = useRef<string | null>(null);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const refreshReviewTelegramDelivery = useCallback(async () => {
    if (!venueId || role !== "OWNER") return;
    const response = await fetch(`/api/telegram/review-notifications?venueId=${encodeURIComponent(venueId)}`);
    if (!response.ok) return;
    const data = (await response.json()) as { delivery: null | ReviewTelegramDelivery };
    setReviewTelegramDelivery(data.delivery);
  }, [role, venueId]);

  useEffect(() => {
    void refreshReviewTelegramDelivery();
  }, [refreshReviewTelegramDelivery]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const url = new URL(window.location.href);
    if (url.searchParams.get("conversation") === selectedConversationId) return;

    url.searchParams.set("conversation", selectedConversationId);
    if (!inbox) url.hash = "Messaging";
    window.history.replaceState(window.history.state, "", url);
  }, [inbox, selectedConversationId]);
  const resizeComposer = useCallback(() => {
    const composer = composerRef.current;
    if (!composer) return;

    composer.style.height = "auto";
    const maxHeight = Math.min(240, window.innerHeight * 0.35);
    const minimumHeight = 72;
    composer.style.height = `${Math.max(minimumHeight, Math.min(composer.scrollHeight, maxHeight))}px`;
    composer.style.overflowY = composer.scrollHeight > maxHeight ? "auto" : "hidden";
  }, []);
  const { data: messagingEvents } = useVenueMessagingEventsSubscription({
    skip: inbox || !hasOwner || !isAuthenticated,
    variables: { venueId: venueId! },
  });
  const { data: inboxEvents } = useMessagingUnreadEventsSubscription({
    skip: !inbox || !isAuthenticated,
  });
  const { data: conversationMessagingEvents } = useConversationMessagingEventsSubscription({
    skip: !hasOwner || !isAuthenticated || !selectedConversationId || messages.length === 0,
    variables: { messageIds: messages.map((message) => message.id as UUID) },
  });
  const { data: reactionEvents } = useConversationReactionEventsSubscription({
    skip: !hasOwner || !isAuthenticated || !selectedConversationId || messages.length === 0,
    variables: { messageIds: messages.map((message) => message.id as UUID) },
  });

  useEffect(() => {
    if (!messagingEvents) return;

    const conversationIds = new Set<string>();
    messagingEvents.messages.forEach((message) => conversationIds.add(message.conversation_id));
    const signature = `${venueId}:${messagingEvents.messages
      .map(
        (message) =>
          `${message.conversation_id}:${message.id}:${message.deleted_at ?? ""}:${message.telegram_delivered_at ?? ""}:${message.body}`,
      )
      .join("|")}`;
    if (lastVenueEventRef.current === null || !lastVenueEventRef.current.startsWith(`${venueId}:`)) {
      lastVenueEventRef.current = signature;
      return;
    }
    if (lastVenueEventRef.current === signature) return;
    lastVenueEventRef.current = signature;
    if (conversationIds.size === 0) return;

    window.dispatchEvent(
      new CustomEvent<MessagingUpdateDetail>("venue-messaging-update", {
        detail: { conversationIds: [...conversationIds], source: "venue", venueId },
      }),
    );
  }, [messagingEvents, venueId]);

  useEffect(() => {
    if (!inboxEvents) return;

    const signature = inboxEvents.messages
      .map((message) => `${message.id}:${message.deleted_at ?? ""}:${message.edited_at ?? ""}:${message.body}`)
      .join("|");
    if (lastInboxEventRef.current === null) {
      lastInboxEventRef.current = signature;
      return;
    }
    if (lastInboxEventRef.current === signature) return;
    lastInboxEventRef.current = signature;

    window.dispatchEvent(
      new CustomEvent<MessagingUpdateDetail>("venue-messaging-update", {
        detail: { conversationIds: inboxEvents.messages.map((message) => message.conversation_id), source: "inbox" },
      }),
    );
  }, [inboxEvents]);

  useEffect(() => {
    if (!conversationMessagingEvents || !selectedConversationId) return;
    const signature = `${selectedConversationId}:${conversationMessagingEvents.messages
      .map(
        (message) =>
          `${message.conversation_id}:${message.id}:${message.deleted_at ?? ""}:${message.telegram_delivered_at ?? ""}:${message.body}`,
      )
      .join("|")}`;
    if (
      lastConversationEventRef.current === null ||
      !lastConversationEventRef.current.startsWith(`${selectedConversationId}:`)
    ) {
      lastConversationEventRef.current = signature;
      return;
    }
    if (lastConversationEventRef.current === signature) return;
    lastConversationEventRef.current = signature;

    window.dispatchEvent(
      new CustomEvent<MessagingUpdateDetail>("venue-messaging-update", {
        detail: { conversationIds: [selectedConversationId], source: "conversation", venueId },
      }),
    );
  }, [conversationMessagingEvents, selectedConversationId, venueId]);

  useEffect(() => {
    if (!reactionEvents || !selectedConversationId) return;

    const signature = `${selectedConversationId}:${reactionEvents.message_reactions
      .map((reaction) => `${reaction.message_id}:${reaction.emoji}:${reaction.user_id}:${reaction.created_at}`)
      .join("|")}`;
    if (
      lastReactionEventRef.current === null ||
      !lastReactionEventRef.current.startsWith(`${selectedConversationId}:`)
    ) {
      lastReactionEventRef.current = signature;
      return;
    }
    if (lastReactionEventRef.current === signature) return;
    lastReactionEventRef.current = signature;

    window.dispatchEvent(
      new CustomEvent<MessagingUpdateDetail>("venue-messaging-update", {
        detail: { conversationIds: [selectedConversationId], source: "conversation", venueId },
      }),
    );
  }, [reactionEvents, selectedConversationId, venueId]);

  useEffect(() => {
    if ((!hasOwner && !inbox) || (!isAuthenticated && !isUserLoading)) {
      setRole(null);
      setTelegramLinked(null);
      setConversations([]);
      setSelectedConversationId(null);
      selectedConversationIdRef.current = null;
      setMessages([]);
      setIsLoadingConversations(false);
      setIsLoadingMessages(false);
      return;
    }
    if (!isAuthenticated) return;
    let isCurrent = true;
    let hasLoadedInitially = false;
    let activeRequest: AbortController | null = null;
    const load = async () => {
      const isInitialLoad = !hasLoadedInitially;
      if (isInitialLoad) setIsLoadingConversations(true);
      if (document.hidden) {
        if (isInitialLoad && isCurrent) setIsLoadingConversations(false);
        return;
      }
      const abortController = new AbortController();
      const requestTimeout = window.setTimeout(() => abortController.abort(), 15_000);
      activeRequest = abortController;
      try {
        const response = await fetch(
          inbox ? "/api/conversations?inbox=true" : `/api/conversations?venueId=${encodeURIComponent(venueId ?? "")}`,
          {
            cache: "no-store",
            signal: abortController.signal,
          },
        );
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          if (response.status === 403 && isCurrent) setRole(null);
          else if (isCurrent) setMessageError(data?.error || i18n("Unable to load messages"));
          return;
        }
        const data = (await response.json()) as {
          conversations: Conversation[];
          role: MessagingRole;
          telegramLinked: boolean;
        };
        if (!isCurrent) return;
        setRole(data.role);
        setTelegramLinked(data.telegramLinked);
        const nextConversationId =
          selectedConversationIdRef.current ||
          data.conversations.find((conversation) => conversation.id === requestedConversationId)?.id ||
          data.conversations[0]?.id ||
          null;
        selectedConversationIdRef.current = nextConversationId;
        setConversations(
          sortConversations(data.conversations).map((conversation) =>
            conversation.id === nextConversationId ? { ...conversation, unread_count: 0 } : conversation,
          ),
        );
        if (isInitialLoad) setIsLoadingMessages(data.conversations.length > 0);
        setSelectedConversationId(nextConversationId);
      } catch {
        if (isCurrent && abortController.signal.aborted) {
          setMessageError(i18n("Messages are taking too long to load. Please try again."));
        } else if (isCurrent) {
          setMessageError(i18n("Unable to load messages"));
        }
      } finally {
        window.clearTimeout(requestTimeout);
        if (activeRequest === abortController) activeRequest = null;
        if (isInitialLoad && isCurrent) {
          hasLoadedInitially = true;
          window.requestAnimationFrame(() => {
            if (isCurrent) setIsLoadingConversations(false);
          });
        }
      }
    };
    void load();
    const onMessagingUpdate = (event: Event) => {
      const detail = (event as CustomEvent<MessagingUpdateDetail>).detail;
      if ((inbox && detail?.source === "inbox") || detail?.venueId === venueId) void load();
    };
    const onVisibilityChange = () => {
      if (!document.hidden) void load();
    };
    window.addEventListener("venue-messaging-update", onMessagingUpdate);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      isCurrent = false;
      activeRequest?.abort();
      window.removeEventListener("venue-messaging-update", onMessagingUpdate);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [hasOwner, inbox, isAuthenticated, isUserLoading, requestedConversationId, venueId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setNextMessageCursor(null);
      setHasOlderMessages(false);
      setIsLoadingMessages(false);
      return;
    }
    shouldStickToLatestRef.current = true;
    setShowJumpToLatest(false);
    let isCurrent = true;
    let isInitialLoad = true;
    let activeRequest: AbortController | null = null;
    setIsLoadingMessages(true);
    const load = async () => {
      const isInitialRequest = isInitialLoad;
      const abortController = new AbortController();
      const requestTimeout = window.setTimeout(() => abortController.abort(), 15_000);
      activeRequest = abortController;
      if (document.hidden) {
        window.clearTimeout(requestTimeout);
        if (isInitialRequest && isCurrent) setIsLoadingMessages(false);
        return;
      }
      try {
        const response = await fetch(`/api/conversations/${selectedConversationId}/messages?limit=50`, {
          cache: "no-store",
          signal: abortController.signal,
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          if (isCurrent) setMessageError(data?.error || i18n("Unable to load messages"));
          return;
        }
        const data = (await response.json()) as MessagePage;
        if (!isCurrent) return;
        if (isInitialRequest) {
          setMessages(data.messages);
          setNextMessageCursor(data.nextCursor);
          setHasOlderMessages(data.hasMore);
          isInitialLoad = false;
        } else {
          setMessages((current) => mergeMessages(current, data.messages));
        }
        const lastMessageId = data.messages.at(-1)?.id ?? "";
        const readSyncKey = `${selectedConversationId}:${data.messages.length}:${lastMessageId}`;
        if (lastReadSyncRef.current !== readSyncKey) {
          lastReadSyncRef.current = readSyncKey;
          setConversations((current) =>
            current.map((conversation) =>
              conversation.id === selectedConversationId ? { ...conversation, unread_count: 0 } : conversation,
            ),
          );
          window.dispatchEvent(
            new CustomEvent<{ conversationId: string }>("messages-read", {
              detail: { conversationId: selectedConversationId },
            }),
          );
        }
      } catch {
        if (isCurrent && abortController.signal.aborted) {
          setMessageError(i18n("Messages are taking too long to load. Please try again."));
        } else if (isCurrent) {
          setMessages([]);
          setMessageError(i18n("Unable to load messages"));
        }
      } finally {
        window.clearTimeout(requestTimeout);
        if (activeRequest === abortController) activeRequest = null;
        if (isInitialRequest && isCurrent) setIsLoadingMessages(false);
      }
    };
    void load();
    const onMessagingUpdate = (event: Event) => {
      const detail = (event as CustomEvent<MessagingUpdateDetail>).detail;
      if (detail?.conversationIds.includes(selectedConversationId)) void load();
    };
    const onVisibilityChange = () => {
      if (!document.hidden) void load();
    };
    window.addEventListener("venue-messaging-update", onMessagingUpdate);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      isCurrent = false;
      activeRequest?.abort();
      window.removeEventListener("venue-messaging-update", onMessagingUpdate);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [selectedConversationId]);

  useLayoutEffect(() => {
    if (isLoadingMessages) return;

    const list = messageListRef.current;
    const scrollRestore = scrollRestoreRef.current;
    if (list && scrollRestore) {
      list.scrollTop = list.scrollHeight - scrollRestore.height + scrollRestore.top;
      scrollRestoreRef.current = null;
      return;
    }
    if (list && shouldStickToLatestRef.current) {
      list.scrollTop = list.scrollHeight;
      setShowJumpToLatest(false);
    }
  }, [isLoadingMessages, messages, selectedConversationId]);

  useLayoutEffect(() => {
    resizeComposer();
    const frame = window.requestAnimationFrame(resizeComposer);
    return () => window.cancelAnimationFrame(frame);
  }, [isLoadingMessages, isUserLoading, messageBody, resizeComposer, role]);

  useEffect(() => {
    window.addEventListener("resize", resizeComposer);
    return () => window.removeEventListener("resize", resizeComposer);
  }, [resizeComposer]);

  useEffect(() => {
    if (!reactionPicker) return;
    const close = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-message-actions]"))
        setReactionPicker(null);
    };
    const escape = (event: KeyboardEvent) => event.key === "Escape" && setReactionPicker(null);
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", escape);
    };
  }, [reactionPicker]);

  useEffect(() => {
    if (!isConversationMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsConversationMenuOpen(false);
    };
    const desktopBreakpoint = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktopBreakpoint.matches) setIsConversationMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    desktopBreakpoint.addEventListener("change", closeOnDesktop);
    window.requestAnimationFrame(() => conversationMenuCloseButtonRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      desktopBreakpoint.removeEventListener("change", closeOnDesktop);
    };
  }, [isConversationMenuOpen]);

  useEffect(() => {
    if (!isExpanded) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isExpanded]);

  if (isUserLoading) {
    return (
      <div aria-live="polite" className="flex min-h-32 items-center justify-center">
        <AnimatedEllipsis size="md" />
      </div>
    );
  }

  if (!isAuthenticated || !role) return null;

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId);
  const activeRole = inbox ? (selectedConversation?.role ?? "USER") : role;
  const activeVenueId = inbox ? selectedConversation?.venue_id : venueId;
  const activeVenueName = inbox ? selectedConversation?.venue_name : venueName;
  const senderName = (senderType: ConversationMessage["sender_type"]) => {
    if (senderType === "VENUE") return activeVenueName || i18n("Venue");
    if (activeRole === "OWNER") return selectedConversation?.user_name || i18n("Customer");
    if (inbox) return currentUser?.name || i18n("You");
    return selectedConversation?.user_name || i18n("Customer");
  };
  const openUserProfilePreview = (userId: string, name: string) => {
    void openCustomDialog({
      children: <UserProfilePreview fallbackName={name} userId={userId} />,
      title: i18n("Profile"),
    });
  };
  const openVenuePreview = () => {
    if (!selectedConversation?.venue_slug) return;

    void openCustomDialog({
      children: (
        <VenuePreview
          category={selectedConversation.venue_category}
          city={selectedConversation.venue_city}
          country={selectedConversation.venue_country}
          image={selectedConversation.avatar_image}
          name={activeVenueName || i18n("Venue")}
          slug={selectedConversation.venue_slug}
        />
      ),
      title: i18n("Venue"),
    });
  };
  const openCounterpart = () => {
    if (activeRole === "USER" && selectedConversation?.venue_slug) {
      openVenuePreview();
      return;
    }

    if (selectedConversation?.profile_user_id) {
      openUserProfilePreview(selectedConversation.profile_user_id, selectedConversation.user_name || i18n("Customer"));
    }
  };
  const canOpenCounterpart =
    activeRole === "USER"
      ? inbox && Boolean(selectedConversation?.venue_slug)
      : Boolean(selectedConversation?.profile_user_id);
  const counterpartLabel =
    activeRole === "USER"
      ? i18n("View venue {name}", { name: activeVenueName || i18n("Venue") })
      : i18n("View profile for {name}", { name: selectedConversation?.user_name || i18n("Customer") });
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", {
      ...(date.toDateString() === new Date().toDateString() ? {} : { day: "numeric", month: "short" }),
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  const formatDay = (timestamp: string) =>
    new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(timestamp));
  const canDeleteMessage = (message: ConversationMessage) =>
    (activeRole === "OWNER" && message.sender_type === "VENUE") ||
    (activeRole === "USER" && message.sender_type === "USER");
  const canEditMessage = (message: ConversationMessage) => canDeleteMessage(message) && message.editable !== false;
  const openActions = (message: ConversationMessage, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const gap = 12;
    const emojiPickerHeight = 56;
    const emojiPickerWidth = 304;
    const actionMenuHeight = 96 + (canEditMessage(message) ? 48 : 0) + (canDeleteMessage(message) ? 48 : 0);
    const viewportPadding = 8;
    const canFitAbove = rect.top - gap - emojiPickerHeight >= viewportPadding;
    const canFitBelow = rect.bottom + gap + actionMenuHeight <= window.innerHeight - viewportPadding;
    const canFitTogetherBelow =
      rect.bottom + gap + emojiPickerHeight + gap + actionMenuHeight <= window.innerHeight - viewportPadding;
    const canFitTogetherAbove = rect.top - gap - actionMenuHeight - gap - emojiPickerHeight >= viewportPadding;

    let emojisTop: number;
    let actionsTop: number;

    if (canFitAbove && canFitBelow) {
      // Preferred: reactions frame the message from above, actions sit below it.
      emojisTop = rect.top - gap - emojiPickerHeight;
      actionsTop = rect.bottom + gap;
    } else if (canFitTogetherBelow) {
      emojisTop = rect.bottom + gap;
      actionsTop = emojisTop + emojiPickerHeight + gap;
    } else if (canFitTogetherAbove) {
      actionsTop = rect.top - gap - actionMenuHeight;
      emojisTop = actionsTop - gap - emojiPickerHeight;
    } else {
      // Very small viewports cannot fit both menus without overlap. Keep them on
      // the side with more space and within the viewport as far as possible.
      const combinedHeight = emojiPickerHeight + gap + actionMenuHeight;
      const maximumStart = Math.max(viewportPadding, window.innerHeight - combinedHeight - viewportPadding);
      if (window.innerHeight - rect.bottom >= rect.top) {
        emojisTop = Math.max(viewportPadding, Math.min(rect.bottom + gap, maximumStart));
        actionsTop = emojisTop + emojiPickerHeight + gap;
      } else {
        emojisTop = Math.max(viewportPadding, Math.min(rect.top - gap - combinedHeight, maximumStart));
        actionsTop = emojisTop + emojiPickerHeight + gap;
      }
    }

    setReactionPicker({
      actionsTop,
      emojisTop,
      message,
      x: Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - emojiPickerWidth - viewportPadding)),
    });
  };
  const copyMessage = async (body: string) => {
    try {
      await navigator.clipboard.writeText(body);
    } catch (error) {
      console.error("Unable to copy message:", error);
    } finally {
      setReactionPicker(null);
    }
  };
  const startEditingMessage = (message: ConversationMessage) => {
    if (!canEditMessage(message)) return;
    setMessageBody(message.body);
    setReplyToMessage(null);
    setMessageBeingEdited(message);
    setReactionPicker(null);
    window.requestAnimationFrame(() => composerRef.current?.focus());
  };
  const deleteMessage = async (message: ConversationMessage) => {
    if (!selectedConversationId || !canDeleteMessage(message)) return;
    if (!window.confirm(i18n("Delete this message?"))) return;

    setReactionPicker(null);
    setMessageError("");
    try {
      const response = await fetch(`/api/conversations/${selectedConversationId}/messages/${message.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string; message?: { deleted_at?: string } };
      if (!response.ok) throw new Error(data.error || i18n("Unable to delete the message"));

      setMessages((current) =>
        current.map((currentMessage) =>
          currentMessage.id === message.id
            ? {
                ...currentMessage,
                body: "",
                deleted_at: data.message?.deleted_at ?? new Date().toISOString(),
                reactions: [],
              }
            : currentMessage,
        ),
      );
      setReplyToMessage((current) => (current?.id === message.id ? null : current));
      setMessageBeingEdited((current) => (current?.id === message.id ? null : current));
      await refreshConversations();
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to delete the message"));
    }
  };
  const refreshConversations = async () => {
    try {
      const response = await fetch(
        inbox ? "/api/conversations?inbox=true" : `/api/conversations?venueId=${encodeURIComponent(venueId ?? "")}`,
      );
      if (response.ok) {
        const data = (await response.json()) as { conversations: Conversation[] };
        setConversations(
          sortConversations(data.conversations).map((conversation) =>
            conversation.id === selectedConversationIdRef.current ? { ...conversation, unread_count: 0 } : conversation,
          ),
        );
      }
    } catch {
      // The live subscription will reconcile this supplementary list refresh.
    }
  };
  const toggleReaction = async (messageId: string, emoji: string) => {
    if (!selectedConversationId) return;
    const response = await fetch(`/api/conversations/${selectedConversationId}/messages/${messageId}/reaction`, {
      body: JSON.stringify({ emoji }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    if (!response.ok) return;
    const { active } = (await response.json()) as { active: boolean };
    setMessages((current) =>
      current.map((message) => {
        if (message.id !== messageId) return message;
        const reactions = message.reactions || [];
        const reaction = reactions.find((item) => item.emoji === emoji);
        return {
          ...message,
          reactions: reaction
            ? reactions
                .map((item) =>
                  item.emoji === emoji
                    ? { ...item, count: Number(item.count) + (active ? 1 : -1), reacted: active }
                    : item,
                )
                .filter((item) => Number(item.count) > 0)
            : [...reactions, { count: 1, emoji, reacted: true }],
        };
      }),
    );
  };
  const sendMessage = async () => {
    const body = messageBody.trim();
    if (!body) return;
    setIsSendingMessage(true);
    setMessageError("");
    try {
      if (messageBeingEdited && selectedConversationId) {
        const response = await fetch(`/api/conversations/${selectedConversationId}/messages/${messageBeingEdited.id}`, {
          body: JSON.stringify({ body }),
          headers: { "Content-Type": "application/json" },
          method: "PATCH",
        });
        const data = (await response.json()) as { error?: string; message?: ConversationMessage };
        if (!response.ok || !data.message) throw new Error(data.error || i18n("Unable to edit the message"));
        setMessages((current) =>
          current.map((message) => (message.id === data.message?.id ? { ...message, ...data.message } : message)),
        );
        setMessageBody("");
        setMessageBeingEdited(null);
        return;
      }
      const isOwner = activeRole === "OWNER";
      if (!isOwner && !activeVenueId) throw new Error(i18n("Select a conversation"));
      const response = await fetch(
        isOwner ? `/api/conversations/${selectedConversationId}/messages` : "/api/conversations",
        {
          body: JSON.stringify(
            isOwner
              ? { body, replyToMessageId: replyToMessage?.id }
              : { body, replyToMessageId: replyToMessage?.id, venueId: activeVenueId },
          ),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        },
      );
      const data = (await response.json()) as {
        conversationId?: string;
        error?: string;
        message?: ConversationMessage;
      };
      if (!response.ok) throw new Error(data.error || i18n("Unable to send the message"));
      if (!isOwner && data.conversationId) {
        setSelectedConversationId(data.conversationId);
        try {
          const messagesResponse = await fetch(`/api/conversations/${data.conversationId}/messages`);
          if (messagesResponse.ok) {
            setMessages(((await messagesResponse.json()) as { messages: ConversationMessage[] }).messages);
          }
        } catch {
          // The message was accepted. A live update or the normal selected-conversation load will display it.
        }
      }
      if (isOwner && data.message) {
        const message: ConversationMessage = {
          body: data.message.body ?? body,
          created_at: data.message.created_at ?? new Date().toISOString(),
          id: data.message.id ?? crypto.randomUUID(),
          reply_to_body: replyToMessage?.body ?? null,
          reply_to_message_id: data.message.reply_to_message_id ?? replyToMessage?.id ?? null,
          reply_to_sender_type: replyToMessage?.sender_type ?? null,
          sender_type: data.message.sender_type ?? "VENUE",
          telegram_delivered_at: data.message.telegram_delivered_at ?? null,
          editable: true,
        };
        setMessages((current) => [...current, message]);
      }
      setMessageBody("");
      setReplyToMessage(null);
      await refreshConversations();
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to send the message"));
    } finally {
      setIsSendingMessage(false);
    }
  };
  const linkTelegram = async () => {
    if (!venueId) return;
    setMessageError("");
    try {
      const response = await fetch("/api/telegram/link", {
        body: JSON.stringify({ venueId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !data.url) throw new Error(data.error || i18n("Unable to create a Telegram link"));
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to create a Telegram link"));
    }
  };
  const unlinkTelegram = async () => {
    if (!venueId) return;
    const confirmed = await openConfirmDialog({
      message: i18n(
        "Telegram will stop receiving new customer messages. Your existing web conversations will remain available.",
      ),
      title: i18n("Unlink Telegram?"),
    });
    if (!confirmed) return;

    setIsUnlinkingTelegram(true);
    setMessageError("");
    try {
      const response = await fetch("/api/telegram/unlink", {
        body: JSON.stringify({ venueId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string; telegramLinked?: boolean };
      if (!response.ok) throw new Error(data.error || i18n("Unable to unlink Telegram"));
      setTelegramLinked(data.telegramLinked ?? false);
      setTelegramReviewNotificationsEnabled(false);
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to unlink Telegram"));
    } finally {
      setIsUnlinkingTelegram(false);
    }
  };
  const setTelegramReviewNotifications = async (enabled: boolean) => {
    if (!venueId || isSavingTelegramReviewNotifications) return;

    setIsSavingTelegramReviewNotifications(true);
    setMessageError("");
    try {
      const response = await fetch("/api/telegram/review-notifications", {
        body: JSON.stringify({ enabled, venueId }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const data = (await response.json()) as { enabled?: boolean; error?: string };
      if (!response.ok || data.enabled === undefined) {
        throw new Error(data.error || i18n("Unable to update Telegram review notifications"));
      }
      setTelegramReviewNotificationsEnabled(data.enabled);
      void refreshReviewTelegramDelivery();
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to update Telegram review notifications"));
    } finally {
      setIsSavingTelegramReviewNotifications(false);
    }
  };
  const retryReviewTelegramDelivery = async () => {
    if (!venueId || isRetryingReviewTelegramDelivery) return;
    setIsRetryingReviewTelegramDelivery(true);
    setMessageError("");
    try {
      const response = await fetch("/api/telegram/review-notifications", {
        body: JSON.stringify({ venueId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || i18n("Unable to retry Telegram review notification"));
      await refreshReviewTelegramDelivery();
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to retry Telegram review notification"));
    } finally {
      setIsRetryingReviewTelegramDelivery(false);
    }
  };
  const scrollToLatest = () => {
    const list = messageListRef.current;
    if (!list) return;
    shouldStickToLatestRef.current = true;
    list.scrollTo({ behavior: "smooth", top: list.scrollHeight });
  };
  const retryTelegramDelivery = async (messageId: string) => {
    if (!selectedConversationId) return;

    setRetryingTelegramMessageId(messageId);
    setMessageError("");
    try {
      const response = await fetch(
        `/api/conversations/${selectedConversationId}/messages/${messageId}/telegram-retry`,
        {
          method: "POST",
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || i18n("Unable to retry Telegram delivery"));
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, telegram_delivery_status: "PENDING" } : message,
        ),
      );
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to retry Telegram delivery"));
    } finally {
      setRetryingTelegramMessageId(null);
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversationId || !nextMessageCursor || !hasOlderMessages || isLoadingOlderMessages) return;

    const list = messageListRef.current;
    if (list) {
      shouldStickToLatestRef.current = false;
      scrollRestoreRef.current = { height: list.scrollHeight, top: list.scrollTop };
    }
    setIsLoadingOlderMessages(true);
    try {
      const response = await fetch(
        `/api/conversations/${selectedConversationId}/messages?limit=50&before=${encodeURIComponent(nextMessageCursor)}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        scrollRestoreRef.current = null;
        return;
      }
      const data = (await response.json()) as MessagePage;
      setMessages((current) => mergeMessages(data.messages, current));
      setNextMessageCursor(data.nextCursor);
      setHasOlderMessages(data.hasMore);
    } catch {
      scrollRestoreRef.current = null;
    } finally {
      setIsLoadingOlderMessages(false);
    }
  };
  const selectConversation = (conversationId: string) => {
    selectedConversationIdRef.current = conversationId;
    if (conversationId !== selectedConversationId) {
      setMessages([]);
      setNextMessageCursor(null);
      setHasOlderMessages(false);
      setIsLoadingMessages(true);
    }
    setSelectedConversationId(conversationId);
    setIsConversationMenuOpen(false);
  };
  const renderConversationButton = (className: string) => {
    if (role !== "OWNER" && !inbox) return null;

    return (
      <Button
        aria-controls="messaging-conversations-menu"
        aria-expanded={isConversationMenuOpen}
        aria-label={i18n("Open conversations")}
        className={className}
        color="primary"
        onClick={() => setIsConversationMenuOpen(true)}
        variant="ghost"
      >
        <span className="flex items-center gap-2">
          <MessagesSquare size={20} />
          {i18n("Conversations")}
          <ChevronRight aria-hidden="true" className="hidden sm:block" size={18} />
        </span>
      </Button>
    );
  };
  const archiveConversation = async () => {
    if (!selectedConversation) return;

    const archived = !selectedConversation.archived_at;
    setIsArchivingConversation(true);
    setMessageError("");
    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/archive`, {
        body: JSON.stringify({ archived }),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
      const data = (await response.json()) as { conversation?: { archived_at: null | string }; error?: string };
      if (!response.ok) throw new Error(data.error || i18n("Unable to update the conversation"));

      setConversations((current) =>
        sortConversations(
          current.map((conversation) =>
            conversation.id === selectedConversation.id
              ? { ...conversation, archived_at: data.conversation?.archived_at ?? null }
              : conversation,
          ),
        ),
      );
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to update the conversation"));
    } finally {
      setIsArchivingConversation(false);
    }
  };
  const renderArchiveButton = () => {
    if (!selectedConversation) return null;

    const isArchived = Boolean(selectedConversation.archived_at);
    return (
      <ActionButton
        aria-label={isArchived ? i18n("Restore conversation") : i18n("Archive conversation")}
        busy={isArchivingConversation}
        icon={isArchived ? <ArchiveRestore /> : <Archive />}
        onClick={() => void archiveConversation()}
        variant="ghost"
      />
    );
  };

  return (
    <div className="space-y-4">
      <RichText as="div" className="text-neutral mb-6 text-sm">
        {!inbox && role === "OWNER"
          ? telegramLinked
            ? i18n(
                "Manage customer enquiries in one place. Reply here, or reply to the forwarded message in Telegram - both appear in the same conversation.",
              )
            : i18n("Manage customer enquiries here. Link Telegram to also receive and reply to messages there.")
          : inbox
            ? i18n("Manage your private conversations and customer enquiries in one place.")
            : i18n(
                "Send a private message to this venue. Only you and the venue owner can see this conversation. They can reply here or through Telegram.",
              )}
      </RichText>

      <div
        className={clsx(
          isExpanded &&
            "bg-surface fixed inset-0 z-50 flex h-dvh flex-col p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-6",
        )}
      >
        {isExpanded && (
          <header className="mb-3 flex shrink-0 items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle size={20} />
              {i18n("Messages")}
            </h2>
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              {renderConversationButton("min-w-0 px-2 md:hidden")}
              <PushNotifications />
              {renderArchiveButton()}
              <ActionButton
                aria-label={i18n("Exit expanded chat")}
                icon={<Minimize2 />}
                onClick={() => setIsExpanded(false)}
                variant="ghost"
              />
            </div>
          </header>
        )}
        {!isExpanded && (
          <header className="mb-3 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">{renderConversationButton("w-fit md:hidden")}</div>
            <div className="flex shrink-0 gap-1.5 sm:gap-2">
              <PushNotifications />
              {renderArchiveButton()}
              <ActionButton
                aria-label={i18n("Expand chat")}
                icon={<Maximize2 />}
                onClick={() => setIsExpanded(true)}
                variant="ghost"
              />
            </div>
          </header>
        )}
        {(role === "OWNER" || inbox) && (
          <>
            <div
              aria-hidden={!isConversationMenuOpen}
              className={clsx(
                "fixed inset-0 z-60 md:hidden",
                isConversationMenuOpen ? "pointer-events-auto" : "pointer-events-none",
              )}
            >
              <button
                aria-label={i18n("Close conversations")}
                className={clsx(
                  "absolute inset-0 bg-neutral-900/30 transition-opacity duration-300",
                  isConversationMenuOpen ? "opacity-100" : "opacity-0",
                )}
                onClick={() => setIsConversationMenuOpen(false)}
                tabIndex={isConversationMenuOpen ? 0 : -1}
                type="button"
              />
              <aside
                aria-label={i18n("Conversations")}
                aria-modal="true"
                className={clsx(
                  "bg-surface absolute inset-y-0 left-0 flex w-[min(22rem,calc(100%-2.5rem))] flex-col shadow-xl transition-transform duration-300",
                  isConversationMenuOpen ? "translate-x-0" : "-translate-x-full",
                )}
                id="messaging-conversations-menu"
                role="dialog"
              >
                <header className="border-neutral/10 flex items-center justify-between border-b p-4">
                  <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <MessagesSquare size={20} />
                    {i18n("Conversations")}
                  </h2>
                  <ActionButton
                    aria-label={i18n("Close conversations")}
                    icon={<X />}
                    onClick={() => setIsConversationMenuOpen(false)}
                    ref={conversationMenuCloseButtonRef}
                    variant="ghost"
                  />
                </header>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                  <ConversationList
                    conversations={conversations}
                    isLoading={isLoadingConversations}
                    onSelect={selectConversation}
                    selectedConversationId={selectedConversationId}
                  />
                </div>
              </aside>
            </div>
          </>
        )}
        <div
          className={clsx(
            "grid gap-4 overflow-hidden",
            isExpanded ? "min-h-0 flex-1" : "h-[min(40rem,calc(100dvh-11rem))] min-h-80",
            (role === "OWNER" || inbox) && "md:grid-cols-3 md:gap-8",
            (role === "OWNER" || inbox) && !isExpanded && "md:h-200",
          )}
        >
          {(role === "OWNER" || inbox) && (
            <SectionCard
              as="aside"
              className="hidden min-h-0 overflow-y-auto md:col-span-1 md:block"
              title={
                <span className="flex items-center gap-2">
                  <MessagesSquare size={20} />
                  {i18n("Conversations")}
                </span>
              }
            >
              <ConversationList
                conversations={conversations}
                isLoading={isLoadingConversations}
                onSelect={selectConversation}
                selectedConversationId={selectedConversationId}
              />
            </SectionCard>
          )}
          <section
            className={clsx(
              "relative flex min-h-0 flex-col overflow-hidden",
              (role === "OWNER" || inbox) && "md:col-span-2",
            )}
          >
            <div
              className={clsx(
                "flex min-h-0 flex-1 flex-col gap-4 px-4 py-5",
                reactionPicker ? "overflow-y-hidden" : "overflow-y-auto",
              )}
              onScroll={(event) => {
                const element = event.currentTarget;
                const nearLatest = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
                shouldStickToLatestRef.current = nearLatest;
                setShowJumpToLatest(!nearLatest);
                if (element.scrollTop < 80) void loadOlderMessages();
              }}
              ref={messageListRef}
            >
              {messages.length === 0 && (isLoadingMessages || (!selectedConversationId && isLoadingConversations)) ? (
                <div aria-live="polite" className="flex min-h-32 flex-1 items-center justify-center">
                  <AnimatedEllipsis size="md" />
                </div>
              ) : (
                <>
                  {isLoadingOlderMessages && (
                    <p aria-live="polite" className="text-on-surface/60 text-center text-xs">
                      {i18n("Loading older messages")}
                    </p>
                  )}
                  {selectedConversationId ? (
                    messages.map((message, index) => {
                      const isActionMessage = reactionPicker?.message.id === message.id;
                      const isOwnMessage =
                        (activeRole === "OWNER" && message.sender_type === "VENUE") ||
                        (activeRole === "USER" && message.sender_type === "USER");
                      const bubbleColour =
                        message.sender_type === "VENUE"
                          ? "bg-secondary-hover before:bg-secondary-hover"
                          : "bg-surface-tint before:bg-surface-tint";
                      const name = senderName(message.sender_type);
                      const senderColour = getSenderColour(name);
                      const avatarImage = selectedConversation?.avatar_image;
                      const isNewDay =
                        index === 0 ||
                        new Date(messages[index - 1]?.created_at ?? "").toDateString() !==
                          new Date(message.created_at).toDateString();
                      const previousMessage = messages[index - 1];
                      const nextMessage = messages[index + 1];
                      const followsSameSender =
                        !message.deleted_at &&
                        !previousMessage?.deleted_at &&
                        index > 0 &&
                        previousMessage?.sender_type === message.sender_type &&
                        new Date(previousMessage.created_at).toDateString() ===
                          new Date(message.created_at).toDateString();
                      const isFollowedBySameSender =
                        !message.deleted_at &&
                        !nextMessage?.deleted_at &&
                        nextMessage?.sender_type === message.sender_type &&
                        new Date(nextMessage.created_at).toDateString() === new Date(message.created_at).toDateString();
                      const showSender = !followsSameSender || isNewDay;
                      const showSenderName = showSender && !(activeRole === "USER" && message.sender_type === "VENUE");
                      const isLastInSenderGroup = !isFollowedBySameSender;
                      const hideVenueAvatar = !inbox && activeRole === "USER" && message.sender_type === "VENUE";

                      if (message.deleted_at) {
                        return (
                          <div
                            className={clsx(
                              "flex flex-col transition-[filter,opacity] duration-150",
                              reactionPicker && !isActionMessage && "pointer-events-none opacity-60 blur-[1.5px]",
                            )}
                            key={message.id}
                          >
                            {isNewDay && <Separator className="py-1" text={formatDay(message.created_at)} />}
                            <div
                              className={`flex max-w-[92%] items-baseline gap-3 py-1 ${isOwnMessage ? "flex-row-reverse self-end" : "self-start"}`}
                            >
                              <div aria-hidden="true" className="w-10 shrink-0" />
                              <p className="text-on-surface/50 text-xs italic">
                                {isOwnMessage
                                  ? i18n("You deleted a message")
                                  : i18n("{name} deleted a message", { name })}
                                <time className="ml-2 not-italic" dateTime={message.created_at}>
                                  {formatTimestamp(message.created_at)}
                                </time>
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          className={clsx(
                            "flex flex-col transition-[filter,opacity] duration-150",
                            reactionPicker && !isActionMessage && "pointer-events-none opacity-60 blur-[1.5px]",
                          )}
                          key={message.id}
                        >
                          {isNewDay && <Separator className="py-1" text={formatDay(message.created_at)} />}
                          <div
                            className={`flex max-w-[92%] items-end gap-3 ${isOwnMessage ? "flex-row-reverse self-end" : "self-start"} ${followsSameSender ? "-mt-2" : ""}`}
                          >
                            {!isOwnMessage && !hideVenueAvatar && isLastInSenderGroup && canOpenCounterpart ? (
                              <button
                                aria-label={counterpartLabel}
                                className="focus-visible:outline-primary shrink-0 self-end rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
                                onClick={openCounterpart}
                                type="button"
                              >
                                <ParticipantAvatar image={avatarImage} name={name} />
                              </button>
                            ) : !isOwnMessage && !hideVenueAvatar && isLastInSenderGroup ? (
                              <ParticipantAvatar className="self-end" image={avatarImage} name={name} />
                            ) : !isOwnMessage && !hideVenueAvatar ? (
                              <div aria-hidden="true" className="w-10 shrink-0" />
                            ) : null}
                            <div className={`flex min-w-0 flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                              {!isOwnMessage && showSenderName && canOpenCounterpart ? (
                                <button
                                  aria-label={counterpartLabel}
                                  className={`focus-visible:outline-primary mb-1 px-1 text-base font-semibold transition-opacity hover:opacity-75 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 ${senderColour.textClassName} ${isOwnMessage ? "text-right" : ""}`}
                                  onClick={openCounterpart}
                                  type="button"
                                >
                                  {name}
                                </button>
                              ) : !isOwnMessage && showSenderName ? (
                                <p
                                  className={`mb-1 px-1 text-base font-semibold ${senderColour.textClassName} ${isOwnMessage ? "text-right" : ""}`}
                                >
                                  {name}
                                </p>
                              ) : null}
                              <div
                                className={`${bubbleColour} relative touch-manipulation rounded-xl px-4 py-2 select-none ${isLastInSenderGroup ? "before:absolute before:bottom-0 before:h-4 before:w-4 before:content-['']" : ""} ${
                                  isLastInSenderGroup
                                    ? isOwnMessage
                                      ? "rounded-br-sm before:-right-2 before:[clip-path:polygon(0_0,0_100%,100%_100%)]"
                                      : "rounded-bl-sm before:-left-2 before:[clip-path:polygon(100%_0,100%_100%,0_100%)]"
                                    : ""
                                }`}
                                onContextMenu={(event) => {
                                  event.preventDefault();
                                  openActions(message, event.currentTarget);
                                }}
                                onPointerCancel={() => {
                                  touchStartRef.current = null;
                                }}
                                onPointerDown={(event) => {
                                  if (event.pointerType === "touch")
                                    touchStartRef.current = { x: event.clientX, y: event.clientY };
                                }}
                                onPointerMove={(event) => {
                                  const start = touchStartRef.current;
                                  if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8)
                                    touchStartRef.current = null;
                                }}
                                onPointerUp={(event) => {
                                  const start = touchStartRef.current;
                                  touchStartRef.current = null;
                                  if (
                                    event.pointerType === "touch" &&
                                    start &&
                                    !(event.target instanceof Element && event.target.closest("button"))
                                  ) {
                                    openActions(message, event.currentTarget);
                                  }
                                }}
                              >
                                {(message.reply_to_body || message.reply_to_deleted) && (
                                  <div className="border-primary bg-primary/8 text-on-surface/70 mb-2 max-w-full rounded-xl border-l-4 px-3 py-2 text-sm">
                                    <p className="text-primary font-semibold">
                                      ↩ {senderName(message.reply_to_sender_type ?? "USER")}
                                    </p>
                                    <p className="mt-0.5 truncate">
                                      {message.reply_to_deleted ? i18n("Deleted message") : message.reply_to_body}
                                    </p>
                                  </div>
                                )}
                                <p className="text-base leading-6 wrap-break-word whitespace-pre-wrap">
                                  {message.body}
                                </p>

                                <div className="text-on-surface/60 mt-1 flex min-w-28 justify-between text-xs">
                                  {message.sender_type === "USER" && message.telegram_delivered_at && (
                                    <Tooltip label={i18n("Delivered to Telegram")}>
                                      <Check className="stroke-success mt-1" size={10} />
                                    </Tooltip>
                                  )}
                                  {message.sender_type === "USER" &&
                                    ["PENDING", "PROCESSING"].includes(message.telegram_delivery_status ?? "") && (
                                      <Tooltip label={i18n("Sending to Telegram")}>
                                        <AnimatedEllipsis el="." size="sm" />
                                      </Tooltip>
                                    )}
                                  {message.sender_type === "USER" && message.telegram_delivery_status === "FAILED" && (
                                    <Tooltip label={i18n("Retry Telegram delivery")}>
                                      <button
                                        aria-label={i18n("Retry Telegram delivery")}
                                        className="text-danger hover:text-danger-hover"
                                        disabled={retryingTelegramMessageId === message.id}
                                        onClick={() => void retryTelegramDelivery(message.id)}
                                        type="button"
                                      >
                                        <RefreshCw
                                          className={retryingTelegramMessageId === message.id ? "animate-spin" : ""}
                                          size={12}
                                        />
                                      </button>
                                    </Tooltip>
                                  )}
                                  {message.sent_from_telegram && (
                                    <Tooltip label={i18n("Sent from Telegram")}>
                                      <Image alt="Telegram" width={14} height={14} src={TELEGRAM_LOGO} />
                                    </Tooltip>
                                  )}
                                  {message.edited_at && (
                                    <span className="mr-1">
                                      <Tooltip label={i18n("Edited")}>
                                        <Pencil size={12} />
                                      </Tooltip>
                                    </span>
                                  )}
                                  <time className="ml-auto text-right" dateTime={message.created_at}>
                                    {formatTimestamp(message.created_at)}
                                  </time>
                                </div>

                                {message.reactions?.length ? (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {message.reactions.map((reaction) => {
                                      const reactionCount = Number(reaction.count);

                                      return (
                                        <button
                                          aria-label={
                                            reactionCount > 1
                                              ? reaction.reacted
                                                ? i18n("Your reaction and {count} other", { count: reactionCount - 1 })
                                                : i18n("{count} reactions", { count: reactionCount })
                                              : reaction.reacted
                                                ? i18n("Your reaction")
                                                : i18n("Reaction from the other participant")
                                          }
                                          aria-pressed={reaction.reacted}
                                          className={clsx(
                                            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-lg leading-none transition-colors",
                                            reaction.reacted
                                              ? "bg-secondary/50 hover:bg-secondary/75"
                                              : "bg-on-surface/10 hover:bg-on-surface/20",
                                          )}
                                          key={reaction.emoji}
                                          onClick={() => void toggleReaction(message.id, reaction.emoji)}
                                          onPointerUp={(event) => event.stopPropagation()}
                                          type="button"
                                        >
                                          <span>{reaction.emoji}</span>
                                          {reactionCount > 1 && (
                                            <span className="text-on-surface/70 text-sm font-semibold">
                                              {reactionCount}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-on-surface/70 text-sm">
                      {inbox || activeRole === "OWNER" ? i18n("Select a conversation") : i18n("Start a conversation")}
                    </p>
                  )}
                </>
              )}
            </div>
            {showJumpToLatest && selectedConversationId && (
              <ActionButton
                aria-label={i18n("Jump to latest messages")}
                className="absolute right-5 bottom-28 z-10 rounded-full shadow-lg"
                color="primary"
                icon={<span aria-hidden="true">↓</span>}
                onClick={scrollToLatest}
                variant="filled"
              />
            )}
            {reactionPicker && (
              <MessageActionsMenu
                canDelete={canDeleteMessage(reactionPicker.message)}
                canEdit={canEditMessage(reactionPicker.message)}
                menu={reactionPicker}
                onClose={() => setReactionPicker(null)}
                onCopy={(body) => void copyMessage(body)}
                onDelete={(message) => void deleteMessage(message)}
                onEdit={startEditingMessage}
                onReply={(message) => {
                  setReplyToMessage(message);
                  setReactionPicker(null);
                }}
                onToggleReaction={(messageId, emoji) => void toggleReaction(messageId, emoji)}
              />
            )}
            <MessageComposer
              disabled={!selectedConversationId && (role === "OWNER" || inbox)}
              error={messageError}
              isSending={isSendingMessage}
              messageBeingEdited={messageBeingEdited}
              messageBody={messageBody}
              onCancelEdit={() => {
                setMessageBeingEdited(null);
                setMessageBody("");
              }}
              onCancelReply={() => setReplyToMessage(null)}
              onChange={setMessageBody}
              onSend={() => void sendMessage()}
              replyToMessage={replyToMessage}
              textareaRef={composerRef}
            />
          </section>
        </div>
      </div>
    </div>
  );
};
