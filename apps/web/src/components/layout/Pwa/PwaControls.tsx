"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui";
import { useI18n } from "~/i18n/useI18n";
import { isProduction } from "~/lib/config/env";
import { registerAppWorker } from "~/lib/pwa/registration";

type InstallPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
} & Event;

export function PwaControls() {
  const i18n = useI18n();
  const [offline, setOffline] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [waiting, setWaiting] = useState<null | ServiceWorker>(null);
  const [error, setError] = useState(false);
  const [installing, setInstalling] = useState(false);
  const applyingUpdate = useRef(false);

  useEffect(() => {
    const updateConnectivity = () => setOffline(!navigator.onLine);
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateDisplayMode = () =>
      setInstalled(displayMode.matches || Boolean((navigator as { standalone?: boolean } & Navigator).standalone));
    const onInstall = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPrompt);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    updateConnectivity();
    updateDisplayMode();
    window.addEventListener("online", updateConnectivity);
    window.addEventListener("offline", updateConnectivity);
    window.addEventListener("beforeinstallprompt", onInstall);
    window.addEventListener("appinstalled", onInstalled);
    displayMode.addEventListener("change", updateDisplayMode);
    return () => {
      window.removeEventListener("online", updateConnectivity);
      window.removeEventListener("offline", updateConnectivity);
      window.removeEventListener("beforeinstallprompt", onInstall);
      window.removeEventListener("appinstalled", onInstalled);
      displayMode.removeEventListener("change", updateDisplayMode);
    };
  }, []);

  useEffect(() => {
    if (!isProduction || !("serviceWorker" in navigator)) return;
    let current = true;
    let registration: ServiceWorkerRegistration | undefined;
    let installingWorker: null | ServiceWorker = null;
    const checkWaiting = () => {
      if (current && registration?.waiting) setWaiting(registration.waiting);
    };
    const onUpdate = () => {
      installingWorker?.removeEventListener("statechange", checkWaiting);
      installingWorker = registration?.installing ?? null;
      installingWorker?.addEventListener("statechange", checkWaiting);
    };
    const onController = () => {
      if (applyingUpdate.current) {
        applyingUpdate.current = false;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", onController);
    void registerAppWorker()
      .then((value) => {
        if (!current) return;
        registration = value;
        checkWaiting();
        onUpdate();
        registration.addEventListener("updatefound", onUpdate);
      })
      .catch(() => {
        if (current) setError(true);
      });
    return () => {
      current = false;
      registration?.removeEventListener("updatefound", onUpdate);
      installingWorker?.removeEventListener("statechange", checkWaiting);
      navigator.serviceWorker.removeEventListener("controllerchange", onController);
    };
  }, []);

  const install = async () => {
    if (!prompt || installing) return;
    setInstalling(true);
    try {
      await prompt.prompt();
      await prompt.userChoice;
    } catch {
      setError(true);
    } finally {
      setInstalling(false);
      setPrompt(null);
    }
  };

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
          <Button
            onClick={() => {
              applyingUpdate.current = true;
              waiting.postMessage({ type: "ACTIVATE_UPDATE" });
            }}
            size="sm"
          >
            {i18n("Update and reload")}
          </Button>
        </div>
      )}
      <details>
        <summary className="min-h-11 cursor-pointer py-3">{i18n("App and offline options")}</summary>
        <div className="space-y-3 rounded-lg bg-surface-tint p-4">
          {!installed &&
            (prompt ? (
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
          <a className="inline-flex min-h-11 items-center underline" href="/offline.html">
            {i18n("Read saved articles")}
          </a>
          {error && (
            <p role="status">{i18n("App setup could not finish. Please reconnect and reload to try again.")}</p>
          )}
        </div>
      </details>
    </aside>
  );
}
