"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { sendToMixpanel } from "~/lib/mixpanel";
import { storage } from "~/lib/utils/storage";

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<null | ThemeContextType>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = storage.get<string>("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const resolved = saved ? saved === "dark" : prefersDark;
    setIsDark(resolved);
  }, []);

  useEffect(() => {
    if (isDark === null) return;
    document.documentElement.classList.toggle("dark", isDark);
    storage.set("theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const nextIsDark = !isDark;
    sendToMixpanel("Toggled Theme", { theme: nextIsDark ? "dark" : "light" });
    setIsDark(nextIsDark);
  }, [isDark]);

  const contextValue = useMemo<null | ThemeContextType>(
    () => (isDark !== null ? { isDark, toggleTheme } : null),
    [isDark, toggleTheme],
  );

  if (!contextValue) return null;

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
