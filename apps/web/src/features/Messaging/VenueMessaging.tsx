"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import { ActionButton, Button, RichText, Separator, Textarea, Tooltip } from "~/components/ui";
import { PushNotifications } from "~/components/layout/PushNotifications/PushNotifications";
import { useI18n } from "~/i18n/useI18n";
import { MESSAGE_REACTION_EMOJIS } from "~/lib/messaging/constants";
import { getSenderColour, getSenderInitials } from "~/lib/messaging/sender";

import { Conversation, ConversationMessage } from "./types";
import { clsx } from "clsx";
import { MetadataSection } from "../Venues/VenueView/MetadataDisplay";

type MessagingRole = "OWNER" | "USER";

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

interface VenueMessagingProps {
  hasOwner: boolean;
  initialRole: MessagingRole | null;
  initialTelegramLinked: boolean | null;
  venueId: string;
  venueName: string;
}

export const VenueMessaging = ({
  hasOwner,
  initialRole,
  initialTelegramLinked,
  venueId,
  venueName,
}: VenueMessagingProps) => {
  const i18n = useI18n();
  const locale = useLocale();
  const requestedConversationId = useSearchParams().get("conversation");
  const [role, setRole] = useState<MessagingRole | null>(initialRole);
  const [telegramLinked, setTelegramLinked] = useState<boolean | null>(initialTelegramLinked);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [nextMessageCursor, setNextMessageCursor] = useState<null | string>(null);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<ConversationMessage | null>(null);
  const [messageError, setMessageError] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [reactionPicker, setReactionPicker] = useState<{
    message: ConversationMessage;
    x: number;
    y: number;
  } | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const shouldStickToLatestRef = useRef(true);
  const scrollRestoreRef = useRef<null | { height: number; top: number }>(null);
  const lastReadSyncRef = useRef("");
  const longPressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasOwner) {
      setRole(null);
      setTelegramLinked(null);
      setConversations([]);
      return;
    }
    let isCurrent = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(`/api/conversations?venueId=${encodeURIComponent(venueId)}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          if (response.status === 403 && isCurrent) setRole(null);
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
        setConversations(data.conversations);
        setSelectedConversationId(
          (current) =>
            current ||
            data.conversations.find((conversation) => conversation.id === requestedConversationId)?.id ||
            data.conversations[0]?.id ||
            null,
        );
      } catch {
        // Messaging remains unavailable when the session cannot be loaded.
      }
    };
    void load();
    const interval = window.setInterval(load, 5_000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, [hasOwner, requestedConversationId, venueId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      setNextMessageCursor(null);
      setHasOlderMessages(false);
      return;
    }
    shouldStickToLatestRef.current = true;
    setShowJumpToLatest(false);
    let isCurrent = true;
    let isInitialLoad = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(`/api/conversations/${selectedConversationId}/messages?limit=50`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as MessagePage;
        if (!isCurrent) return;
        setMessages((current) => (isInitialLoad ? data.messages : mergeMessages(current, data.messages)));
        if (isInitialLoad) {
          setNextMessageCursor(data.nextCursor);
          setHasOlderMessages(data.hasMore);
          isInitialLoad = false;
        }
        const lastMessageId = data.messages.at(-1)?.id ?? "";
        const readSyncKey = `${selectedConversationId}:${data.messages.length}:${lastMessageId}`;
        if (lastReadSyncRef.current !== readSyncKey) {
          lastReadSyncRef.current = readSyncKey;
          window.dispatchEvent(new Event("messages-read"));
        }
      } catch {
        if (isCurrent) setMessages([]);
      }
    };
    void load();
    const interval = window.setInterval(load, 3_000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, [selectedConversationId]);

  useEffect(() => {
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
  }, [messages, selectedConversationId]);

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

  useEffect(
    () => () => {
      if (longPressTimerRef.current !== null) window.clearTimeout(longPressTimerRef.current);
    },
    [],
  );

  if (!role) return null;

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
  const formatDay = (timestamp: string) =>
    new Intl.DateTimeFormat(locale === "uk" ? "uk-UA" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(timestamp));
  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) window.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };
  const openActions = (message: ConversationMessage, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setReactionPicker({
      message,
      x: Math.max(8, Math.min(rect.left, window.innerWidth - 280)),
      y: Math.max(8, Math.min(rect.top - 68, window.innerHeight - 150)),
    });
  };
  const refreshConversations = async () => {
    const response = await fetch(`/api/conversations?venueId=${encodeURIComponent(venueId)}`);
    if (response.ok) setConversations(((await response.json()) as { conversations: Conversation[] }).conversations);
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
        const messagesResponse = await fetch(`/api/conversations/${data.conversationId}/messages`);
        if (messagesResponse.ok) {
          setMessages(((await messagesResponse.json()) as { messages: ConversationMessage[] }).messages);
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

  return (
    <div className="space-y-4">
      <RichText as="div" className="text-neutral mb-6 text-sm">
        {role === "OWNER"
          ? telegramLinked
            ? i18n(
                "Manage customer enquiries in one place. Reply here, or reply to the forwarded message in Telegram—both appear in the same conversation.",
              )
            : i18n("Manage customer enquiries here. Link Telegram to also receive and reply to messages there.")
          : i18n(
              "Send a private message to this venue. Only you and the venue owner can see this conversation. They can reply here or through Telegram.",
            )}
      </RichText>

      {role === "OWNER" && telegramLinked === false && (
        <div className="bg-primary/10 flex items-center justify-between rounded-xl px-4 py-2">
          <p>{i18n("Link Telegram to receive customer messages")}</p>
          <div className="flex items-center space-x-2">
            {messageError && <p className="text-sm text-red-600">{messageError}</p>}
            <Button onClick={linkTelegram} size="sm" color="primary">
              {i18n("Link Telegram")}
            </Button>
          </div>
        </div>
      )}
      <div
        className={`grid gap-4 overflow-hidden ${role === "OWNER" ? "h-200 grid-rows-[12rem_minmax(0,1fr)] md:grid-cols-[16rem_1fr] md:grid-rows-1" : "h-128"}`}
      >
        {role === "OWNER" && (
          <aside
            className={`group/card border-primary/0 bg-surface-tint/50 hover:border-primary/20 rounded-xl border p-4 transition-all duration-300 hover:shadow-lg lg:text-base`}
          >
            <MetadataSection icon={MessageCircle} title={i18n("Conversations")}>
              {conversations.length ? (
                conversations.map((conversation) => (
                  <button
                    className={clsx(
                      "hover:bg-on-surface/5 -mx-4 flex w-full items-start justify-between px-4 py-2 text-sm",
                      selectedConversationId === conversation.id && "bg-primary/10",
                    )}
                    // className={`w-full text-left text-sm ${selectedConversationId === conversation.id ? "bg-primary/10" : "hover:bg-surface-tint"}`}
                    key={conversation.id}
                    onClick={() => setSelectedConversationId(conversation.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{conversation.user_name || i18n("Customer")}</p>
                      {Number(conversation.unread_count) > 0 && (
                        <span
                          aria-label={i18n("Unread messages")}
                          className="bg-primary text-on-primary flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold"
                        >
                          {Number(conversation.unread_count) > 99 ? "99+" : conversation.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-on-surface/70 text-sm">{i18n("No conversations yet")}</p>
              )}
            </MetadataSection>
          </aside>
        )}
        <section className="relative flex min-h-0 flex-col overflow-hidden">
          <div
            className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5"
            onScroll={(event) => {
              const element = event.currentTarget;
              const nearLatest = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
              shouldStickToLatestRef.current = nearLatest;
              setShowJumpToLatest(!nearLatest);
              if (element.scrollTop < 80) void loadOlderMessages();
            }}
            ref={messageListRef}
          >
            {isLoadingOlderMessages && (
              <p aria-live="polite" className="text-on-surface/60 text-center text-xs">
                {i18n("Loading older messages")}
              </p>
            )}
            {selectedConversationId ? (
              messages.map((message, index) => {
                const isVenueMessage = message.sender_type === "VENUE";
                const name = senderName(message.sender_type);
                const senderColour = getSenderColour(name);
                const isNewDay =
                  index === 0 ||
                  new Date(messages[index - 1]?.created_at ?? "").toDateString() !==
                    new Date(message.created_at).toDateString();
                const followsSameSender = index > 0 && messages[index - 1]?.sender_type === message.sender_type;
                const showSender = !followsSameSender || isNewDay;
                return (
                  <Fragment key={message.id}>
                    {isNewDay && <Separator className="py-1" text={formatDay(message.created_at)} />}
                    <div
                      className={`flex max-w-[92%] gap-3 ${isVenueMessage ? "flex-row-reverse self-end" : "self-start"} ${followsSameSender ? "-mt-2" : ""}`}
                    >
                      {showSender ? (
                        <div
                          aria-hidden="true"
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tracking-tight text-white ${isVenueMessage ? "bg-primary" : senderColour.avatarClassName}`}
                        >
                          {getSenderInitials(name)}
                        </div>
                      ) : (
                        <div aria-hidden="true" className="w-10 shrink-0" />
                      )}
                      <div className={`flex min-w-0 flex-col ${isVenueMessage ? "items-end" : "items-start"}`}>
                        {showSender && (
                          <p
                            className={`mb-1 px-1 text-base font-semibold ${isVenueMessage ? "text-primary text-right" : senderColour.textClassName}`}
                          >
                            {name}
                          </p>
                        )}
                        <div
                          className={`bg-surface-tint before:bg-surface-tint relative rounded-xl px-4 py-2 before:absolute before:bottom-0 before:h-4 before:w-4 before:content-[''] ${isVenueMessage ? "rounded-br-sm before:-right-2 before:[clip-path:polygon(0_0,0_100%,100%_100%)]" : "rounded-bl-sm before:-left-2 before:[clip-path:polygon(100%_0,100%_100%,0_100%)]"}`}
                          onContextMenu={(event) => {
                            event.preventDefault();
                            openActions(message, event.currentTarget);
                          }}
                          onPointerCancel={clearLongPress}
                          onPointerDown={(event) => {
                            if (event.pointerType === "touch") {
                              const element = event.currentTarget;
                              longPressTimerRef.current = window.setTimeout(() => {
                                openActions(message, element);
                                longPressTimerRef.current = null;
                              }, 500);
                            }
                          }}
                          onPointerMove={clearLongPress}
                          onPointerUp={clearLongPress}
                        >
                          {message.reply_to_body && (
                            <div className="border-primary bg-primary/8 text-on-surface/70 mb-2 max-w-full rounded-xl border-l-4 px-3 py-2 text-sm">
                              <p className="text-primary font-semibold">
                                ↩{" "}
                                {message.reply_to_sender_type === "VENUE"
                                  ? venueName || i18n("Venue")
                                  : selectedConversation?.user_name || i18n("Customer")}
                              </p>
                              <p className="mt-0.5 truncate">{message.reply_to_body}</p>
                            </div>
                          )}
                          <p className="text-base leading-6 wrap-break-word whitespace-pre-wrap">{message.body}</p>

                          <div className="text-on-surface/60 mt-1 flex min-w-24 justify-between text-xs">
                            {message.sender_type === "USER" && message.telegram_delivered_at && (
                              <Tooltip label={i18n("Delivered to Telegram")}>
                                <Check className="stroke-success mt-1" size={10} />
                              </Tooltip>
                            )}
                            <time className="ml-auto text-right" dateTime={message.created_at}>
                              {formatTimestamp(message.created_at)}
                            </time>
                          </div>

                          {message.reactions?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.reactions.map((reaction) => (
                                <button
                                  aria-label={
                                    reaction.reacted
                                      ? i18n("Your reaction")
                                      : i18n("Reaction from the other participant")
                                  }
                                  className={`rounded-full px-3 py-1.5 text-lg leading-none transition-colors ${reaction.reacted ? "bg-primary/15 hover:bg-primary/30" : "bg-on-surface/10 hover:bg-on-surface/20"}`}
                                  key={reaction.emoji}
                                  onClick={() => void toggleReaction(message.id, reaction.emoji)}
                                  type="button"
                                >
                                  {reaction.emoji}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Fragment>
                );
              })
            ) : (
              <p className="text-on-surface/70 text-sm">
                {role === "OWNER" ? i18n("Select a conversation") : i18n("Start a conversation")}
              </p>
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
                style={{ left: reactionPicker.x, top: reactionPicker.y }}
              >
                {MESSAGE_REACTION_EMOJIS.map((emoji) => (
                  <button
                    aria-label={emoji}
                    className="hover:bg-surface-tint rounded-full px-1.5 py-1 text-2xl transition-transform hover:scale-125"
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
              <button
                data-message-actions
                className="bg-surface hover:bg-surface-tint fixed z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ring-1 ring-neutral-200"
                onClick={() => {
                  setReplyToMessage(reactionPicker.message);
                  setReactionPicker(null);
                }}
                style={{ left: reactionPicker.x, top: reactionPicker.y + 68 }}
                type="button"
              >
                <span className="text-xl">↩</span>
                {i18n("Reply")}
              </button>
            </>
          )}
          <div className="p-3">
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
            <div className="flex items-end gap-2">
              <div className="min-w-0 flex-1">
                <Textarea
                  disabled={role === "OWNER" && !selectedConversationId}
                  maxChars={4096}
                  onChange={(event) => setMessageBody(event.target.value)}
                  placeholder={i18n("Write a message")}
                  rows={2}
                  value={messageBody}
                />
              </div>
              <Button
                busy={isSendingMessage}
                className="mb-5"
                disabled={!messageBody.trim() || (role === "OWNER" && !selectedConversationId)}
                onClick={sendMessage}
              >
                {i18n("Send")}
              </Button>
            </div>
            <div className="flex-col text-right">
              <PushNotifications />
              {messageError && <p className="mt-1 text-sm text-red-600">{messageError}</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
