"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from "../../lib/theme-script";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (
    nextTheme: Theme,
    origin?: { x: number; y: number } | MouseEvent | React.MouseEvent
  ) => void;
  toggleTheme: (
    origin?: { x: number; y: number } | MouseEvent | React.MouseEvent
  ) => void;
  hasChosen: boolean;
  systemHint: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getPointFromOrigin(
  origin?: { x: number; y: number } | MouseEvent | React.MouseEvent
): { x: number; y: number } {
  if (!origin) {
    return {
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
      y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    };
  }
  if ("clientX" in origin && "clientY" in origin) {
    return { x: origin.clientX, y: origin.clientY };
  }
  return { x: origin.x, y: origin.y };
}

function updateThemeMeta(theme: Theme) {
  if (typeof document === "undefined") return;
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const targetColor = theme === "dark" ? "#0D0B09" : "#F7F1E1";
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", targetColor);
  } else {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = targetColor;
    document.head.appendChild(meta);
  }
}

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const match = document.cookie.match(
      new RegExp("(^|; )" + THEME_COOKIE_NAME + "=([^;]+)")
    );
    const cookieVal = match ? (decodeURIComponent(match[2]) as Theme) : null;
    const saved = stored || cookieVal;
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // ignore
  }
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = readStoredTheme();
    return saved ?? "dark";
  });

  const [hasChosen, setHasChosen] = useState<boolean>(() => {
    return readStoredTheme() !== null;
  });

  const [systemHint, setSystemHint] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Keep DOM dataset and metadata in sync on mount
  useEffect(() => {
    const saved = readStoredTheme();
    if (saved) {
      document.documentElement.dataset.theme = saved;
      document.documentElement.style.colorScheme = saved;
      document.documentElement.removeAttribute("data-gate");
      updateThemeMeta(saved);
    } else {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.dataset.gate = "open";
      document.documentElement.style.colorScheme = "dark";
      updateThemeMeta("dark");
    }
  }, []);

  // Watch for system color scheme changes to update subtle suggestion badge
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemHint(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const applyThemeToDom = useCallback((nextTheme: Theme) => {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.style.colorScheme = nextTheme;
    document.documentElement.removeAttribute("data-gate");
    updateThemeMeta(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(
        nextTheme
      )}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // storage unavailable
    }
  }, []);

  const setTheme = useCallback(
    (
      nextTheme: Theme,
      origin?: { x: number; y: number } | MouseEvent | React.MouseEvent
    ) => {
      if (typeof document === "undefined") return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const executeDomUpdate = () => {
        setThemeState(nextTheme);
        setHasChosen(true);
        applyThemeToDom(nextTheme);
      };

      // Check for View Transitions API support
      const doc = document as unknown as {
        startViewTransition?: (cb: () => void) => {
          ready: Promise<void>;
          finished: Promise<void>;
        };
      };

      if (!reducedMotion && typeof doc.startViewTransition === "function") {
        const { x, y } = getPointFromOrigin(origin);
        const right = window.innerWidth - x;
        const bottom = window.innerHeight - y;
        const maxRadius = Math.hypot(Math.max(x, right), Math.max(y, bottom));

        const transition = doc.startViewTransition(() => {
          executeDomUpdate();
        });

        transition.ready
          .then(() => {
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 650,
                easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          })
          .catch(() => {
            // View transition animation failed or was skipped
          });
      } else {
        // Fallback: smooth CSS transition
        document.documentElement.classList.add("theme-transitioning");
        executeDomUpdate();
        window.setTimeout(() => {
          document.documentElement.classList.remove("theme-transitioning");
        }, 350);
      }
    },
    [applyThemeToDom]
  );

  const toggleTheme = useCallback(
    (origin?: { x: number; y: number } | MouseEvent | React.MouseEvent) => {
      setTheme(theme === "dark" ? "light" : "dark", origin);
    },
    [setTheme, theme]
  );

  // Global keyboard shortcut 'T' (when not in an input/textarea and not in open gate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t" || e.key === "T") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable ||
            target.closest("[role='dialog']") ||
            document.documentElement.dataset.gate === "open")
        ) {
          return;
        }

        if (e.metaKey || e.ctrlKey || e.altKey) {
          return;
        }

        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      hasChosen,
      systemHint,
    }),
    [theme, setTheme, toggleTheme, hasChosen, systemHint]
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
