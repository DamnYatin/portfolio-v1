import { getLenis } from "./lenisInstance";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

/**
 * Idempotent, reference-counted ScrollLock utility.
 * Prevents multiple components (PreLoader, ThemeGate, Modals) from
 * stomping on each other's overflow styles or restoring stale "hidden" values.
 */
class ScrollLockManager {
  private lockCount = 0;
  private isLocked = false;
  private savedHtmlOverflow = "";
  private savedBodyOverflow = "";

  public lock(): void {
    if (typeof document === "undefined") return;

    this.lockCount++;
    if (this.isLocked) return;

    this.isLocked = true;
    this.savedHtmlOverflow = document.documentElement.style.overflow;
    this.savedBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const lenis = getLenis();
    if (lenis) {
      lenis.stop();
    }
  }

  public unlock(): void {
    if (typeof document === "undefined") return;

    this.lockCount = Math.max(0, this.lockCount - 1);
    if (this.lockCount > 0) {
      // Still locked by another component
      return;
    }

    if (!this.isLocked) return;
    this.isLocked = false;

    // Restore overflow styles
    document.documentElement.style.overflow = this.savedHtmlOverflow || "";
    document.body.style.overflow = this.savedBodyOverflow || "";

    const lenis = getLenis();
    if (lenis) {
      lenis.start();
      lenis.resize();
    }

    // Double-rAF ensures DOM layout and CSS transitions have settled
    // before recalculating ScrollTrigger start/end trigger points.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.refresh(true);
        } catch {
          // ignore
        }

        // Dev-only assertion to catch regressions
        if (process.env.NODE_ENV !== "production") {
          const htmlOf = document.documentElement.style.overflow;
          const bodyOf = document.body.style.overflow;
          if (htmlOf === "hidden" || bodyOf === "hidden") {
            console.warn(
              "[ScrollLock] Warning: overflow is still 'hidden' after unlock!",
              { html: htmlOf, body: bodyOf }
            );
          }
        }
      });
    });
  }

  public forceUnlock(): void {
    this.lockCount = 0;
    this.isLocked = false;
    if (typeof document === "undefined") return;
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    const lenis = getLenis();
    if (lenis) {
      lenis.start();
      lenis.resize();
    }
    requestAnimationFrame(() => {
      try {
        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.refresh(true);
      } catch {
        // ignore
      }
    });
  }
}

export const scrollLock = new ScrollLockManager();
