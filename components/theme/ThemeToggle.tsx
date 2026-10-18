"use client";

import React, { useRef } from "react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className = "", compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    toggleTheme(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTheme(buttonRef.current ? {
        x: buttonRef.current.getBoundingClientRect().left + buttonRef.current.offsetWidth / 2,
        y: buttonRef.current.getBoundingClientRect().top + buttonRef.current.offsetHeight / 2,
      } : undefined);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Toggle color theme"
      title={isLight ? "Switch to dark mode (T)" : "Switch to light mode (T)"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`theme-toggle ${isLight ? "is-light" : "is-dark"} ${compact ? "theme-toggle--compact" : ""} ${className}`.trim()}
    >
      <span className="theme-toggle__track">
        {/* Sun Icon (Left) */}
        <span className="theme-toggle__icon theme-toggle__icon--sun" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
        </span>

        {/* Sliding Thumb */}
        <span className="theme-toggle__thumb" aria-hidden="true">
          <span className="theme-toggle__thumb-core" />
        </span>

        {/* Moon Icon (Right) */}
        <span className="theme-toggle__icon theme-toggle__icon--moon" aria-hidden="true">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </span>
      </span>
      <span className="sr-only">
        {isLight ? "Light theme active. Click to switch to dark theme." : "Dark theme active. Click to switch to light theme."}
      </span>
    </button>
  );
}
