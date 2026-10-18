"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import AboutSection from "../components/AboutSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";
import HeadlineReveal from "../components/HeadlineReveal";
import HeroSection from "../components/HeroSection";
import InViewMount from "../components/InViewMount";
import PipelineGrid from "../components/PipelineGrid";
import ScrollVelocitySkew from "../components/ScrollVelocitySkew";
import SpatialSection from "../components/SpatialSection";
import StackTransitions from "../components/StackTransitions";
import StickyDeckSection from "../components/StickyDeckSection";
import { BUILDING } from "../lib/data";
import { burnControls } from "../lib/burnControls";
import { getLenis } from "../lib/lenisInstance";
import {
  resolveMotionEnvironment,
  subscribeMotionEnvironment,
  type MotionEnvironment,
} from "../lib/motionEnvironment";
import {
  observeScrollTargets,
  refreshScrollTargets,
} from "../lib/scrollTarget";
import { MOTION_FAILED_EVENT } from "../lib/motionEvents";
import { useTheme } from "../components/theme/ThemeProvider";

gsap.registerPlugin(ScrollTrigger);

const SKILL_PILLS = [
  "Python",
  "Java",
  "C/C++",
  "SQL",
  "Dart",
  "Flask",
  "Flutter",
  "Deep Learning",
  "Computer Vision",
  "Recommender Systems",
  "LLMs / GenAI",
  "YOLO",
  "Semantic Segmentation",
  "PyTorch",
  "TensorFlow",
  "Keras",
  "OpenCV",
  "NumPy",
  "Pandas",
  "Blender",
  "FastAPI",
  "Docker",
  "Google Cloud",
  "GPU Computing",
  "React.js",
  "JavaScript",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Agentic AI",
  "CI/CD",
  "REST APIs",
  "LangChain",
  "Hugging Face",
] as const;

const CHAPTER_TARGETS = [
  "projects",
  "currently-building",
  "skills",
  "about",
  "contact",
] as const;

const FAILURE_CLEAR_TARGETS = [
  ".stack-section",
  ".cs-viewport",
  ".cs-slide",
  ".sp-content",
  ".sp-reveal",
  "[data-chapter-heading]",
  "[data-chapter-body]",
  "[data-building-card]",
  "[data-circuit-draw]",
  "[data-circuit-glow]",
  ".about-sticky",
  ".about-split-container",
  ".about-terminal-wrap",
  ".contact-sticky",
  ".contact-links",
  ".contact-link",
  ".contact-mask",
  ".stack-veil",
  ".reveal-word",
  ".name-part-1",
  ".name-part-2",
  ".hero-tagline",
  ".hero-sub",
  /* The coarse-pointer name-split scrub fades this container to 0 on
     exit; fail-open must restore it or the hero CTAs stay hidden. */
  ".hero-sub-content",
  ".hero-buttons",
].join(",");

const GravityPit = dynamic(() => import("../components/GravityPit"), {
  ssr: false,
});
const PreLoader = dynamic(() => import("../components/PreLoader"), {
  ssr: false,
});

