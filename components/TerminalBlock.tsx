"use client";

import React, { useEffect, useRef, useState, startTransition } from "react";

interface Step {
  cmd: string;
  output: string;
}

const STEPS: Step[] = [
  { cmd: "whoami", output: "yatin-mishra" },
  { cmd: "cat stack.txt", output: "rust · c++ · js" },
  { cmd: "git log --oneline", output: "feat: ship it" },
];

export default function TerminalBlock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [completedSteps, setCompletedSteps] = useState<number>(0);
  const [currentText, setCurrentText] = useState("");
  const [showCurrentOutput, setShowCurrentOutput] = useState(false);
  const [started, setStarted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  /* Detect prefers-reduced-motion on mount */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    startTransition(() => setReducedMotion(mq.matches));
    const handler = (e: MediaQueryListEvent) => startTransition(() => setReducedMotion(e.matches));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* ---- IntersectionObserver: fires the sequence on first entry ---- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  /* ---- Typewriter: runs through the sequence ---- */
  useEffect(() => {
    if (!started) return;

    if (reducedMotion) {
      startTransition(() => {
        setCompletedSteps(STEPS.length);
        setCurrentText("");
        setShowCurrentOutput(true);
      });
      return;
    }

    let isCancelled = false;

    const runSequence = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (isCancelled) break;
        const targetCmd = STEPS[i].cmd;

        // Type command
        for (let c = 1; c <= targetCmd.length; c++) {
          if (isCancelled) break;
          await new Promise((res) => setTimeout(res, 75));
          if (isCancelled) break;
          setCurrentText(targetCmd.slice(0, c));
        }

        // Pause before showing output
        await new Promise((res) => setTimeout(res, 300));
        if (isCancelled) break;
        setShowCurrentOutput(true);

        // Pause before advancing to next command
        await new Promise((res) => setTimeout(res, 500));
        if (isCancelled) break;
        setCompletedSteps(i + 1);
        setCurrentText("");
        setShowCurrentOutput(false);
      }
    };

    runSequence();

    return () => {
      isCancelled = true;
    };
  }, [started, reducedMotion]);

  const allDone = completedSteps >= STEPS.length;

  return (
    <div ref={containerRef} className="term-shell">
      <div className="term-shell-inner">
        {/* ---- Title bar ---- */}
        <div className="term-bar">
          <div className="term-dots">
            <span className="term-dot term-dot--red" />
            <span className="term-dot term-dot--yellow" />
            <span className="term-dot term-dot--green" />
          </div>
          <span className="term-title">guest@yatin: ~</span>
        </div>

        {/* ---- Body ---- */}
        <div className="term-body is-expanded">
          {/* Previously completed steps */}
          {STEPS.slice(0, completedSteps).map((step, idx) => (
            <div key={idx} style={{ marginBottom: 12 }}>
              <div className="term-line">
                <span className="term-prompt-arrow">➡︎</span>
                <span className="term-prompt-dir">~</span>
                <span className="term-typed">{step.cmd}</span>
              </div>
              <div className="term-output" style={{ margin: "4px 0 0 16px" }}>
                <span className="term-str">&quot;{step.output}&quot;</span>
              </div>
            </div>
          ))}

          {/* Currently typing step */}
          {!allDone && (
            <div>
              <div className="term-line">
                <span className="term-prompt-arrow">➡︎</span>
                <span className="term-prompt-dir">~</span>
                <span className="term-typed">{currentText}</span>
                {!showCurrentOutput && <span className="terminal-cursor" aria-hidden="true" />}
              </div>
              {showCurrentOutput && (
                <div className="term-output" style={{ margin: "4px 0 0 16px" }}>
                  <span className="term-str">&quot;{STEPS[completedSteps].output}&quot;</span>
                </div>
              )}
            </div>
          )}

          {/* Final prompt with active cursor when sequence completes */}
          {allDone && (
            <div className="term-line term-line--mt">
              <span className="term-prompt-arrow">➡︎</span>
              <span className="term-prompt-dir">~</span>
              <span className="terminal-cursor" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
