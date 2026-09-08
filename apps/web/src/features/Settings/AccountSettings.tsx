"use client";

import { Bell, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button, Checkbox, TextLink } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import type { ContentAlertDeliveryPreferences } from "~/lib/models/content-subscription-alert-deliveries";
import type { ContentUpdateNotificationPreferences } from "~/lib/models/content-updates";
import type { TelegramCommunityNotificationPreferences } from "~/lib/models/telegram-community-notifications";

import { ContentAlertDeliverySettings } from "./ContentAlertDeliverySettings";

type AccountSettingsProps = {
  initialContentAlertDeliveryPreferences: ContentAlertDeliveryPreferences;
  initialTelegramCommunityPreferences: TelegramCommunityNotificationPreferences;
  initialUpdateNotificationPreferences: ContentUpdateNotificationPreferences;
};

export const AccountSettings = ({
  initialContentAlertDeliveryPreferences,
  initialTelegramCommunityPreferences,
  initialUpdateNotificationPreferences,
}: AccountSettingsProps) => {
  const i18n = useI18n();
  const { openConfirmDialog } = useDialog();
  const { showError, showSuccess } = useNotifications();
  const [preferences, setPreferences] = useState<ContentUpdateNotificationPreferences>(
    initialUpdateNotificationPreferences,
  );
  const [savingPreferences, setSavingPreferences] = useState<
    Record<keyof ContentUpdateNotificationPreferences, boolean>
  >({
    comments_enabled: false,
    replies_enabled: false,
  });
  const [telegramPreferences, setTelegramPreferences] = useState<TelegramCommunityNotificationPreferences>({
    ...initialTelegramCommunityPreferences,
    linked: initialTelegramCommunityPreferences.linked || initialContentAlertDeliveryPreferences.telegramLinked,
  });
  const [telegramFollowEnabled, setTelegramFollowEnabled] = useState(initialContentAlertDeliveryPreferences.telegramEnabled);
  const [isAwaitingTelegramLink, setIsAwaitingTelegramLink] = useState(false);
  const [isLinkingTelegram, setIsLinkingTelegram] = useState(false);
  const [isUnlinkingTelegram, setIsUnlinkingTelegram] = useState(false);
  const [isSavingTelegramFollow, setIsSavingTelegramFollow] = useState(false);
  const [isSavingTelegramCommunity, setIsSavingTelegramCommunity] = useState(false);
  const isTelegramPreferenceSaving = isSavingTelegramFollow || isSavingTelegramCommunity;

  const save = async (preference: keyof ContentUpdateNotificationPreferences, enabled: boolean) => {
    if (savingPreferences[preference]) return;
    const previous = preferences[preference];
    setPreferences((current) => ({ ...current, [preference]: enabled }));
    setSavingPreferences((current) => ({ ...current, [preference]: true }));
    try {
      const response = await fetch("/api/updates/notifications", {
        body: JSON.stringify({
          [preference === "comments_enabled" ? "commentsEnabled" : "repliesEnabled"]: enabled,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const saved = (await response.json()) as ContentUpdateNotificationPreferences & { error?: string };
      if (!response.ok) throw new Error(saved.error ?? "Unable to save notification preferences");
      setPreferences((current) => ({ ...current, [preference]: saved[preference] }));
    } catch (error) {
      setPreferences((current) => ({ ...current, [preference]: previous }));
      showError(error instanceof Error ? error.message : i18n("Unable to save notification preferences"));
    } finally {
      setSavingPreferences((current) => ({ ...current, [preference]: false }));
    }
  };

  const refreshTelegramPreferences = useCallback(async () => {
    const response = await fetch("/api/telegram/user-community-notifications", { cache: "no-store" });
    const result = (await response.json().catch(() => null)) as
      | (TelegramCommunityNotificationPreferences & { error?: string })
      | null;
    if (!response.ok || !result) throw new Error(result?.error ?? "Unable to load Telegram settings");
    setTelegramPreferences({ enabled: result.linked ? result.enabled : false, linked: result.linked });
    if (!result.linked) setTelegramFollowEnabled(false);
    if (result.linked) setIsAwaitingTelegramLink(false);
  }, []);

  useEffect(() => {
    if (!isAwaitingTelegramLink || telegramPreferences.linked) return;
    const poll = window.setInterval(() => void refreshTelegramPreferences().catch(() => undefined), 5_000);
    return () => window.clearInterval(poll);
  }, [isAwaitingTelegramLink, refreshTelegramPreferences, telegramPreferences.linked]);

  const linkTelegram = async () => {
    if (isUnlinkingTelegram || isTelegramPreferenceSaving) return;
    setIsLinkingTelegram(true);
    try {
      const response = await fetch("/api/telegram/user-link", { method: "POST" });
      const result = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;
      if (!response.ok || !result?.url) throw new Error(result?.error ?? "Unable to create a Telegram link");
      window.open(result.url, "_blank", "noopener,noreferrer");
      setIsAwaitingTelegramLink(true);
      void refreshTelegramPreferences().catch(() => undefined);
      showSuccess(i18n("Finish linking in Telegram. This page will update automatically."));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to create a Telegram link"));
    } finally {
      setIsLinkingTelegram(false);
    }
  };

  const unlinkTelegram = async () => {
    if (isLinkingTelegram || isTelegramPreferenceSaving) return;
    if (
      !(await openConfirmDialog({
        message: i18n("Telegram will stop receiving follow alerts and private Community responses."),
        title: i18n("Unlink Telegram?"),
      }))
    )
      return;
    setIsUnlinkingTelegram(true);
    try {
      const response = await fetch("/api/telegram/user-unlink", { method: "POST" });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error ?? "Unable to unlink Telegram");
      setIsAwaitingTelegramLink(false);
      setTelegramPreferences({ enabled: false, linked: false });
      setTelegramFollowEnabled(false);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to unlink Telegram"));
    } finally {
      setIsUnlinkingTelegram(false);
    }
  };

  const saveTelegramFollow = async (enabled: boolean) => {
    if (isSavingTelegramFollow) return;
    const previous = telegramFollowEnabled;
    setTelegramFollowEnabled(enabled);
    setIsSavingTelegramFollow(true);
    try {
      const response = await fetch("/api/following/delivery", {
        body: JSON.stringify({ telegramEnabled: enabled }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json().catch(() => null)) as
        | (ContentAlertDeliveryPreferences & { error?: string })
        | null;
      if (!response.ok || !result) throw new Error(result?.error ?? "Unable to save alert delivery settings");
      setTelegramFollowEnabled(result.telegramLinked ? result.telegramEnabled : false);
      setTelegramPreferences((current) => ({
        ...current,
        enabled: result.telegramLinked ? current.enabled : false,
        linked: result.telegramLinked,
      }));
    } catch (error) {
      setTelegramFollowEnabled(previous);
      void refreshTelegramPreferences().catch(() => undefined);
      showError(error instanceof Error ? error.message : i18n("Unable to save alert delivery settings"));
    } finally {
      setIsSavingTelegramFollow(false);
    }
  };

  const saveTelegramCommunity = async (enabled: boolean) => {
    if (isSavingTelegramCommunity) return;
    const previous = telegramPreferences.enabled;
    setTelegramPreferences((current) => ({ ...current, enabled }));
    setIsSavingTelegramCommunity(true);
    try {
      const response = await fetch("/api/telegram/user-community-notifications", {
        body: JSON.stringify({ enabled }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json().catch(() => null)) as { enabled?: boolean; error?: string; linked: boolean } | null;
      const savedEnabled = result?.enabled;
      if (!response.ok || !result || savedEnabled === undefined)
        throw new Error(result?.error ?? "Unable to save Telegram settings");
      setTelegramPreferences({ enabled: result.linked ? savedEnabled : false, linked: result.linked });
      if (!result.linked) setTelegramFollowEnabled(false);
    } catch (error) {
      setTelegramPreferences((current) => ({ ...current, enabled: previous }));
      void refreshTelegramPreferences().catch(() => undefined);
      showError(error instanceof Error ? error.message : i18n("Unable to save Telegram settings"));
    } finally {
      setIsSavingTelegramCommunity(false);
    }
  };

  return (
    <div className="space-y-6">
      <section aria-labelledby="notifications-heading" className="space-y-4" id="updates-notifications">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary rounded-xl p-2.5">
            <Bell aria-hidden size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold md:text-2xl" id="notifications-heading">
              {i18n("Notifications")}
            </h2>
            <p className="text-neutral mt-1 text-sm md:text-base">
              {i18n("Choose the activity you want to hear about.")}
            </p>
          </div>
        </div>
        <section className="bg-surface-tint/50 border-primary/10 rounded-2xl border p-5 md:p-6">
          <h3 className="text-lg font-bold">{i18n("Feed activity")}</h3>
          <p className="text-neutral mt-1 text-sm">{i18n("Choose which feed activity you want to be notified about")}</p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4 border-t border-current/10 pt-5">
            <Checkbox
              checked={preferences.comments_enabled}
              disabled={savingPreferences.comments_enabled}
              label={i18n("Comments to posts")}
              onChange={(event) => void save("comments_enabled", event.target.checked)}
            />
            <Checkbox
              checked={preferences.replies_enabled}
              disabled={savingPreferences.replies_enabled}
              label={i18n("Replies to comments")}
              onChange={(event) => void save("replies_enabled", event.target.checked)}
            />
          </div>
        </section>
        <section className="bg-surface-tint/50 border-primary/10 rounded-2xl border p-5 md:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-lg font-bold">{i18n("Following alerts")}</h3>
              <p className="text-neutral mt-1 text-sm">{i18n("Receive updates from the places and areas you follow.")}</p>
            </div>
            <TextLink href="/user-profile/following">{i18n("Manage follows")}</TextLink>
          </div>
          <ContentAlertDeliverySettings id="content-alert-delivery" initialPreferences={initialContentAlertDeliveryPreferences} />
        </section>
      </section>
      <section
        aria-labelledby="telegram-heading"
        className="bg-surface-tint/50 border-primary/10 rounded-2xl border p-5 md:p-6"
        id="telegram-connection"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2.5">
              <Send aria-hidden size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold md:text-2xl" id="telegram-heading">
                {i18n("Telegram")}
              </h2>
              <p className="text-neutral mt-1 text-sm md:text-base">
                {telegramPreferences.linked
                  ? i18n("Choose the Telegram alerts you want to receive.")
                  : i18n("Connect once to receive follow alerts and private Community responses.")}
              </p>
            </div>
          </div>
          {telegramPreferences.linked ? (
            <Button
              busy={isUnlinkingTelegram}
              color="danger"
              disabled={isTelegramPreferenceSaving}
              onClick={() => void unlinkTelegram()}
              size="sm"
              variant="outlined"
            >
              {i18n("Unlink")}
            </Button>
          ) : (
            <Button
              busy={isLinkingTelegram}
              color="primary"
              disabled={isUnlinkingTelegram || isTelegramPreferenceSaving}
              onClick={() => void linkTelegram()}
              size="sm"
            >
              {i18n("Link Telegram")}
            </Button>
          )}
        </div>
        <div className="mt-5 grid gap-4 border-t border-current/10 pt-5 sm:grid-cols-2">
          <Checkbox
            checked={telegramPreferences.linked && telegramFollowEnabled}
            disabled={!telegramPreferences.linked || isSavingTelegramFollow || isUnlinkingTelegram}
            label={i18n("Alerts from followed places")}
            onChange={(event) => void saveTelegramFollow(event.target.checked)}
          />
          <Checkbox
            checked={telegramPreferences.linked && telegramPreferences.enabled}
            disabled={!telegramPreferences.linked || isSavingTelegramCommunity || isUnlinkingTelegram}
            label={i18n("Private Community responses")}
            onChange={(event) => void saveTelegramCommunity(event.target.checked)}
          />
        </div>
        {!telegramPreferences.linked && (
          <p className="text-neutral mt-3 text-sm">{i18n("Link Telegram to turn on either alert.")}</p>
        )}
        <TextLink className="mt-3" href="/user-profile/settings#content-alert-delivery">
          {i18n("Follow alerts use the delivery frequency above.")}
        </TextLink>
      </section>
    </div>
  );
};
