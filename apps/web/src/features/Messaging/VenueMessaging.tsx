"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Check,
  ChevronRight,
  Copy,
  Maximize2,
  MessageCircle,
  MessagesSquare,
  Minimize2,
  Pencil,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import {
  ActionButton,
  AnimatedEllipsis,
  Button,
  RichText,
  SectionCard,
  Separator,
  Textarea,
  Tooltip,
} from "~/components/ui";
import { PushNotifications } from "~/components/layout/PushNotifications/PushNotifications";
import { useDialog } from "~/contexts/DialogContext";
import { useUser } from "~/hooks/useUser";
import { useI18n } from "~/i18n/useI18n";
import { MESSAGE_REACTION_EMOJIS } from "~/lib/messaging/constants";
import { getSenderColour, getSenderInitials } from "~/lib/messaging/sender";
import {
  useConversationMessagingEventsSubscription,
  useConversationReactionEventsSubscription,
  useVenueMessagingEventsSubscription,
} from "~/types/graphql.generated";
import { UUID } from "~/types/uuid";

import { Conversation, ConversationMessage } from "./types";
import { clsx } from "clsx";
import Image from "next/image";

type MessagingRole = "OWNER" | "USER";
type MessagingUpdateDetail = {
  conversationIds: string[];
  source: "conversation" | "venue";
  venueId: string;
};

type MessagePage = {
  hasMore: boolean;
  messages: ConversationMessage[];
  nextCursor: null | string;
};

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
  initialRole: MessagingRole | null;
  initialTelegramLinked: boolean | null;
  venueId: UUID;
  venueName: string;
}

const TELEGRAM_LOGO = "/static/telegram.svg";

