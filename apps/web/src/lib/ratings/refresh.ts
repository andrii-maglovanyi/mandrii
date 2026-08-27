import { RatingTargetType } from "./types";

const channelName = "mandrii-rating-refresh";
const storageKey = "mandrii-rating-refresh";
const localEventName = "mandrii-rating-refresh";

type RefreshMessage = {
  id: string;
  key: string;
};

export const ratingRefreshKey = (type: RatingTargetType, targetId: string) => `${type}:${targetId}`;

const createMessage = (key: string): RefreshMessage => ({
  id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  key,
});

const parseMessage = (value: unknown): RefreshMessage | null => {
  if (
    !value ||
    typeof value !== "object" ||
    !("id" in value) ||
    !("key" in value) ||
    typeof value.id !== "string" ||
    typeof value.key !== "string"
  ) {
    return null;
  }
  return value as RefreshMessage;
};

export const publishRatingRefresh = (type: RatingTargetType, targetId: string) => {
  if (typeof window === "undefined") return;

  const message = createMessage(ratingRefreshKey(type, targetId));

  // Always notify this document synchronously. BroadcastChannel behavior in
  // the publishing document is browser-dependent, while this is explicit.
  window.dispatchEvent(new CustomEvent<RefreshMessage>(localEventName, { detail: message }));

  if (typeof window.BroadcastChannel !== "undefined") {
    const channel = new window.BroadcastChannel(channelName);
    channel.postMessage(message);
    channel.close();
    return;
  }

  // Storage synchronizes the fallback with other tabs.
  window.localStorage.setItem(storageKey, JSON.stringify(message));
  window.localStorage.removeItem(storageKey);
};

export const subscribeToRatingRefresh = (type: RatingTargetType, targetId: string, onRefresh: () => void) => {
  if (typeof window === "undefined") return () => undefined;

  const key = ratingRefreshKey(type, targetId);
  const channel = typeof window.BroadcastChannel !== "undefined" ? new window.BroadcastChannel(channelName) : null;
  const handledMessages = new Set<string>();
  const handleMessage = (value: unknown) => {
    const message = parseMessage(value);
    if (!message || message.key !== key || handledMessages.has(message.id)) return;

    if (handledMessages.size >= 100) handledMessages.clear();
    handledMessages.add(message.id);
    onRefresh();
  };
  const onMessage = (event: MessageEvent<unknown>) => handleMessage(event.data);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue) return;
    try {
      handleMessage(JSON.parse(event.newValue));
    } catch {
      // Ignore a malformed browser storage event.
    }
  };
  const onLocalRefresh = (event: Event) => handleMessage((event as CustomEvent<unknown>).detail);

  channel?.addEventListener("message", onMessage);
  window.addEventListener(localEventName, onLocalRefresh);
  if (!channel) window.addEventListener("storage", onStorage);
  return () => {
    channel?.removeEventListener("message", onMessage);
    channel?.close();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(localEventName, onLocalRefresh);
  };
};
