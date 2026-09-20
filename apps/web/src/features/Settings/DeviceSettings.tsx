"use client";

import { useLocale } from "next-intl";
import { useState, useSyncExternalStore } from "react";

import { PushNotifications } from "~/components/layout/PushNotifications/PushNotifications";
import { usePwa } from "~/components/layout/Pwa/PwaProvider";
import { Button, Checkbox } from "~/components/ui";
import { useDialog } from "~/contexts/DialogContext";
import { useI18n } from "~/i18n/useI18n";
import {
  isDeviceLocationEnabled,
  setDeviceLocationEnabled,
  subscribeDevicePreferences,
} from "~/lib/pwa/device-preferences";
import { OFFLINE_ARTICLES_KEY } from "~/lib/pwa/offline-reading";

export function DeviceSettings() {
  const i18n = useI18n();
  const { openConfirmDialog } = useDialog();
  const locale = useLocale();
  const { applyUpdate, canInstall, install, installed, installing, waiting } = usePwa();
  const locationEnabled = useSyncExternalStore(subscribeDevicePreferences, isDeviceLocationEnabled, () => true);
  const [message, setMessage] = useState("");
  return (
    <section
      aria-labelledby="device-settings-heading"
      className={`border-primary/10 bg-surface-tint/50 space-y-5 rounded-2xl border p-5 md:p-6`}
      id="device-settings"
    >
      <h2 className={`text-xl font-bold md:text-2xl`} id="device-settings-heading">
        {i18n("This device")}
      </h2>
      <p className="text-neutral text-sm">{i18n("These options apply to this browser or installed app.")}</p>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{i18n("Device notifications")}</h3>
          <p className="text-neutral text-sm">
            {i18n("Enable or disable notifications on this device. Choose alert topics and delivery frequency above.")}
          </p>
          <p className="text-neutral mt-2 text-sm">
            {i18n(
              "Notifications are optional. On iPhone and iPad, open the Home Screen app before enabling them in your account settings.",
            )}
          </p>
          <p className="text-neutral mt-2 text-sm">
            {i18n("If notifications are blocked, allow them in your browser or system settings first.")}
          </p>
        </div>
        <PushNotifications />
      </div>
      <div>
        <Checkbox
          checked={locationEnabled}
          label={i18n("Allow Find me on this device")}
          onChange={(event) => {
            try {
              setDeviceLocationEnabled(event.target.checked);
              setMessage("");
            } catch {
              setMessage(i18n("Could not save device settings. Check browser storage permissions."));
            }
          }}
        />
        <p className="text-neutral mt-2 text-sm">
          {i18n(
            "Location is requested only when you tap Find me. Browser permission is managed in your device settings.",
          )}
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">{i18n("Offline reading")}</h3>
        <p className="text-neutral text-sm">
          {i18n(
            "Save public articles for text-only reading on this device. Maps, messages, payments, and account changes need a connection.",
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a className="inline-flex min-h-11 items-center underline" href={`/offline.html?lang=${locale}`}>
            {i18n("Read saved articles")}
          </a>
          <Button
            color="neutral"
            onClick={async () => {
              if (
                !(await openConfirmDialog({
                  message: i18n("You will need a connection to save these articles again."),
                  title: i18n("Remove all saved articles?"),
                }))
              )
                return;
              try {
                localStorage.removeItem(OFFLINE_ARTICLES_KEY);
                setMessage(i18n("Saved articles removed from this device."));
              } catch {
                setMessage(i18n("Could not save device settings. Check browser storage permissions."));
              }
            }}
            size="sm"
            variant="outlined"
          >
            {i18n("Remove all saved articles")}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">{i18n("App installation and updates")}</h3>
        {installed ? (
          <p>{i18n("You are using the installed app.")}</p>
        ) : canInstall ? (
          <Button disabled={installing} onClick={() => void install()}>
            {i18n("Install Mandrii")}
          </Button>
        ) : (
          <p className="text-neutral text-sm">
            {i18n(
              "On iPhone or iPad, use Share, then Add to Home Screen. On Android, use Install app in your browser menu.",
            )}
          </p>
        )}
        {waiting && (
          <>
            <p>{i18n("An app update is ready. Save your work before reloading.")}</p>
            <Button onClick={applyUpdate}>{i18n("Update and reload")}</Button>
          </>
        )}
      </div>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
