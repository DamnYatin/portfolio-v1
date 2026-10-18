"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (nextTheme: Theme) => void;
  isGateOpen: boolean;
  closeGate: () => void;
  isLoaderDone: boolean;
  setLoaderDone: (done: boolean) => void;
  systemHint: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getDevOverrideTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const val = params.get("theme");
    if (val === "dark" || val === "light") return val;
  } catch {
    // ignore
  }
  return null;
}

function updateThemeMeta(theme: Theme) {
  if (typeof document === "undefined") return;
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const targetColor = theme === "dark" ? "#0D0B09" : "#EBE2CC";
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", targetColor);
  } else {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = targetColor;
    document.head.appendChild(meta);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const devTheme = useMemo(() => getDevOverrideTheme(), []);

  const [theme, setThemeState] = useState<Theme>(() => {
    return devTheme ?? "dark";
  });

  const [isLoaderDone, setIsLoaderDoneState] = useState<boolean>(false);

  // If dev override is provided, gate is never opened
  const [isGateOpen, setIsGateOpen] = useState<boolean>(false);

  const [systemHint, setSystemHint] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Watch system color scheme changes for the suggestion badge
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemHint(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync dev theme if present on mount
  useEffect(() => {
    if (devTheme) {
      document.documentElement.dataset.theme = devTheme;
      document.documentElement.style.colorScheme = devTheme;
      document.documentElement.removeAttribute("data-gate");
      updateThemeMeta(devTheme);
    }
  }, [devTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = nextTheme;
      document.documentElement.style.colorScheme = nextTheme;
      updateThemeMeta(nextTheme);
    }
  }, []);

  const setLoaderDone = useCallback((done: boolean) => {
    setIsLoaderDoneState(done);
    if (done) {
      const dev = getDevOverrideTheme();
      if (!dev) {
        setIsGateOpen(true);
        if (typeof document !== "undefined") {
          document.documentElement.dataset.gate = "open";
        }
      }
    }
  }, []);

  const closeGate = useCallback(() => {
    setIsGateOpen(false);
    if (typeof document !== "undefined") {
      document.documentElement.removeAttribute("data-gate");
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      isGateOpen,
      closeGate,
      isLoaderDone,
      setLoaderDone,
      systemHint,
    }),
    [theme, setTheme, isGateOpen, closeGate, isLoaderDone, setLoaderDone, systemHint]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