export const VenueMessaging = ({
  hasOwner,
  initialRole,
  initialTelegramLinked,
  venueId,
  venueName,
}: VenueMessagingProps) => {
  const { isAuthenticated, isLoading: isUserLoading } = useUser();
  const i18n = useI18n();
  const { openConfirmDialog } = useDialog();
  const locale = useLocale();
  const requestedConversationId = useSearchParams().get("conversation");
  const [role, setRole] = useState<MessagingRole | null>(initialRole);
  const [telegramLinked, setTelegramLinked] = useState<boolean | null>(initialTelegramLinked);
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
  const [isUnlinkingTelegram, setIsUnlinkingTelegram] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [reactionPicker, setReactionPicker] = useState<{
    actionsTop: number;
    emojisTop: number;
    message: ConversationMessage;
    x: number;
  } | null>(null);
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
    skip: !hasOwner || !isAuthenticated,
    variables: { venueId },
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
      .map((message) => `${message.conversation_id}:${message.id}:${message.deleted_at ?? ""}:${message.body}`)
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
    if (!conversationMessagingEvents || !selectedConversationId) return;
    const signature = `${selectedConversationId}:${conversationMessagingEvents.messages
      .map((message) => `${message.conversation_id}:${message.id}:${message.deleted_at ?? ""}:${message.body}`)
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
    if (!hasOwner || (!isAuthenticated && !isUserLoading)) {
      setRole(null);
      setTelegramLinked(null);
      setConversations([]);
      setSelectedConversationId(null);
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
        const response = await fetch(`/api/conversations?venueId=${encodeURIComponent(venueId)}`, {
          cache: "no-store",
          signal: abortController.signal,
        });
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
        setConversations(sortConversations(data.conversations));
        if (isInitialLoad) setIsLoadingMessages(data.conversations.length > 0);
        setSelectedConversationId(
          (current) =>
            current ||
            data.conversations.find((conversation) => conversation.id === requestedConversationId)?.id ||
            data.conversations[0]?.id ||
            null,
        );
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
      if (detail?.venueId === venueId) void load();
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
  }, [hasOwner, isAuthenticated, isUserLoading, requestedConversationId, venueId]);

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
        if (!response.ok) return;
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
          window.dispatchEvent(new Event("messages-read"));
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
  const senderName = (senderType: ConversationMessage["sender_type"]) =>
    senderType === "VENUE" ? venueName || i18n("Venue") : selectedConversation?.user_name || i18n("Customer");
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", {
      ...(date.toDateString() === new Date().toDateString() ? {} : { day: "numeric", month: "short" }),
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };
  const formatConversationTimestamp = (timestamp: null | string) => {
    if (!timestamp) return null;

    const date = new Date(timestamp);
    const today = new Date();
    const calendarDay = (value: Date) => Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
    const daysAgo = Math.floor((calendarDay(today) - calendarDay(date)) / 86_400_000);
    const dateLocale = locale === "uk" ? "uk-UA" : "en-GB";

    if (daysAgo === 0) {
      return new Intl.DateTimeFormat(dateLocale, { hour: "2-digit", minute: "2-digit" }).format(date);
    }
    if (daysAgo > 0 && daysAgo < 7) {
      return new Intl.DateTimeFormat(dateLocale, { weekday: "short" }).format(date);
    }
    return new Intl.DateTimeFormat(dateLocale, { day: "numeric", month: "2-digit", year: "2-digit" }).format(date);
  };
  const formatDay = (timestamp: string) =>
    new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(timestamp));
  const canDeleteMessage = (message: ConversationMessage) =>
    (role === "OWNER" && message.sender_type === "VENUE") || (role === "USER" && message.sender_type === "USER");
  const canEditMessage = (message: ConversationMessage) => canDeleteMessage(message) && message.editable !== false;
  const openActions = (message: ConversationMessage, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const gap = 12;
    const emojiPickerHeight = 56;
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
      x: Math.max(8, Math.min(rect.left, window.innerWidth - 280)),
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
      const response = await fetch(`/api/conversations?venueId=${encodeURIComponent(venueId)}`);
      if (response.ok) {
        setConversations(
          sortConversations(((await response.json()) as { conversations: Conversation[] }).conversations),
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
      const isOwner = role === "OWNER";
      const response = await fetch(
        isOwner ? `/api/conversations/${selectedConversationId}/messages` : "/api/conversations",
        {
          body: JSON.stringify(
            isOwner
              ? { body, replyToMessageId: replyToMessage?.id }
              : { body, replyToMessageId: replyToMessage?.id, venueId },
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
    } catch (error) {
      setMessageError(error instanceof Error ? error.message : i18n("Unable to unlink Telegram"));
    } finally {
      setIsUnlinkingTelegram(false);
    }
  };
  const scrollToLatest = () => {
    const list = messageListRef.current;
    if (!list) return;
    shouldStickToLatestRef.current = true;
    list.scrollTo({ behavior: "smooth", top: list.scrollHeight });
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
    if (conversationId !== selectedConversationId) {
      setMessages([]);
      setNextMessageCursor(null);
      setHasOlderMessages(false);
      setIsLoadingMessages(true);
    }
    setSelectedConversationId(conversationId);
    setIsConversationMenuOpen(false);
  };
  const renderConversationList = () => {
    if (isLoadingConversations) {
      return (
        <div aria-live="polite" className="flex min-h-20 items-center justify-center">
          <AnimatedEllipsis size="md" />
        </div>
      );
    }
    if (!conversations.length) return <p className="text-on-surface/70 text-sm">{i18n("No conversations yet")}</p>;

    const renderConversationRows = (conversationItems: Conversation[]) =>
      conversationItems.map((conversation) => {
        const name = conversation.user_name ?? i18n("Customer");
        const senderColour = getSenderColour(name);
        const lastMessageTime = formatConversationTimestamp(conversation.last_message_at);
        const isArchived = Boolean(conversation.archived_at);

        return (
          <button
            className={clsx(
              "hover:bg-on-surface/5 flex w-full items-center gap-3 px-4 py-2 text-left text-sm",
              selectedConversationId === conversation.id && "bg-primary/10",
              isArchived && "opacity-70",
            )}
            key={conversation.id}
            onClick={() => selectConversation(conversation.id)}
          >
            <div
              aria-hidden="true"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-tight text-white ${senderColour.avatarClassName}`}
            >
              {getSenderInitials(name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-medium">{name}</p>
                </div>
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
            {renderConversationRows(activeConversations)}
          </section>
        )}
        {archivedConversations.length > 0 && (
          <section>
            <Separator align="left" text={i18n("Archived")} />
            {renderConversationRows(archivedConversations)}
          </section>
        )}
      </div>
    );
  };
  const renderConversationButton = (className: string) => {
    if (role !== "OWNER") return null;

    return (
      <Button
        aria-controls="venue-conversations-menu"
        aria-expanded={isConversationMenuOpen}
        className={className}
        color="primary"
        onClick={() => setIsConversationMenuOpen(true)}
        variant="ghost"
      >
        <span className="flex items-center gap-2">
          <MessagesSquare size={20} />
          {i18n("Conversations")}
          <ChevronRight aria-hidden="true" size={18} />
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
        {role === "OWNER"
          ? telegramLinked
            ? i18n(
                "Manage customer enquiries in one place. Reply here, or reply to the forwarded message in Telegram - both appear in the same conversation.",
              )
            : i18n("Manage customer enquiries here. Link Telegram to also receive and reply to messages there.")
          : i18n(
              "Send a private message to this venue. Only you and the venue owner can see this conversation. They can reply here or through Telegram.",
            )}
      </RichText>

      {role === "OWNER" && telegramLinked === false && (
        <div className="bg-primary/10 flex items-center justify-between rounded-xl px-4 py-2">
          <div className="flex space-x-2">
            <Image alt="Telegram" width={22} height={22} src={TELEGRAM_LOGO} />
            <p>{i18n("Receive messages in Telegram")}</p>
          </div>
          <div className="flex items-center space-x-2">
            {messageError && <p className="text-sm text-red-600">{messageError}</p>}
            <Button onClick={linkTelegram} size="sm" color="primary">
              {i18n("Link")}
            </Button>
          </div>
        </div>
      )}
      {role === "OWNER" && telegramLinked === true && (
        <div className="bg-primary/10 flex items-center justify-between rounded-xl px-4 py-2">
          <div className="flex space-x-2">
            <Image alt="Telegram" width={22} height={22} src={TELEGRAM_LOGO} />
            <p>{i18n("Telegram is linked and receiving customer messages")}</p>
          </div>
          <Button
            busy={isUnlinkingTelegram}
            color="danger"
            onClick={() => void unlinkTelegram()}
            size="sm"
            variant="outlined"
          >
            {i18n("Unlink")}
          </Button>
        </div>
      )}
      <div className={clsx(isExpanded && "bg-surface fixed inset-0 z-50 flex h-dvh flex-col p-3 md:p-6")}>
        {isExpanded && (
          <header className="mb-3 flex shrink-0 items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageCircle size={20} />
              {i18n("Messages")}
            </h2>
            <div className="flex items-center gap-2">
              {renderConversationButton("md:hidden")}
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
            <div>{renderConversationButton("flex-1 justify-between md:hidden")}</div>
            <div className="flex gap-2">
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
        {role === "OWNER" && (
          <>
            <div
              aria-hidden={!isConversationMenuOpen}
              className={clsx(
                "fixed inset-0 z-[60] md:hidden",
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
                  "bg-surface absolute inset-y-0 left-0 flex w-[min(22rem,calc(100%-3rem))] flex-col shadow-xl transition-transform duration-300",
                  isConversationMenuOpen ? "translate-x-0" : "-translate-x-full",
                )}
                id="venue-conversations-menu"
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
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{renderConversationList()}</div>
              </aside>
            </div>
          </>
        )}
        <div
          className={clsx(
            "grid gap-4 overflow-hidden",
            isExpanded ? "min-h-0 flex-1" : "h-128",
            role === "OWNER" && "md:grid-cols-3 md:gap-8",
            role === "OWNER" && !isExpanded && "md:h-200",
          )}
        >
          {role === "OWNER" && (
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
              {renderConversationList()}
            </SectionCard>
          )}
          <section
            className={clsx("relative flex min-h-0 flex-col overflow-hidden", role === "OWNER" && "md:col-span-2")}
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
                        (role === "OWNER" && message.sender_type === "VENUE") ||
                        (role === "USER" && message.sender_type === "USER");
                      const bubbleColour =
                        message.sender_type === "VENUE"
                          ? "bg-secondary-hover before:bg-secondary-hover"
                          : "bg-surface-tint before:bg-surface-tint";
                      const name = senderName(message.sender_type);
                      const senderColour = getSenderColour(name);
                      const isNewDay =
                        index === 0 ||
                        new Date(messages[index - 1]?.created_at ?? "").toDateString() !==
                          new Date(message.created_at).toDateString();
                      const previousMessage = messages[index - 1];
                      const followsSameSender =
                        !message.deleted_at &&
                        !previousMessage?.deleted_at &&
                        index > 0 &&
                        previousMessage?.sender_type === message.sender_type;
                      const showSender = !followsSameSender || isNewDay;

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
                            className={`flex max-w-[92%] gap-3 ${isOwnMessage ? "flex-row-reverse self-end" : "self-start"} ${followsSameSender ? "-mt-2" : ""}`}
                          >
                            {showSender ? (
                              <div
                                aria-hidden="true"
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tracking-tight text-white ${senderColour.avatarClassName}`}
                              >
                                {getSenderInitials(name)}
                              </div>
                            ) : (
                              <div aria-hidden="true" className="w-10 shrink-0" />
                            )}
                            <div className={`flex min-w-0 flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                              {showSender && (
                                <p
                                  className={`mb-1 px-1 text-base font-semibold ${senderColour.textClassName} ${isOwnMessage ? "text-right" : ""}`}
                                >
                                  {name}
                                </p>
                              )}
                              <div
                                className={`${bubbleColour} relative touch-manipulation rounded-xl px-4 py-2 select-none before:absolute before:bottom-0 before:h-4 before:w-4 before:content-[''] ${isOwnMessage ? "rounded-br-sm before:-right-2 before:[clip-path:polygon(0_0,0_100%,100%_100%)]" : "rounded-bl-sm before:-left-2 before:[clip-path:polygon(100%_0,100%_100%,0_100%)]"}`}
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
                                      ↩{" "}
                                      {message.reply_to_sender_type === "VENUE"
                                        ? venueName || i18n("Venue")
                                        : selectedConversation?.user_name || i18n("Customer")}
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
                                  {message.sent_from_telegram && (
                                    <Tooltip label={i18n("Sent from Telegram")}>
                                      <Image alt="Telegram" width={14} height={14} src={TELEGRAM_LOGO} />
                                    </Tooltip>
                                  )}
                                  <time className="ml-auto text-right" dateTime={message.created_at}>
                                    {message.edited_at && (
                                      <span className="mr-1">
                                        <Tooltip label={i18n("Edited")}>
                                          <Pencil />
                                        </Tooltip>
                                      </span>
                                    )}
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
                      {role === "OWNER" ? i18n("Select a conversation") : i18n("Start a conversation")}
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
              <>
                <div
                  data-message-actions
                  className="bg-surface fixed z-50 flex items-center gap-1 rounded-full p-2 shadow-xl ring-1 ring-neutral-200"
                  style={{ left: reactionPicker.x, top: reactionPicker.emojisTop }}
                >
                  {MESSAGE_REACTION_EMOJIS.map((emoji) => (
                    <button
                      aria-label={emoji}
                      className="hover:bg-surface-tint h-10 w-10 rounded-full px-1.5 py-1 text-2xl transition-transform hover:scale-125"
                      key={emoji}
                      onClick={() => {
                        const messageId = reactionPicker.message.id;
                        setReactionPicker(null);
                        void toggleReaction(messageId, emoji);
                      }}
                      type="button"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div
                  data-message-actions
                  className="bg-surface fixed z-50 overflow-hidden rounded-xl shadow-xl ring-1 ring-neutral-200"
                  style={{ left: reactionPicker.x, top: reactionPicker.actionsTop }}
                >
                  <button
                    className="hover:bg-surface-tint flex w-full items-center gap-2 px-4 py-3 text-sm font-medium"
                    onClick={() => {
                      setReplyToMessage(reactionPicker.message);
                      setReactionPicker(null);
                    }}
                    type="button"
                  >
                    <Reply size={18} />
                    {i18n("Reply")}
                  </button>
                  <button
                    className="border-neutral/10 hover:bg-surface-tint flex w-full items-center gap-2 border-t px-4 py-3 text-sm font-medium"
                    onClick={() => void copyMessage(reactionPicker.message.body)}
                    type="button"
                  >
                    <Copy size={18} />
                    {i18n("Copy")}
                  </button>
                  {canEditMessage(reactionPicker.message) && (
                    <button
                      className="border-neutral/10 hover:bg-surface-tint flex w-full items-center gap-2 border-t px-4 py-3 text-sm font-medium"
                      onClick={() => startEditingMessage(reactionPicker.message)}
                      type="button"
                    >
                      <Pencil size={18} />
                      {i18n("Edit")}
                    </button>
                  )}
                  {canDeleteMessage(reactionPicker.message) && (
                    <button
                      className="border-neutral/10 text-danger hover:bg-danger/10 flex w-full items-center gap-2 border-t px-4 py-3 text-sm font-medium"
                      onClick={() => void deleteMessage(reactionPicker.message)}
                      type="button"
                    >
                      <Trash2 size={18} />
                      {i18n("Delete")}
                    </button>
                  )}
                </div>
              </>
            )}
            <div className="p-3">
              {messageBeingEdited && (
                <div className="border-primary bg-primary/8 mb-2 flex items-center justify-between rounded-lg border-l-4 px-3 py-2 text-xs">
                  <span className="truncate">{i18n("Editing message")}</span>
                  <button
                    aria-label={i18n("Cancel editing")}
                    className="ml-3 text-base"
                    onClick={() => {
                      setMessageBeingEdited(null);
                      setMessageBody("");
                    }}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              )}
              {replyToMessage && (
                <div className="border-primary bg-primary/8 mb-2 flex items-center justify-between rounded-lg border-l-4 px-3 py-2 text-xs">
                  <span className="truncate">
                    {i18n("Replying to")}: {replyToMessage.body}
                  </span>
                  <button
                    aria-label={i18n("Cancel reply")}
                    className="ml-3 text-base"
                    onClick={() => setReplyToMessage(null)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex-col items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Textarea
                    className="min-h-18 resize-none"
                    disabled={role === "OWNER" && !selectedConversationId}
                    maxChars={4096}
                    onChange={(event) => setMessageBody(event.target.value)}
                    placeholder={i18n("Write a message")}
                    ref={composerRef}
                    rows={2}
                    value={messageBody}
                  />
                </div>
                <div className="-mt-3 flex justify-end">
                  <Button
                    busy={isSendingMessage}
                    disabled={!messageBody.trim() || (role === "OWNER" && !selectedConversationId)}
                    onClick={sendMessage}
                  >
                    {messageBeingEdited ? i18n("Save") : i18n("Send")}
                  </Button>
                </div>
              </div>
              <div className="flex-col text-right">
                {messageError && <p className="mt-1 text-sm text-red-600">{messageError}</p>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
