"use client";

// Account-level delivery settings for alerts from followed content.

import { Bell, ChevronDown, ChevronUp, Mail, Smartphone } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

import type {
  ContentAlertDeliveryPreferences,
  ContentAlertDeliveryPreferenceUpdate,
} from "~/lib/models/content-subscription-alert-deliveries";

import { Button, Select, Switch } from "~/components/ui";
import { useNotifications } from "~/hooks/useNotifications";
import { useI18n } from "~/i18n/useI18n";
import { publicConfig } from "~/lib/config/public";
import { getCompatiblePushSubscription, urlBase64ToUint8Array } from "~/lib/push-subscription";
import { readyAppWorker } from "~/lib/pwa/registration";

type DeliveryMethodProps = {
  action?: ReactNode;
  checked: boolean;
  description: string;
  disabled?: boolean;
  icon: ReactNode;
  id: string;
  onChange: (checked: boolean) => void;
  title: string;
};

const DeliveryMethod = ({
  action,
  checked,
  description,
  disabled = false,
  icon,
  id,
  onChange,
  title,
}: DeliveryMethodProps) => (
  <div
    className={`
      flex min-h-28 flex-col rounded-xl p-4 transition
      ${
      checked ? "bg-primary/10" : "bg-surface"
    }
      ${disabled ? "opacity-60" : ""}
    `}
  >
    <div className="flex items-start gap-3">
      <div className={`
        rounded-lg p-2
        ${checked ? "bg-primary/15 text-primary" : `
          bg-surface-tint text-neutral
        `}
      `}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-neutral">{description}</p>
      </div>
      <Switch
        aria-label={title}
        checked={checked}
        className="mt-0.5"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
    {action && <div className="mt-auto flex justify-end pt-3">{action}</div>}
  </div>
);

type ContentAlertDeliverySettingsProps = {
  defaultExpanded?: boolean;
  id?: string;
  initialPreferences: ContentAlertDeliveryPreferences;
};

type DeliveryControl = "email" | "frequency" | "push";

