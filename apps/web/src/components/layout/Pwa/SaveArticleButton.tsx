"use client";

import { GlobeOff } from "lucide-react";
import { useState } from "react";

import { ActionButton } from "~/components/ui";
import { useNotifications } from "~/hooks";
import { useI18n } from "~/i18n/useI18n";
import { saveOfflineArticle } from "~/lib/pwa/offline-reading";
import { readyAppWorker } from "~/lib/pwa/registration";

export function SaveArticleButton({ title }: { title: string }) {
  const i18n = useI18n();
  const [status, setStatus] = useState<"error" | "idle" | "saved" | "saving">("idle");
  const { showError, showSuccess } = useNotifications();

  if (status === "saved") {
    showSuccess(i18n("Text saved on this device. Open App and offline options to read it offline."));
  }

  if (status === "error") {
    showError(i18n("Could not save this article. Check your connection and available storage."));
  }

  return (
    <div className="my-4">
      <ActionButton
        aria-label={i18n("Save article for offline reading")}
        color="primary"
        disabled={status === "saving"}
        icon={<GlobeOff />}
        onClick={async (event) => {
          const article = event.currentTarget.closest("[data-offline-article]")?.querySelector("article");
          if (!(article instanceof HTMLElement)) return;
          const text = article.innerText;
          const url = window.location.pathname;
          setStatus("saving");
          try {
            await readyAppWorker();
            saveOfflineArticle({ savedAt: new Date().toISOString(), text, title, url });
            setStatus("saved");
          } catch {
            setStatus("error");
          }
        }}
        size="sm"
        variant="ghost"
      />
    </div>
  );
}
