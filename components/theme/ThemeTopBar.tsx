"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";

export function ThemeTopBar() {
  const { hasChosen } = useTheme();

  // If user hasn't made a choice at the gate yet, don't show the top bar
  if (!hasChosen) return null;

  return (
    <header className="theme-top-bar" aria-label="Theme settings">
      <div className="theme-top-bar__inner">
        <ThemeToggle />
      </div>
    </header>
  );
}