export default function Home() {
  const { setLoaderDone, heroEntranceReady } = useTheme();
  const [environment, setEnvironment] = useState<MotionEnvironment | null>(null);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const portfolioSectionRef = useRef<HTMLElement>(null);
  const motionFailedRef = useRef(false);
  const desktopScrub = environment?.desktopScrub ?? false;

  const failOpen = useCallback(() => {
    if (motionFailedRef.current) return;
    motionFailedRef.current = true;
    const root = document.documentElement;
    root.dataset.motionReady = "failed";
    root.dataset.intro = "active";
    delete root.dataset.burnActive;

    try {
      burnControls.setActive(false);
      burnControls.setProgress(0);
      burnControls.invalidate();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      gsap.killTweensOf(FAILURE_CLEAR_TARGETS);
      gsap.set(FAILURE_CLEAR_TARGETS, {
        clearProps:
          "opacity,transform,filter,clipPath,visibility,pointerEvents,willChange,strokeDasharray,strokeDashoffset",
      });
    } catch {
      // The CSS failure contract still exposes the complete natural-flow page.
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motionReady = "false";

    const onMotionFailure = () => failOpen();
    window.addEventListener(MOTION_FAILED_EVENT, onMotionFailure);

    const unsubscribe = subscribeMotionEnvironment(setEnvironment, {
      debounceAll: true,
      watchOrientation: true,
    });

    return () => {
      unsubscribe();
      window.removeEventListener(MOTION_FAILED_EVENT, onMotionFailure);
      delete root.dataset.motionReady;
    };
  }, [failOpen]);

  /* No-WebGL desktop: the immersive media query still matches, but the
     laptop scrub — the only thing that reveals #projects at desktop
     widths — can never mount. Fail open immediately so the natural-flow
     contract (poster hero, everything visible) takes over instead of the
     pinned runways activating around content nothing will ever reveal. */
  useEffect(() => {
    if (!environment || !environment.desktopScrub || environment.webglAvailable) {
      return;
    }
    /* Confirm before failing open: a cold GPU process can make the very
       first WebGL probe fail transiently (seen under e2e load), and
       fail-open latches permanently. Re-probe after a beat and only
       dispatch if WebGL is genuinely unavailable. Dispatch (rather than
       call failOpen directly) so every component's own listener also
       runs — StickyDeckSection's exposeStaticDeck is what clears
       #projects' inline hidden state. */
    const timer = window.setTimeout(() => {
      const recheck = resolveMotionEnvironment();
      if (recheck.desktopScrub && !recheck.webglAvailable) {
        window.dispatchEvent(new Event(MOTION_FAILED_EVENT));
      }
    }, 1_200);
    return () => window.clearTimeout(timer);
  }, [environment]);

  useEffect(() => {
    const refreshTargets = () => {
      getLenis()?.resize();
      refreshScrollTargets(CHAPTER_TARGETS);
    };
    const stopObserving = observeScrollTargets();

    ScrollTrigger.addEventListener("refresh", refreshTargets);
    window.addEventListener("load", refreshTargets);
    window.addEventListener("orientationchange", refreshTargets);
    refreshTargets();

    return () => {
      ScrollTrigger.removeEventListener("refresh", refreshTargets);
      window.removeEventListener("load", refreshTargets);
      window.removeEventListener("orientationchange", refreshTargets);
      stopObserving();
    };
  }, []);

  useEffect(() => {
    if (!environment || !preloaderDone || motionFailedRef.current) return;

    let firstFrame = 0;

    try {
      firstFrame = requestAnimationFrame(() => {
        if (motionFailedRef.current) return;
        document.documentElement.dataset.motionReady = "true";
        /* Force the named runway styles to resolve before either Lenis or
           ScrollTrigger snapshots the new document height. */
        void document.documentElement.scrollHeight;
        getLenis()?.resize();
        ScrollTrigger.refresh();
        refreshScrollTargets(CHAPTER_TARGETS);
      });
    } catch {
      failOpen();
    }

    return () => {
      cancelAnimationFrame(firstFrame);
    };
  }, [environment, failOpen, preloaderDone]);

  return (
    <>
      {/* Server-rendered preloader mask — present in the raw HTML from the
          first byte so it covers the hero BEFORE any JS runs (PreLoader is
          dynamic/ssr:false and mounts only after hydration). PreLoader removes
          it once its own overlay has painted, so there's never a hero flash.
          Lives here (not the root layout) so non-home routes are never
          covered by it. */}
      <div
        id="preloader-mask"
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 9999, background: "var(--surface-0)" }}
      />
      <PreLoader
        onComplete={() => {
          setPreloaderDone(true);
          setLoaderDone(true);
        }}
      />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <main id="main-content" tabIndex={-1}>
        <HeroSection
          animate={heroEntranceReady}
          environment={environment ?? undefined}
          motionEnabled={desktopScrub}
          portfolioSectionRef={portfolioSectionRef}
        />

        <div className="stack-section" data-stack>
          <StickyDeckSection
            portfolioSectionRef={portfolioSectionRef}
            motionEnabled={desktopScrub}
          />
        </div>

        <div
          className="stack-section stack-section--building"
          data-stack
          style={{ zIndex: 2 }}
        >
          <SpatialSection id="currently-building" chapter="building">
            <div className="container">
              <header
                className="ed-header"
                data-chapter-heading
                style={{ marginBottom: "56px" }}
              >
                <div className="ed-header-row sp-reveal">
                  <span className="ed-eyebrow">02 / In Progress</span>
                  <span className="ed-meta mono">live pipelines</span>
                </div>
                <h2 className="ed-heading ed-heading--md sp-reveal">
                  Currently <em>building</em>
                </h2>
              </header>
              <PipelineGrid items={BUILDING} />
            </div>
          </SpatialSection>
          <div className="stack-veil" aria-hidden="true" />
        </div>

        <div
          className="stack-section stack-section--skills"
          data-stack
          style={{ zIndex: 3 }}
        >
          <SpatialSection
            id="skills"
            chapter="skills"
            className="skills-spatial"
          >
            <div className="container">
              <header
                className="ed-header"
                data-chapter-heading
                style={{ marginBottom: "20px" }}
              >
                <div className="ed-header-row sp-reveal">
                  <span className="ed-eyebrow">03 / Skills</span>
                  <span className="ed-meta mono">drag to interact</span>
                </div>
                <h2 className="ed-heading ed-heading--md sp-reveal">
                  The <em>stack</em>
                </h2>
              </header>

              <p
                className="sp-reveal"
                style={{
                  color: "var(--ink-2)",
                  marginBottom: "20px",
                  fontFamily: "var(--font-jakarta)",
                  fontSize: "15px",
                  letterSpacing: "-0.01em",
                }}
              >
                Technologies and frameworks I use to engineer robust, scalable
                systems.
              </p>

              <div className="sp-reveal" data-chapter-body>
                {environment === null ? null : (
                  <InViewMount minHeight={420}>
                    <GravityPit pills={SKILL_PILLS} />
                  </InViewMount>
                )}
              </div>
            </div>
          </SpatialSection>
          <div className="stack-veil" aria-hidden="true" />
        </div>

        <div
          className="stack-section stack-section--about"
          data-stack
          style={{ zIndex: 6 }}
        >
          <AboutSection />
          <div className="stack-veil" aria-hidden="true" />
        </div>

        <div
          className="stack-section contact-runway"
          data-stack
          style={{ zIndex: 5 }}
        >
          <div
            className="chapter-marker chapter-marker--contact-spy"
            data-scroll-spy="contact"
            data-scroll-spy-clearance="none"
            aria-hidden="true"
          />
          <div
            className="chapter-marker chapter-marker--contact-landing"
            data-scroll-landing="contact"
            data-scroll-landing-clearance="none"
            aria-hidden="true"
          />
          <div className="contact-sticky">
            <ContactSection animate={preloaderDone} />
          </div>
          <div className="stack-veil" aria-hidden="true" />
        </div>
      </main>

      <Footer />
      <StackTransitions />
      <HeadlineReveal />
      <ScrollVelocitySkew />
    </>
  );
}
