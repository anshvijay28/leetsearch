"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "leetsearch_theme";

function getInitialMode(): ThemeMode {
  // Always return "dark" for SSR to match initial client render
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start with "dark" to match SSR, then sync with actual preference after mount
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with localStorage/system preference after hydration
  useEffect(() => {
    const actualMode = getInitialMode();
    setModeState(actualMode);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, mode);
    const root = document.documentElement;
    const body = document.body;
    // Tailwind's dark variant relies on a .dark class on the root element.
    root.classList.toggle("dark", mode === "dark");
    body.classList.toggle("dark", mode === "dark");
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
  }, [mode, isHydrated]);

  const setMode = (next: ThemeMode) => setModeState(next);
  const toggle = () => setModeState((prev) => (prev === "dark" ? "light" : "dark"));

  const value = useMemo(() => ({ mode, toggle, setMode }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