export const ContentAlertDeliverySettings = ({
  defaultExpanded = false,
  id,
  initialPreferences,
}: ContentAlertDeliverySettingsProps) => {
  const i18n = useI18n();
  const { showError, showSuccess } = useNotifications();
  const [preferences, setPreferences] = useState<ContentAlertDeliveryPreferences>(initialPreferences);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [savingControls, setSavingControls] = useState<Set<DeliveryControl>>(new Set());
  const savingControlsRef = useRef(new Set<DeliveryControl>());

  useEffect(() => {
    if (id && window.location.hash === `#${id}`) setIsExpanded(true);
  }, [id]);

  const setControlSaving = (control: DeliveryControl, isSaving: boolean) => {
    const next = new Set(savingControlsRef.current);
    if (isSaving) next.add(control);
    else next.delete(control);
    savingControlsRef.current = next;
    setSavingControls(next);
  };

  const isSaving = (control: DeliveryControl) => savingControls.has(control);

  const persist = async (update: ContentAlertDeliveryPreferenceUpdate) => {
    const response = await fetch("/api/following/delivery", {
      body: JSON.stringify(update),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    });
    const result = (await response.json()) as { error?: string } & ContentAlertDeliveryPreferences;
    if (!response.ok) throw new Error(result.error ?? "Unable to save alert delivery settings");
    return result;
  };

  const save = async (control: DeliveryControl, update: ContentAlertDeliveryPreferenceUpdate) => {
    if (savingControlsRef.current.has(control)) return;
    const previous = Object.fromEntries(
      Object.keys(update).map((key) => [key, preferences[key as keyof ContentAlertDeliveryPreferenceUpdate]]),
    ) as ContentAlertDeliveryPreferenceUpdate;
    setPreferences((current) => ({ ...current, ...update }));
    setControlSaving(control, true);
    try {
      const result = await persist(update);
      setPreferences((current) => ({
        ...current,
        ...Object.fromEntries(
          Object.keys(update).map((key) => [key, result[key as keyof ContentAlertDeliveryPreferenceUpdate]]),
        ),
      }));
    } catch (error) {
      setPreferences((current) => ({ ...current, ...previous }));
      showError(error instanceof Error ? error.message : i18n("Unable to save alert delivery settings"));
    } finally {
      setControlSaving(control, false);
    }
  };

  const enableBrowserPush = async () => {
    const publicKey = publicConfig.webPush.vapidPublicKey;
    if (
      !preferences.pushSupported ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window) ||
      publicKey === "__UNSET__"
    ) {
      showError(i18n("Browser notifications are not available here."));
      return;
    }

    if (savingControlsRef.current.has("push")) return;
    setControlSaving("push", true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("Browser notification permission was not granted");
      const registration = await readyAppWorker();
      const subscription =
        (await getCompatiblePushSubscription(registration, publicKey)) ??
        (await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
          userVisibleOnly: true,
        }));
      const response = await fetch("/api/push/subscribe", {
        body: JSON.stringify({ subscription }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) throw new Error("Unable to enable browser notifications");

      const saved = await persist({ pushEnabled: true });
      setPreferences((current) => ({
        ...current,
        pushEnabled: saved.pushEnabled,
        pushSubscribed: saved.pushSubscribed,
      }));
      showSuccess(i18n("Browser alerts enabled"));
    } catch (error) {
      showError(error instanceof Error ? error.message : i18n("Unable to enable browser notifications"));
    } finally {
      setControlSaving("push", false);
    }
  };

  const enabledMethods = [
    preferences.emailEnabled && i18n("Email"),
    preferences.pushEnabled && i18n("Browser alerts"),
  ].filter(Boolean);

  return (
    <section className="border-t border-current/10 pt-7" id={id}>
      <div className={`
        flex flex-col justify-between gap-4
        sm:flex-row sm:items-center
      `}>
        <div>
          <h4 className="text-lg font-bold">{i18n("Delivery channels")}</h4>
          <p className="mt-1 text-sm text-neutral">
            {enabledMethods.length > 0
              ? i18n("In-app alerts, plus {methods}.", { methods: enabledMethods.join(", ") })
              : i18n("In-app alerts are on. Add another channel when you need it.")}
          </p>
        </div>
        <Button
          aria-expanded={isExpanded}
          color="neutral"
          onClick={() => setIsExpanded((current) => !current)}
          size="sm"
          variant="ghost"
        >
          {i18n("Manage delivery")}{" "}
          {isExpanded ? <ChevronUp aria-hidden size={17} /> : <ChevronDown aria-hidden size={17} />}
        </Button>
      </div>
      {isExpanded && (
        <div className={`
          mt-5 rounded-2xl bg-surface-tint/60 p-3
          sm:p-4
        `}>
          <div className={`
            grid gap-3
            md:grid-cols-2
          `}>
            <DeliveryMethod
              checked={preferences.emailEnabled}
              description={i18n("Receive alerts in your inbox.")}
              disabled={isSaving("email")}
              icon={<Mail aria-hidden size={19} />}
              id="content-alert-email"
              onChange={(checked) => void save("email", { emailEnabled: checked })}
              title={i18n("Email")}
            />
            <DeliveryMethod
              action={
                !preferences.pushSubscribed && preferences.pushSupported ? (
                  <Button
                    color="primary"
                    disabled={isSaving("push")}
                    onClick={() => void enableBrowserPush()}
                    size="sm"
                    variant="outlined"
                  >
                    <Smartphone aria-hidden size={16} /> {i18n("Enable browser notifications")}
                  </Button>
                ) : undefined
              }
              checked={preferences.pushEnabled}
              description={
                preferences.pushSupported
                  ? preferences.pushSubscribed
                    ? i18n("Receive alerts in this browser.")
                    : i18n("Enable browser notifications to turn this on.")
                  : i18n("Browser notifications are not available here.")
              }
              disabled={
                isSaving("push") ||
                (!preferences.pushEnabled && (!preferences.pushSubscribed || !preferences.pushSupported))
              }
              icon={<Bell aria-hidden size={19} />}
              id="content-alert-browser"
              onChange={(checked) => void save("push", { pushEnabled: checked })}
              title={i18n("Browser alerts")}
            />
          </div>
          <div
            className={`
              mt-3 flex flex-col gap-3 rounded-xl bg-surface p-4
              sm:flex-row sm:items-center sm:justify-between
            `}
          >
            <div>
              <p className="font-semibold">{i18n("Following alert frequency")}</p>
              <p className="mt-0.5 text-sm text-neutral">
                {i18n("Choose when Email, Browser, and Telegram follow alerts are sent.")}
              </p>
            </div>
            <div className={`
              w-full
              sm:w-72
            `}>
              <Select
                aria-label={i18n("Following alert frequency")}
                disabled={isSaving("frequency")}
                onChange={(event) =>
                  void save("frequency", {
                    frequency: event.target.value as ContentAlertDeliveryPreferences["frequency"],
                  })
                }
                options={[
                  { label: i18n("Immediate"), value: "IMMEDIATE" },
                  { label: i18n("Daily · around 09:00 UTC"), value: "DAILY" },
                  { label: i18n("Weekly · Mon around 09:00 UTC"), value: "WEEKLY" },
                ]}
                value={preferences.frequency}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
