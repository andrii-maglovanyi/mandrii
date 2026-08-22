"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";

import { ActionButton } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { publicConfig } from "~/lib/config/public";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function hasMatchingApplicationServerKey(subscription: PushSubscription, publicKey: string) {
  const applicationServerKey = subscription.options.applicationServerKey;
  if (!applicationServerKey) return false;

  const currentKey = new Uint8Array(applicationServerKey as ArrayBuffer);
  const expectedKey = urlBase64ToUint8Array(publicKey);
  return currentKey.length === expectedKey.length && currentKey.every((byte, index) => byte === expectedKey[index]);
}

export const PushNotifications = () => {
  const i18n = useI18n();
  const [status, setStatus] = useState<"blocked" | "checking" | "error" | "idle" | "subscribed" | "unsupported">(
    "checking",
  );

  useEffect(() => {
    let isCurrent = true;

    const restoreSubscription = async () => {
      const publicKey = publicConfig.webPush.vapidPublicKey;
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window) ||
        publicKey === "__UNSET__"
      ) {
        if (isCurrent) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (isCurrent) setStatus("blocked");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.getRegistration("/");
        if (!registration) {
          if (isCurrent) setStatus("idle");
          return;
        }
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription && !hasMatchingApplicationServerKey(existingSubscription, publicKey)) {
          await existingSubscription.unsubscribe();
        }
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          if (isCurrent) setStatus("idle");
          return;
        }

        const response = await fetch("/api/push/subscribe", {
          body: JSON.stringify({ subscription }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        });
        if (isCurrent) setStatus(response.ok ? "subscribed" : "error");
      } catch (error) {
        console.error("Unable to restore push notifications:", error);
        if (isCurrent) setStatus("error");
      }
    };

    void restoreSubscription();
    return () => {
      isCurrent = false;
    };
  }, []);

  const enable = async () => {
    const publicKey = publicConfig.webPush.vapidPublicKey;
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window) ||
      publicKey === "__UNSET__"
    ) {
      setStatus("unsupported");
      return;
    }

    setStatus("checking");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "idle");
        return;
      }
      await navigator.serviceWorker.register("/sw.js");
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription && !hasMatchingApplicationServerKey(existingSubscription, publicKey)) {
        await existingSubscription.unsubscribe();
      }
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
          userVisibleOnly: true,
        }));
      const response = await fetch("/api/push/subscribe", {
        body: JSON.stringify({ subscription }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("subscribed");
    } catch (error) {
      console.error("Unable to enable push notifications:", error);
      setStatus("error");
    }
  };

  const disable = async () => {
    if (!("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    setStatus("checking");
    try {
      const registration = await navigator.serviceWorker.getRegistration("/");
      const subscription = await registration?.pushManager.getSubscription();
      if (!subscription) {
        setStatus("idle");
        return;
      }

      await subscription.unsubscribe();
      const response = await fetch("/api/push/unsubscribe", {
        body: JSON.stringify({ endpoint: subscription.endpoint }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      setStatus(response.ok ? "idle" : "error");
    } catch (error) {
      console.error("Unable to disable push notifications:", error);
      setStatus("error");
    }
  };

  if (status === "unsupported") return null;

  if (status === "checking") {
    return <ActionButton aria-label={i18n("Checking notification settings")} busy icon={<Bell />} variant="ghost" />;
  }
  if (status === "subscribed") {
    return (
      <ActionButton
        aria-label={i18n("Disable message notifications")}
        icon={<BellOff />}
        onClick={() => void disable()}
        variant="ghost"
      />
    );
  }
  if (status === "blocked") {
    return (
      <ActionButton
        aria-label={i18n("Notifications are blocked in browser settings")}
        disabled
        icon={<BellOff />}
        variant="ghost"
      />
    );
  }

  return (
    <ActionButton
      aria-label={
        status === "error" ? i18n("Retry enabling message notifications") : i18n("Enable message notifications")
      }
      icon={<Bell />}
      onClick={() => void enable()}
      variant="ghost"
    />
  );
};
