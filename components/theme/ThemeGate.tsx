"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme, type Theme } from "./ThemeProvider";

interface ThemeGateProps {
  onSelect?: (theme: Theme) => void;
}

export function ThemeGate({ onSelect }: ThemeGateProps) {
  const { hasChosen, setTheme, systemHint } = useTheme();
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(() =>
    systemHint === "light" ? 1 : 0
  );

  const darkBtnRef = useRef<HTMLButtonElement>(null);
  const lightBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while gate is open
  useEffect(() => {
    if (hasChosen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [hasChosen]);

  // Focus the pre-highlighted option initially
  useEffect(() => {
    if (hasChosen) return;
    const timer = setTimeout(() => {
      if (systemHint === "light") {
        lightBtnRef.current?.focus();
        setFocusedIndex(1);
      } else {
        darkBtnRef.current?.focus();
        setFocusedIndex(0);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [hasChosen, systemHint]);

  const handleChoose = useCallback(
    (chosen: Theme, origin?: { x: number; y: number } | React.MouseEvent) => {
      if (isExiting) return;
      setActiveTheme(chosen);
      setIsExiting(true);

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const duration = reducedMotion ? 150 : 700;

      // Trigger theme change with coordinate origin
      setTheme(chosen, origin);
      onSelect?.(chosen);

      setTimeout(() => {
        // Unlock scroll and remove gate flag
        document.documentElement.removeAttribute("data-gate");
      }, duration);
    },
    [isExiting, onSelect, setTheme]
  );

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (hasChosen || isExiting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Direct shortcuts: 'D' for Dark, 'L' for Light
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        const rect = darkBtnRef.current?.getBoundingClientRect();
        handleChoose(
          "dark",
          rect
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : undefined
        );
        return;
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        const rect = lightBtnRef.current?.getBoundingClientRect();
        handleChoose(
          "light",
          rect
            ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            : undefined
        );
        return;
      }

      // Arrow keys
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        darkBtnRef.current?.focus();
        setFocusedIndex(0);
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        lightBtnRef.current?.focus();
        setFocusedIndex(1);
        return;
      }

      // Tab trap
      if (e.key === "Tab") {
        e.preventDefault();
        if (focusedIndex === 0) {
          lightBtnRef.current?.focus();
          setFocusedIndex(1);
        } else {
          darkBtnRef.current?.focus();
          setFocusedIndex(0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, handleChoose, hasChosen, isExiting]);

  if (hasChosen && !isExiting) {
    return null;
  }

  const bgToneClass =
    hoveredTheme === "light"
      ? "theme-gate--blend-light"
      : hoveredTheme === "dark"
      ? "theme-gate--blend-dark"
      : "";

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-gate-heading"
      className={`theme-gate ${bgToneClass} ${isExiting ? "theme-gate--exiting" : ""}`}
    >
      <div className="theme-gate__backdrop" aria-hidden="true" />

      <div className="theme-gate__container">
        {/* Eyebrow & Headline */}
        <header className="theme-gate__header">
          <div className="theme-gate__meta mono">
            <span>00 / SETUP</span>
            <span className="theme-gate__meta-divider" aria-hidden="true">·</span>
            <span>EXPERIENCE PREFERENCE</span>
          </div>
          <h1 id="theme-gate-heading" className="theme-gate__title">
            Choose your <em>vibe</em>
          </h1>
          <p className="theme-gate__subtitle">
            Select a canvas tone to shape typography, lighting, and 3D acoustics.
          </p>
        </header>

        {/* The Two Split Theme Cards */}
        <div className="theme-gate__cards">
          {/* DARK THEME CARD */}
          <button
            ref={darkBtnRef}
            type="button"
            className={`theme-gate__card theme-gate__card--dark ${
              systemHint === "dark" ? "theme-gate__card--suggested" : ""
            } ${activeTheme === "dark" ? "theme-gate__card--selected" : ""}`}
            onClick={(e) => handleChoose("dark", e)}
            onMouseEnter={() => setHoveredTheme("dark")}
            onMouseLeave={() => setHoveredTheme(null)}
            onFocus={() => {
              setHoveredTheme("dark");
              setFocusedIndex(0);
            }}
            onBlur={() => setHoveredTheme(null)}
            aria-label="Select Dark Theme: Near-black obsidian with antique gold accents (shortcut D)"
          >
            <div className="theme-gate__card-inner" data-theme="dark">
              {/* Card Header */}
              <div className="theme-gate__card-top">
                <div className="theme-gate__badge mono">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                  <span>DARK THEME</span>
                </div>
                {systemHint === "dark" && (
                  <span className="theme-gate__hint-pill mono">SYSTEM MATCH</span>
                )}
              </div>

              {/* Miniature live preview of the site in DARK theme */}
              <div className="theme-gate__preview">
                <div className="theme-gate__preview-header">
                  <span className="theme-gate__preview-eyebrow mono">02 / IN PROGRESS</span>
                  <div className="theme-gate__preview-title">
                    Currently <em>building</em>
                  </div>
                </div>

                <div className="theme-gate__preview-card">
                  <div className="theme-gate__preview-row">
                    <span className="theme-gate__preview-dot" />
                    <span className="theme-gate__preview-node mono">node_00 · ACTIVE</span>
                  </div>
                  <div className="theme-gate__preview-pipe mono">
                    [RESEARCH] <span className="arrow">→</span> [DEPLOY]
                  </div>
                  <div className="theme-gate__preview-pills">
                    <span className="theme-gate__preview-pill">Python</span>
                    <span className="theme-gate__preview-pill">PyTorch</span>
                  </div>
                </div>

                <div className="theme-gate__preview-term">
                  <div className="theme-gate__preview-term-dots">
                    <span className="dot dot--red" />
                    <span className="dot dot--yellow" />
                    <span className="dot dot--green" />
                  </div>
                  <span className="theme-gate__preview-term-line mono">
                    <span className="arrow">➡︎</span> node developer.js
                  </span>
                </div>
              </div>

              <div className="theme-gate__card-footer">
                <span className="theme-gate__card-cta">
                  <span>Enter Dark Mode</span>
                  <span className="theme-gate__card-key mono">[D]</span>
                </span>
                <span className="theme-gate__card-subtext">Warm obsidian · Antique gold</span>
              </div>
            </div>
          </button>

          {/* LIGHT THEME CARD */}
          <button
            ref={lightBtnRef}
            type="button"
            className={`theme-gate__card theme-gate__card--light ${
              systemHint === "light" ? "theme-gate__card--suggested" : ""
            } ${activeTheme === "light" ? "theme-gate__card--selected" : ""}`}
            onClick={(e) => handleChoose("light", e)}
            onMouseEnter={() => setHoveredTheme("light")}
            onMouseLeave={() => setHoveredTheme(null)}
            onFocus={() => {
              setHoveredTheme("light");
              setFocusedIndex(1);
            }}
            onBlur={() => setHoveredTheme(null)}
            aria-label="Select Light Theme: Warm sepia paper with golden amber accents (shortcut L)"
          >
            <div className="theme-gate__card-inner" data-theme="light">
              {/* Card Header */}
              <div className="theme-gate__card-top">
                <div className="theme-gate__badge mono">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                  <span>LIGHT THEME</span>
                </div>
                {systemHint === "light" && (
                  <span className="theme-gate__hint-pill mono">SYSTEM MATCH</span>
                )}
              </div>

              {/* Miniature live preview of the site in LIGHT theme */}
              <div className="theme-gate__preview">
                <div className="theme-gate__preview-header">
                  <span className="theme-gate__preview-eyebrow mono">02 / IN PROGRESS</span>
                  <div className="theme-gate__preview-title">
                    Currently <em>building</em>
                  </div>
                </div>

                <div className="theme-gate__preview-card">
                  <div className="theme-gate__preview-row">
                    <span className="theme-gate__preview-dot" />
                    <span className="theme-gate__preview-node mono">node_00 · ACTIVE</span>
                  </div>
                  <div className="theme-gate__preview-pipe mono">
                    [RESEARCH] <span className="arrow">→</span> [DEPLOY]
                  </div>
                  <div className="theme-gate__preview-pills">
                    <span className="theme-gate__preview-pill">Python</span>
                    <span className="theme-gate__preview-pill">PyTorch</span>
                  </div>
                </div>

                <div className="theme-gate__preview-term">
                  <div className="theme-gate__preview-term-dots">
                    <span className="dot dot--red" />
                    <span className="dot dot--yellow" />
                    <span className="dot dot--green" />
                  </div>
                  <span className="theme-gate__preview-term-line mono">
                    <span className="arrow">➡︎</span> node developer.js
                  </span>
                </div>
              </div>

              <div className="theme-gate__card-footer">
                <span className="theme-gate__card-cta">
                  <span>Enter Light Mode</span>
                  <span className="theme-gate__card-key mono">[L]</span>
                </span>
                <span className="theme-gate__card-subtext">Sepia paper · Golden amber</span>
              </div>
            </div>
          </button>
        </div>

        {/* Subtle Hint */}
        <footer className="theme-gate__footer mono">
          <span>You can change this anytime with the top bar toggle or shortcut &quot;T&quot;.</span>
        </footer>
      </div>
    </div>
  );
}
