"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";
import ScrollToPlugin from "gsap/ScrollToPlugin";
import { HoverScrambleText } from "./ui/HoverScrambleText";
import { getLenis } from "../lib/lenisInstance";
import { power4InOut } from "../lib/scrollTarget";

gsap.registerPlugin(ScrollToPlugin);

/* ─────────────────────────────────────────────────────────────────────
   Footer — a quiet, classy sign-off, not a marketing block.

   Three balanced zones on a 1fr/auto/1fr grid (the {J} logo doubles as
   back-to-top, the status line is dead-centered, the stack credit sits
   right), over a quiet copyright sub-row. Surface is a touch darker than
   --surface-0 so it reads as the floor of the page.
   ───────────────────────────────────────────────────────────────────── */

/** Formats the time in Asia/Kolkata timezone (GMT+5:30) */
function formatKolkataTime(d: Date): string {
  const timeStr = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);

  return `${timeStr} (Asia/Kolkata · GMT+5:30)`;
}

function LocalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    // Defer the first tick out of the effect body, then tick every second.
    const tick = () => setTime(formatKolkataTime(new Date()));
    const raf = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  // Avoid hydration mismatch — render nothing on first server pass
  if (time === null) return null;

  return (
    <span className="footer-clock" aria-label="Asia/Kolkata time" aria-live="off">
      {time}
    </span>
  );
}

export default function Footer() {
  const backToTop = () => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.3, easing: power4InOut, force: true, lock: true });
    else gsap.to(window, { scrollTo: { y: 0 }, duration: 1.5, ease: "power4.inOut" });
  };

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-row">
        <button type="button" className="footer-logo" onClick={backToTop} aria-label="Back to top">
          <span className="bracket">&#123;</span>Y<span className="bracket">&#125;</span>
        </button>

        <span className="footer-status">
          <span className="footer-dot" aria-hidden="true" />
          open to internships &amp; open-source collaboration · Class of 2029
        </span>

        <span className="footer-stack">
          <HoverScrambleText text="Next.js · Three.js · GSAP" />
        </span>
      </div>

      <div className="footer-sub">
        <span>© 2026 Yatin Mishra</span>
        <LocalClock />
      </div>
    </footer>
  );
}
