"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import { Checkbox } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";

import { UserTelegramCommunitySettings } from "./UserTelegramCommunitySettings";

type UpdateNotificationPreferences = {
  comments_enabled: boolean;
  replies_enabled: boolean;
};

export const AccountSettings = () => {
  const i18n = useI18n();
  const { showError } = useNotifications();
  const [preferences, setPreferences] = useState<UpdateNotificationPreferences>({
    comments_enabled: true,
    replies_enabled: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState<Record<keyof UpdateNotificationPreferences, boolean>>({
    comments_enabled: false,
    replies_enabled: false,
  });

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/updates/notifications", { signal: controller.signal })
      .then(async (response) => {
        const result = (await response.json()) as { error?: string; preferences?: UpdateNotificationPreferences };
        if (!response.ok || !result.preferences)
          throw new Error(result.error ?? "Unable to load notification preferences");
        setPreferences(result.preferences);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          showError(error instanceof Error ? error.message : i18n("Unable to load notification preferences"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [i18n, showError]);

  const save = async (preference: keyof UpdateNotificationPreferences, enabled: boolean) => {
    if (savingPreferences[preference]) return;
    const previous = preferences;
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
      const saved = (await response.json()) as UpdateNotificationPreferences & { error?: string };
      if (!response.ok) throw new Error(saved.error ?? "Unable to save notification preferences");
      setPreferences((current) => ({ ...current, [preference]: saved[preference] }));
    } catch (error) {
      setPreferences((current) => ({ ...current, [preference]: previous[preference] }));
      showError(error instanceof Error ? error.message : i18n("Unable to save notification preferences"));
    } finally {
      setSavingPreferences((current) => ({ ...current, [preference]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <section
        className="bg-surface-tint/50 border-primary/10 rounded-2xl border p-6 md:p-8"
        id="updates-notifications"
      >
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 text-primary rounded-xl p-2.5">
            <Bell aria-hidden size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold md:text-2xl">{i18n("Feed notifications")}</h2>
            <p className="text-neutral mt-1 text-sm md:text-base">
              {i18n("Choose which feed activity you want to be notified about")}
            </p>
          </div>
        </div>

        {isLoading ? (
          <AnimatedEllipsis centered size="sm" />
        ) : (
          <div className="mt-6 flex flex-wrap gap-5 border-t border-current/10 pt-5">
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
        )}
      </section>
      <UserTelegramCommunitySettings />
    </div>
  );
};
