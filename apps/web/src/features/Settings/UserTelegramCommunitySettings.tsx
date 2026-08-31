"use client";

import Image from "next/image";
import { Bell, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AnimatedEllipsis, Button, Checkbox, SectionCard } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";

type TelegramCommunityPreferences = { enabled: boolean; linked: boolean };

const INITIAL_PREFERENCES: TelegramCommunityPreferences = { enabled: false, linked: false };

export function UserTelegramCommunitySettings() {
  const i18n = useI18n();
  const { openConfirmDialog } = useDialog();
  const { showError, showSuccess } = useNotifications();
  const [preferences, setPreferences] = useState<TelegramCommunityPreferences>(INITIAL_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/telegram/user-community-notifications");
    const result = (await response.json().catch(() => null)) as
      | (TelegramCommunityPreferences & { error?: string })
      | null;
    if (!response.ok || !result) throw new Error(result?.error ?? "Unable to load Telegram settings");
    setPreferences({ enabled: result.enabled, linked: result.linked });
    return result;
  }, []);

  useEffect(() => {
    void refresh()
      .catch((error) => showError(error instanceof Error ? error.message : i18n("Unable to load Telegram settings")))
      .finally(() => setIsLoading(false));
  }, [i18n, refresh, showError]);

  const link = async () => {
    setIsLinking(true);
    try {
      const response = await fetch("/api/telegram/user-link", { method: "POST" });
      const result = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;
      if (!response.ok || !result?.url) throw new Error(result?.error ?? "Unable to create a Telegram link");
      window.open(result.url, "_blank", "noopener,noreferrer");
      showSuccess(i18n("Finish linking in Telegram - this page will update automatically."));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to create a Telegram link"));
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    if (preferences.linked) return;
    const interval = window.setInterval(() => void refresh().catch(() => undefined), 5_000);
    return () => window.clearInterval(interval);
  }, [preferences.linked, refresh]);

  const saveNotifications = async (enabled: boolean) => {
    const previous = preferences;
    setPreferences((current) => ({ ...current, enabled }));
    setIsSaving(true);
    try {
      const response = await fetch("/api/telegram/user-community-notifications", {
        body: JSON.stringify({ enabled }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = (await response.json().catch(() => null)) as
        | (TelegramCommunityPreferences & { error?: string })
        | null;
      if (!response.ok || !result) throw new Error(result?.error ?? "Unable to save Telegram settings");
      setPreferences({ enabled: result.enabled, linked: result.linked });
    } catch (error) {
      setPreferences(previous);
      showError(error instanceof Error ? error.message : i18n("Unable to save Telegram settings"));
    } finally {
      setIsSaving(false);
    }
  };

  const unlink = async () => {
    if (
      !(await openConfirmDialog({
        message: i18n("Telegram will stop receiving private Community responses."),
        title: i18n("Unlink Telegram?"),
      }))
    )
      return;
    setIsUnlinking(true);
    try {
      const response = await fetch("/api/telegram/user-unlink", { method: "POST" });
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error ?? "Unable to unlink Telegram");
      setPreferences(INITIAL_PREFERENCES);
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to unlink Telegram"));
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <SectionCard title={i18n("Telegram for Community")}>
      <div className="mt-4 space-y-4">
        <div className="from-primary/10 flex items-center justify-between gap-4 rounded-xl bg-linear-to-r to-transparent px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Image alt="Telegram" height={36} src="/static/telegram.svg" width={36} />
            <div>
              <p className="font-medium">{i18n("Telegram")}</p>
              <p className="text-on-surface/70 text-sm">
                {preferences.linked
                  ? i18n("Linked - choose what Telegram receives")
                  : i18n("Receive private Community responses in Telegram")}
              </p>
            </div>
          </div>
          {preferences.linked ? (
            <Button busy={isUnlinking} color="danger" onClick={() => void unlink()} size="sm" variant="outlined">
              {i18n("Unlink")}
            </Button>
          ) : (
            <Button busy={isLinking} color="primary" onClick={() => void link()} size="sm">
              {i18n("Link")}
            </Button>
          )}
        </div>
        {isLoading ? (
          <AnimatedEllipsis centered size="sm" />
        ) : (
          <div className="space-y-3 border-t border-current/10 pt-4">
            <Checkbox
              checked={preferences.enabled}
              disabled={!preferences.linked || isSaving}
              label={i18n("Notify me about private Community responses")}
              onChange={(event) => void saveNotifications(event.target.checked)}
            />
            <p className="text-on-surface/70 ml-7 flex gap-2 text-sm">
              <Bell aria-hidden className="mt-0.5 shrink-0" size={15} />
              {preferences.linked
                ? i18n("Get a Telegram message when someone responds to your Community post.")
                : i18n("Link Telegram first to turn on Community response notifications.")}
            </p>
            <p className="text-neutral ml-7 flex gap-2 text-sm">
              <Send aria-hidden className="mt-0.5 shrink-0" size={15} />
              {i18n("Responses remain private and are opened securely in Mandrii.")}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
