"use client";
import { useLocale } from "next-intl";

import { Button } from "~/components/ui";
import { Link } from "~/i18n/navigation";
import { useI18n } from "~/i18n/useI18n";

import { usePwa } from "./PwaProvider";

export function PwaControls() {
  const i18n = useI18n();
  const locale = useLocale();
  const { applyUpdate, canInstall, error, install, installed, installing, offline, waiting } = usePwa();
  return (
    <aside className="mx-auto my-3 w-full max-w-5xl px-4 text-sm">
      {offline && (
        <p className="mb-3 rounded-lg bg-surface-tint p-3" role="status">
          {i18n("You are offline. Saved articles are available; live content needs a connection.")}
        </p>
      )}
      {waiting && (
        <div className="mb-3 flex flex-wrap items-center gap-3" role="status">
          <p>{i18n("An app update is ready. Save your work before reloading.")}</p>
          <Button onClick={applyUpdate} size="sm">
            {i18n("Update and reload")}
          </Button>
        </div>
      )}
      <details>
        <summary className="min-h-11 cursor-pointer py-3">{i18n("App and offline options")}</summary>
        <div className="space-y-3 rounded-lg bg-surface-tint p-4">
          {!installed &&
            (canInstall ? (
              <Button disabled={installing} onClick={() => void install()}>
                {i18n("Install Mandrii")}
              </Button>
            ) : (
              <p>
                {i18n(
                  "On iPhone or iPad, use Share, then Add to Home Screen. On Android, use Install app in your browser menu.",
                )}
              </p>
            ))}
          <p>
            {i18n(
              "Notifications are optional. On iPhone and iPad, open the Home Screen app before enabling them in your account settings.",
            )}
          </p>
          <p>
            {i18n("Use Find me on the map to share your location for nearby results. You can search manually instead.")}
          </p>
          <a className="inline-flex min-h-11 items-center underline" href={`/offline.html?lang=${locale}`}>
            {i18n("Read saved articles")}
          </a>
          <p>
            <Link href="/user-profile/settings#device-settings">{i18n("Manage device settings")}</Link>
          </p>
          {error && (
            <p role="status">{i18n("App setup could not finish. Please reconnect and reload to try again.")}</p>
          )}
        </div>
      </details>
    </aside>
  );
}
