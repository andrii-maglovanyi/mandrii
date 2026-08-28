"use client";

import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

import { Checkbox } from "~/components/ui";
import { AnimatedEllipsis } from "~/components/ui/AnimatedEllipsis/AnimatedEllipsis";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";

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
  const [isSaving, setIsSaving] = useState(false);

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

  const save = async (next: UpdateNotificationPreferences) => {
    if (isSaving) return;
    const previous = preferences;
    setPreferences(next);
    setIsSaving(true);
    try {
      const response = await fetch("/api/updates/notifications", {
        body: JSON.stringify({ commentsEnabled: next.comments_enabled, repliesEnabled: next.replies_enabled }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const saved = (await response.json()) as UpdateNotificationPreferences & { error?: string };
      if (!response.ok) throw new Error(saved.error ?? "Unable to save notification preferences");
      setPreferences(saved);
    } catch (error) {
      setPreferences(previous);
      showError(error instanceof Error ? error.message : i18n("Unable to save notification preferences"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="bg-surface-tint/50 border-primary/10 rounded-2xl border p-6 md:p-8" id="updates-notifications">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 text-primary rounded-xl p-2.5">
          <Bell aria-hidden size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold md:text-2xl">{i18n("Updates notifications")}</h2>
          <p className="text-neutral mt-1 text-sm md:text-base">
            {i18n("Choose which Updates activity you want to be notified about across your account.")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <AnimatedEllipsis centered size="sm" />
      ) : (
        <div className="mt-6 flex flex-wrap gap-5 border-t border-current/10 pt-5">
          <Checkbox
            checked={preferences.comments_enabled}
            disabled={isSaving}
            label={i18n("Comments")}
            onChange={(event) =>
              void save({
                ...preferences,
                comments_enabled: event.target.checked,
              })
            }
          />
          <Checkbox
            checked={preferences.replies_enabled}
            disabled={isSaving}
            label={i18n("Replies")}
            onChange={(event) =>
              void save({
                ...preferences,
                replies_enabled: event.target.checked,
              })
            }
          />
        </div>
      )}
    </section>
  );
};
