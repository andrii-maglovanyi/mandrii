"use client";

import { useEffect, useState } from "react";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";

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
      const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || !publicKey) {
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
    const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_VAPID_PUBLIC_KEY;
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window) || !publicKey) {
      setStatus("unsupported");
      return;
    }

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

  if (status === "checking") return null;
  if (status === "subscribed")
    return <p className="text-on-surface/70 text-sm">{i18n("Notifications are enabled for this device.")}</p>;
  if (status === "blocked")
    return (
      <p className="text-danger text-sm">{i18n("Notifications are blocked. Enable them in your browser settings.")}</p>
    );
  if (status === "unsupported")
    return <p className="text-on-surface/70 text-sm">{i18n("Notifications are not supported on this device.")}</p>;
  if (status === "error")
    return <p className="text-danger text-sm">{i18n("Unable to enable notifications. Please try again.")}</p>;

  return (
    <Button onClick={() => void enable()} variant="outlined">
      {i18n("Enable message notifications")}
    </Button>
  );
};
