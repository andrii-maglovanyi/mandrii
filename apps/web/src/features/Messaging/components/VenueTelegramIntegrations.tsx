"use client";

import { useCallback, useEffect, useState } from "react";

import { useDialog } from "~/contexts/DialogContext";
import { useI18n } from "~/i18n/useI18n";
import { UUID } from "~/types/uuid";

import { TelegramLinkPanel } from "./TelegramLinkPanel";

type Delivery = {
  attempts: number;
  delivered_at: null | string;
  last_error: null | string;
  next_attempt_at: string;
  status: "DELIVERED" | "FAILED" | "PENDING" | "PROCESSING";
};

export const VenueTelegramIntegrations = ({
  initialLinked,
  initialReviewNotificationsEnabled,
  targetId,
  targetType = "venue",
}: {
  initialLinked: boolean;
  initialReviewNotificationsEnabled: boolean;
  targetId: UUID;
  targetType?: "event" | "venue";
}) => {
  const i18n = useI18n();
  const { openConfirmDialog } = useDialog();
  const [linked, setLinked] = useState(initialLinked);
  const [reviewNotificationsEnabled, setReviewNotificationsEnabled] = useState(initialReviewNotificationsEnabled);
  const [qrNotificationsEnabled, setQrNotificationsEnabled] = useState(false);
  const [isSavingQrNotifications, setIsSavingQrNotifications] = useState(false);
  const [messageNotificationsEnabled, setMessageNotificationsEnabled] = useState(false);
  const [isSavingMessageNotifications, setIsSavingMessageNotifications] = useState(false);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState("");
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isAwaitingLink, setIsAwaitingLink] = useState(false);
  const targetPayload = targetType === "venue" ? { venueId: targetId } : { eventId: targetId };

  const refreshDelivery = useCallback(async () => {
    const queryKey = targetType === "venue" ? "venueId" : "eventId";
    const response = await fetch(`/api/telegram/review-notifications?${queryKey}=${encodeURIComponent(targetId)}`);
    if (!response.ok) return;
    const result = (await response.json()) as { delivery: Delivery | null; enabled: boolean; linked: boolean };
    setDelivery(result.delivery);
    setLinked(result.linked);
    setReviewNotificationsEnabled(result.enabled);
    if (result.linked) setIsAwaitingLink(false);
  }, [targetId, targetType]);

  useEffect(() => void refreshDelivery(), [refreshDelivery]);

  const refreshQrNotifications = useCallback(async () => {
    const queryKey = targetType === "venue" ? "venueId" : "eventId";
    const response = await fetch(`/api/telegram/qr-notifications?${queryKey}=${encodeURIComponent(targetId)}`);
    if (!response.ok) return;
    const result = (await response.json()) as { enabled: boolean };
    setQrNotificationsEnabled(result.enabled);
  }, [targetId, targetType]);

  useEffect(() => void refreshQrNotifications(), [refreshQrNotifications]);

  const refreshMessageNotifications = useCallback(async () => {
    if (targetType !== "venue") return;
    const response = await fetch(`/api/telegram/message-notifications?venueId=${encodeURIComponent(targetId)}`);
    if (!response.ok) return;
    const result = (await response.json()) as { enabled: boolean };
    setMessageNotificationsEnabled(result.enabled);
  }, [targetId, targetType]);

  useEffect(() => void refreshMessageNotifications(), [refreshMessageNotifications]);

  useEffect(() => {
    if (!isAwaitingLink || linked) return;

    const refreshOnFocus = () => void refreshDelivery();
    const interval = window.setInterval(refreshOnFocus, 5_000);
    const timeout = window.setTimeout(() => setIsAwaitingLink(false), 15 * 60 * 1_000);
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [isAwaitingLink, linked, refreshDelivery]);

  const link = async () => {
    setError("");
    try {
      const response = await fetch(targetType === "venue" ? "/api/telegram/link" : "/api/telegram/event-link", {
        body: JSON.stringify(targetPayload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string; url?: string };
      if (!response.ok || !result.url) throw new Error(result.error || i18n("Unable to create a Telegram link"));
      window.open(result.url, "_blank", "noopener,noreferrer");
      setIsAwaitingLink(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : i18n("Unable to create a Telegram link"));
    }
  };

  const unlink = async () => {
    if (
      !(await openConfirmDialog({
        message: i18n(
          targetType === "venue"
            ? "Telegram will stop receiving new customer messages."
            : "Telegram will stop receiving new review notifications.",
        ),
        title: i18n("Unlink Telegram?"),
      }))
    )
      return;
    setIsUnlinking(true);
    setError("");
    try {
      const response = await fetch("/api/telegram/unlink", {
        body: JSON.stringify(targetPayload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || i18n("Unable to unlink Telegram"));
      setLinked(false);
      setReviewNotificationsEnabled(false);
      setDelivery(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : i18n("Unable to unlink Telegram"));
    } finally {
      setIsUnlinking(false);
    }
  };

  const updateNotifications = async (enabled: boolean) => {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("/api/telegram/review-notifications", {
        body: JSON.stringify({ ...targetPayload, enabled }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json()) as { enabled?: boolean; error?: string };
      if (!response.ok || result.enabled === undefined)
        throw new Error(result.error || i18n("Unable to update Telegram review notifications"));
      setReviewNotificationsEnabled(result.enabled);
      void refreshDelivery();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : i18n("Unable to update Telegram review notifications"));
    } finally {
      setIsSaving(false);
    }
  };

  const retry = async () => {
    setIsRetrying(true);
    setError("");
    try {
      const response = await fetch("/api/telegram/review-notifications", {
        body: JSON.stringify(targetPayload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || i18n("Unable to retry Telegram review notification"));
      await refreshDelivery();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : i18n("Unable to retry Telegram review notification"));
    } finally {
      setIsRetrying(false);
    }
  };

  const updateQrNotifications = async (enabled: boolean) => {
    setIsSavingQrNotifications(true);
    setError("");
    try {
      const response = await fetch("/api/telegram/qr-notifications", {
        body: JSON.stringify({ ...targetPayload, enabled }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json()) as { enabled?: boolean; error?: string };
      if (!response.ok || result.enabled === undefined)
        throw new Error(result.error || i18n("Unable to update Telegram QR notifications"));
      setQrNotificationsEnabled(result.enabled);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : i18n("Unable to update Telegram QR notifications"));
    } finally {
      setIsSavingQrNotifications(false);
    }
  };

  const updateMessageNotifications = async (enabled: boolean) => {
    if (targetType !== "venue") return;
    setIsSavingMessageNotifications(true);
    setError("");
    try {
      const response = await fetch("/api/telegram/message-notifications", {
        body: JSON.stringify({ enabled, venueId: targetId }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json()) as { enabled?: boolean; error?: string };
      if (!response.ok || result.enabled === undefined)
        throw new Error(result.error || i18n("Unable to update Telegram message notifications"));
      setMessageNotificationsEnabled(result.enabled);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : i18n("Unable to update Telegram message notifications"));
    } finally {
      setIsSavingMessageNotifications(false);
    }
  };

  return (
    <TelegramLinkPanel
      delivery={delivery}
      error={error}
      isAwaitingLink={isAwaitingLink}
      isLinked={linked}
      isSavingReviewNotifications={isSaving}
      isUnlinking={isUnlinking}
      onLink={() => void link()}
      onMessageNotificationsChange={(enabled) => void updateMessageNotifications(enabled)}
      onRetryReviewNotification={() => void retry()}
      onReviewNotificationsChange={(enabled) => void updateNotifications(enabled)}
      onQrNotificationsChange={(enabled) => void updateQrNotifications(enabled)}
      onUnlink={() => void unlink()}
      retryingReviewNotification={isRetrying}
      reviewNotificationsEnabled={reviewNotificationsEnabled}
      qrNotificationsEnabled={qrNotificationsEnabled}
      isSavingQrNotifications={isSavingQrNotifications}
      isSavingMessageNotifications={isSavingMessageNotifications}
      messageNotificationsEnabled={messageNotificationsEnabled}
      isVenue={targetType === "venue"}
    />
  );
};
