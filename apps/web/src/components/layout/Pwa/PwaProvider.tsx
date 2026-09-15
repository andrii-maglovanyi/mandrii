"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

import { isProduction } from "~/lib/config/env";
import { registerAppWorker } from "~/lib/pwa/registration";

type InstallPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
} & Event;

type PwaState = {
  applyUpdate: () => void;
  canInstall: boolean;
  error: boolean;
  install: () => Promise<void>;
  installed: boolean;
  installing: boolean;
  offline: boolean;
  waiting: null | ServiceWorker;
};
const PwaContext = createContext<null | PwaState>(null);
export function PwaProvider({ children }: { children: React.ReactNode }) {
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
    <PwaContext.Provider
      value={{
        applyUpdate: () => {
          if (waiting) {
            applyingUpdate.current = true;
            waiting.postMessage({ type: "ACTIVATE_UPDATE" });
          }
        },
        canInstall: Boolean(prompt),
        error,
        install,
        installed,
        installing,
        offline,
        waiting,
      }}
    >
      {children}
    </PwaContext.Provider>
  );
}
export function usePwa() {
  const value = useContext(PwaContext);
  if (!value) throw new Error("PwaProvider is required");
  return value;
}
