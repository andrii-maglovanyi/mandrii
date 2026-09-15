"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

import { sendToMixpanel } from "~/lib/mixpanel";
import { localStore } from "~/lib/utils";

type ThemeContextType = { isDark: boolean; toggleTheme: () => void };
const ThemeContext = createContext<null | ThemeContextType>(null);
const THEME_CHANGE = "mandrii-theme-changed";

function currentTheme() {
  return document.documentElement.classList.contains("dark");
}
function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => {
    let saved: null | string = null;
    try {
      saved = localStore.get<string>("theme");
    } catch {
      /* Storage can be blocked. */
    }
    document.documentElement.classList.toggle("dark", saved ? saved === "dark" : media.matches);
    callback();
  };
  sync();
  window.addEventListener("storage", sync);
  window.addEventListener(THEME_CHANGE, callback);
  media.addEventListener("change", sync);
  return () => {
    window.removeEventListener("storage", sync);
    window.removeEventListener(THEME_CHANGE, callback);
    media.removeEventListener("change", sync);
  };
}

export const ThemeProvider = ({
  children,
  initialIsDark = false,
}: {
  children: React.ReactNode;
  initialIsDark?: boolean;
}) => {
  const isDark = useSyncExternalStore(subscribeTheme, currentTheme, () => initialIsDark);
  useEffect(() => {
    document.cookie = `mndr.theme=${isDark ? "dark" : "light"}; path=/; max-age=31536000; SameSite=Lax`;
  }, [isDark]);
  const toggleTheme = useCallback(() => {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    try {
      localStore.set("theme", nextIsDark ? "dark" : "light");
    } catch {
      /* Keep the current tab usable without storage. */
    }
    window.dispatchEvent(new Event(THEME_CHANGE));
    sendToMixpanel("Toggled Theme", { theme: nextIsDark ? "dark" : "light" });
  }, [isDark]);
  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};
